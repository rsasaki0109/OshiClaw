const CHARACTERS = [
  {
    id: "kurose",
    name: "黒瀬",
    role: "先輩エンジニア",
    live2d: null,
    fallback: {
      eyeLeft: "◉",
      eyeRight: "◉",
      mouth: "—",
      accent: "#ffa657",
      mouthColor: "#ffa657",
      nameColor: "#ffa657",
      faceScale: 1.04,
    },
    reaction: "状況から出して。最短で切る。",
    scenes: [
      [
        { role: "user", content: "このプロジェクト、どんな感じ？" },
        {
          role: "assistant",
          content:
            "## OshiClaw の狙い\n\n- 開発支援とキャラ体験を同じ UI に乗せる\n- ローカルでは実 LLM、Pages では静的 demo を見せる\n- public に出しても説明しやすいクール寄りの世界観に寄せている\n\nまずは使い道が一目で分かる形にしている。",
        },
      ],
      [
        { role: "user", content: "次に詰めるなら？" },
        {
          role: "assistant",
          content:
            "次ならこの順だ。\n\n1. 実 Live2D モデルを増やす\n2. 会話 export を入れる\n3. Markdown の table を足す\n\n優先度を守れば、公開後も崩れない。",
        },
      ],
    ],
  },
  {
    id: "mio",
    name: "みお",
    role: "実装アシスタント",
    live2d: {
      modelUrl: "./static/live2d/haru/haru_greeter_t03.model3.json",
      expressions: { idle: "f00", talking: "f03", thinking: "f02" },
      motions: { idle: "Idle", talking: "Tap" },
    },
    fallback: {
      eyeLeft: "●",
      eyeRight: "●",
      mouth: "ω",
      accent: "#58a6ff",
      mouthColor: "#f97583",
      nameColor: "#58a6ff",
      faceScale: 1,
    },
    reaction: "状況を見よう。実装の当たりを一緒に絞るね。",
    scenes: [
      [
        { role: "user", content: "このプロジェクト、どんな感じ？" },
        {
          role: "assistant",
          content:
            "## いま見せてるところ\n\n- Live2D 表示\n- キャラ切替\n- Markdown 表示\n- 音声とリアクション演出\n\n```bash\npython3 server.py\n```",
        },
      ],
      [
        { role: "user", content: "エラー調査っぽい流れも見たい" },
        {
          role: "assistant",
          content:
            "> まず再現条件を絞るのが近道かも。\n\n1. 失敗する操作を固定\n2. Console / Network を確認\n3. 直近差分を切る\n\n必要ならローカル版で実際に会話しよう。",
        },
      ],
    ],
  },
  {
    id: "buddy",
    name: "ハル",
    role: "同期の相棒",
    live2d: null,
    fallback: {
      eyeLeft: "•",
      eyeRight: "•",
      mouth: "ᴗ",
      accent: "#3fb950",
      mouthColor: "#56d364",
      nameColor: "#3fb950",
      faceScale: 0.98,
    },
    reaction: "よし、まず demo 触ってみよう。",
    scenes: [
      [
        { role: "user", content: "GitHub Pages では何が見れる？" },
        {
          role: "assistant",
          content:
            "## Pages 版で見れるもの\n\n- キャラの雰囲気\n- 会話テンポ\n- Markdown 表示\n- Live2D / fallback の見た目差\n\n[ローカル版の起動方法](./README.md) も repo にまとめてある。",
        },
      ],
      [
        { role: "user", content: "試す順番を 3 つで教えて" },
        {
          role: "assistant",
          content:
            "1. キャラを切り替える\n2. `会話を再生` を押す\n3. `音声 ON` で雰囲気を見る\n\n気になったらローカル版で実チャットに進もう。",
        },
      ],
    ],
  },
];

const STATUS_LABELS = {
  idle: "待機中...",
  thinking: "考え中...",
  talking: "おしゃべり中！",
};

