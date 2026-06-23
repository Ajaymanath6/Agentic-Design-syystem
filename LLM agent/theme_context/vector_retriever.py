"""Optional vector retrieval (LangChain + Chroma). Falls back silently."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from theme_context.chunks import ThemeChunk
from theme_context.config import rag_index_dir
from theme_context.token_help import TokenHelpEntry, load_token_help_entries

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)

_vector_store = None
_embeddings = None
_init_attempted = False


def _try_init_vector_store() -> bool:
    global _vector_store, _embeddings, _init_attempted
    if _vector_store is not None:
        return True
    if _init_attempted:
        return False
    _init_attempted = True
    try:
        import chromadb
        from langchain_chroma import Chroma
        from theme_context.vertex_credentials import load_dotenv_llm, make_vertex_embeddings
    except ImportError as e:
        logger.warning("RAG vector deps not installed: %s", e)
        return False

    load_dotenv_llm()
    index_dir = rag_index_dir()
    try:
        _embeddings = make_vertex_embeddings()
        client = chromadb.PersistentClient(path=index_dir)
        _vector_store = Chroma(
            client=client,
            collection_name="theme_catalog",
            embedding_function=_embeddings,
        )
        if _vector_store._collection.count() == 0:  # type: ignore[attr-defined]
            logger.warning("RAG index empty at %s — run build_rag_index.py", index_dir)
            _vector_store = None
            return False
        return True
    except Exception as e:
        logger.warning("Vector store init failed: %s", e)
        _vector_store = None
        return False


def retrieve_vector_chunks(
    prompt: str,
    *,
    top_k: int = 5,
) -> list[tuple[str, str]]:
    """Returns list of (chunk_id, text)."""
    if not _try_init_vector_store() or _vector_store is None:
        return []
    try:
        docs = _vector_store.similarity_search(prompt, k=top_k)
    except Exception as e:
        logger.warning("Vector search failed: %s", e)
        return []
    out: list[tuple[str, str]] = []
    for doc in docs:
        cid = (doc.metadata or {}).get("chunk_id", "unknown")
        out.append((str(cid), doc.page_content))
    return out


def vector_hits_to_theme_chunks(hits: list[tuple[str, str]]) -> list[ThemeChunk]:
    chunks: list[ThemeChunk] = []
    for cid, text in hits:
        if not text.strip():
            continue
        chunks.append(
            ThemeChunk(chunk_id=f"vector:{cid}", text=text, keywords=frozenset()),
        )
    return chunks


def vector_hits_to_catalog_excerpts(hits: list[tuple[str, str]]) -> str:
    lines: list[str] = []
    for cid, text in hits:
        if cid.startswith("catalog:") and text.strip():
            lines.append(text.strip())
    if not lines:
        return ""
    header = "Published catalog HTML (vector-retrieved reference):"
    return header + "\n" + "\n".join(lines)
