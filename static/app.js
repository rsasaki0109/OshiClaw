// ===== Live2D Setup =====
const DEFAULT_LIVE2D_CONFIG = {
  model_url: "",
  expressions: {
    idle: "f00",
    thinking: "f02",
    talking: "f03",
  },
  motions: {
    idle: "Idle",
    talking: "Tap",
  },
};
const DEFAULT_FALLBACK_APPEARANCE = {
  variant: "simple",
  eye_left: "●",
  eye_right: "●",
  mouth: "ω",
  accent_color: "#58a6ff",
  mouth_color: "#f97583",
  name_color: "#58a6ff",
  face_scale: 1,
  skin_color: "#f3d2ba",
  hair_color: "#1f2430",
  coat_color: "#101722",
  shirt_color: "#d9dee6",
  eye_color: "#dfe7f2",
  glow_color: "rgba(88, 166, 255, 0.2)",
};
const DEFAULT_TTS_CONFIG = {
  preferred_lang: "ja-JP",
  voice_keywords: [],
  rate: 1,
  pitch: 1,
};
const DEFAULT_CHARACTER = {
  id: "kurose",
  name: "黒瀬",
  role_label: "先輩エンジニア",
  intro_message: "状況を出して。最短で切り分ける。",
  reset_message: "会話を切り替えた。論点からやり直そう。",
  input_placeholder: "ログ、コード、エラーを貼って",
  live2d: {
    model_url: "",
    expressions: {
      idle: "f00",
      thinking: "f02",
      talking: "f03",
    },
    motions: {
      idle: "Idle",
      talking: "Tap",
    },
  },
  fallback_appearance: {
    variant: "portrait-kurose",
    eye_left: "",
    eye_right: "",
    mouth: "",
    accent_color: "#ffa657",
    mouth_color: "#ffa657",
    name_color: "#ffa657",
    face_scale: 1.04,
    skin_color: "#e6c2a8",
    hair_color: "#11161f",
    coat_color: "#1a2230",
    shirt_color: "#d7dde6",
    eye_color: "#f4f7fb",
    glow_color: "rgba(255, 166, 87, 0.22)",
  },
  tts: {
    preferred_lang: "ja-JP",
    voice_keywords: [
      "otoya",
      "ichiro",
      "daichi",
      "google 日本語",
    ],
    rate: 0.93,
    pitch: 0.8,
  },
  hit_reactions: {
    Head: "その観点でいい。続きを見よう。",
    Body: "ログを見れば早い。次に進むぞ。",
  },
};
const HIT_REACTION_EXPRESSIONS = {
  Head: "talking",
  Body: "thinking",
};
const LOCAL_SESSION_STORAGE_KEY = "oshi-claw:session:v2";
const LEGACY_SESSION_STORAGE_KEYS = ["oshi-chat:session:v1"];
const LOCAL_AUDIO_STORAGE_KEY = "oshi-claw:audio:v3";
const LEGACY_AUDIO_STORAGE_KEYS = ["oshi-chat:audio:v2", "oshi-chat:audio:v1"];
const TTS_AUTO_VOICE_VALUE = "__auto__";
const GLOBAL_TTS_SELECTION_KEY = "__global__";
const SLOW_HINT_AFTER_SECONDS = 10;
const VERY_SLOW_HINT_AFTER_SECONDS = 20;
const REQUEST_SUCCESS_FEEDBACK_MS = 2800;
const SPEECH_STATUS_GRACE_MS = 400;
const SPEECH_ANIMATION_FRAME_MS = 90;
const SPEECH_MOTION_REFRESH_MS = 720;

let live2dModel = null;
let live2dApp = null;
let statusResetTimer = null;
let reactionBubbleTimer = null;
let reactionResetTimer = null;
let currentCharacter = DEFAULT_CHARACTER;
let currentModelName = "";
let activeAbortController = null;
let persistedMessages = [];
let retryableMessage = "";
let pendingUserMessageText = null;
let requestFeedbackInterval = null;
let requestFeedbackHideTimer = null;
let generationStartedAt = 0;
let ttsEnabled = true;
let voiceSelectionsByCharacter = {};
let availableVoices = [];
let activeSpeechUtterance = null;
let isSpeaking = false;
let speechAnimationInterval = null;
let speechAnimationStartedAt = 0;
let speechMotionLastTriggeredAt = 0;
let live2dSpeechBaseTransform = null;
let live2dResizeHandlerRegistered = false;

function layoutLive2DModel(model, container) {
  const scale = Math.min(
    (container.clientWidth * 0.8) / model.width,
    (container.clientHeight * 0.9) / model.height
  );

  model.scale.set(scale);
  model.x = (container.clientWidth - model.width) / 2;
  model.y = container.clientHeight - model.height;

  if (isSpeaking) {
    live2dSpeechBaseTransform = captureLive2DSpeechBase();
  }
}

function getCharacterName() {
  return currentCharacter.name;
}

function buildCharacterLive2DConfig(character) {
  const live2d = character.live2d || {};

  return {
    ...DEFAULT_LIVE2D_CONFIG,
    ...live2d,
    expressions: {
      ...DEFAULT_LIVE2D_CONFIG.expressions,
      ...(live2d.expressions || {}),
    },
    motions: {
      ...DEFAULT_LIVE2D_CONFIG.motions,
      ...(live2d.motions || {}),
    },
  };
}

function buildFallbackAppearance(character) {
  return {
    ...DEFAULT_FALLBACK_APPEARANCE,
    ...(character.fallback_appearance || {}),
  };
}

function buildCharacterTtsConfig(character) {
  const tts = character.tts || {};

  return {
    ...DEFAULT_TTS_CONFIG,
    ...tts,
    voice_keywords: Array.isArray(tts.voice_keywords)
      ? tts.voice_keywords
      : DEFAULT_TTS_CONFIG.voice_keywords,
  };
}

function getCurrentLive2DConfig() {
  return buildCharacterLive2DConfig(currentCharacter);
}

function getCurrentFallbackAppearance() {
  return buildFallbackAppearance(currentCharacter);
}

