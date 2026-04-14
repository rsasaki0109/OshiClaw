const CHARACTERS = [
  {
    id: "mio",
    mode: "live2d",
    name: "みお",
    role: "実装アシスタント",
    meta: {
      group: "同梱サンプル",
      asset: "Live2D 実動作",
      sourceLabel: "",
      sourceUrl: "",
      note: "GitHub Pages では bundled sample の Live2D だけを同梱しています。",
    },
    stage: {
      title: "bundled sample",
      body: "この slot だけは repo に同梱した Live2D を実際に動かしています。",
      chips: ["bundled", "Live2D", "public demo"],
    },
    live2d: {
      modelUrl: "./static/live2d/haru/haru_greeter_t03.model3.json",
      expressions: { idle: "f00", talking: "f03", thinking: "f02" },
      motions: { idle: "Idle", talking: "Tap" },
    },
    reaction: "まずは挙動を見るね。必要ならローカル版で深掘りしよう。",
    scenes: [
      [
        { role: "user", content: "GitHub Pages では何を見せてるの？" },
        {
          role: "assistant",
          content:
            "## 公開している範囲\n\n- bundled sample の **Live2D 実動作**\n- チャット風 UI と Markdown 表示\n- リアクションと TTS の雰囲気\n\npublic ページには、独自 fallback や再配布条件が読みにくいモデルは置いていません。",
        },
      ],
      [
        { role: "user", content: "Live2D は結局無理だったの？" },
        {
          role: "assistant",
          content:
            "無理ではないよ。\n\n1. **技術的には動く**\n2. 問題は **public にそのまま置けるモデルが少ない** こと\n3. だから Pages では bundled sample だけを実体表示にしている\n\n本番で増やすなら、配布条件を確認した公式モデルを個別に入れる形になる。",
        },
      ],
    ],
  },
  {
    id: "zundamon",
    mode: "candidate",
    name: "ずんだもん",
    role: "公式候補",
    meta: {
      group: "公式候補",
      asset: "VTubeStudio / 3D モデル",
      sourceLabel: "東北ずん子・ずんだもん公式ショップ",
      sourceUrl: "https://shop.zunko.jp/collections/%E3%83%87%E3%83%BC%E3%82%BF",
      note: "2026年4月15日時点で公式ショップに VTubeStudio 対応と 3D モデルの配布導線があります。Pages にはモデル本体をミラーしていません。",
    },
    stage: {
      title: "official candidate",
      body: "公式ショップに無料配布導線がある代表例。public では出典だけ示して、モデル本体の再配布は避けています。",
      chips: ["official", "¥0", "Live2D候補"],
    },
    reaction: "公式導線は強いのだ。ここから個別に確認するのだ。",
    scenes: [
      [
        { role: "user", content: "Pages に足すなら誰が強い？" },
        {
          role: "assistant",
          content:
            "まずは **ずんだもん** なのだ。\n\n- 公式ガイドラインで Web 利用が明示されている\n- 公式ショップに **VTubeStudio 対応** と **3D モデル** がある\n- ただし Pages ではモデル自体をミラーせず、出典リンクだけを見せるのが安全なのだ。",
        },
      ],
    ],
  },
  {
    id: "tohoku_zunko",
    mode: "candidate",
    name: "東北ずん子",
    role: "公式候補",
    meta: {
      group: "公式候補",
      asset: "VTubeStudio / 3D モデル",
      sourceLabel: "東北ずん子・ずんだもん公式ショップ",
      sourceUrl: "https://shop.zunko.jp/collections/%E3%83%87%E3%83%BC%E3%82%BF",
      note: "2026年4月15日時点で公式ショップに VTubeStudio 対応と 3D モデルの配布導線があります。Pages にはリンクだけを掲載しています。",
    },
    stage: {
      title: "official candidate",
      body: "ずんだもん系で安定して扱いやすい公式キャラ。ガイドラインと素材導線が揃っています。",
      chips: ["official", "¥0", "guideline clear"],
    },
    reaction: "公式側の導線が見えていれば、あとで組み込む判断がしやすいですわ。",
    scenes: [
      [
        { role: "user", content: "ずんだもん以外の本命は？" },
        {
          role: "assistant",
          content:
            "**東北ずん子** も強いよ。\n\n- 同じ公式ショップで **VTubeStudio 対応** と **3D モデル** が見つかる\n- ガイドラインも同系列で読みやすい\n- Pages では `候補一覧 + 出典リンク` までに留めるのが堅い",
        },
      ],
    ],
  },
  {
    id: "takehiro",
    mode: "candidate",
    name: "玄野武宏",
    role: "公式候補",
    meta: {
      group: "公式候補",
      asset: "公式立ち絵(無料) / MMD",
      sourceLabel: "VirVox Project",
      sourceUrl: "https://www.virvoxproject.com/%E7%8E%84%E9%87%8E%E6%AD%A6%E5%AE%8F",
      note: "VirVox は公式立ち絵と MMD の配布導線あり。個人のホームページ等で公式イラスト掲載はガイドライン上 OK ですが、Pages では素材をミラーせず案内だけにしています。",
    },
    stage: {
      title: "official candidate",
      body: "男枠ならここ。無料立ち絵と MMD モデルの導線が明確です。",
      chips: ["official", "male", "MMD"],
    },
    reaction: "素材ページと規約を並べて見れば、かなり判断しやすい。",
    scenes: [
      [
        { role: "user", content: "男キャラなら誰がいい？" },
        {
          role: "assistant",
          content:
            "**玄野武宏** が第一候補。\n\n- 公式ページに **PSDTool 対応公式立ち絵(無料)**\n- 同じページに **MMD モデル** 導線\n- 個人のブログやホームページへの公式イラスト掲載は、VirVox の具体例で許諾不要と読める\n\nただし public ページでの素材ミラーは避けている。",
        },
      ],
    ],
  },
  {
    id: "hau",
    mode: "candidate",
    name: "雨晴はう",
    role: "公式候補",
    meta: {
      group: "公式候補",
      asset: "公式立ち絵配布",
      sourceLabel: "Amehare Project",
      sourceUrl: "https://amehau.com/",
      note: "公式サイトに公式立ち絵配布導線があります。ただしサイト内コンテンツの無断転載・二次配布は禁止なので、Pages では名前と出典リンクだけにしています。",
    },
    stage: {
      title: "official candidate",
      body: "素材導線はあるが、サイト画像の転載制限があるタイプ。Pages では案内表示までに留めるのが安全です。",
      chips: ["official", "image only", "link out"],
    },
    reaction: "素材はあるけど、public 側ではリンク止まりが安全だよ。",
    scenes: [
      [
        { role: "user", content: "雨晴はうはどう扱う？" },
        {
          role: "assistant",
          content:
            "公式サイトに **公式立ち絵 v2.0** の配布導線はあるよ。\n\nでも、サイト全体の利用規約では **画像等の無断転載・二次配布** を禁止している。だから Pages では素材そのものは持たず、`候補` として出典だけ示す形にしている。",
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

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function speak(text) {
  if (!voiceEnabled || !("speechSynthesis" in window)) {
    return;
  }

  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(
    String(text)
      .replace(/```[\s\S]*?```/g, "コードがあります。")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
  );
  utterance.lang = "ja-JP";
  utterance.rate = currentCharacter.mode === "candidate" ? 1 : 1.02;
  utterance.pitch = currentCharacter.mode === "candidate" ? 0.98 : 1.02;
  window.speechSynthesis.speak(utterance);
}

function setStatus(state) {
  charStatusEl.className = state;
  charStatusEl.textContent = STATUS_LABELS[state] || state;

  if (live2dModel && currentCharacter.mode === "live2d") {
    try {
      if (state === "thinking") {
        live2dModel.expression(currentCharacter.live2d.expressions.thinking);
      } else if (state === "talking") {
        live2dModel.expression(currentCharacter.live2d.expressions.talking);
        live2dModel.motion(currentCharacter.live2d.motions.talking);
      } else {
        live2dModel.expression(currentCharacter.live2d.expressions.idle);
        live2dModel.motion(currentCharacter.live2d.motions.idle);
      }
    } catch {
      // Some models do not expose every expression / motion consistently.
    }
  }

  if (state === "talking") {
    characterPanelEl.classList.add("speaking");
  } else {
    characterPanelEl.classList.remove("speaking");
  }
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

function renderCandidatePanel() {
  const stage = currentCharacter.stage;
  fallbackEl.hidden = false;
  fallbackEl.removeAttribute("data-variant");
  fallbackEl.innerHTML = `
    <div class="demo-candidate">
      <span class="demo-candidate-kind">${stage.title}</span>
      <h3>${currentCharacter.name}</h3>
      <p>${stage.body}</p>
      <div class="demo-candidate-chips">
        ${stage.chips.map((chip) => `<span>${chip}</span>`).join("")}
      </div>
    </div>
  `;
}

function showUnavailable(message) {
  fallbackEl.hidden = false;
  fallbackEl.removeAttribute("data-variant");
  fallbackEl.innerHTML = `
    <div class="demo-unavailable">
      <strong>Live2D unavailable</strong>
      <p>${message}</p>
    </div>
  `;
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
  fallbackEl.innerHTML = "";
  live2dCanvasEl.style.display = "block";

  if (currentCharacter.mode !== "live2d") {
    live2dCanvasEl.style.display = "none";
    renderCandidatePanel();
    setStatus("idle");
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
    console.warn("Live2D demo load failed:", error);
    clearLive2DModel();
    live2dCanvasEl.style.display = "none";
    showUnavailable("この環境では Live2D を読み込めませんでした。ローカル版なら実機ブラウザで確認しやすいです。");
    setStatus("idle");
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
  addMessage("assistant", `こんにちは、${currentCharacter.name} の Pages preview です。`);
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
  currentSceneIndex = 0;
  charNameEl.textContent = currentCharacter.name;
  charRoleEl.textContent = currentCharacter.role;
  metaGroupEl.textContent = currentCharacter.meta.group;
  metaAssetEl.textContent = currentCharacter.meta.asset;
  metaNoteEl.textContent = currentCharacter.meta.note;

  if (currentCharacter.meta.sourceUrl && currentCharacter.meta.sourceLabel) {
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
    option.textContent =
      character.mode === "live2d"
        ? `${character.name} / ${character.role}`
        : `${character.name} / ${character.role} (link only)`;
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
  applyCharacter(characterId);
  await loadCharacterVisual();
  await playCurrentScene();
}

async function init() {
  populateCharacterSelect();
  applyCharacter("mio");
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
  currentSceneIndex = (currentSceneIndex + 1) % currentCharacter.scenes.length;
  playCurrentScene();
});

voiceToggleBtn.addEventListener("click", toggleVoice);

characterPanelEl.addEventListener("click", () => {
  showReaction(currentCharacter.reaction);
});

window.addEventListener("beforeunload", stopSpeech);
window.addEventListener("load", init);
