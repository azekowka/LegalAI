import asyncio
import os
from pathlib import Path
from typing import Any, List, Optional
from copy import deepcopy
import json
import re

from decouple import config
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from theflow.utils.modules import import_dotted_string

from ktem.reasoning.prompt_optimization.suggest_followup_chat import (
    SuggestFollowupQuesPipeline,
)
from ktem.utils.lang import SUPPORTED_LANGUAGE_MAP


# --- Initialize Application and Core Components ---

# We'll store our core application components in this dictionary
# to be initialized at startup.
app_state = {}


class Settings:
    """A simple class to hold our application settings."""

    def __init__(self):
        # --- Paths and Directories ---
        this_dir = Path(__file__).parent
        self.KH_APP_DATA_DIR = this_dir / "ktem_app_data"
        self.KH_APP_DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.KH_USER_DATA_DIR = self.KH_APP_DATA_DIR / "user_data"
        self.KH_USER_DATA_DIR.mkdir(parents=True, exist_ok=True)

        # --- Database ---
        # Overriding the database path to be in our app data directory
        os.environ["KH_DATABASE"] = f"sqlite:///{self.KH_USER_DATA_DIR / 'sql.db'}"
        from ktem.db.models import engine
        from ktem.index.models import Index
        from ktem.db.models import Conversation
        Index.metadata.create_all(engine)
        Conversation.metadata.create_all(engine)


        # --- LLMs (filtered for OpenAI) ---
        self.KH_LLMS = {}
        OPENAI_API_KEY = config("OPENAI_API_KEY", default="")
        print(f"OpenAI API Key loaded: {'Yes' if OPENAI_API_KEY else 'No'}")
        
        if OPENAI_API_KEY:
            self.KH_LLMS["openai"] = {
                "spec": {
                    "__type__": "kotaemon.llms.ChatOpenAI",
                    "temperature": 0,
                    "base_url": config(
                        "OPENAI_API_BASE", default="https://api.openai.com/v1"
                    ),
                    "api_key": OPENAI_API_KEY,
                    "model": config("OPENAI_CHAT_MODEL", default="gpt-4o-mini"),
                    "timeout": 20,
                },
                "default": True,
            }
            print(f"OpenAI LLM configured with model: {config('OPENAI_CHAT_MODEL', default='gpt-4o-mini')}")
        else:
            print("WARNING: No OpenAI API key found. Chat functionality will not work.")

        # --- Embeddings (filtered for OpenAI and VoyageAI) ---
        self.KH_EMBEDDINGS = {}
        if OPENAI_API_KEY:
            self.KH_EMBEDDINGS["openai"] = {
                "spec": {
                    "__type__": "kotaemon.embeddings.OpenAIEmbeddings",
                    "base_url": config(
                        "OPENAI_API_BASE", default="https://api.openai.com/v1"
                    ),
                    "api_key": OPENAI_API_KEY,
                    "model": config(
                        "OPENAI_EMBEDDINGS_MODEL", default="text-embedding-3-large"
                    ),
                    "timeout": 10,
                },
                "default": True,
            }
        VOYAGE_API_KEY = config("VOYAGE_API_KEY", default="")
        if VOYAGE_API_KEY:
            self.KH_EMBEDDINGS["voyageai"] = {
                "spec": {
                    "__type__": "kotaemon.embeddings.VoyageAIEmbeddings",
                    "api_key": VOYAGE_API_KEY,
                    "model": config(
                        "VOYAGE_EMBEDDINGS_MODEL", default="voyage-large-2-instruct"
                    ),
                },
                "default": False,
            }
        
        # from ktem.embeddings.manager import embedding_models_manager
        # embedding_models_manager.load_from_settings(self)


        # --- Rerankings (filtered for VoyageAI) ---
        self.KH_RERANKINGS = {}
        if VOYAGE_API_KEY:
            self.KH_RERANKINGS["voyageai"] = {
                "spec": {
                    "__type__": "kotaemon.rerankings.VoyageAIReranking",
                    "api_key": VOYAGE_API_KEY,
                    "model": "rerank-lite-1",
                },
                "default": False,
            }
        
        # from ktem.rerankings.manager import reranking_models_manager
        # reranking_models_manager.load_from_settings(self)


        # --- Storage ---
        self.KH_DOCSTORE = {
            "__type__": "kotaemon.storages.LanceDBDocumentStore",
            "path": str(self.KH_USER_DATA_DIR / "docstore"),
        }
        self.KH_VECTORSTORE = {
            "__type__": "kotaemon.storages.ChromaVectorStore",
            "path": str(self.KH_USER_DATA_DIR / "vectorstore"),
        }
        self.KH_FILESTORAGE_PATH = str(self.KH_USER_DATA_DIR / "files")
        os.makedirs(self.KH_FILESTORAGE_PATH, exist_ok=True)

        # --- Reasoning Pipelines ---
        self.KH_REASONINGS = [
            "ktem.reasoning.simple.FullQAPipeline",
            "ktem.reasoning.simple.FullDecomposeQAPipeline",
            "ktem.reasoning.react.ReactAgentPipeline",
            "ktem.reasoning.rewoo.RewooAgentPipeline",
        ]

        # --- Indices ---
        self.KH_INDICES = [
            {
                "name": "File Collection",
                "config": {
                    "supported_file_types": (
                        ".pdf, .doc, .docx, .txt, .md"
                    ),
                    "private": True,
                },
                "index_type": "ktem.index.file.FileIndex",
            },
        ]
        self.KH_INDEX_TYPES = ["ktem.index.file.FileIndex"]
        
        # --- Settings for reasoning ---
        from ktem.utils.lang import SUPPORTED_LANGUAGE_MAP
        self.SETTINGS_REASONING = {
            "use": {
                "name": "Reasoning options",
                "value": "simple",  # Use the ID instead of full path
                "choices": [(reasoning.split(".")[-1].replace("Pipeline", "").lower(), reasoning) for reasoning in self.KH_REASONINGS],
                "component": "radio",
            },
            "lang": {
                "name": "Language",
                "value": "en",
                "choices": [(lang, code) for code, lang in SUPPORTED_LANGUAGE_MAP.items()],
                "component": "dropdown",
            },
            "max_context_length": {
                "name": "Max context length (LLM)",
                "value": 32000,
                "component": "number",
            },
        }
        self.SETTINGS_APP = {}
        self.KH_FEATURE_USER_MANAGEMENT = False
        
    def __getattr__(self, name: str) -> Any:
        # A little trick to make this class behave like the `theflow.settings` object
        return self.__dict__.get(name)


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initializes the application's core components."""
    settings_obj = Settings()

    # Store settings in a way that ktem can access
    # This needs to be done before importing managers
    from theflow.settings import settings as flowsettings
    for key, value in settings_obj.__dict__.items():
        setattr(flowsettings, key, value)

    from ktem.index.manager import IndexManager
    from ktem.components import reasonings as reasoning_components
    from ktem.settings import SettingGroup, BaseSettingGroup, SettingReasoningGroup
    from ktem.embeddings.manager import embedding_models_manager
    from ktem.rerankings.manager import reranking_models_manager

    # Reload managers to use the new settings
    embedding_models_manager.load()
    reranking_models_manager.load()


    # Mocking the `app` object that ktem components expect
    the_app = type("App", (), {})()
    the_app.f_user_management = False

    # Store settings in a way that ktem can access
    from theflow.settings import settings as flowsettings
    for key, value in settings_obj.__dict__.items():
        setattr(flowsettings, key, value)
    
    # Initialize Index Manager
    index_manager = IndexManager(the_app)
    index_manager.on_application_startup()
    app_state["index_manager"] = index_manager
    
    print(f"Initialized {len(index_manager.indices)} indices:")
    for i, index in enumerate(index_manager.indices):
        print(f"  Index {i}: {index.name} (ID: {index.id})")

    # Load reasonings - map both by class name and ID
    reasoning_map = {}
    for value in settings_obj.KH_REASONINGS:
        reasoning_cls = import_dotted_string(value, safe=False)
        rid = reasoning_cls.get_info()["id"]
        reasoning_components[rid] = reasoning_cls
        # Also map by the full class path for frontend compatibility
        reasoning_map[value] = reasoning_cls
        reasoning_map[rid] = reasoning_cls

    app_state["reasonings"] = reasoning_components
    app_state["reasoning_map"] = reasoning_map
    
    # Prepare settings state
    default_settings = SettingGroup(
        application=BaseSettingGroup(settings=settings_obj.SETTINGS_APP),
        reasoning=SettingReasoningGroup(settings=settings_obj.SETTINGS_REASONING),
    )
    
    # Add default reasoning options for each pipeline
    for reasoning_id in reasoning_components.keys():
        if reasoning_id not in default_settings.reasoning.options:
            # Get the actual pipeline class to get its settings
            reasoning_cls = reasoning_components[reasoning_id]
            pipeline_instance = reasoning_cls()
            pipeline_settings = pipeline_instance.get_user_settings()
            default_settings.reasoning.options[reasoning_id] = BaseSettingGroup(
                settings=pipeline_settings
            )
    
    for index in index_manager.indices:
        options = index.get_user_settings()
        default_settings.index.options[index.id] = BaseSettingGroup(
            settings=options
        )

    default_settings.reasoning.finalize()
    default_settings.index.finalize()
    flattened_settings = default_settings.flatten()
    
    # Debug: Print available settings
    print("Available settings keys:")
    for key in sorted(flattened_settings.keys()):
        if "reasoning" in key:
            print(f"  {key}: {flattened_settings[key]}")
    
    app_state["settings"] = flattened_settings


