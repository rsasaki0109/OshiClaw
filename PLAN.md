# oshi-chat 実装プラン

## プロジェクト概要

「推しキャラと一緒にコーディングできるチャットツール」
キャラクター（みお：後輩エンジニア）がLive2Dで動き、ユーザーとペアプロ風に会話するWebアプリ。

---

## 現在のファイル構成

```
oshi-chat/
├── character.yaml          # [済] キャラ定義（name, tone, style, system_prompt）
├── llm.py                  # [済] OpenAI API呼び出し（遅延初期化、gpt-4o-mini）
├── context.py              # [済] カレントdir .pyファイル読み込み（最大300行x5ファイル）
├── main.py                 # [済] CLIチャット版（動作確認済み）
├── server.py               # [済] FastAPI（POST /api/chat, POST /api/reset, 静的配信）
└── static/
    ├── index.html          # [済] 左Live2D+右チャットパネル、CDNでpixi+live2d読込
    ├── style.css           # [済] GitHubダークテーマ風、チャットバブル、ステータスバッジ
    └── app.js              # [済] Live2D初期化+フォールバック顔文字、チャット送受信、状態制御
```

---

## 完了済みステップ

### Phase 1: CLI版（完了）
- [x] `character.yaml` — キャラ定義（みお、後輩口調、system_prompt）
- [x] `llm.py` — OpenAI Chat API呼び出し。遅延初期化でAPI key未設定時も import可能
- [x] `context.py` — `.py`ファイル最大5個/300行をコンテキストとして読み込む
- [x] `main.py` — 無限ループCLI。exit/Ctrl+Cで終了。会話履歴保持

### Phase 2: Web版 骨格（完了）
- [x] `server.py` — FastAPI。`POST /api/chat`（チャット）、`POST /api/reset`（リセット）、`GET /`（index.html配信）
- [x] `static/index.html` — 左45%にLive2Dキャンバス、右55%にチャットUI
- [x] `static/style.css` — ダークテーマ、メッセージバブル、ステータスバッジ（idle/thinking/talking色分け）
- [x] `static/app.js` — Live2Dモデル読み込み（CDN: haru_greeter）、失敗時CSSフォールバック顔文字、チャット送受信

### 検証状況
- [x] `python3 -c "from server import app"` → OK（ルート一覧確認済み）
- [x] `curl http://localhost:8000/` → HTML返却OK
- [x] `curl -X POST http://localhost:8000/api/reset` → `{"status":"ok"}`
- [ ] **ブラウザでの実画面確認はまだ**（Live2D表示、チャット送受信のE2E未確認）

---

## 未完了ステップ（Codex引き継ぎ用）

### Phase 3: Live2D動作確認＆修正（優先度: 高）

#### Step 3-1: Live2D CDN URLの検証
- `app.js:2-3` の `MODEL_URL` が実際にアクセス可能か確認する
- URL: `https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json`
- 404の場合 → 代替モデルURLに差し替え。候補:
  - `https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display@0.4.0/test/assets/haru/haru_greeter_t03.model3.json`（バージョン固定）
  - ローカルにモデルをダウンロードして `static/live2d/` に配置
- **確認方法**: ブラウザのDevTools Networkタブ、またはcurlで該当URLにアクセス

#### Step 3-2: Live2Dライブラリバージョン互換性
- `index.html:33-35` のCDN script 3つが互いに互換か確認:
  - `cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js`
  - `pixi.js@6.5.10`
  - `pixi-live2d-display@0.4.0`
- pixi-live2d-display 0.4.0 は pixi.js v6 を要求する（v7非互換）→ 現状OK
- cubismcore のバージョンが Cubism4 SDK対応か確認

#### Step 3-3: Live2Dモデル表示のデバッグ
- ブラウザで `http://localhost:8000` を開く
- DevTools Console でエラーを確認
- 成功: キャラがキャンバス中央下に表示される
- 失敗: `showFallbackCharacter()` が呼ばれてCSS顔文字が表示される
- **よくある問題**:
  - CORSエラー → モデルをローカルに配置
  - WebGLコンテキスト生成失敗 → ヘッドレス環境では発生しうる
  - モデルの expression/motion 名が合わない → `app.js:111-119` の `f01`/`f02`/`f03` や `tap_body` が存在しない

#### Step 3-4: expression/motion名をモデルに合わせる
- haru_greeter モデルの `.model3.json` を読んで、利用可能な:
  - `Expressions` 配列 → `setModelState()` の expression名を修正
  - `Motions` オブジェクト → motion グループ名を修正
- `app.js` の `setModelState()` 関数を実際のモデル定義に合わせて更新

---

### Phase 4: チャットUI改善（優先度: 中）

