export const FREE_ROUTER_MODEL = "openrouter/free";

export const COUNCIL_ROLES = [
  {
    id: "analyst",
    label: "ተንታኝ",
    instruction: "Analyze the request independently. Identify the core problem, relevant facts, assumptions, and a practical solution. Prefer accuracy over confidence.",
  },
  {
    id: "critic",
    label: "አረጋጋጭ",
    instruction: "Solve the request independently while actively looking for hidden assumptions, factual risks, edge cases, and safer or more reliable alternatives.",
  },
  {
    id: "specialist",
    label: "ስፔሻሊስት",
    instruction: "Act as a domain specialist for this request. Produce the most technically useful answer you can, with concrete details and examples where appropriate.",
  },
  {
    id: "creative",
    label: "ፈጣሪ",
    instruction: "Explore a distinct, creative approach to the request without sacrificing correctness or practicality. Highlight useful ideas other answers may miss.",
  },
];

const TASK_PATTERNS = {
  code: /\b(code|coding|program|debug|bug|api|html|css|javascript|typescript|python|java|react|sql|software|app|website|function|class|git)\b|ኮድ|ፕሮግራም|ዌብሳይት|መተግበሪያ/iu,
  reasoning: /\b(reason|analy[sz]e|logic|math|calculate|prove|compare|decision|strategy|research|why|plan)\b|ለምን|አስላ|ተንትን|አወዳድር|ምርምር|እቅድ/iu,
  writing: /\b(write|rewrite|story|email|letter|essay|article|poem|creative|translate|summary|summarize)\b|ጻፍ|ታሪክ|ደብዳቤ|ግጥም|ተርጉም|አጠቃልል/iu,
};

const TASK_MODEL_HINTS = {
  code: ["coder", "code", "qwen", "gpt-oss", "deepseek", "mistral", "granite"],
  reasoning: ["reason", "nemotron", "gpt-oss", "deepseek", "qwq", "qwen", "phi"],
  writing: ["llama", "gemma", "mistral", "hermes", "qwen", "glm"],
  general: ["nemotron", "qwen", "gpt-oss", "llama", "gemma", "mistral", "glm"],
};

// OpenRouter's catalog does not currently expose a normalized license field.
// This conservative marker list keeps the council on widely published
// open-weight families and avoids unknown promotional/stealth free models.
const OPEN_WEIGHT_MARKERS = [
  "qwen/", "qwen-", "meta-llama/", "llama", "google/gemma", "gemma",
  "nvidia/nemotron", "nemotron", "openai/gpt-oss", "gpt-oss",
  "deepseek/", "deepseek", "mistralai/", "mistral", "mixtral",
  "microsoft/phi", "phi-", "z-ai/glm", "glm-", "ibm/granite", "granite",
  "allenai/olmo", "olmo", "nousresearch/hermes", "hermes",
  "liquid/lfm", "lfm-",
];

export function uid(prefix = "id") {
  const random = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}

function zeroPrice(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric === 0;
}

export function isFreeModel(model = {}) {
  if (!model.id) return false;
  // Only explicit free routes are admitted. A temporary zero price on a paid
  // model is not enough: its price could change between catalog refreshes.
  return model.id === FREE_ROUTER_MODEL || (
    model.id.endsWith(":free")
    && zeroPrice(model.pricing?.prompt)
    && zeroPrice(model.pricing?.completion)
  );
}

export function isKnownOpenWeightModel(model = {}) {
  if (model.id === FREE_ROUTER_MODEL) return true;
  const haystack = `${model.id || ""} ${model.name || ""} ${model.description || ""}`.toLocaleLowerCase();
  return OPEN_WEIGHT_MARKERS.some((marker) => haystack.includes(marker));
}

export function normalizeFreeModels(catalog = []) {
  const seen = new Set();
  return catalog
    .filter(isFreeModel)
    .filter(isKnownOpenWeightModel)
    .filter((model) => {
      if (seen.has(model.id)) return false;
      seen.add(model.id);
      return true;
    })
    .map((model) => ({
      id: model.id,
      name: model.name || model.id.split("/").pop(),
      provider: model.id.split("/")[0] || "unknown",
      contextLength: Number(model.context_length) || 0,
      description: model.description || "",
    }));
}

export function classifyTask(prompt = "") {
  const text = String(prompt);
  for (const [task, pattern] of Object.entries(TASK_PATTERNS)) {
    if (pattern.test(text)) return task;
  }
  return "general";
}

