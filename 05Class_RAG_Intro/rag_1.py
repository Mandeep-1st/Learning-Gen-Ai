# ### Starting with the pdf example.

# # Loading Pdf_loader
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader

pdf_path = Path(__file__).parent / "nodejs.pdf"

loader = PyPDFLoader(file_path=pdf_path)

# .load() separates the whole things into multiple chunks and return an array.
docs = loader.load()

print(f"Pages loaded: {len(docs)}")

# We are using splitter because we will never be sure about each document created about their size but from here we can make them uniform like we want.
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Why we are using overlap because, creating chunks cut to cut will may lose the meanings of some words so taking some from above and below make things more accurate and correct.
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)

splitted_docs = text_splitter.split_documents(documents=docs)


print(f"splitted loaded: {len(splitted_docs)}")
## Accessing a model to create the Vector embeddings
from langchain_ollama import OllamaEmbeddings

embedder = OllamaEmbeddings(
    model="nomic-embed-text"
)


# ## Linking the DB to store that vectors
from langchain_qdrant import QdrantVectorStore

vector_store = QdrantVectorStore.from_documents(
    documents=[],
    url="http://localhost:6333",
    collection_name="learning_langchain",
    embedding=embedder
)

vector_store.add_documents(documents=splitted_docs)

print("INGESTION DONE.")

#---------- Technically create a diff file for ingestion-----------------------#


# Retrieval
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_qdrant import QdrantVectorStore
from langchain_core.messages import SystemMessage, HumanMessage

# Embedding Model
embedder = OllamaEmbeddings(
    model="nomic-embed-text"
)



# Load Existing Qdrant Collection

vector_store = QdrantVectorStore.from_existing_collection(
    url="http://localhost:6333",
    collection_name="learning_langchain",
    embedding=embedder
)


# Chat Model
llm = ChatOllama(
    model="qwen3:4b",
    temperature=0,
    num_ctx=4096
)
print("LLM: ", llm)


# Chat loop
while True:
    query = input("\nAsk your question (or type exit): ")

    if query.lower() == "exit":
        break

    # Retrieve relevant chunks
    relevant_chunks = vector_store.similarity_search(
        query=query,
        k=4
    )

    print("\nRetrieved Chunks:")
    print("=" * 50)

    for i, chunk in enumerate(relevant_chunks, 1):
        print(f"\nChunk {i}:")
        print(chunk.page_content[:300])
        print("-" * 50)

    # Build context
    context = "\n\n".join(
        chunk.page_content
        for chunk in relevant_chunks
    )

    # System Prompt
    SYSTEM_PROMPT = f"""
You are a helpful AI assistant.

Answer ONLY from the provided context.

If the answer is not present in the context, say:
"I could not find the answer in the provided documents."

Context:
{context}
"""

    # Generate Answer
    response = llm.invoke(
        [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=query)
        ]
    )

    print("\nAnswer:")
    print("=" * 50)
    print(response.content)
    