function renderSimpleFallbackMarkup(fallbackAppearance) {
  return `
    <div class="fb-face">
      <div class="fb-eyes"><span class="fb-eye">${fallbackAppearance.eye_left}</span><span class="fb-eye">${fallbackAppearance.eye_right}</span></div>
      <div class="fb-mouth">${fallbackAppearance.mouth}</div>
    </div>
    <div class="fb-name">${currentCharacter.name}</div>
  `;
}

function renderPortraitKuroseFallbackMarkup() {
  return `
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
  `;
}

function renderFallbackMarkup(fallbackAppearance) {
  if (fallbackAppearance.variant === "portrait-kurose") {
    return renderPortraitKuroseFallbackMarkup();
  }

  return renderSimpleFallbackMarkup(fallbackAppearance);
}

function getCurrentTtsConfig() {
  return buildCharacterTtsConfig(currentCharacter);
}

function applyCharacter(character) {
  currentCharacter = {
    ...DEFAULT_CHARACTER,
    ...character,
    live2d: buildCharacterLive2DConfig(character),
    fallback_appearance: buildFallbackAppearance(character),
    tts: buildCharacterTtsConfig(character),
    hit_reactions: {
      ...DEFAULT_CHARACTER.hit_reactions,
      ...(character.hit_reactions || {}),
    },
  };

  document.querySelector(".char-name").textContent = currentCharacter.name;
  document.querySelector(".char-role").textContent = currentCharacter.role_label;
  document.title = `OshiClaw - ${currentCharacter.name}`;
  inputEl.placeholder = currentCharacter.input_placeholder;

  if (supportsSpeechSynthesis()) {
    populateVoiceSelect(availableVoices);
    syncSpeechControls();
  }
}

function populateCharacterSelect(characters, currentId) {
  const options = characters.map((character) => {
    const option = document.createElement("option");
    option.value = character.id;
    option.textContent = `${character.name} / ${character.role_label}`;
    option.selected = character.id === currentId;
    return option;
  });

  charSelectEl.replaceChildren(...options);
}

function getCurrentStatusState() {
  const className = document.getElementById("char-status").className.trim();
  return className || "idle";
}

function ensureReactionBubble() {
  let bubble = document.getElementById("char-reaction");
  if (bubble) return bubble;

  bubble = document.createElement("div");
  bubble.id = "char-reaction";
  document.getElementById("character-area").appendChild(bubble);
  return bubble;
}

function showCharacterReaction(text) {
  const bubble = ensureReactionBubble();

  bubble.textContent = text;
  bubble.classList.remove("visible");
  void bubble.offsetWidth;
  bubble.classList.add("visible");

  if (reactionBubbleTimer !== null) {
    clearTimeout(reactionBubbleTimer);
  }
  reactionBubbleTimer = setTimeout(() => {
    bubble.classList.remove("visible");
    reactionBubbleTimer = null;
  }, 1600);
}

function scheduleReactionReset() {
  if (reactionResetTimer !== null) {
    clearTimeout(reactionResetTimer);
  }

  reactionResetTimer = setTimeout(() => {
    setModelState(getCurrentStatusState());
    reactionResetTimer = null;
  }, 1200);
}

function handleModelHit(hitAreas) {
  const primaryHit = hitAreas[0];
  const live2dConfig = getCurrentLive2DConfig();
  const reaction = {
    text:
      currentCharacter.hit_reactions?.[primaryHit] || "ふふっ、びっくりした！",
    expression:
      live2dConfig.expressions[HIT_REACTION_EXPRESSIONS[primaryHit]] ||
      live2dConfig.expressions.talking,
  };

  if (live2dModel) {
    try {
      live2dModel.expression(reaction.expression);
      live2dModel.motion(live2dConfig.motions.talking);
    } catch {
      // expressions/motions may vary per model
    }
  }

  showCharacterReaction(reaction.text);
  scheduleReactionReset();
}

function bindModelInteraction(model) {
  model.interactive = true;
  model.buttonMode = true;
  model.on("hit", handleModelHit);
  model.on("pointertap", (event) => {
    model.tap(event.data.global.x, event.data.global.y);
  });
}

function captureLive2DSpeechBase() {
  if (!live2dModel) return null;

  return {
    x: live2dModel.x,
    y: live2dModel.y,
    rotation: live2dModel.rotation,
    scaleX: live2dModel.scale.x,
    scaleY: live2dModel.scale.y,
  };
}

function restoreLive2DSpeechPose() {
  if (!live2dModel || !live2dSpeechBaseTransform) return;

  live2dModel.x = live2dSpeechBaseTransform.x;
  live2dModel.y = live2dSpeechBaseTransform.y;
  live2dModel.rotation = live2dSpeechBaseTransform.rotation;
  live2dModel.scale.set(
    live2dSpeechBaseTransform.scaleX,
    live2dSpeechBaseTransform.scaleY
  );
}

function applySpeechAnimationFrame() {
  const characterAreaEl = document.getElementById("character-area");
  characterAreaEl.classList.add("speaking");

  if (!live2dModel) {
    return;
  }

  if (!live2dSpeechBaseTransform) {
    live2dSpeechBaseTransform = captureLive2DSpeechBase();
  }

  if (!live2dSpeechBaseTransform) {
    return;
  }

  const elapsedMs = performance.now() - speechAnimationStartedAt;
  const elapsedSeconds = elapsedMs / 1000;
  const mouthPulse = (Math.sin(elapsedSeconds * 18) + 1) / 2;
  const sway = Math.sin(elapsedSeconds * 7.5);
  const bounce = Math.sin(elapsedSeconds * 14);

  live2dModel.x = live2dSpeechBaseTransform.x + sway * 2.2;
  live2dModel.y = live2dSpeechBaseTransform.y - 2 - mouthPulse * 4.5;
  live2dModel.rotation = live2dSpeechBaseTransform.rotation + sway * 0.012;
  live2dModel.scale.set(
    live2dSpeechBaseTransform.scaleX * (1 + mouthPulse * 0.01),
    live2dSpeechBaseTransform.scaleY * (1 - (mouthPulse * 0.018 + bounce * 0.004))
  );

  if (elapsedMs - speechMotionLastTriggeredAt >= SPEECH_MOTION_REFRESH_MS) {
    speechMotionLastTriggeredAt = elapsedMs;
    const live2dConfig = getCurrentLive2DConfig();

    try {
      live2dModel.expression(live2dConfig.expressions.talking);
      live2dModel.motion(live2dConfig.motions.talking);
    } catch {
      // expressions/motions may vary per model
    }
  }
}