# --- Pydantic Models for API ---

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    history: List[List[str]] = []
    reasoning_mode: str = "ktem.reasoning.simple.FullQAPipeline"
    selected_files: List[str] = []
    user_id: str = "default"  # Assuming a single user for now
    language: str = "en"
    use_mindmap: bool = False


class SuggestRequest(BaseModel):
    history: List[List[str]]
    language: str = "en"


# --- API Endpoints ---

@app.get("/")
async def root():
    """A simple endpoint to confirm the server is running."""
    return {"message": "FastAPI server is running!"}


@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Main chat endpoint to get responses from the RAG system.
    This endpoint streams the response back to the client.
    """
    try:
        # This logic is adapted from `ChatPage.create_pipeline`
        index_manager = app_state["index_manager"]
        settings = app_state["settings"]
        reasoning_map = app_state["reasoning_map"]
        
        # Make a copy of settings to modify for this request
        request_settings = deepcopy(settings)
        request_settings["reasoning.lang"] = request.language
        
        # Add missing settings for simple pipeline
        if "reasoning.options.simple.highlight_citation" not in request_settings:
            request_settings["reasoning.options.simple.highlight_citation"] = "default"
        if "reasoning.options.simple.create_mindmap" not in request_settings:
            request_settings["reasoning.options.simple.create_mindmap"] = False
            
        if request.use_mindmap:
            request_settings["reasoning.options.simple.create_mindmap"] = True

        # Get reasoning class from our map
        if request.reasoning_mode not in reasoning_map:
            raise HTTPException(
                status_code=400, 
                detail=f"Unknown reasoning mode: {request.reasoning_mode}"
            )
        
        reasoning_cls = reasoning_map[request.reasoning_mode]

        # Get retrievers from the index manager
        retrievers = []
        
        # Debug: Check if indices exist
        if not index_manager.indices:
            raise HTTPException(status_code=500, detail="No indices available")
            
        print(f"Available indices: {len(index_manager.indices)}")
        print(f"Selected files: {request.selected_files}")
        
        # Only use the first index (File Collection) to avoid selector issues
        if index_manager.indices:
            index = index_manager.indices[0]  # Use only the first index
            try:
                # If no files selected, pass None to search all files
                selected_files = request.selected_files if request.selected_files else None
                index_retrievers = index.get_retriever_pipelines(
                    settings=request_settings, user_id=request.user_id, selected=selected_files
                )
                retrievers.extend(index_retrievers)
                print(f"Added {len(index_retrievers)} retrievers from index {index.id}")
            except Exception as e:
                print(f"Error getting retrievers from index {index.id}: {e}")
                # Create a fallback empty retriever list
                pass

        # Initialize the reasoning pipeline
        pipeline = reasoning_cls.get_pipeline(request_settings, {}, retrievers)

        # Stream the response
        async def stream_generator():
            try:
                for response in pipeline.stream(
                    request.message, request.conversation_id, request.history
                ):
                    if response.channel and response.content:
                        yield json.dumps({"type": response.channel, "data": response.content}) + "\\n"
            except Exception as e:
                print(f"Error in stream generator: {e}")
                yield json.dumps({"type": "error", "data": str(e)}) + "\\n"

        return StreamingResponse(stream_generator(), media_type="application/x-ndjson")
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload(file: UploadFile = File(...), user_id: str = "default"):
    """
    Endpoint to upload a file to the default 'File Collection' index.
    """
    try:
        index_manager = app_state["index_manager"]
        # Assuming the first index is our target File Collection
        file_collection_index = index_manager.indices[0]
        
        settings = app_state["settings"]
        indexing_pipeline = file_collection_index.get_indexing_pipeline(settings, user_id)
        
        # Save the file temporarily
        settings_obj = Settings()
        temp_path = settings_obj.KH_APP_DATA_DIR / file.filename
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())

        # Use the stream method instead of run
        # Set reindex=True to handle already indexed files
        output_stream = indexing_pipeline.stream([str(temp_path)], reindex=True)
        
        results = []
        errors = []
        try:
            while True:
                response = next(output_stream)
                if response is None:
                    continue
                if response.channel == "index":
                    if response.content["status"] == "success":
                        results.append(response.content.get("file_id"))
                    elif response.content["status"] == "failed":
                        errors.append(response.content.get("message", "Unknown error"))
        except StopIteration as e:
            # The stream is exhausted, get the final results
            final_results, final_errors, docs = e.value
            results.extend([r for r in final_results if r])
            errors.extend([e for e in final_errors if e])
        except Exception as e:
            print(f"Error during indexing: {e}")
            errors.append(str(e))
        
        # Clean up the temporary file
        try:
            os.remove(temp_path)
        except:
            pass  # File might already be moved by the indexing pipeline

        return {
            "filename": file.filename, 
            "ids": results,
            "success": len(results) > 0,
            "errors": errors
        }
        
    except Exception as e:
        print(f"Error in upload endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files")
async def list_files(user_id: str = "default"):
    """List available files in the index."""
    try:
        index_manager = app_state["index_manager"]
        file_collection_index = index_manager.indices[0]
        
        # The selector UI component has the logic to list files.
        selector_ui = file_collection_index.get_selector_component_ui()
        
        # Use the load_files method instead of get_choices
        _, file_options = selector_ui.load_files([], user_id)
        
        # Transform the file options into a more frontend-friendly format
        files = [{"id": file_id, "name": file_name} for file_name, file_id in file_options if not file_name.startswith("group:")]
        
        return {"files": files}
    except Exception as e:
        print(f"Error in list_files: {e}")
        return {"files": []}


@app.post("/suggest-questions")
async def suggest_questions(request: SuggestRequest):
    """Generate suggested follow-up questions based on the chat history."""
    suggest_pipeline = SuggestFollowupQuesPipeline()
    suggest_pipeline.lang = SUPPORTED_LANGUAGE_MAP.get(request.language, "English")
    
    suggested_resp = suggest_pipeline(request.history).text
    questions = []
    # The pipeline returns questions in a JSON-like string, e.g., '["q1", "q2"]'
    if ques_res := re.search(r"\\[(.*?)\\]", re.sub("\\n", "", suggested_resp)):
        ques_res_str = ques_res.group()
        try:
            questions = json.loads(ques_res_str)
        except Exception:
            # Handle cases where the LLM output is not perfect JSON
            pass
    
    return {"questions": questions}
