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

        # --- Embeddings (Multi-API: OpenAI, Google) ---
        self.KH_EMBEDDINGS = {}
        if OPENAI_API_KEY:
            self.KH_EMBEDDINGS["openai"] = {
                "spec": {
                    "__type__": "kotaemon.embeddings.OpenAIEmbeddings",
                    "base_url": config("OPENAI_API_BASE", default="https://api.openai.com/v1"),
                    "api_key": OPENAI_API_KEY,
                    "model": config("OPENAI_EMBEDDINGS_MODEL", default="text-embedding-3-large"),
                    "timeout": 10,
                },
                "default": True,
            }

        GOOGLE_API_KEY = config("GOOGLE_API_KEY", default="")
        if GOOGLE_API_KEY:
            print("Google API Key loaded: Yes")
            self.KH_EMBEDDINGS["google"] = {
                "spec": {
                    "__type__": "kotaemon.embeddings.GoogleEmbeddings",
                    "api_key": GOOGLE_API_KEY,
                },
                "default": False,
            }
        else:
            print("WARNING: No Google API Key found. Some indices may fail.")
        
        # --- Rerankings (Cohere) ---
        self.KH_RERANKINGS = {}
        COHERE_API_KEY = config("COHERE_API_KEY", default="")
        if COHERE_API_KEY:
            print("Cohere API Key loaded: Yes")
            self.KH_RERANKINGS["cohere"] = {
                "spec": {
                    "__type__": "kotaemon.rerankings.CohereReranking",
                    "api_key": COHERE_API_KEY,
                },
                "default": True,
            }
        else:
            print("WARNING: No Cohere API Key found. Reranking may fail.")


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

    # --- SURGICAL FIX: Manually inject API keys into manager instances ---
    # The ktem framework's default indices ignore the settings configuration
    # for API keys. We will patch the model instances directly after they
    # have been loaded by their managers. This ensures that any subsequent
    # use of these models will have the correct credentials.
    print("--- Applying surgical fix to model managers ---")
    google_api_key = config("GOOGLE_API_KEY", default=None)
    cohere_api_key = config("COHERE_API_KEY", default=None)

    if google_api_key and "google" in embedding_models_manager:
        # The underlying object is GoogleEmbeddings from kotaemon
        embedding_models_manager["google"].api_key = google_api_key
        print("  -> Patched GoogleEmbeddings manager instance with API key.")

    if cohere_api_key and "cohere" in reranking_models_manager:
        # The underlying object is CohereReranking from kotaemon
        reranking_models_manager["cohere"].api_key = cohere_api_key
        print("  -> Patched CohereReranking manager instance with API key.")
    # --- END OF FIX ---


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
    allow_credentials=True,
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
    reasoning_mode: str = "simple"
    selected_files: List[str] = []
    user_id: str = "default"
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
        index_manager = app_state["index_manager"]
        settings = app_state["settings"]
        reasoning_map = app_state["reasoning_map"]
        
        request_settings = deepcopy(settings)
        request_settings["reasoning.lang"] = request.language
        
        reasoning_options_prefix = f"reasoning.options.{request.reasoning_mode}"
        if f"{reasoning_options_prefix}.highlight_citation" not in request_settings:
            request_settings[f"{reasoning_options_prefix}.highlight_citation"] = "default"
        if f"{reasoning_options_prefix}.create_mindmap" not in request_settings:
            request_settings[f"{reasoning_options_prefix}.create_mindmap"] = False
            
        if request.use_mindmap:
            request_settings[f"{reasoning_options_prefix}.create_mindmap"] = True
            print(f"Mindmap enabled for {request.reasoning_mode}")

        if request.reasoning_mode not in reasoning_map:
            raise HTTPException(
                status_code=400, 
                detail=f"Unknown reasoning mode: {request.reasoning_mode}"
            )
        
        reasoning_cls = reasoning_map[request.reasoning_mode]

        retrievers = []
        if not index_manager.indices:
            raise HTTPException(status_code=500, detail="No indices available")
            
        index = index_manager.indices[0]
        try:
            mock_components = ["all", [], request.user_id]
            if request.selected_files:
                mock_components = ["select", request.selected_files, request.user_id]
            
            index_retrievers = index.get_retriever_pipelines(
                settings=request_settings, user_id=request.user_id, selected=mock_components
            )
            retrievers.extend(index_retrievers)
            print(f"Added {len(index_retrievers)} retrievers from index {index.id}")
        except Exception as e:
            print(f"Error getting retrievers from index {index.id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get document retrievers: {e}")

        pipeline = reasoning_cls.get_pipeline(request_settings, {}, retrievers)

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
    await models_ready.wait()
    try:
        index_manager = app_state["index_manager"]
        # Find and use the 'File Collection' index specifically
        file_collection_index = next((idx for idx in index_manager.indices if idx.name == "File Collection"), None)
        if not file_collection_index:
            raise HTTPException(status_code=500, detail="'File Collection' index not found.")
        
        settings = app_state["settings"]

        # --- FINAL FIX: Make a copy and force OpenAI embeddings for indexing ---
        request_settings = deepcopy(settings)
        index_id_str = str(file_collection_index.id)
        request_settings[f"index.options.{index_id_str}.embedding_model"] = "openai"
        print(f"--- FINAL FIX APPLIED: Forcing openai embedding for indexing on index {index_id_str} ---")
        # ---

        indexing_pipeline = file_collection_index.get_indexing_pipeline(request_settings, user_id)
        
        # Save the file temporarily
        settings_obj = Settings()
        temp_path = settings_obj.KH_APP_DATA_DIR / file.filename
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())

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
            pass

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
    await models_ready.wait()
    try:
        index_manager = app_state["index_manager"]
        # Find and use the 'File Collection' index specifically
        file_collection_index = next((idx for idx in index_manager.indices if idx.name == "File Collection"), None)
        if not file_collection_index:
            raise HTTPException(status_code=500, detail="'File Collection' index not found.")
        
        # The selector UI component has the logic to list files.
        selector_ui = file_collection_index.get_selector_component_ui()
        
        _, file_options = selector_ui.load_files([], user_id)
        
        files = [{"id": file_id, "name": file_name} for file_name, file_id in file_options if not file_name.startswith("group:")]
        
        return {"files": files}
    except Exception as e:
        print(f"Error in list_files: {e}")
        return {"files": []}