const characterSelectEl = document.getElementById("character-select");
const replayBtn = document.getElementById("replay-btn");
const nextSceneBtn = document.getElementById("next-scene-btn");
const voiceToggleBtn = document.getElementById("voice-toggle");
const charNameEl = document.querySelector(".char-name");
const charRoleEl = document.querySelector(".char-role");
const messagesEl = document.getElementById("chat-messages");
const charStatusEl = document.getElementById("char-status");
const charReactionEl = document.getElementById("char-reaction");
const characterPanelEl = document.getElementById("character-panel");
const fallbackEl = document.getElementById("fallback-char");
const live2dCanvasEl = document.getElementById("live2d-canvas");

let currentCharacter = CHARACTERS[0];
let currentSceneIndex = 0;
let playbackToken = 0;
let live2dApp = null;
let live2dModel = null;
let voiceEnabled = false;
let activeUtterance = null;

function setStatus(state) {
  charStatusEl.className = state;
  charStatusEl.textContent = STATUS_LABELS[state] || state;
  if (live2dModel) {
    try {
      if (state === "thinking") {
        live2dModel.expression(currentCharacter.live2d?.expressions.thinking);
      } else if (state === "talking") {
        live2dModel.expression(currentCharacter.live2d?.expressions.talking);
        live2dModel.motion(currentCharacter.live2d?.motions.talking);
      } else {
        live2dModel.expression(currentCharacter.live2d?.expressions.idle);
        live2dModel.motion(currentCharacter.live2d?.motions.idle);
      }
    } catch {
      // expression / motion may vary per model
    }
  }

  if (state === "talking") {
    characterPanelEl.classList.add("speaking");
  } else {
    characterPanelEl.classList.remove("speaking");
  }
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function stopSpeech() {
  if (!("speechSynthesis" in window)) {
    return;
  }

  activeUtterance = null;
  window.speechSynthesis.cancel();
}

function speak(text) {
  if (!voiceEnabled || !("speechSynthesis" in window)) {
    return;
  }

  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(
    text
      .replace(/```[\s\S]*?```/g, "コードがあります。")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
  );
  utterance.lang = "ja-JP";
  utterance.rate = currentCharacter.id === "kurose" ? 0.93 : 1.04;
  utterance.pitch = currentCharacter.id === "kurose" ? 0.8 : 0.98;
  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function appendTextWithLineBreaks(container, text) {
  const parts = text.split("\n");
  parts.forEach((part, index) => {
    if (part) {
      container.appendChild(document.createTextNode(part));
    }
    if (index < parts.length - 1) {
      container.appendChild(document.createElement("br"));
    }
  });
}

function sanitizeLink(href) {
  try {
    const url = new URL(href, window.location.href);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
  } catch {
    return null;
  }
  return null;
}

function appendInlineMarkdown(container, text) {
  const inlinePattern =
    /(`([^`]+)`|\[([^\]]+)\]\((\S+?)(?:\s+"[^"]*")?\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\n]+)\*|_([^_\n]+)_)/g;
  let lastIndex = 0;
  let match;

  while ((match = inlinePattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      appendTextWithLineBreaks(container, text.slice(lastIndex, match.index));
    }

    if (match[2] !== undefined) {
      const code = document.createElement("code");
      code.textContent = match[2];
      container.appendChild(code);
    } else if (match[3] !== undefined && match[4] !== undefined) {
      const href = sanitizeLink(match[4]);
      if (href) {
        const link = document.createElement("a");
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        appendInlineMarkdown(link, match[3]);
        container.appendChild(link);
      } else {
        appendTextWithLineBreaks(container, match[3]);
      }
    } else if (match[5] !== undefined || match[6] !== undefined) {
      const strong = document.createElement("strong");
      appendInlineMarkdown(strong, match[5] ?? match[6]);
      container.appendChild(strong);
    } else if (match[7] !== undefined || match[8] !== undefined) {
      const em = document.createElement("em");
      appendInlineMarkdown(em, match[7] ?? match[8]);
      container.appendChild(em);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    appendTextWithLineBreaks(container, text.slice(lastIndex));
  }
}

function isBlockStart(line) {
  return (
    /^#{1,6}\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*+]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^```/.test(line)
  );
}

