#!/usr/bin/env python3

from __future__ import annotations

import functools
import http.server
import shutil
import socketserver
import subprocess
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT_DIR / "media" / "readme"
WEBM_PATH = OUTPUT_DIR / "oshiclaw-demo.webm"
MP4_PATH = OUTPUT_DIR / "oshiclaw-demo.mp4"
GIF_PATH = OUTPUT_DIR / "oshiclaw-demo.gif"

HOST = "127.0.0.1"
VIEWPORT = {"width": 1320, "height": 940}
VIDEO_SIZE = {"width": 1320, "height": 940}


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:
        return


def start_server() -> tuple[socketserver.TCPServer, threading.Thread]:
    handler = functools.partial(QuietHandler, directory=str(ROOT_DIR))
    server = socketserver.TCPServer((HOST, 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def wait_for_text(page, selector: str, text: str, timeout_ms: int = 10000) -> None:
    page.locator(selector).filter(has_text=text).first.wait_for(timeout=timeout_ms)


def record_webm(demo_url: str) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    temp_webm = None

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(
            viewport=VIEWPORT,
            record_video_dir=str(OUTPUT_DIR),
            record_video_size=VIDEO_SIZE,
        )
        page = context.new_page()
        page.goto(demo_url, wait_until="networkidle")

        wait_for_text(page, ".char-name", "ずんだもん")
        wait_for_text(page, "#chat-messages .message.assistant", "OshiClaw の狙い")
        page.locator("#character-panel").click()
        page.wait_for_timeout(1200)

        page.select_option("#character-select", "takehiro")
        wait_for_text(page, ".char-name", "玄野武宏")
        wait_for_text(page, "#chat-messages .message.assistant", "今ならこの順だ")
        page.wait_for_timeout(900)

        page.select_option("#character-select", "mio")
        wait_for_text(page, ".char-name", "みお")
        wait_for_text(page, "#chat-messages .message.assistant", "いま見せてるところ")
        page.locator("#character-panel").click()
        page.wait_for_timeout(1800)

        video = page.video
        context.close()
        if video is not None:
            temp_webm = Path(video.path())
        browser.close()

    if temp_webm is None:
        raise RuntimeError("Playwright did not produce a video.")

    if WEBM_PATH.exists():
        WEBM_PATH.unlink()
    shutil.move(temp_webm, WEBM_PATH)


def run_ffmpeg(args: list[str]) -> None:
    subprocess.run(["ffmpeg", "-y", *args], check=True, cwd=ROOT_DIR)


def convert_assets() -> None:
    run_ffmpeg(
        [
            "-i",
            str(WEBM_PATH),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(MP4_PATH),
        ]
    )
    run_ffmpeg(
        [
            "-i",
            str(WEBM_PATH),
            "-vf",
            "fps=8,scale=920:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5",
            str(GIF_PATH),
        ]
    )


def main() -> None:
    server = None
    try:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        server, _thread = start_server()
        time.sleep(0.4)
        demo_url = f"http://{HOST}:{server.server_address[1]}/index.html"
        record_webm(demo_url)
        convert_assets()
    finally:
        if server is not None:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    main()