function startSpeechAnimation() {
  stopSpeechAnimation({ preserveCharacterAreaState: true });
  speechAnimationStartedAt = performance.now();
  speechMotionLastTriggeredAt = -SPEECH_MOTION_REFRESH_MS;
  live2dSpeechBaseTransform = captureLive2DSpeechBase();
  applySpeechAnimationFrame();
  speechAnimationInterval = setInterval(
    applySpeechAnimationFrame,
    SPEECH_ANIMATION_FRAME_MS
  );
}

function stopSpeechAnimation(options = {}) {
  const { preserveCharacterAreaState = false } = options;

  if (speechAnimationInterval !== null) {
    clearInterval(speechAnimationInterval);
    speechAnimationInterval = null;
  }

  speechAnimationStartedAt = 0;
  speechMotionLastTriggeredAt = 0;
  restoreLive2DSpeechPose();
  live2dSpeechBaseTransform = null;

  if (!preserveCharacterAreaState) {
    document.getElementById("character-area").classList.remove("speaking");
  }
}

function ensureLive2DApp() {
  if (live2dApp) {
    return live2dApp;
  }

  const canvas = document.getElementById("live2d-canvas");
  const container = canvas.parentElement;
  live2dApp = new PIXI.Application({
    view: canvas,
    autoStart: true,
    resizeTo: container,
    backgroundAlpha: 0,
  });

  if (!live2dResizeHandlerRegistered) {
    window.addEventListener("resize", () => {
      if (live2dModel && live2dApp) {
        layoutLive2DModel(live2dModel, container);
      }
    });
    live2dResizeHandlerRegistered = true;
  }

  return live2dApp;
}

function clearFallbackCharacter() {
  const fallbackEl = document.getElementById("fallback-char");
  if (fallbackEl) {
    fallbackEl.remove();
  }
}

function clearLive2DModel() {
  if (!live2dModel || !live2dApp) {
    live2dModel = null;
    return;
  }

  stopSpeechAnimation({ preserveCharacterAreaState: isSpeaking });

  try {
    live2dApp.stage.removeChild(live2dModel);
  } catch {
    // stage child may already be detached
  }

  try {
    live2dModel.destroy();
  } catch {
    // pixi-live2d-display may already have released resources
  }

  live2dModel = null;
}

async function loadCurrentCharacterVisual() {
  const canvas = document.getElementById("live2d-canvas");
  const container = canvas.parentElement;
  const live2dConfig = getCurrentLive2DConfig();
  const currentStatus = getCurrentStatusState();

  clearFallbackCharacter();
  clearLive2DModel();
  canvas.style.display = "block";

  if (!live2dConfig.model_url) {
    showFallbackCharacter(container);
    setStatus(currentStatus);
    return;
  }

  try {
    const app = ensureLive2DApp();
    const model = await PIXI.live2d.Live2DModel.from(live2dConfig.model_url, {
      autoInteract: false,
    });
    app.stage.addChild(model);

    layoutLive2DModel(model, container);
    bindModelInteraction(model);
    live2dModel = model;

    if (isSpeaking) {
      startSpeechAnimation();
    } else {
      setModelState(currentStatus);
    }

    startIdleAnimation();
    setStatus(currentStatus);
    console.log(`Live2D model loaded for ${currentCharacter.id}`);
  } catch (e) {
    console.warn("Live2D load failed, using fallback:", e);
    showFallbackCharacter(container);
    setStatus(currentStatus);
  }
}

async function initLive2D() {
  ensureLive2DApp();
  await loadCurrentCharacterVisual();
}

// Live2D読み込み失敗時のCSS代替キャラ
function showFallbackCharacter(container) {
  const fallbackAppearance = getCurrentFallbackAppearance();
  const canvas = document.getElementById("live2d-canvas");
  canvas.style.display = "none";

  const fb = document.createElement("div");
  fb.id = "fallback-char";
  fb.dataset.variant = fallbackAppearance.variant || "simple";
  fb.dataset.state = "idle";
  fb.innerHTML = renderFallbackMarkup(fallbackAppearance);
  fb.style.setProperty("--fb-accent", fallbackAppearance.accent_color);
  fb.style.setProperty("--fb-mouth-color", fallbackAppearance.mouth_color);
  fb.style.setProperty("--fb-name-color", fallbackAppearance.name_color);
  fb.style.setProperty("--fb-face-scale", String(fallbackAppearance.face_scale));
  fb.style.setProperty("--fb-skin-color", fallbackAppearance.skin_color);
  fb.style.setProperty("--fb-hair-color", fallbackAppearance.hair_color);
  fb.style.setProperty("--fb-coat-color", fallbackAppearance.coat_color);
  fb.style.setProperty("--fb-shirt-color", fallbackAppearance.shirt_color);
  fb.style.setProperty("--fb-eye-color", fallbackAppearance.eye_color);
  fb.style.setProperty("--fb-glow-color", fallbackAppearance.glow_color);
  container.insertBefore(fb, container.firstChild);
  fb.addEventListener("click", () => handleModelHit(["Body"]));
}

function startIdleAnimation() {
  if (!live2dModel) return;
  const live2dConfig = getCurrentLive2DConfig();
  try {
    live2dModel.motion(live2dConfig.motions.idle);
  } catch {
    // model may not have idle motion group
  }
}

function setModelState(state) {
  const live2dConfig = getCurrentLive2DConfig();

  // Live2D model state
  if (live2dModel) {
    try {
      if (state === "thinking") {
        live2dModel.expression(live2dConfig.expressions.thinking);
      } else if (state === "talking") {
        live2dModel.expression(live2dConfig.expressions.talking);
        live2dModel.motion(live2dConfig.motions.talking);
      } else {
        live2dModel.expression(live2dConfig.expressions.idle);
        live2dModel.motion(live2dConfig.motions.idle);
      }
    } catch {
      // expressions/motions may vary per model
    }
  }

  // Fallback character state
  const fb = document.getElementById("fallback-char");
  if (fb) {
    fb.dataset.state = state;
  }
}

