import os
from collections.abc import Iterator
from urllib.parse import urlparse

from dotenv import load_dotenv
from openai import OpenAI

_client = None
DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434/v1"
DEFAULT_OLLAMA_MODEL = "gemma4:latest"
DEFAULT_OPENAI_MODEL = "gpt-4o-mini"

load_dotenv()


def _is_local_base_url(base_url: str | None) -> bool:
    if not base_url:
        return False

    parsed = urlparse(base_url)
    return parsed.hostname in {"127.0.0.1", "localhost"}


def _get_base_url() -> str | None:
    base_url = os.environ.get("OPENAI_BASE_URL")
    if base_url:
        return base_url.rstrip("/")

    if os.environ.get("OPENAI_API_KEY"):
        return None

    return DEFAULT_OLLAMA_BASE_URL


def _get_api_key(base_url: str | None) -> str:
    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key:
        return api_key

    if _is_local_base_url(base_url):
        return "ollama"

    raise RuntimeError("OPENAI_API_KEY 環境変数を設定してください")


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        base_url = _get_base_url()
        _client = OpenAI(
            api_key=_get_api_key(base_url),
            base_url=base_url,
        )
    return _client


def _get_model_name(model: str | None = None) -> str:
    if model:
        return model

    if os.environ.get("MODEL"):
        return os.environ["MODEL"]

    if _is_local_base_url(_get_base_url()):
        return DEFAULT_OLLAMA_MODEL

    return DEFAULT_OPENAI_MODEL


def get_default_model_name() -> str:
    return _get_model_name()


def list_available_models() -> list[str]:
    response = _get_client().models.list()
    model_ids = sorted(model.id for model in response.data)
    return model_ids or [get_default_model_name()]


def chat(messages: list[dict], model: str | None = None) -> str:
    """OpenAI Chat APIを呼び出し、応答テキストを返す。"""
    response = _get_client().chat.completions.create(
        model=_get_model_name(model),
        messages=messages,
        temperature=0.8,
    )
    return response.choices[0].message.content


def chat_stream(messages: list[dict], model: str | None = None) -> Iterator[str]:
    """OpenAI Chat APIをストリーミングで呼び出し、テキスト片を返す。"""
    stream = _get_client().chat.completions.create(
        model=_get_model_name(model),
        messages=messages,
        temperature=0.8,
        stream=True,
    )

    for chunk in stream:
        for choice in chunk.choices:
            content = choice.delta.content or ""
            if content:
                yield content