function renderMarkdown(text) {
  const fragment = document.createDocumentFragment();
  const lines = String(text ?? "").replace(/\r\n/g, "\n").split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fenceMatch = line.match(/^```([^\n`]*)$/);
    if (fenceMatch) {
      const codeLines = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) {
        index += 1;
      }
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = codeLines.join("\n");
      pre.appendChild(code);
      fragment.appendChild(pre);
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const heading = document.createElement(`h${headingMatch[1].length}`);
      appendInlineMarkdown(heading, headingMatch[2]);
      fragment.appendChild(heading);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const blockquote = document.createElement("blockquote");
      const quoteLines = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      appendInlineMarkdown(blockquote, quoteLines.join("\n"));
      fragment.appendChild(blockquote);
      continue;
    }

    const unorderedMatch = line.match(/^[-*+]\s+(.*)$/);
    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (unorderedMatch || orderedMatch) {
      const list = document.createElement(unorderedMatch ? "ul" : "ol");
      while (index < lines.length) {
        const itemMatch = unorderedMatch
          ? lines[index].match(/^[-*+]\s+(.*)$/)
          : lines[index].match(/^\d+\.\s+(.*)$/);
        if (!itemMatch) {
          break;
        }
        const li = document.createElement("li");
        appendInlineMarkdown(li, itemMatch[1]);
        list.appendChild(li);
        index += 1;
      }
      fragment.appendChild(list);
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length) {
      if (!lines[index].trim() || isBlockStart(lines[index])) {
        break;
      }
      paragraphLines.push(lines[index]);
      index += 1;
    }

    const paragraph = document.createElement("p");
    appendInlineMarkdown(paragraph, paragraphLines.join("\n"));
    fragment.appendChild(paragraph);
  }

  return fragment;
}