// ===== Status Indicator =====
function setStatus(state) {
  const el = document.getElementById("char-status");
  el.className = state;
  const labels = {
    idle: "待機中...",
    thinking: "考え中...",
    talking: "おしゃべり中！",
  };
  el.textContent = labels[state] || state;
  setModelState(state);
}

// ===== Chat Logic =====
const messagesEl = document.getElementById("chat-messages");
const inputEl = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const stopBtn = document.getElementById("stop-btn");
const resetBtn = document.getElementById("reset-btn");
const charSelectEl = document.getElementById("character-select");
const modelSelectEl = document.getElementById("model-select");
const audioControlsEl = document.getElementById("audio-controls");
const ttsToggleBtn = document.getElementById("tts-toggle");
const ttsVoiceSelectEl = document.getElementById("tts-voice-select");
const requestFeedbackEl = document.getElementById("request-feedback");
const requestFeedbackTextEl = document.getElementById("request-feedback-text");
const retryBtn = document.getElementById("retry-btn");

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

function sanitizeMarkdownLinkHref(rawHref) {
  if (typeof rawHref !== "string") {
    return null;
  }

  const href = rawHref.trim();
  if (!href) {
    return null;
  }

  if (href.startsWith("#")) {
    return href;
  }

  try {
    const url = new URL(href, window.location.href);
    if (
      url.protocol === "http:" ||
      url.protocol === "https:" ||
      url.protocol === "mailto:"
    ) {
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
      const href = sanitizeMarkdownLinkHref(match[4]);
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

async function copyText(text) {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

function createCodeBlock(codeText, language = "") {
  const wrapper = document.createElement("div");
  wrapper.className = "code-block";

  const header = document.createElement("div");
  header.className = "code-block-header";

  const languageLabel = document.createElement("span");
  languageLabel.className = "code-block-language";
  languageLabel.textContent = language || "code";
  header.appendChild(languageLabel);

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "code-copy-btn";
  copyButton.textContent = "コピー";
  copyButton.addEventListener("click", async () => {
    try {
      await copyText(codeText);
      copyButton.textContent = "コピー済み";
      setTimeout(() => {
        copyButton.textContent = "コピー";
      }, 1200);
    } catch (e) {
      console.warn("Copy failed:", e);
      copyButton.textContent = "失敗";
      setTimeout(() => {
        copyButton.textContent = "コピー";
      }, 1200);
    }
  });
  header.appendChild(copyButton);

  const pre = document.createElement("pre");
  const code = document.createElement("code");
  if (language) {
    code.dataset.language = language;
  }
  code.textContent = codeText;
  pre.appendChild(code);

  wrapper.append(header, pre);
  return wrapper;
}

function isMarkdownBlockStart(line) {
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
  const lines = String(text ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fenceMatch = line.match(/^```([^\n`]*)$/);
    if (fenceMatch) {
      const language = fenceMatch[1].trim();
      const codeLines = [];
      index += 1;

      while (index < lines.length && !/^```/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length && /^```/.test(lines[index])) {
        index += 1;
      }

      fragment.appendChild(createCodeBlock(codeLines.join("\n"), language));
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const heading = document.createElement(`h${headingMatch[1].length}`);
      appendInlineMarkdown(heading, headingMatch[2].trim());
      fragment.appendChild(heading);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines = [];

      while (index < lines.length) {
        const quoteLine = lines[index];
        if (!quoteLine.trim()) {
          quoteLines.push("");
          index += 1;
          continue;
        }
        if (!/^>\s?/.test(quoteLine)) {
          break;
        }
        quoteLines.push(quoteLine.replace(/^>\s?/, ""));
        index += 1;
      }

      const blockquote = document.createElement("blockquote");
      blockquote.appendChild(renderMarkdown(quoteLines.join("\n")));
      fragment.appendChild(blockquote);
      continue;
    }

    const unorderedMatch = line.match(/^[-*+]\s+(.*)$/);
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (unorderedMatch || orderedMatch) {
      const list = document.createElement(unorderedMatch ? "ul" : "ol");

      while (index < lines.length) {
        const currentLine = lines[index];
        const itemMatch = unorderedMatch
          ? currentLine.match(/^[-*+]\s+(.*)$/)
          : currentLine.match(/^\d+\.\s+(.*)$/);
        if (!itemMatch) {
          break;
        }

        const item = document.createElement("li");
        appendInlineMarkdown(item, itemMatch[1]);
        list.appendChild(item);
        index += 1;
      }

      fragment.appendChild(list);
      continue;
    }

    const paragraphLines = [line];
    index += 1;

    while (index < lines.length) {
      const nextLine = lines[index];
      if (!nextLine.trim() || isMarkdownBlockStart(nextLine)) {
        break;
      }

      paragraphLines.push(nextLine);
      index += 1;
    }

    const paragraph = document.createElement("p");
    appendInlineMarkdown(paragraph, paragraphLines.join("\n"));
    fragment.appendChild(paragraph);
  }

  return fragment;
}

function createMessage(role, text) {
  const div = document.createElement("div");
  div.className = `message ${role}`;

  if (role === "assistant") {
    const name = document.createElement("span");
    name.className = "msg-name";
    name.textContent = getCharacterName();
    div.appendChild(name);
  }

  const body = document.createElement("div");
  body.className = "msg-body";
  body.appendChild(renderMarkdown(text));
  div.appendChild(body);
  return div;
}

function setMessageText(messageEl, text) {
  const body = messageEl.querySelector(".msg-body");
  body.replaceChildren(renderMarkdown(text));
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addMessage(role, text) {
  const div = createMessage(role, text);

  // typing indicator removal
  const typing = messagesEl.querySelector(".message.typing");
  if (typing) typing.remove();

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function showTyping() {
  const div = document.createElement("div");
  div.className = "message typing";
  div.innerHTML = `<span class="msg-name">${getCharacterName()}</span><span class="typing-dots">考え中</span>`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function syncRequestFeedbackVisibility() {
  const hasText = requestFeedbackTextEl.textContent.trim().length > 0;
  const hasRetry = !retryBtn.hidden;
  requestFeedbackEl.hidden = !hasText && !hasRetry;
}

function updateRetryButtonState() {
  retryBtn.hidden = !retryableMessage;
  retryBtn.disabled =
    Boolean(activeAbortController) || isSpeaking || !retryableMessage;
  syncRequestFeedbackVisibility();
}

function syncStopButtonState() {
  stopBtn.disabled = !activeAbortController && !isSpeaking;
}

function setRetryableMessage(message) {
  retryableMessage = typeof message === "string" ? message.trim() : "";
  updateRetryButtonState();
}

function setRequestFeedback(text, tone = "info") {
  requestFeedbackEl.dataset.tone = tone;
  requestFeedbackTextEl.textContent = text;
  syncRequestFeedbackVisibility();
}

function clearRequestFeedbackTimers() {
  if (requestFeedbackInterval !== null) {
    clearInterval(requestFeedbackInterval);
    requestFeedbackInterval = null;
  }

  if (requestFeedbackHideTimer !== null) {
    clearTimeout(requestFeedbackHideTimer);
    requestFeedbackHideTimer = null;
  }
}

function clearRequestFeedback() {
  clearRequestFeedbackTimers();
  generationStartedAt = 0;
  requestFeedbackEl.dataset.tone = "";
  requestFeedbackTextEl.textContent = "";
  syncRequestFeedbackVisibility();
}

function getElapsedSeconds() {
  if (!generationStartedAt) return 0;
  return Math.max(1, Math.floor((Date.now() - generationStartedAt) / 1000));
}

function updateGenerationFeedback() {
  const elapsedSeconds = getElapsedSeconds();
  if (!elapsedSeconds) return;

  if (elapsedSeconds >= VERY_SLOW_HINT_AFTER_SECONDS) {
    setRequestFeedback(
      `応答待ち ${elapsedSeconds}秒 かなり重いね。停止かモデル変更を試してみて。`,
      "error"
    );
    return;
  }

  if (elapsedSeconds >= SLOW_HINT_AFTER_SECONDS) {
    setRequestFeedback(
      `応答待ち ${elapsedSeconds}秒 ちょっと重めかも。もう少し待つか停止してね。`,
      "warn"
    );
    return;
  }

  setRequestFeedback(`応答待ち ${elapsedSeconds}秒`, "info");
}

function startGenerationFeedback() {
  clearRequestFeedbackTimers();
  generationStartedAt = Date.now();
  updateGenerationFeedback();
  requestFeedbackInterval = setInterval(updateGenerationFeedback, 1000);
}

function finishGenerationFeedback(text, tone = "info", durationMs = 0) {
  clearRequestFeedbackTimers();
  generationStartedAt = 0;
  setRequestFeedback(text, tone);

  if (durationMs > 0) {
    requestFeedbackHideTimer = setTimeout(() => {
      requestFeedbackHideTimer = null;
      clearRequestFeedback();
    }, durationMs);
  }
}

function supportsSpeechSynthesis() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

function loadStoredAudioSettings() {
  const storageKeys = [LOCAL_AUDIO_STORAGE_KEY, ...LEGACY_AUDIO_STORAGE_KEYS];

  for (const storageKey of storageKeys) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) {
        continue;
      }

      const storedSelections =
        typeof parsed.voice_selections === "object" &&
        parsed.voice_selections !== null
          ? Object.fromEntries(
              Object.entries(parsed.voice_selections).filter(
                ([key, value]) =>
                  typeof key === "string" &&
                  key &&
                  typeof value === "string" &&
                  value.trim()
              )
            )
          : {};

      if (
        Object.keys(storedSelections).length === 0 &&
        typeof parsed.voice_name === "string" &&
        parsed.voice_name.trim()
      ) {
        storedSelections[GLOBAL_TTS_SELECTION_KEY] = parsed.voice_name.trim();
      }

      return {
        enabled:
          typeof parsed.enabled === "boolean" ? parsed.enabled : ttsEnabled,
        voice_selections: storedSelections,
      };
    } catch (e) {
      console.warn("Stored audio settings are invalid, ignoring them:", e);
    }
  }

  return null;
}

function saveStoredAudioSettings() {
  if (!supportsSpeechSynthesis()) return;

  localStorage.setItem(
    LOCAL_AUDIO_STORAGE_KEY,
    JSON.stringify({
      enabled: ttsEnabled,
      voice_selections: voiceSelectionsByCharacter,
    })
  );
}

function sortVoices(voices) {
  return voices.slice().sort((left, right) => {
    const leftJa = left.lang.toLowerCase().startsWith("ja");
    const rightJa = right.lang.toLowerCase().startsWith("ja");
    if (leftJa !== rightJa) {
      return leftJa ? -1 : 1;
    }

    if (left.default !== right.default) {
      return left.default ? -1 : 1;
    }

    return left.name.localeCompare(right.name, "ja");
  });
}

function formatVoiceOptionLabel(voice) {
  const meta = [];
  if (voice.default) {
    meta.push("既定");
  }

  return meta.length > 0
    ? `${voice.name} (${voice.lang} / ${meta.join(", ")})`
    : `${voice.name} (${voice.lang})`;
}

function getStoredVoiceSelection(characterId) {
  return (
    voiceSelectionsByCharacter[characterId] ||
    voiceSelectionsByCharacter[GLOBAL_TTS_SELECTION_KEY] ||
    TTS_AUTO_VOICE_VALUE
  );
}

function pruneStoredVoiceSelections(voices) {
  const availableVoiceNames = new Set(voices.map((voice) => voice.name));

  for (const [key, value] of Object.entries(voiceSelectionsByCharacter)) {
    if (value === TTS_AUTO_VOICE_VALUE) {
      continue;
    }

    if (!availableVoiceNames.has(value)) {
      delete voiceSelectionsByCharacter[key];
    }
  }
}

function populateVoiceSelect(voices) {
  const defaultOption = document.createElement("option");
  defaultOption.value = TTS_AUTO_VOICE_VALUE;
  defaultOption.textContent = `${currentCharacter.name}既定`;

  const voiceOptions = voices.map((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = formatVoiceOptionLabel(voice);
    return option;
  });

  ttsVoiceSelectEl.replaceChildren(defaultOption, ...voiceOptions);

  const selectedVoice = getStoredVoiceSelection(currentCharacter.id);
  if (
    selectedVoice !== TTS_AUTO_VOICE_VALUE &&
    voices.some((voice) => voice.name === selectedVoice)
  ) {
    ttsVoiceSelectEl.value = selectedVoice;
    return;
  }

  ttsVoiceSelectEl.value = TTS_AUTO_VOICE_VALUE;
}

function syncSpeechControls() {
  if (!supportsSpeechSynthesis()) {
    audioControlsEl.hidden = true;
    return;
  }

  audioControlsEl.hidden = false;
  ttsToggleBtn.classList.toggle("active", ttsEnabled);
  ttsToggleBtn.setAttribute("aria-pressed", String(ttsEnabled));
  ttsToggleBtn.textContent = ttsEnabled ? "音声 ON" : "音声 OFF";
  ttsVoiceSelectEl.disabled = !ttsEnabled || availableVoices.length === 0;
  updateRetryButtonState();
}

function resolveAutoVoice(voices, ttsConfig) {
  if (voices.length === 0) {
    return null;
  }

  const preferredLang = (ttsConfig.preferred_lang || "ja-JP").toLowerCase();
  const preferredPrefix = preferredLang.split("-")[0];
  const keywords = (ttsConfig.voice_keywords || []).map((keyword) =>
    String(keyword).toLowerCase()
  );
  let bestVoice = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const voice of voices) {
    const lang = (voice.lang || "").toLowerCase();
    const searchableName = `${voice.name} ${voice.voiceURI || ""}`.toLowerCase();
    let score = 0;

    if (lang === preferredLang) {
      score += 120;
    } else if (preferredPrefix && lang.startsWith(preferredPrefix)) {
      score += 72;
    } else if (lang.startsWith("ja")) {
      score += 24;
    }

    keywords.forEach((keyword, index) => {
      if (keyword && searchableName.includes(keyword)) {
        score += (keywords.length - index) * 18;
      }
    });

    if (voice.default) {
      score += 6;
    }

    if (score > bestScore) {
      bestScore = score;
      bestVoice = voice;
    }
  }

  return bestVoice || voices[0] || null;
}

function getSelectedVoice() {
  const selectedVoice = getStoredVoiceSelection(currentCharacter.id);
  if (selectedVoice !== TTS_AUTO_VOICE_VALUE) {
    const manualVoice =
      availableVoices.find((voice) => voice.name === selectedVoice) || null;
    if (manualVoice) {
      return manualVoice;
    }
  }

  return resolveAutoVoice(availableVoices, getCurrentTtsConfig());
}

function refreshSpeechVoices() {
  if (!supportsSpeechSynthesis()) {
    syncSpeechControls();
    return;
  }

  availableVoices = sortVoices(window.speechSynthesis.getVoices());
  pruneStoredVoiceSelections(availableVoices);
  populateVoiceSelect(availableVoices);
  syncSpeechControls();
  saveStoredAudioSettings();
}

function normalizeSpeechText(text) {
  return text
    .replace(/```[\s\S]*?```/g, "コードがあります。")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stopSpeechPlayback(options = {}) {
  const { keepStatus = false, announceStop = false } = options;

  if (!supportsSpeechSynthesis()) return false;

  const hadSpeech =
    isSpeaking ||
    activeSpeechUtterance !== null ||
    window.speechSynthesis.speaking ||
    window.speechSynthesis.pending;

  activeSpeechUtterance = null;
  isSpeaking = false;

  if (hadSpeech) {
    window.speechSynthesis.cancel();
  }

  stopSpeechAnimation();

  if (hadSpeech && !keepStatus && !activeAbortController) {
    clearStatusResetTimer();
    setStatus("idle");
  }

  if (announceStop && hadSpeech) {
    finishGenerationFeedback("読み上げを止めたよ。", "warn", 1800);
  }

  syncStopButtonState();
  return hadSpeech;
}

function speakAssistantReply(text) {
  if (!supportsSpeechSynthesis() || !ttsEnabled) {
    return false;
  }

  const spokenText = normalizeSpeechText(text);
  if (!spokenText) {
    return false;
  }

  stopSpeechPlayback({ keepStatus: true });

  const utterance = new SpeechSynthesisUtterance(spokenText);
  const selectedVoice = getSelectedVoice();
  const ttsConfig = getCurrentTtsConfig();
  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
  } else {
    utterance.lang = ttsConfig.preferred_lang || "ja-JP";
  }

  utterance.rate = Math.min(1.4, Math.max(0.7, Number(ttsConfig.rate) || 1));
  utterance.pitch = Math.min(1.6, Math.max(0.6, Number(ttsConfig.pitch) || 1));
  utterance.volume = 1;

  activeSpeechUtterance = utterance;

  const finalize = () => {
    if (activeSpeechUtterance !== utterance) {
      return;
    }

    activeSpeechUtterance = null;
    isSpeaking = false;
    stopSpeechAnimation();
    syncStopButtonState();

    if (!activeAbortController) {
      clearStatusResetTimer();
      statusResetTimer = setTimeout(() => {
        setStatus("idle");
        statusResetTimer = null;
      }, SPEECH_STATUS_GRACE_MS);
    }
  };

  utterance.onstart = () => {
    if (activeSpeechUtterance !== utterance) {
      return;
    }

    clearStatusResetTimer();
    isSpeaking = true;
    startSpeechAnimation();
    syncStopButtonState();
    setStatus("talking");
  };
  utterance.onend = finalize;
  utterance.onerror = finalize;

  try {
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    activeSpeechUtterance = null;
    isSpeaking = false;
    stopSpeechAnimation();
    syncStopButtonState();
    console.warn("TTS playback failed:", e);
    return false;
  }

  return true;
}

function initSpeechSynthesis() {
  if (!supportsSpeechSynthesis()) {
    audioControlsEl.hidden = true;
    return;
  }

  const storedSettings = loadStoredAudioSettings();
  if (storedSettings) {
    ttsEnabled = storedSettings.enabled;
    voiceSelectionsByCharacter = storedSettings.voice_selections;
  }

  if (typeof window.speechSynthesis.addEventListener === "function") {
    window.speechSynthesis.addEventListener("voiceschanged", refreshSpeechVoices);
  } else {
    window.speechSynthesis.onvoiceschanged = refreshSpeechVoices;
  }
  refreshSpeechVoices();
}

function loadStoredSession() {
  const storageKeys = [LOCAL_SESSION_STORAGE_KEY, ...LEGACY_SESSION_STORAGE_KEYS];

  for (const storageKey of storageKeys) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        !Array.isArray(parsed.messages)
      ) {
        continue;
      }

      return {
        character_id:
          typeof parsed.character_id === "string" ? parsed.character_id : null,
        model_name:
          typeof parsed.model_name === "string" ? parsed.model_name : null,
        messages: parsed.messages.filter(
          (message) =>
            message &&
            (message.role === "user" || message.role === "assistant") &&
            typeof message.content === "string"
        ),
      };
    } catch (e) {
      console.warn("Stored session is invalid, ignoring it:", e);
    }
  }

  return null;
}

