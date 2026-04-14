const CHARACTERS = [
  {
    id: "zundamon",
    name: "ずんだもん",
    role: "マスコット相棒",
    meta: {
      group: "公式無料",
      asset: "3D / Live2D候補",
      sourceLabel: "東北ずん子・ずんだもんPJ",
      sourceUrl: "https://zunko.jp/",
      note: "無料の3D/Live2D導線があり、今の main face に向いています。",
    },
    live2d: null,
    fallback: {
      eyeLeft: "◕",
      eyeRight: "◕",
      mouth: "ڡ",
      accent: "#74d44c",
      mouthColor: "#f6c15b",
      nameColor: "#74d44c",
      faceScale: 1.03,
    },
    reaction: "その切り方でいいのだ。次へ進むのだ。",
    scenes: [
      [
        { role: "user", content: "このプロジェクト、どんな感じ？" },
        {
          role: "assistant",
          content:
            "## OshiClaw の狙い\n\n- 公式無料キャラやオリジナルキャラを混ぜて試せる\n- ローカルでは実 LLM、Pages では静的 demo を見せる\n- まずは画像素材や fallback から増やし、あとで Live2D に上げる\n\n気軽に触って、気に入った枠を育てる方針なのだ。",
        },
      ],
      [
        { role: "user", content: "次に詰めるなら？" },
        {
          role: "assistant",
          content:
            "次ならこの順なのだ。\n\n1. 公式画像素材を増やす\n2. 実 Live2D モデルを追加する\n3. experimental 枠を分けて管理する\n\n土台を分けておくと増やしやすいのだ。",
        },
      ],
    ],
  },
  {
    id: "takehiro",
    name: "玄野武宏",
    role: "兄貴分エンジニア",
    meta: {
      group: "公式無料",
      asset: "MMDモデルあり",
      sourceLabel: "VirVox Project",
      sourceUrl: "https://www.virvoxproject.com/%E7%8E%84%E9%87%8E%E6%AD%A6%E5%AE%8F",
      note: "無料立ち絵と MMD モデルの導線がある男枠。",
    },
    live2d: null,
    fallback: {
      eyeLeft: "◆",
      eyeRight: "◆",
      mouth: "﹂",
      accent: "#4ec2a6",
      mouthColor: "#9ce6c3",
      nameColor: "#4ec2a6",
      faceScale: 1,
    },
    reaction: "その見方で合ってる。続けようぜ。",
    scenes: [
      [
        { role: "user", content: "無料3Dモデルがあるキャラってどれがいい？" },
        {
          role: "assistant",
          content:
            "## 今ならこの順だ\n\n1. ずんだもん\n2. 玄野武宏\n3. 雨晴はう\n\nまずは導線がはっきりしているキャラから前面に出すのが堅い。",
        },
      ],
      [
        { role: "user", content: "Pages では何を見せる？" },
        {
          role: "assistant",
          content:
            "無料素材のあるキャラを前に出して、\n\n- 見た目\n- 会話テンポ\n- Live2D と fallback の差\n\nこの 3 つを先に見せるのがいい。",
        },
      ],
    ],
  },
  {
    id: "hau",
    name: "雨晴はう",
    role: "やさしい案内役",
    meta: {
      group: "公式無料",
      asset: "3D素材あり",
      sourceLabel: "Amehare Project",
      sourceUrl: "https://amehau.com/",
      note: "公式サイトで立ち絵や 3D モデルなどの素材配布を案内。",
    },
    live2d: null,
    fallback: {
      eyeLeft: "◡",
      eyeRight: "◡",
      mouth: "ᴗ",
      accent: "#ff9d76",
      mouthColor: "#ffd08a",
      nameColor: "#ff9d76",
      faceScale: 1,
    },
    reaction: "大丈夫だよ。順に見ていこう。",
    scenes: [
      [
        { role: "user", content: "画像だけのキャラでも入れる価値ある？" },
        {
          role: "assistant",
          content:
            "あるよ。\n\n- まず roster を増やせる\n- 出典や規約を見える化できる\n- Live2D はあとから追加できる\n\n最初から全部モデル化しなくて大丈夫。",
        },
      ],
      [
        { role: "user", content: "じゃあ次に何する？" },
        {
          role: "assistant",
          content:
            "まずは Pages の顔を無料素材キャラ中心に整えよう。\nそのあとで、実際に動かす Live2D を増やしていけばいいよ。",
        },
      ],
    ],
  },
  {
    id: "mio",
    name: "みお",
    role: "実装アシスタント",
    meta: {
      group: "同梱モデル",
      asset: "Live2Dデモ",
      sourceLabel: "OshiClaw bundled model",
      sourceUrl: "",
      note: "この Pages demo で実際に Live2D が動く確認用キャラ。",
    },
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
const metaGroupEl = document.getElementById("demo-character-group");
const metaAssetEl = document.getElementById("demo-character-asset");
const metaSourceEl = document.getElementById("demo-character-source");
const metaNoteEl = document.getElementById("demo-character-note");

let currentCharacter = CHARACTERS[0];
let currentSceneIndex = 0;
let playbackToken = 0;
let live2dApp = null;
let live2dModel = null;
let voiceEnabled = false;
let activeUtterance = null;

function getSpeechProfile(characterId) {
  switch (characterId) {
    case "zundamon":
      return { rate: 1.08, pitch: 1.12 };
    case "takehiro":
      return { rate: 0.98, pitch: 0.9 };
    case "hau":
      return { rate: 1, pitch: 1.08 };
    default:
      return { rate: 1.04, pitch: 0.98 };
  }
}

function setStatus(state) {
  charStatusEl.className = state;
  charStatusEl.textContent = STATUS_LABELS[state] || state;
  fallbackEl.dataset.state = state;
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
  const speechProfile = getSpeechProfile(currentCharacter.id);
  utterance.rate = speechProfile.rate;
  utterance.pitch = speechProfile.pitch;
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
  fallbackEl.dataset.variant = fallback.variant || "simple";
  fallbackEl.dataset.state = "idle";
  fallbackEl.innerHTML =
    fallback.variant === "portrait-kurose"
      ? `
        <div class="fb-portrait-shell">
          <div class="fb-glow"></div>
          <div class="fb-portrait">
            <div class="fb-head">
              <div class="fb-hair-back"></div>
              <div class="fb-faceplate">
                <div class="fb-brows">
                  <span class="fb-brow"></span>
                  <span class="fb-brow"></span>
                </div>
                <div class="fb-eyes">
                  <span class="fb-eye"></span>
                  <span class="fb-eye"></span>
                </div>
                <div class="fb-mouth"></div>
              </div>
              <div class="fb-hair-front"></div>
            </div>
            <div class="fb-neck"></div>
            <div class="fb-body">
              <div class="fb-shirt"></div>
              <div class="fb-lapel fb-lapel-left"></div>
              <div class="fb-lapel fb-lapel-right"></div>
            </div>
          </div>
          <div class="fb-name">${currentCharacter.name}</div>
        </div>
      `
      : `
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
  fallbackEl.style.setProperty("--fb-skin-color", fallback.skinColor || "#f3d2ba");
  fallbackEl.style.setProperty("--fb-hair-color", fallback.hairColor || "#1f2430");
  fallbackEl.style.setProperty("--fb-coat-color", fallback.coatColor || "#101722");
  fallbackEl.style.setProperty("--fb-shirt-color", fallback.shirtColor || "#d9dee6");
  fallbackEl.style.setProperty("--fb-eye-color", fallback.eyeColor || "#dfe7f2");
  fallbackEl.style.setProperty("--fb-glow-color", fallback.glowColor || "rgba(88, 166, 255, 0.2)");
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
  metaGroupEl.textContent = currentCharacter.meta?.group || "未分類";
  metaAssetEl.textContent = currentCharacter.meta?.asset || "fallback";
  metaNoteEl.textContent = currentCharacter.meta?.note || "";

  if (currentCharacter.meta?.sourceUrl && currentCharacter.meta?.sourceLabel) {
    metaSourceEl.hidden = false;
    metaSourceEl.href = currentCharacter.meta.sourceUrl;
    metaSourceEl.textContent = currentCharacter.meta.sourceLabel;
  } else {
    metaSourceEl.hidden = true;
    metaSourceEl.removeAttribute("href");
    metaSourceEl.textContent = "";
  }

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
  applyCharacter("zundamon");
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