@app.post("/suggest-questions")
async def suggest_questions(request: SuggestRequest):
    await models_ready.wait()
    try:
        settings_obj = Settings()
        openai_spec = settings_obj.KH_LLMS.get("openai", {}).get("spec")

        llm = None
        if openai_spec:
            llm_spec = openai_spec.copy()
            llm_spec.pop("__type__", None)
            llm = ChatOpenAI(**llm_spec)
        else:
            print("WARNING: OpenAI LLM not configured for suggestions.")

        if (
            len(request.history) <= 1 and 
            any("what can you tell me about" in str(h).lower() for h in request.history if h)
        ):
            questions = [
                "What is the main purpose of this document?",
                "What are the key terms and conditions?", 
                "Who are the parties involved?",
                "What are the important dates or deadlines?",
                "What are the main obligations or requirements?"
            ]
            return {"questions": questions[:3]}
        
        suggest_pipeline = SuggestFollowupQuesPipeline(llm=llm) if llm else SuggestFollowupQuesPipeline()
        suggest_pipeline.lang = SUPPORTED_LANGUAGE_MAP.get(request.language, "English")
        
        suggested_resp = suggest_pipeline(request.history).text
        
        questions = []
        try:
            json_match = re.search(r'\{[^}]*"questions"[^}]*\}', suggested_resp, re.DOTALL)
            if json_match:
                parsed_json = json.loads(json_match.group())
                if "questions" in parsed_json:
                    questions = parsed_json["questions"]
        except Exception:
            pass
        
        if not questions:
            try:
                if ques_res := re.search(r"\[(.*?)\]", re.sub("\n", "", suggested_resp)):
                    questions = json.loads(ques_res.group())
            except Exception:
                pass
        
        if not questions:
            lines = suggested_resp.split('\n')
            for line in lines:
                line = re.sub(r'^[\d\.\-\*\s]+', '', line).strip()
                if line and '?' in line and len(line) > 10:
                    questions.append(line)
        
        return {"questions": questions[:3]}
        
    except Exception as e:
        print(f"Error in suggest_questions: {e}")
        return {"questions": []}

async def aiter(stream):
    results, errors, docs = [], [], []
    try:
        while True:
            response = next(stream)
            if response is None:
                continue
            if response.channel == "index":
                if response.content["status"] == "success":
                    results.append(response.content.get("file_id"))
                elif response.content["status"] == "failed":
                    errors.append(response.content.get("message", "Unknown error"))
    except StopIteration as e:
        final_results, final_errors, docs = e.value
        results.extend([r for r in final_results if r])
        errors.extend([e for e in final_errors if e])
    return results, errors, docs
