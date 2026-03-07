FROM python:3.12-slim

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

RUN pip install --no-cache-dir uv

COPY requirements.txt .

# Install PyTorch CPU-only first (~200MB vs ~2GB with CUDA — not needed in container)
RUN uv pip install --system torch torchvision --index-url https://download.pytorch.org/whl/cpu

RUN uv pip install --system -r requirements.txt

RUN python -c "import nltk; nltk.download('punkt_tab', quiet=True); nltk.download('averaged_perceptron_tagger_eng', quiet=True); nltk.download('stopwords', quiet=True)"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]