#### Step 4-1: マークダウンレンダリング
- 現状: `body.textContent = text` で生テキスト表示 (`app.js:165`)
- 課題: LLMがコードブロックを返してもプレーンテキストになる
- 修正: 軽量マークダウンパーサーを入れる
  - 案A: `marked.js`（CDN `https://cdn.jsdelivr.net/npm/marked/marked.min.js`）
  - 案B: 最小限の自前パース（` ``` ` をpreタグに変換するだけ）
- `addMessage()` で `body.innerHTML = marked.parse(text)` に変更
- **注意**: XSS対策として `DOMPurify` も入れるか、marked の `sanitize` オプションを使う

#### Step 4-2: チャット応答のストリーミング表示
- 現状: LLM応答を全部受けてから一括表示
- 改善: Server-Sent Events (SSE) でトークン単位で流す
- `llm.py` に `chat_stream()` を追加:
  ```python
  def chat_stream(messages, model="gpt-4o-mini"):
      response = _get_client().chat.completions.create(
          model=model, messages=messages, temperature=0.8, stream=True
      )
      for chunk in response:
          delta = chunk.choices[0].delta.content
          if delta:
              yield delta
  ```
- `server.py` に `GET /api/chat/stream` エンドポイント追加（StreamingResponse）
- `app.js` の `sendMessage()` を EventSource/fetch+reader に変更

#### Step 4-3: 会話履歴のトークン管理
- 現状: `conversation_history` が無限に伸びる (`server.py:28`)
- 問題: gpt-4o-miniのコンテキスト上限に達するとエラー
- 修正: `_build_system_prompt()` 呼び出し時に古いメッセージを切り捨て
  - 直近N件（例: 20メッセージ）を保持
  - system promptは常に先頭に維持

---

### Phase 5: キャラクター体験の強化（優先度: 中）

#### Step 5-1: Live2Dクリック/タッチインタラクション
- モデルをクリックしたらリアクション（手を振る等）
- `app.js` で `model.on("hit", ...)` を実装
- hitArea名はモデル定義による（`Head`, `Body` 等）

#### Step 5-2: 「次どうする？」ペアプロ提案の強化
- system_promptに追加ルール:
  - エラーが貼られたら → 原因の仮説を提示
  - コードが貼られたら → 改善ポイントを指摘
  - 「わからん」系 → ステップバイステップ分解
- `character.yaml` の `system_prompt` に追記

#### Step 5-3: キャラ切替機能
- `character.yaml` を複数キャラ対応に拡張、またはディレクトリ化:
  ```
  characters/
    mio.yaml      # 後輩系
    senpai.yaml   # 厳しめ先輩
    buddy.yaml    # 同期の友達
  ```
- UIにキャラ選択ドロップダウン追加
- `server.py` に `POST /api/character` エンドポイント追加

---

### Phase 6: インフラ・DX（優先度: 低）

#### Step 6-1: .envファイル対応
- `python-dotenv` を追加
- `server.py` / `llm.py` の起動時に `.env` を読み込む
- `.env.example` を作成:
  ```
  OPENAI_API_KEY=sk-...
  MODEL=gpt-4o-mini
  PORT=8000
  ```

#### Step 6-2: requirements.txt作成
- ```
  fastapi
  uvicorn[standard]
  pyyaml
  openai
  python-dotenv
  ```

#### Step 6-3: .gitignore作成
- ```
  __pycache__/
  .env
  .browser_data/
  *.pyc
  ```

#### Step 6-4: Live2Dモデルのローカル配置
- CDN依存をなくす
- `static/live2d/` ディレクトリにモデルファイル一式を配置
- `app.js` の `MODEL_URL` をローカルパスに変更: `/static/live2d/model.json`

---

## 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| Backend | Python + FastAPI + uvicorn | Python 3.10+, FastAPI最新 |
| LLM | OpenAI Chat API | gpt-4o-mini (変更可) |
| Frontend | Vanilla JS (CDN依存のみ) | - |
| 2Dキャラ | pixi.js + pixi-live2d-display + Cubism Core | pixi 6.5.10, pixi-live2d-display 0.4.0 |
| 設定 | YAML (character.yaml) | pyyaml |

---

## 既知の技術的リスク

1. **Live2D CDN URL**: jsDelivr経由のGitHub参照は、リポジトリ構成変更で壊れる可能性あり → Phase 6-4でローカル化推奨
2. **expression/motion名ハードコード**: `app.js` の `f01`/`f02`/`f03` や `tap_body` はharuモデル固有。モデル変更時に必ず修正が必要
3. **シングルセッション**: `server.py` のconversation_historyがグローバル変数。複数ブラウザタブで競合する → 将来的にsession ID導入
4. **トークン上限**: 会話が長くなるとAPI上限到達 → Phase 4-3で対応

---

## Codexへの指示

- 小さく動く最小実装を優先し、1ステップずつ実装・確認する
- Phase 3 を最優先で完了させる（Live2Dが動かないとWeb版の意味がない）
- 各ステップで `python3 server.py` を起動し、`curl` でAPIを叩いて動作確認する
- Live2Dの表示確認はDevTools Consoleのログで判断（ヘッドレスの場合）
- フロントエンド変更後はブラウザのハードリロード（Ctrl+Shift+R）が必要
