#!/usr/bin/env python3
"""Build Chroma index for THEME_CONTEXT_MODE=rag. Run from repo: npm run rag:reindex"""

from __future__ import annotations

import json
import os
import sys

# Allow imports from LLM agent root
_AGENT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _AGENT_ROOT not in sys.path:
    sys.path.insert(0, _AGENT_ROOT)

from theme_context.catalog_index import load_catalog_records
from theme_context.chunks import load_theme_chunks
from theme_context.config import rag_index_dir
from theme_context.token_help import load_token_help_entries
from theme_context.vertex_credentials import load_dotenv_llm, make_vertex_embeddings


def main() -> None:
    load_dotenv_llm(_AGENT_ROOT)
    try:
        import chromadb
        from langchain_chroma import Chroma
        from langchain_core.documents import Document
    except ImportError as e:
        print(
            "Install RAG deps: pip install -r requirements-rag.txt",
            file=sys.stderr,
        )
        raise SystemExit(1) from e

    index_dir = os.path.abspath(rag_index_dir())
    os.makedirs(index_dir, exist_ok=True)

    embeddings = make_vertex_embeddings()
    client = chromadb.PersistentClient(path=index_dir)

    try:
        client.delete_collection("theme_catalog")
    except Exception:
        pass

    store = Chroma(
        client=client,
        collection_name="theme_catalog",
        embedding_function=embeddings,
    )

    documents: list[Document] = []

    for chunk in load_theme_chunks(force_reload=True):
        documents.append(
            Document(
                page_content=chunk.text,
                metadata={"chunk_id": chunk.chunk_id, "source": "theme-guide"},
            ),
        )

    for entry in load_token_help_entries(force_reload=True):
        documents.append(
            Document(
                page_content=f"{entry.title}\n{entry.text}",
                metadata={"chunk_id": f"help:{entry.entry_id}", "source": "token-help"},
            ),
        )

    for rec in load_catalog_records(force_reload=True):
        if not rec.html_excerpt:
            continue
        documents.append(
            Document(
                page_content=(
                    f"catalog:{rec.record_id}\n"
                    f"label={rec.label} kind={rec.kind}\n"
                    f"{rec.html_excerpt}"
                ),
                metadata={
                    "chunk_id": f"catalog:{rec.record_id}",
                    "source": "catalog",
                },
            ),
        )

    if not documents:
        print("No documents to index.", file=sys.stderr)
        raise SystemExit(1)

    store.add_documents(documents)
    meta_path = os.path.join(index_dir, "index-meta.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump({"document_count": len(documents)}, f)
    print(f"Indexed {len(documents)} documents at {index_dir}")


if __name__ == "__main__":
    main()
