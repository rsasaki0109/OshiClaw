#!/usr/bin/env python3
"""推しキャラと一緒にコーディングできるチャットツール"""

import sys
from pathlib import Path

import yaml

from context import load_context
from llm import chat


def load_character(path: str = "character.yaml") -> dict:
    """キャラクター定義YAMLを読み込む。"""
    with open(Path(__file__).parent / path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def build_system_prompt(character: dict, code_context: str) -> str:
    """system promptを組み立てる。"""
    prompt = character["system_prompt"]
    if code_context:
        prompt += "\n" + code_context
    return prompt


def main():
    character = load_character()
    code_context = load_context()
    system_prompt = build_system_prompt(character, code_context)

    messages = [{"role": "system", "content": system_prompt}]

    print(f"\n  {character['name']}：先輩、今日も一緒にがんばろっ！")
    print(f"  （exitで終了）\n")

    while True:
        try:
            user_input = input("you: ").strip()
        except (EOFError, KeyboardInterrupt):
            print(f"\n{character['name']}：おつかれさまっす！またね～")
            break

        if not user_input:
            continue
        if user_input.lower() == "exit":
            print(f"\n{character['name']}：おつかれさまっす！またね～")
            break

        messages.append({"role": "user", "content": user_input})

        try:
            reply = chat(messages)
        except Exception as e:
            print(f"\n[エラー] API呼び出し失敗: {e}\n")
            messages.pop()
            continue

        messages.append({"role": "assistant", "content": reply})
        print(f"\n{character['name']}：{reply}\n")


if __name__ == "__main__":
    main()