function saveStoredSession() {
  localStorage.setItem(
    LOCAL_SESSION_STORAGE_KEY,
    JSON.stringify({
      character_id: currentCharacter.id,
      model_name: currentModelName,
      messages: persistedMessages,
    })
  );
}

function setPersistedMessages(messages) {
  persistedMessages = messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

function renderPersistedConversation() {
  messagesEl.innerHTML = "";

  if (persistedMessages.length === 0) {
    addMessage("assistant", currentCharacter.intro_message);
    return;
  }

  persistedMessages.forEach((message) => {
    addMessage(message.role, message.content);
  });
}

function hasSelectOption(selectEl, value) {
  return Array.from(selectEl.options).some((option) => option.value === value);
}

function applySessionState(session) {
  resetPendingRequestState();
  applyCharacter(session.character);
  charSelectEl.value = session.character.id;
  currentModelName = session.current_model_name;
  modelSelectEl.value = currentModelName;
  setPersistedMessages(session.messages);
  renderPersistedConversation();
  saveStoredSession();
  setStatus("idle");
}

async function loadCharacters() {
  const res = await fetch("/api/characters");
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  populateCharacterSelect(data.characters, data.current_character_id);

  const selectedCharacter =
    data.characters.find(
      (character) => character.id === data.current_character_id
    ) || data.characters[0];

  applyCharacter(selectedCharacter);
}

function populateModelSelect(models, currentModel) {
  const options = models.map((modelName) => {
    const option = document.createElement("option");
    option.value = modelName;
    option.textContent = modelName;
    option.selected = modelName === currentModel;
    return option;
  });

  modelSelectEl.replaceChildren(...options);
  currentModelName = currentModel;
}

async function loadModels() {
  const res = await fetch("/api/models");
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  populateModelSelect(data.models, data.current_model_name);
}

async function fetchSessionState() {
  const res = await fetch("/api/session");
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return await res.json();
}

async function restoreSessionState(session) {
  const res = await fetch("/api/session", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });

  if (!res.ok) {
    const errorText = (await res.text()).trim();
    throw new Error(errorText || `HTTP ${res.status}`);
  }

  return await res.json();
}

