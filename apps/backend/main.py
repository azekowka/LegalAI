import asyncio
import os
from pathlib import Path
from typing import Any, List, Optional
from copy import deepcopy

from decouple import config
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from theflow.utils.modules import import_dotted_string

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
                "value": "ktem.reasoning.simple.FullQAPipeline",
                "choices": self.KH_REASONINGS,
                "component": "radio",
            },
            "lang": {
                "name": "Language",
                "value": "en",
                "choices": [(lang, code) for code, lang in SUPPORTED_LANGUAGE_MAP.items()],
                "component": "dropdown",
            },
        }
        self.SETTINGS_APP = {}
        self.KH_FEATURE_USER_MANAGEMENT = False
        
    def __getattr__(self, name: str) -> Any:
        # A little trick to make this class behave like the `theflow.settings` object
        return self.__dict__.get(name)


app = FastAPI()


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

    # Load reasonings
    for value in settings_obj.KH_REASONINGS:
        reasoning_cls = import_dotted_string(value, safe=False)
        rid = reasoning_cls.get_info()["id"]
        reasoning_components[rid] = reasoning_cls

    app_state["reasonings"] = reasoning_components
    
    # Prepare settings state
    default_settings = SettingGroup(
        application=BaseSettingGroup(settings=settings_obj.SETTINGS_APP),
        reasoning=SettingReasoningGroup(settings=settings_obj.SETTINGS_REASONING),
    )
    for index in index_manager.indices:
        options = index.get_user_settings()
        default_settings.index.options[index.id] = BaseSettingGroup(
            settings=options
        )

    default_settings.reasoning.finalize()
    default_settings.index.finalize()
    app_state["settings"] = default_settings.flatten()


# --- Pydantic Models for API ---

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    history: List[List[str]] = []
    reasoning_mode: str = "ktem.reasoning.simple.FullQAPipeline"
    selected_files: List[str] = []
    user_id: str = "default"  # Assuming a single user for now


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
    from ktem.components import reasonings

    # This logic is adapted from `ChatPage.create_pipeline`
    index_manager = app_state["index_manager"]
    settings = app_state["settings"]
    
    reasoning_cls = reasonings[request.reasoning_mode]

    # Get retrievers from the index manager
    retrievers = []
    for index in index_manager.indices:
        # Assuming we are using the first index (File Collection)
        # and passing selected file ids to it.
        retrievers.extend(
            index.get_retriever_pipelines(
                settings=settings, user_id=request.user_id, selected=request.selected_files
            )
        )

    # Initialize the reasoning pipeline
    pipeline = reasoning_cls.get_pipeline(settings, {}, retrievers)

    # Stream the response
    async def stream_generator():
        for response in pipeline.stream(
            request.message, request.conversation_id, request.history
        ):
            if response.channel == "chat" and response.content:
                yield response.content

    return StreamingResponse(stream_generator(), media_type="text/event-stream")

@app.post("/upload")
async def upload(file: UploadFile = File(...), user_id: str = "default"):
    """
    Endpoint to upload a file to the default 'File Collection' index.
    """
    index_manager = app_state["index_manager"]
    # Assuming the first index is our target File Collection
    file_collection_index = index_manager.indices[0]
    
    settings = app_state["settings"]
    indexing_pipeline = file_collection_index.get_indexing_pipeline(settings, user_id)
    
    # Save the file temporarily
    temp_path = Path(app_state["settings"]["KH_APP_DATA_DIR"]) / file.filename
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())

    # Run the indexing pipeline
    # The pipeline takes a list of file paths
    result = indexing_pipeline.run([str(temp_path)])
    
    # Clean up the temporary file
    os.remove(temp_path)

    return {"filename": file.filename, "ids": result}

@app.get("/files")
async def list_files(user_id: str = "default"):
    """List available files in the index."""
    index_manager = app_state["index_manager"]
    file_collection_index = index_manager.indices[0]
    
    # The selector UI component has the logic to list files.
    selector_ui = file_collection_index.get_selector_component_ui()
    files = selector_ui.get_choices(user_id)
    
    return {"files": files}