function createMessage(role, content) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${role}`;

  if (role === "assistant") {
    const nameEl = document.createElement("span");
    nameEl.className = "msg-name";
    nameEl.textContent = currentCharacter.name;
    messageEl.appendChild(nameEl);
  }

  const bodyEl = document.createElement("div");
  bodyEl.className = "msg-body";
  bodyEl.appendChild(renderMarkdown(content));
  messageEl.appendChild(bodyEl);
  return messageEl;
}

function addMessage(role, content) {
  const typingEl = messagesEl.querySelector(".message.typing");
  if (typingEl) {
    typingEl.remove();
  }
  messagesEl.appendChild(createMessage(role, content));
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTyping() {
  const typingEl = document.createElement("div");
  typingEl.className = "message assistant typing";
  typingEl.innerHTML = `<span class="msg-name">${currentCharacter.name}</span><span class="typing-dots">考え中</span>`;
  messagesEl.appendChild(typingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderFallbackCharacter() {
  const { fallback } = currentCharacter;
  fallbackEl.hidden = false;
  fallbackEl.innerHTML = `
    <div class="fb-wrap">
      <div class="fb-face">
        <div class="fb-eyes">${fallback.eyeLeft}${fallback.eyeRight}</div>
        <div class="fb-mouth">${fallback.mouth}</div>
        <div class="fb-name">${currentCharacter.name}</div>
      </div>
    </div>
  `;
  fallbackEl.style.setProperty("--fb-accent", fallback.accent);
  fallbackEl.style.setProperty("--fb-mouth-color", fallback.mouthColor);
  fallbackEl.style.setProperty("--fb-name-color", fallback.nameColor);
  fallbackEl.style.setProperty("--fb-face-scale", String(fallback.faceScale));
}

function layoutLive2D(model) {
  const width = characterPanelEl.clientWidth;
  const height = characterPanelEl.clientHeight;
  const scale = Math.min((width * 0.78) / model.width, (height * 0.86) / model.height);
  model.scale.set(scale);
  model.x = (width - model.width) / 2;
  model.y = height - model.height;
}

async function ensureLive2DApp() {
  if (live2dApp) {
    return live2dApp;
  }

  live2dApp = new PIXI.Application({
    view: live2dCanvasEl,
    autoStart: true,
    resizeTo: characterPanelEl,
    transparent: true,
    antialias: true,
  });

  window.addEventListener("resize", () => {
    if (live2dModel) {
      layoutLive2D(live2dModel);
    }
  });

  return live2dApp;
}

function clearLive2DModel() {
  if (!live2dModel || !live2dApp) {
    live2dModel = null;
    return;
  }

  try {
    live2dApp.stage.removeChild(live2dModel);
    live2dModel.destroy();
  } catch {
    // noop
  }
  live2dModel = null;
}

async function loadCharacterVisual() {
  clearLive2DModel();
  fallbackEl.hidden = true;
  live2dCanvasEl.style.display = "block";

  if (!currentCharacter.live2d) {
    live2dCanvasEl.style.display = "none";
    renderFallbackCharacter();
    return;
  }

  try {
    await ensureLive2DApp();
    live2dModel = await PIXI.live2d.Live2DModel.from(currentCharacter.live2d.modelUrl);
    live2dModel.interactive = true;
    live2dModel.buttonMode = true;
    live2dModel.on("pointertap", () => {
      showReaction(currentCharacter.reaction);
      setStatus("talking");
      window.setTimeout(() => setStatus("idle"), 900);
    });
    live2dApp.stage.addChild(live2dModel);
    layoutLive2D(live2dModel);
    setStatus("idle");
  } catch (error) {
    console.warn("Live2D demo load failed, using fallback:", error);
    clearLive2DModel();
    live2dCanvasEl.style.display = "none";
    renderFallbackCharacter();
  }
}

function showReaction(text) {
  charReactionEl.hidden = false;
  charReactionEl.textContent = text;
  charReactionEl.classList.remove("visible");
  void charReactionEl.offsetWidth;
  charReactionEl.classList.add("visible");
  window.clearTimeout(showReaction.timer);
  showReaction.timer = window.setTimeout(() => {
    charReactionEl.classList.remove("visible");
  }, 1500);
}

async function playCurrentScene() {
  const token = ++playbackToken;
  const scene = currentCharacter.scenes[currentSceneIndex];

  stopSpeech();
  messagesEl.innerHTML = "";
  setStatus("idle");
  addMessage("assistant", `こんにちは、${currentCharacter.name} の demo だよ。`);
  await wait(450);

  for (const turn of scene) {
    if (token !== playbackToken) {
      return;
    }

    if (turn.role === "user") {
      setStatus("thinking");
      addMessage("user", turn.content);
      await wait(700);
      continue;
    }

    showTyping();
    setStatus("talking");
    showReaction(currentCharacter.reaction);
    await wait(950);

    if (token !== playbackToken) {
      return;
    }

    addMessage("assistant", turn.content);
    speak(turn.content);
    await wait(1600);
  }

  setStatus("idle");
}

function applyCharacter(characterId) {
  currentCharacter =
    CHARACTERS.find((character) => character.id === characterId) || CHARACTERS[0];
  charNameEl.textContent = currentCharacter.name;
  charRoleEl.textContent = currentCharacter.role;
  document.title = `${currentCharacter.name} | OshiClaw Demo`;
  characterSelectEl.value = currentCharacter.id;
}

function populateCharacterSelect() {
  const options = CHARACTERS.map((character) => {
    const option = document.createElement("option");
    option.value = character.id;
    option.textContent = `${character.name} / ${character.role}`;
    return option;
  });
  characterSelectEl.replaceChildren(...options);
}

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  voiceToggleBtn.classList.toggle("active", voiceEnabled);
  voiceToggleBtn.setAttribute("aria-pressed", String(voiceEnabled));
  voiceToggleBtn.textContent = voiceEnabled ? "音声 ON" : "音声 OFF";
  if (!voiceEnabled) {
    stopSpeech();
  }
}

async function switchCharacter(characterId) {
  playbackToken += 1;
  currentSceneIndex = 0;
  applyCharacter(characterId);
  await loadCharacterVisual();
  await playCurrentScene();
}

async function init() {
  populateCharacterSelect();
  applyCharacter("kurose");
  await loadCharacterVisual();
  await playCurrentScene();
}

characterSelectEl.addEventListener("change", (event) => {
  switchCharacter(event.target.value);
});

replayBtn.addEventListener("click", () => {
  playCurrentScene();
});

nextSceneBtn.addEventListener("click", () => {
  currentSceneIndex =
    (currentSceneIndex + 1) % currentCharacter.scenes.length;
  playCurrentScene();
});

voiceToggleBtn.addEventListener("click", toggleVoice);

characterPanelEl.addEventListener("click", () => {
  showReaction(currentCharacter.reaction);
});

window.addEventListener("beforeunload", stopSpeech);
window.addEventListener("load", init);