async function switchCharacter(characterId) {
  const previousCharacterId = currentCharacter.id;
  charSelectEl.disabled = true;
  modelSelectEl.disabled = true;
  resetBtn.disabled = true;

  try {
    const res = await fetch("/api/character", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character_id: characterId }),
    });

    if (!res.ok) {
      const errorText = (await res.text()).trim();
      throw new Error(errorText || `HTTP ${res.status}`);
    }

    const data = await res.json();
    resetPendingRequestState();
    applyCharacter(data.character);
    await loadCurrentCharacterVisual();
    setPersistedMessages([]);
    messagesEl.innerHTML = "";
    addMessage("assistant", currentCharacter.intro_message);
    saveStoredSession();
    setStatus("idle");
  } catch (e) {
    charSelectEl.value = previousCharacterId;
    addMessage("assistant", `キャラ切替に失敗しちゃった... (${e.message})`);
  } finally {
    charSelectEl.disabled = false;
    modelSelectEl.disabled = false;
    resetBtn.disabled = false;
  }
}

async function switchModel(modelName) {
  const previousModelName = currentModelName;
  charSelectEl.disabled = true;
  modelSelectEl.disabled = true;
  resetBtn.disabled = true;

  try {
    const res = await fetch("/api/model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model_name: modelName }),
    });

    if (!res.ok) {
      const errorText = (await res.text()).trim();
      throw new Error(errorText || `HTTP ${res.status}`);
    }

    const data = await res.json();
    resetPendingRequestState();
    currentModelName = data.model_name;
    modelSelectEl.value = currentModelName;
    setPersistedMessages([]);
    messagesEl.innerHTML = "";
    addMessage("assistant", `${getCharacterName()}で続けるね。モデルは ${currentModelName} に切り替えたよ。`);
    saveStoredSession();
    setStatus("idle");
  } catch (e) {
    modelSelectEl.value = previousModelName;
    addMessage("assistant", `モデル切替に失敗しちゃった... (${e.message})`);
  } finally {
    charSelectEl.disabled = false;
    modelSelectEl.disabled = false;
    resetBtn.disabled = false;
  }
}

