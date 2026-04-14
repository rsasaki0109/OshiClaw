import os
from pathlib import Path

MAX_LINES = 300
MAX_FILES = 5


def load_context(directory: str = ".") -> str:
    """カレントディレクトリの.pyファイルを読み込み、コンテキスト文字列を返す。"""
    py_files = sorted(Path(directory).glob("*.py"))
    if not py_files:
        return ""

    parts = []
    total_lines = 0
    for f in py_files[:MAX_FILES]:
        try:
            lines = f.read_text(encoding="utf-8").splitlines()
        except (OSError, UnicodeDecodeError):
            continue
        take = min(len(lines), MAX_LINES - total_lines)
        if take <= 0:
            break
        parts.append(f"# --- {f.name} ---\n" + "\n".join(lines[:take]))
        total_lines += take

    if not parts:
        return ""

    return (
        "\n\n以下はカレントディレクトリのコードコンテキストです:\n\n"
        + "\n\n".join(parts)
        + "\n"
    )
