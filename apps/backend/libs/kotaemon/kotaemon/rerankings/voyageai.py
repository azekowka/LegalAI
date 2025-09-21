from __future__ import annotations

import importlib

from decouple import config
from theflow import Param

from kotaemon.base.schema import Document

from .base import BaseReranking


def _import_voyageai():
    try:
        import voyageai
    except ImportError:
        raise ImportError(
            "Could not import voyageai python package. "
            "Please install it with `pip install voyageai`."
        )
    return voyageai


class VoyageAIReranking(BaseReranking):
    """VoyageAI Reranking model"""

    model_name: str = Param(
        "rerank-2",
        help=(
            "ID of the model to use. You can go to [Supported Models]"
            "(https://docs.voyageai.com/docs/reranker) to see the supported models"
        ),
        required=True,
    )
    api_key: str = Param(
        config("VOYAGE_API_KEY", ""),
        help="VoyageAI API key",
        required=True,
    )

    def __init__(self, *args, **kwargs):
        if "model" in kwargs and "model_name" not in kwargs:
            kwargs["model_name"] = kwargs.pop("model")
        super().__init__(*args, **kwargs)

        if not self.api_key:
            raise ValueError("API key must be provided for VoyageAIEmbeddings.")

        self._client = _import_voyageai().Client(api_key=self.api_key)
        self._aclient = _import_voyageai().AsyncClient(api_key=self.api_key)

    def run(self, documents: list[Document], query: str) -> list[Document]:
        """Use VoyageAI Reranker model to re-order documents
        with their relevance score"""
        compressed_docs: list[Document] = []

        if not documents:  # to avoid empty api call
            return compressed_docs

        _docs = [d.content for d in documents]
        response = self._client.rerank(
            model=self.model_name, query=query, documents=_docs
        )
        for r in response.results:
            doc = documents[r.index]
            doc.metadata["reranking_score"] = r.relevance_score
            compressed_docs.append(doc)

        return compressed_docs