function clearStatusResetTimer() {
  if (statusResetTimer !== null) {
    clearTimeout(statusResetTimer);
    statusResetTimer = null;
  }
}

function setGenerationActive(active) {
  sendBtn.disabled = active;
  resetBtn.disabled = active;
  charSelectEl.disabled = active;
  modelSelectEl.disabled = active;
  syncStopButtonState();
  updateRetryButtonState();
}

function stopOutput() {
  if (activeAbortController) {
    activeAbortController.abort();
    return;
  }

  if (stopSpeechPlayback({ announceStop: true })) {
    inputEl.focus();
  }
}

function resetPendingRequestState() {
  stopSpeechPlayback({ keepStatus: true });
  pendingUserMessageText = null;
  setRetryableMessage(null);
  clearRequestFeedback();
}

function scheduleIdleStatus() {
  clearStatusResetTimer();
  statusResetTimer = setTimeout(() => {
    setStatus("idle");
    statusResetTimer = null;
  }, 2000);
}

async function sendMessage(options = {}) {
  const { text: overrideText = null, reusePendingUser = false } = options;
  const text = (overrideText ?? inputEl.value).trim();
  if (!text || activeAbortController) return;

  stopSpeechPlayback({ keepStatus: true });
  inputEl.value = "";
  inputEl.style.height = "auto";
  clearStatusResetTimer();
  setRetryableMessage(null);

  const abortController = new AbortController();
  activeAbortController = abortController;
  setGenerationActive(true);
  startGenerationFeedback();

  if (!reusePendingUser) {
    addMessage("user", text);
    pendingUserMessageText = text;
  }
  showTyping();
  setStatus("thinking");
  let reply = "";
  let assistantMessage = null;

  try {
    const res = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
      signal: abortController.signal,
    });

    if (!res.ok) {
      const errorText = (await res.text()).trim();
      throw new Error(errorText || `HTTP ${res.status}`);
    }

    if (!res.body) {
      throw new Error("stream unavailable");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (!chunk) continue;

      reply += chunk;
      if (!assistantMessage) {
        setStatus("talking");
        assistantMessage = addMessage("assistant", "");
      }
      setMessageText(assistantMessage, reply);
    }

    const tail = decoder.decode();
    if (tail) {
      reply += tail;
    }

    if (!assistantMessage) {
      setStatus("talking");
      assistantMessage = addMessage("assistant", "");
    }
    setMessageText(assistantMessage, reply);
    if (pendingUserMessageText === text) {
      persistedMessages.push(
        { role: "user", content: text },
        { role: "assistant", content: reply }
      );
      pendingUserMessageText = null;
    }
    saveStoredSession();
    finishGenerationFeedback(
      `${getElapsedSeconds()}秒で応答したよ。`,
      "success",
      REQUEST_SUCCESS_FEEDBACK_MS
    );
    setRetryableMessage(null);
    if (!speakAssistantReply(reply)) {
      scheduleIdleStatus();
    }
  } catch (e) {
    const typing = messagesEl.querySelector(".message.typing");
    if (typing) typing.remove();

    if (e.name === "AbortError") {
      setRetryableMessage(text);
      if (assistantMessage) {
        addMessage("assistant", "いったんここで止めたよ。");
      } else {
        addMessage("assistant", "生成を止めたよ。また投げてね。");
      }
      finishGenerationFeedback(
        `${getElapsedSeconds()}秒で停止したよ。必要なら再試行してね。`,
        "warn"
      );
      setStatus("idle");
    } else {
      setRetryableMessage(text);
      addMessage("assistant", `エラーが発生しちゃった... (${e.message})`);
      finishGenerationFeedback(
        `${getElapsedSeconds()}秒で失敗したよ。再試行できるよ。`,
        "error"
      );
      setStatus("idle");
    }
  } finally {
    activeAbortController = null;
    setGenerationActive(false);
    inputEl.focus();
  }
}

