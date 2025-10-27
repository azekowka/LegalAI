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
from kotaemon.llms import ChatOpenAI

from ktem.reasoning.prompt_optimization.suggest_followup_chat import (
    SuggestFollowupQuesPipeline,
)
from ktem.utils.lang import SUPPORTED_LANGUAGE_MAP

app_state = {}
models_ready = asyncio.Event()


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

        # --- Embeddings (FORCE ONLY OPENAI) ---
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
        else:
            print("WARNING: No OpenAI API key found. Embeddings will not work.")
        
        # --- Rerankings (FORCE DISABLED) ---
        self.KH_RERANKINGS = {}


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

        # --- Indices (FORCE ONLY FILE INDEX) ---
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


def load_models_and_settings_blocking():
    """Initializes the application's core components (this is a slow, blocking function)."""
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
    
    # This is the final step. If this is printed, loading was
    # a successful run in the background.
    print("Background model loading and initialization complete.")
    models_ready.set()


async def background_loader():
    """Runs the blocking loader function in a background thread."""
    try:
        # Run the blocking function in a separate thread
        await asyncio.to_thread(load_models_and_settings_blocking)
    except Exception as e:
        print(f"FATAL: Background loading failed: {e}")


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://legal-ai-web.vercel.app"
    ],
    allow_credentials=True,  # Set to False when using allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/healthz")
def healthz():
    """Health check endpoint."""
    return {"status": "ok"}


@app.on_event("startup")
async def startup_event():
    """Starts the server immediately and kicks off background loading."""
    print("Application startup: Kicking off background tasks.")
    asyncio.create_task(background_loader())


# --- Pydantic Models for API ---

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    history: List[List[str]] = []
    reasoning_mode: str = "simple"  # Use the ID instead of full class path
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
    await models_ready.wait()
    try:
        # This logic is adapted from `ChatPage.create_pipeline`
        index_manager = app_state["index_manager"]
        settings = app_state["settings"]
        reasoning_map = app_state["reasoning_map"]
        
        # Make a copy of settings to modify for this request
        request_settings = deepcopy(settings)
        request_settings["reasoning.lang"] = request.language
        
        # Add missing settings for simple pipeline
        reasoning_options_prefix = f"reasoning.options.{request.reasoning_mode}"
        if f"{reasoning_options_prefix}.highlight_citation" not in request_settings:
            request_settings[f"{reasoning_options_prefix}.highlight_citation"] = "default"
            
        if request.use_mindmap:
            request_settings[f"{reasoning_options_prefix}.create_mindmap"] = True
            print(f"Mindmap enabled in settings for {request.reasoning_mode}: {request_settings[f'{reasoning_options_prefix}.create_mindmap']}")

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
                # Mock the Gradio component format that get_selected_ids expects
                # Format: [mode, selected_files, user_id]
                if request.selected_files:
                    # Select specific files
                    mock_components = ["select", request.selected_files, request.user_id]
                else:
                    # Search all files
                    mock_components = ["all", [], request.user_id]
                
                index_retrievers = index.get_retriever_pipelines(
                    settings=request_settings, user_id=request.user_id, selected=mock_components
                )
                retrievers.extend(index_retrievers)
                print(f"Added {len(index_retrievers)} retrievers from index {index.id}")
            except Exception as e:
                print(f"Error getting retrievers from index {index.id}: {e}")
                # Create a fallback empty retriever list
                raise HTTPException(status_code=500, detail=f"Failed to get document retrievers: {e}")

        # Initialize the reasoning pipeline
        print(f"Retrievers: {retrievers}")
        pipeline = reasoning_cls.get_pipeline(request_settings, {}, retrievers)

        # Stream the response
        async def stream_generator():
            try:
                for response in pipeline.stream(
                    request.message, request.conversation_id, request.history
                ):
                    if response.channel and response.content:
                        yield json.dumps({"type": response.channel, "data": response.content}) + "\n"
            except Exception as e:
                print(f"Error in stream generator: {e}")
                yield json.dumps({"type": "error", "data": str(e)}) + "\n"

        return StreamingResponse(stream_generator(), media_type="application/x-ndjson")
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload(file: UploadFile = File(...), user_id: str = "default"):
    """
    Endpoint to upload a file to the default 'File Collection' index.
    """
    await models_ready.wait()
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
    await models_ready.wait()
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
    await models_ready.wait()
    try:
        # Explicitly use the configured OpenAI LLM to avoid defaulting to Gemini
        settings_obj = Settings()
        openai_spec = settings_obj.KH_LLMS.get("openai", {}).get("spec")

        llm = None
        if openai_spec:
            llm_spec = openai_spec.copy()
            llm_spec.pop("__type__", None)
            llm = ChatOpenAI(**llm_spec)
        else:
            print("WARNING: OpenAI LLM not configured for suggestions.")

        print(f"Generating suggestions for history: {request.history}")
        
        # Check if this is an initial request (no real history)
        is_initial_request = (
            len(request.history) <= 1 and 
            any("what can you tell me about" in str(h).lower() for h in request.history if h)
        )
        
        if is_initial_request:
            # Generate document-based questions
            questions = [
                "What is the main purpose of this document?",
                "What are the key terms and conditions?", 
                "Who are the parties involved?",
                "What are the important dates or deadlines?",
                "What are the main obligations or requirements?"
            ]
            print(f"Generated initial document questions: {questions}")
            return {"questions": questions[:3]}
        
        # Regular follow-up questions based on chat history
        suggest_pipeline = SuggestFollowupQuesPipeline(llm=llm) if llm else SuggestFollowupQuesPipeline()
        suggest_pipeline.lang = SUPPORTED_LANGUAGE_MAP.get(request.language, "English")
        
        suggested_resp = suggest_pipeline(request.history).text
        print(f"LLM suggested response: {suggested_resp}")
        
        questions = []
        
        # First try to parse as complete JSON object
        try:
            # Look for JSON object with "questions" key
            json_match = re.search(r'\{[^}]*"questions"[^}]*\}', suggested_resp, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                print(f"Found JSON object: {json_str}")
                parsed_json = json.loads(json_str)
                if "questions" in parsed_json:
                    questions = parsed_json["questions"]
                    print(f"Parsed questions from JSON: {questions}")
        except Exception as e:
            print(f"JSON object parsing failed: {e}")
        
        # Fallback: try to extract array format
        if not questions:
            if ques_res := re.search(r"\[(.*?)\]", re.sub("\n", "", suggested_resp)):
                ques_res_str = ques_res.group()
                print(f"Extracted array string: {ques_res_str}")
                try:
                    questions = json.loads(ques_res_str)
                    print(f"Parsed questions from array: {questions}")
                except Exception as e:
                    print(f"Array parsing failed: {e}")
        
        # Final fallback: extract questions manually
        if not questions:
            print("Manual extraction fallback")
            lines = suggested_resp.split('\n')
            for line in lines:
                line = line.strip()
                if line and not line.startswith('#') and '?' in line:
                    # Clean up the line
                    line = re.sub(r'^[\d\.\-\*\s]+', '', line).strip()
                    if len(line) > 10:  # Only add substantial questions
                        questions.append(line)
        
        print(f"Final questions to return: {questions}")
        return {"questions": questions[:3]}  # Limit to 3 questions
        
    except Exception as e:
        print(f"Error in suggest_questions: {e}")
        return {"questions": []}