function scoreModel(model, task) {
  const haystack = `${model.id} ${model.name} ${model.description}`.toLocaleLowerCase();
  let score = Math.min(Math.log10(Math.max(model.contextLength, 1)) * 2, 12);
  const hints = TASK_MODEL_HINTS[task] || TASK_MODEL_HINTS.general;
  hints.forEach((hint, index) => {
    if (haystack.includes(hint)) score += Math.max(2, 9 - index);
  });
  if (model.id.endsWith(":free")) score += 4;
  if (/vision|vl|omni|image/.test(haystack) && task !== "general") score -= 2;
  if (model.id === FREE_ROUTER_MODEL) score -= 20;
  return score;
}

export function selectCouncilModels(catalog = [], prompt = "", count = 3) {
  const task = classifyTask(prompt);
  const models = normalizeFreeModels(catalog)
    .filter((model) => model.id !== FREE_ROUTER_MODEL)
    .map((model) => ({ ...model, score: scoreModel(model, task) }))
    .sort((a, b) => b.score - a.score || b.contextLength - a.contextLength);

  const selected = [];
  const providers = new Set();
  for (const model of models) {
    if (selected.length >= count) break;
    if (providers.has(model.provider)) continue;
    selected.push(model);
    providers.add(model.provider);
  }
  for (const model of models) {
    if (selected.length >= count) break;
    if (!selected.some((item) => item.id === model.id)) selected.push(model);
  }
  while (selected.length < count && models.length) {
    selected.push({ ...models[selected.length % models.length] });
  }
  while (selected.length < count) {
    selected.push({
      id: FREE_ROUTER_MODEL,
      name: "OpenRouter Free Auto",
      provider: "openrouter",
      contextLength: 200000,
      score: 0,
    });
  }
  return { task, models: selected.slice(0, count) };
}

export function buildSynthesisPrompt(proposals = [], language = "auto") {
  const languageRule = {
    am: "Write the final answer in clear, natural Amharic.",
    en: "Write the final answer in English.",
    auto: "Use the same language as the user's request.",
  }[language] || "Use the same language as the user's request.";
  const evidence = proposals.map((proposal, index) => (
    `\n\n--- Candidate ${index + 1} (${proposal.role || "independent model"}; ${proposal.model || "unknown model"}) ---\n${proposal.content}`
  )).join("");
  return [
    "You are the chair of an AI council. Several independent open-weight models answered the same user request.",
    "Synthesize one superior final answer: preserve correct and useful points, resolve disagreements, remove unsupported claims, and do not mention the council unless the user asks.",
    "Do not assume that agreement proves truth. If an important claim remains uncertain, state that uncertainty plainly.",
    languageRule,
    evidence,
  ].join("\n");
}

export function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(url) {
  const decoded = String(url).replaceAll("&amp;", "&").trim();
  if (/^(https?:\/\/|mailto:)/i.test(decoded)) return escapeHTML(decoded);
  return "#";
}

function inlineMarkdown(raw) {
  let line = escapeHTML(raw);
  line = line.replace(/`([^`]+)`/g, "<code>$1</code>");
  line = line.replace(/\[([^\]]+)]\(([^)]+)\)/g, (_, label, url) => {
    return `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  line = line.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  line = line.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  line = line.replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,!?።])/g, "$1<em>$2</em>");
  return line;
}

export function renderMarkdown(source = "") {
  const codeBlocks = [];
  const tokenized = String(source).replace(/```([^\n`]*)\n?([\s\S]*?)```/g, (_, language, code) => {
    const index = codeBlocks.length;
    const lang = escapeHTML(language.trim() || "code");
    const safeCode = escapeHTML(code.replace(/\n$/, ""));
    codeBlocks.push(
      `<div class="code-block"><div class="code-header"><span>${lang}</span><button class="copy-code" type="button">Copy</button></div><pre><code>${safeCode}</code></pre></div>`,
    );
    return `\u0000CODE${index}\u0000`;
  });

  const lines = tokenized.replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let paragraph = [];
  let listType = null;

  const closeParagraph = () => {
    if (!paragraph.length) return;
    output.push(`<p>${paragraph.map(inlineMarkdown).join("<br>")}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (!listType) return;
    output.push(`</${listType}>`);
    listType = null;
  };

  for (const line of lines) {
    const codeMatch = line.match(/^\u0000CODE(\d+)\u0000$/);
    if (codeMatch) {
      closeParagraph();
      closeList();
      output.push(codeBlocks[Number(codeMatch[1])] || "");
      continue;
    }
    if (!line.trim()) {
      closeParagraph();
      closeList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeParagraph();
      closeList();
      const level = heading[1].length;
      output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      closeParagraph();
      closeList();
      output.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      closeParagraph();
      const nextType = unordered ? "ul" : "ol";
      if (listType !== nextType) {
        closeList();
        listType = nextType;
        output.push(`<${listType}>`);
      }
      output.push(`<li>${inlineMarkdown((unordered || ordered)[1])}</li>`);
      continue;
    }
    closeList();
    paragraph.push(line);
  }
  closeParagraph();
  closeList();
  return output.join("\n");
}