// ===== Event Listeners =====
sendBtn.addEventListener("click", sendMessage);
stopBtn.addEventListener("click", stopOutput);
retryBtn.addEventListener("click", () => {
  if (!retryableMessage) return;

  sendMessage({
    text: retryableMessage,
    reusePendingUser: pendingUserMessageText === retryableMessage,
  });
});
ttsToggleBtn.addEventListener("click", () => {
  if (!supportsSpeechSynthesis()) return;

  ttsEnabled = !ttsEnabled;
  if (!ttsEnabled) {
    stopSpeechPlayback({ announceStop: true });
  }

  syncSpeechControls();
  saveStoredAudioSettings();
});
ttsVoiceSelectEl.addEventListener("change", (event) => {
  voiceSelectionsByCharacter[currentCharacter.id] = event.target.value;
  saveStoredAudioSettings();
});
charSelectEl.addEventListener("change", (event) => {
  switchCharacter(event.target.value);
});
modelSelectEl.addEventListener("change", (event) => {
  switchModel(event.target.value);
});

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// auto-resize textarea
inputEl.addEventListener("input", () => {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + "px";
});

resetBtn.addEventListener("click", async () => {
  await fetch("/api/reset", { method: "POST" });
  resetPendingRequestState();
  setPersistedMessages([]);
  messagesEl.innerHTML = "";
  addMessage("assistant", currentCharacter.reset_message);
  saveStoredSession();
  setStatus("idle");
});

// ===== Init =====
window.addEventListener("load", async () => {
  initSpeechSynthesis();

  try {
    await Promise.all([loadCharacters(), loadModels()]);
  } catch (e) {
    console.warn("Initial config load failed, using defaults:", e);
    populateCharacterSelect([DEFAULT_CHARACTER], DEFAULT_CHARACTER.id);
    applyCharacter(DEFAULT_CHARACTER);
    populateModelSelect(["gemma4:latest"], "gemma4:latest");
  }

  try {
    const storedSession = loadStoredSession();

    if (storedSession) {
      const restoredSession = await restoreSessionState({
        character_id: hasSelectOption(charSelectEl, storedSession.character_id)
          ? storedSession.character_id
          : currentCharacter.id,
        model_name: hasSelectOption(modelSelectEl, storedSession.model_name)
          ? storedSession.model_name
          : currentModelName,
        messages: storedSession.messages,
      });
      applySessionState(restoredSession);
    } else {
      applySessionState(await fetchSessionState());
    }
  } catch (e) {
    console.warn("Session restore failed, starting fresh:", e);
    setPersistedMessages([]);
    renderPersistedConversation();
    saveStoredSession();
    setStatus("idle");
  }

  await initLive2D();
});
