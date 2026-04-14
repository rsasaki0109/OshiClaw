#!/usr/bin/env python3
"""推しチャット Webサーバー"""

import os
from collections.abc import Iterator
from pathlib import Path

import yaml
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from context import load_context
from llm import chat, chat_stream, get_default_model_name, list_available_models

load_dotenv()

app = FastAPI()

BASE_DIR = Path(__file__).parent
CHARACTERS_DIR = BASE_DIR / "characters"
DEFAULT_CHARACTER_ID = "mio"

# コードコンテキスト（起動時に1回読み込み）
CODE_CONTEXT = load_context(str(BASE_DIR))
MAX_HISTORY_MESSAGES = 20

# セッション別の会話履歴（簡易実装: シングルセッション）
conversation_history: list[dict] = []


def _coerce_float(value: object, default: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _load_character_file(path: Path) -> tuple[str, dict]:
    with open(path, encoding="utf-8") as f:
        character = yaml.safe_load(f)

    character_id = character.get("id", path.stem)
    character["id"] = character_id
    character.setdefault("role_label", "エンジニア")
    character.setdefault("intro_message", f"{character['name']}だよ。よろしくね。")
    character.setdefault("reset_message", "会話をリセットしたよ。")
    character.setdefault("input_placeholder", "何か聞いて！")
    character.setdefault("hit_reactions", {})
    live2d = character.get("live2d") or {}
    if not isinstance(live2d, dict):
        live2d = {}
    expressions = live2d.get("expressions") or {}
    if not isinstance(expressions, dict):
        expressions = {}
    motions = live2d.get("motions") or {}
    if not isinstance(motions, dict):
        motions = {}
    live2d["model_url"] = str(live2d.get("model_url", ""))
    live2d["expressions"] = expressions
    live2d["motions"] = motions
    character["live2d"] = live2d

    fallback_appearance = character.get("fallback_appearance") or {}
    if not isinstance(fallback_appearance, dict):
        fallback_appearance = {}
    character["fallback_appearance"] = fallback_appearance

    tts = character.get("tts") or {}
    if not isinstance(tts, dict):
        tts = {}
    voice_keywords = tts.get("voice_keywords") or []
    if not isinstance(voice_keywords, list):
        voice_keywords = []
    tts["preferred_lang"] = str(tts.get("preferred_lang", "ja-JP"))
    tts["voice_keywords"] = [
        str(keyword).strip() for keyword in voice_keywords if str(keyword).strip()
    ]
    tts["rate"] = _coerce_float(tts.get("rate"), 1.0)
    tts["pitch"] = _coerce_float(tts.get("pitch"), 1.0)
    character["tts"] = tts
    return character_id, character


def _load_characters() -> dict[str, dict]:
    characters: dict[str, dict] = {}

    if CHARACTERS_DIR.exists():
        for path in sorted(CHARACTERS_DIR.glob("*.yaml")):
            character_id, character = _load_character_file(path)
            characters[character_id] = character

    if not characters:
        character_id, character = _load_character_file(BASE_DIR / "character.yaml")
        characters[character_id] = character

    return characters


CHARACTERS = _load_characters()
current_character_id = (
    DEFAULT_CHARACTER_ID if DEFAULT_CHARACTER_ID in CHARACTERS else next(iter(CHARACTERS))
)
current_model_name = get_default_model_name()


def _get_current_character() -> dict:
    return CHARACTERS[current_character_id]


def _serialize_character(character: dict) -> dict:
    return {
        "id": character["id"],
        "name": character["name"],
        "role_label": character["role_label"],
        "tone": character.get("tone", ""),
        "style": character.get("style", ""),
        "intro_message": character["intro_message"],
        "reset_message": character["reset_message"],
        "input_placeholder": character["input_placeholder"],
        "hit_reactions": character.get("hit_reactions", {}),
        "live2d": character.get("live2d", {}),
        "fallback_appearance": character.get("fallback_appearance", {}),
        "tts": character.get("tts", {}),
    }


def _build_system_prompt() -> str:
    prompt = _get_current_character()["system_prompt"]
    if CODE_CONTEXT:
        prompt += "\n" + CODE_CONTEXT
    return prompt


def _ensure_system_prompt() -> None:
    if not conversation_history:
        conversation_history.append(
            {"role": "system", "content": _build_system_prompt()}
        )


def _trim_conversation_history() -> None:
    if len(conversation_history) <= MAX_HISTORY_MESSAGES + 1:
        return

    system_message = conversation_history[0]
    recent_messages = conversation_history[1:][-MAX_HISTORY_MESSAGES:]
    conversation_history[:] = [system_message, *recent_messages]


def _prepare_conversation(message: str) -> list[dict]:
    _ensure_system_prompt()
    conversation_history.append({"role": "user", "content": message})
    _trim_conversation_history()
    return list(conversation_history)


def _store_assistant_reply(reply: str) -> None:
    conversation_history.append({"role": "assistant", "content": reply})
    _trim_conversation_history()


def _rollback_last_user_message(message: str) -> None:
    if not conversation_history:
        return

    last_message = conversation_history[-1]
    if last_message.get("role") == "user" and last_message.get("content") == message:
        conversation_history.pop()


def _serialize_visible_messages() -> list[dict[str, str]]:
    return [
        {"role": message["role"], "content": message["content"]}
        for message in conversation_history
        if message["role"] != "system"
    ]


def _restore_conversation_history(messages: list[dict[str, str]]) -> None:
    conversation_history.clear()
    _ensure_system_prompt()
    conversation_history.extend(messages)
    _trim_conversation_history()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


class CharacterInfo(BaseModel):
    id: str
    name: str
    role_label: str
    tone: str
    style: str
    intro_message: str
    reset_message: str
    input_placeholder: str
    hit_reactions: dict[str, str]
    live2d: dict
    fallback_appearance: dict
    tts: dict


class CharactersResponse(BaseModel):
    current_character_id: str
    characters: list[CharacterInfo]


class CharacterSelectRequest(BaseModel):
    character_id: str


class CharacterSelectResponse(BaseModel):
    status: str
    character: CharacterInfo


class ModelsResponse(BaseModel):
    current_model_name: str
    models: list[str]


class ModelSelectRequest(BaseModel):
    model_name: str


class ModelSelectResponse(BaseModel):
    status: str
    model_name: str


class SessionMessage(BaseModel):
    role: str
    content: str


class SessionStateResponse(BaseModel):
    character: CharacterInfo
    current_model_name: str
    messages: list[SessionMessage]


class SessionRestoreRequest(BaseModel):
    character_id: str
    model_name: str
    messages: list[SessionMessage]


@app.post("/api/chat", response_model=ChatResponse)
def api_chat(req: ChatRequest):
    reply = chat(_prepare_conversation(req.message), model=current_model_name)
    _store_assistant_reply(reply)

    return ChatResponse(reply=reply)


@app.post("/api/chat/stream")
def api_chat_stream(req: ChatRequest):
    messages = _prepare_conversation(req.message)

    def generate() -> Iterator[str]:
        chunks: list[str] = []
        completed = False

        try:
            for chunk in chat_stream(messages, model=current_model_name):
                chunks.append(chunk)
                yield chunk
            completed = True
        finally:
            if completed:
                _store_assistant_reply("".join(chunks))
            else:
                _rollback_last_user_message(req.message)

    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/session", response_model=SessionStateResponse)
def api_session():
    return SessionStateResponse(
        character=CharacterInfo(**_serialize_character(_get_current_character())),
        current_model_name=current_model_name,
        messages=[SessionMessage(**message) for message in _serialize_visible_messages()],
    )


@app.put("/api/session", response_model=SessionStateResponse)
def api_restore_session(req: SessionRestoreRequest):
    global current_character_id, current_model_name

    if req.character_id not in CHARACTERS:
        raise HTTPException(status_code=404, detail="character not found")

    try:
        models = list_available_models()
    except Exception:
        models = [current_model_name]

    if req.model_name not in models:
        raise HTTPException(status_code=404, detail="model not found")

    restored_messages = [
        {"role": message.role, "content": message.content}
        for message in req.messages
        if message.role in {"user", "assistant"} and message.content.strip()
    ]

    current_character_id = req.character_id
    current_model_name = req.model_name
    _restore_conversation_history(restored_messages)

    return SessionStateResponse(
        character=CharacterInfo(**_serialize_character(_get_current_character())),
        current_model_name=current_model_name,
        messages=[SessionMessage(**message) for message in _serialize_visible_messages()],
    )


@app.get("/api/characters", response_model=CharactersResponse)
def api_characters():
    return CharactersResponse(
        current_character_id=current_character_id,
        characters=[
            CharacterInfo(**_serialize_character(character))
            for character in CHARACTERS.values()
        ],
    )


@app.post("/api/character", response_model=CharacterSelectResponse)
def api_character(req: CharacterSelectRequest):
    global current_character_id

    if req.character_id not in CHARACTERS:
        raise HTTPException(status_code=404, detail="character not found")

    current_character_id = req.character_id
    conversation_history.clear()

    return CharacterSelectResponse(
        status="ok",
        character=CharacterInfo(**_serialize_character(_get_current_character())),
    )


@app.get("/api/models", response_model=ModelsResponse)
def api_models():
    try:
        models = list_available_models()
    except Exception:
        models = [current_model_name]

    return ModelsResponse(
        current_model_name=current_model_name,
        models=models,
    )


@app.post("/api/model", response_model=ModelSelectResponse)
def api_model(req: ModelSelectRequest):
    global current_model_name

    try:
        models = list_available_models()
    except Exception:
        models = [current_model_name]

    if req.model_name not in models:
        raise HTTPException(status_code=404, detail="model not found")

    current_model_name = req.model_name
    conversation_history.clear()

    return ModelSelectResponse(
        status="ok",
        model_name=current_model_name,
    )


@app.post("/api/reset")
def api_reset():
    conversation_history.clear()
    return {"status": "ok"}


# 静的ファイル配信
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


@app.get("/")
def index():
    return FileResponse(BASE_DIR / "static" / "index.html")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))