export function createTitle(prompt = "") {
  const title = String(prompt)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!title) return "አዲስ ውይይት";
  return title.length > 48 ? `${title.slice(0, 47).trim()}…` : title;
}

export function formatBytes(bytes = 0) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

export function conversationGroup(timestamp, now = Date.now()) {
  const value = new Date(timestamp).getTime();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const day = 86_400_000;
  if (value >= startToday.getTime()) return "ዛሬ";
  if (value >= startToday.getTime() - day) return "ትናንት";
  if (value >= startToday.getTime() - day * 7) return "ባለፉት 7 ቀናት";
  return "ከዚያ በፊት";
}

const STOP_WORDS = new Set([
  "the", "and", "that", "this", "with", "from", "have", "what", "when", "where", "which", "your", "about", "into", "ምን", "ነው", "እና", "የሚ", "ይህ", "እንዴት", "ስለ", "ከ", "ለ", "በ", "ውስጥ", "ጋር", "ነገር", "አንድ",
]);

export function tokenize(value = "") {
  const matches = String(value).toLocaleLowerCase().match(/[\p{L}\p{N}_-]{2,}/gu) || [];
  return matches.filter((token) => !STOP_WORDS.has(token));
}

export function chunkText(content = "", chunkSize = 1100, overlap = 140) {
  const text = String(content).replace(/\s+/g, " ").trim();
  if (!text) return [];
  const chunks = [];
  let cursor = 0;
  while (cursor < text.length) {
    let end = Math.min(text.length, cursor + chunkSize);
    if (end < text.length) {
      const sentenceEnd = Math.max(
        text.lastIndexOf("።", end),
        text.lastIndexOf(".", end),
        text.lastIndexOf(" ", end),
      );
      if (sentenceEnd > cursor + chunkSize * 0.6) end = sentenceEnd + 1;
    }
    chunks.push(text.slice(cursor, end).trim());
    if (end >= text.length) break;
    cursor = Math.max(cursor + 1, end - overlap);
  }
  return chunks;
}

export function retrieveKnowledge(query, documents = [], limit = 3) {
  const queryTokens = tokenize(query);
  if (!queryTokens.length || !documents.length) return [];
  const uniqueQuery = [...new Set(queryTokens)];
  const scored = [];

  for (const document of documents) {
    const chunks = chunkText(document.content);
    chunks.forEach((content, index) => {
      const lower = content.toLocaleLowerCase();
      const chunkTokens = tokenize(content);
      const counts = new Map();
      chunkTokens.forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
      let score = 0;
      for (const token of uniqueQuery) {
        const count = counts.get(token) || 0;
        if (count) score += 2 + Math.min(count, 4);
      }
      const normalizedQuery = String(query).trim().toLocaleLowerCase();
      if (normalizedQuery.length > 4 && lower.includes(normalizedQuery)) score += 12;
      if (score > 0) scored.push({ documentId: document.id, name: document.name, index, content, score });
    });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function trimConversation(messages = [], maxCharacters = 12500) {
  const selected = [];
  let used = 0;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    const content = String(message.content || "");
    if (selected.length && used + content.length > maxCharacters) break;
    selected.unshift({ role: message.role, content });
    used += content.length;
  }
  return selected;
}

export function buildSystemPrompt(settings = {}, knowledge = [], attachmentText = "") {
  const languageRule = {
    am: "Respond in clear, natural Amharic unless a technical term is clearer in English.",
    en: "Respond in English.",
    auto: "Reply in the same language as the user's latest message. You understand Amharic and English.",
  }[settings.language || "auto"];

  let prompt = [
    "You are one member of Zola's open-model AI council.",
    languageRule,
    "Be honest about uncertainty. Never invent sources, recent facts, or actions you did not perform.",
    "Give a direct answer first, then useful detail. Use concise Markdown when it improves readability.",
    "For code, provide complete runnable examples and state important assumptions.",
    "Do not claim to be Claude, Fable 5, or any model other than the model actually serving this request.",
  ].join(" ");

  if (settings.systemPrompt?.trim()) prompt += `\n\nUser preferences:\n${settings.systemPrompt.trim()}`;
  if (knowledge.length) {
    prompt += "\n\nRelevant excerpts selected from the user's knowledge files follow. Use them when they answer the question. If they conflict or are insufficient, say so. Cite a file inline as [filename].";
    knowledge.forEach((item) => { prompt += `\n\n[${item.name}]\n${item.content}`; });
  }
  if (attachmentText.trim()) {
    prompt += `\n\nFiles attached to the latest message:\n${attachmentText.trim()}`;
  }
  return prompt;
}
