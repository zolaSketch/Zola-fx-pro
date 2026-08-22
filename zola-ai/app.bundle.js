(() => {
  // core.js
  var FREE_ROUTER_MODEL = "openrouter/free";
  var COUNCIL_ROLES = [
    {
      id: "analyst",
      label: "\u1270\u1295\u1273\u129D",
      instruction: "Analyze the request independently. Identify the core problem, relevant facts, assumptions, and a practical solution. Prefer accuracy over confidence."
    },
    {
      id: "critic",
      label: "\u12A0\u1228\u130B\u130B\u132D",
      instruction: "Solve the request independently while actively looking for hidden assumptions, factual risks, edge cases, and safer or more reliable alternatives."
    },
    {
      id: "specialist",
      label: "\u1235\u1354\u123B\u120A\u1235\u1275",
      instruction: "Act as a domain specialist for this request. Produce the most technically useful answer you can, with concrete details and examples where appropriate."
    },
    {
      id: "creative",
      label: "\u1348\u1323\u122A",
      instruction: "Explore a distinct, creative approach to the request without sacrificing correctness or practicality. Highlight useful ideas other answers may miss."
    }
  ];
  var TASK_PATTERNS = {
    code: /\b(code|coding|program|debug|bug|api|html|css|javascript|typescript|python|java|react|sql|software|app|website|function|class|git)\b|ኮድ|ፕሮግራም|ዌብሳይት|መተግበሪያ/iu,
    reasoning: /\b(reason|analy[sz]e|logic|math|calculate|prove|compare|decision|strategy|research|why|plan)\b|ለምን|አስላ|ተንትን|አወዳድር|ምርምር|እቅድ/iu,
    writing: /\b(write|rewrite|story|email|letter|essay|article|poem|creative|translate|summary|summarize)\b|ጻፍ|ታሪክ|ደብዳቤ|ግጥም|ተርጉም|አጠቃልል/iu
  };
  var TASK_MODEL_HINTS = {
    code: ["coder", "code", "qwen", "gpt-oss", "deepseek", "mistral", "granite"],
    reasoning: ["reason", "nemotron", "gpt-oss", "deepseek", "qwq", "qwen", "phi"],
    writing: ["llama", "gemma", "mistral", "hermes", "qwen", "glm"],
    general: ["nemotron", "qwen", "gpt-oss", "llama", "gemma", "mistral", "glm"]
  };
  var OPEN_WEIGHT_MARKERS = [
    "qwen/",
    "qwen-",
    "meta-llama/",
    "llama",
    "google/gemma",
    "gemma",
    "nvidia/nemotron",
    "nemotron",
    "openai/gpt-oss",
    "gpt-oss",
    "deepseek/",
    "deepseek",
    "mistralai/",
    "mistral",
    "mixtral",
    "microsoft/phi",
    "phi-",
    "z-ai/glm",
    "glm-",
    "ibm/granite",
    "granite",
    "allenai/olmo",
    "olmo",
    "nousresearch/hermes",
    "hermes",
    "liquid/lfm",
    "lfm-"
  ];
  function uid(prefix = "id") {
    const random = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
    return `${prefix}-${random}`;
  }
  function zeroPrice(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric === 0;
  }
  function isFreeModel(model = {}) {
    if (!model.id) return false;
    return model.id === FREE_ROUTER_MODEL || model.id.endsWith(":free") && zeroPrice(model.pricing?.prompt) && zeroPrice(model.pricing?.completion);
  }
  function isKnownOpenWeightModel(model = {}) {
    if (model.id === FREE_ROUTER_MODEL) return true;
    const haystack = `${model.id || ""} ${model.name || ""} ${model.description || ""}`.toLocaleLowerCase();
    return OPEN_WEIGHT_MARKERS.some((marker) => haystack.includes(marker));
  }
  function normalizeFreeModels(catalog = []) {
    const seen = /* @__PURE__ */ new Set();
    return catalog.filter(isFreeModel).filter(isKnownOpenWeightModel).filter((model) => {
      if (seen.has(model.id)) return false;
      seen.add(model.id);
      return true;
    }).map((model) => ({
      id: model.id,
      name: model.name || model.id.split("/").pop(),
      provider: model.id.split("/")[0] || "unknown",
      contextLength: Number(model.context_length) || 0,
      description: model.description || ""
    }));
  }
  function classifyTask(prompt2 = "") {
    const text = String(prompt2);
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
  function selectCouncilModels(catalog = [], prompt2 = "", count = 3) {
    const task = classifyTask(prompt2);
    const models = normalizeFreeModels(catalog).filter((model) => model.id !== FREE_ROUTER_MODEL).map((model) => ({ ...model, score: scoreModel(model, task) })).sort((a, b) => b.score - a.score || b.contextLength - a.contextLength);
    const selected = [];
    const providers = /* @__PURE__ */ new Set();
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
        contextLength: 2e5,
        score: 0
      });
    }
    return { task, models: selected.slice(0, count) };
  }
  function buildSynthesisPrompt(proposals = [], language = "auto") {
    const languageRule = {
      am: "Write the final answer in clear, natural Amharic.",
      en: "Write the final answer in English.",
      auto: "Use the same language as the user's request."
    }[language] || "Use the same language as the user's request.";
    const evidence = proposals.map((proposal, index) => `

--- Candidate ${index + 1} (${proposal.role || "independent model"}; ${proposal.model || "unknown model"}) ---
${proposal.content}`).join("");
    return [
      "You are the chair of an AI council. Several independent open-weight models answered the same user request.",
      "Synthesize one superior final answer: preserve correct and useful points, resolve disagreements, remove unsupported claims, and do not mention the council unless the user asks.",
      "Do not assume that agreement proves truth. If an important claim remains uncertain, state that uncertainty plainly.",
      languageRule,
      evidence
    ].join("\n");
  }
  function escapeHTML(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
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
  function renderMarkdown(source = "") {
    const codeBlocks = [];
    const tokenized = String(source).replace(/```([^\n`]*)\n?([\s\S]*?)```/g, (_, language, code) => {
      const index = codeBlocks.length;
      const lang = escapeHTML(language.trim() || "code");
      const safeCode = escapeHTML(code.replace(/\n$/, ""));
      codeBlocks.push(
        `<div class="code-block"><div class="code-header"><span>${lang}</span><button class="copy-code" type="button">Copy</button></div><pre><code>${safeCode}</code></pre></div>`
      );
      return `\0CODE${index}\0`;
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
  function createTitle(prompt2 = "") {
    const title = String(prompt2).replace(/```[\s\S]*?```/g, " ").replace(/\s+/g, " ").trim();
    if (!title) return "\u12A0\u12F2\u1235 \u12CD\u12ED\u12ED\u1275";
    return title.length > 48 ? `${title.slice(0, 47).trim()}\u2026` : title;
  }
  function formatBytes(bytes = 0) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** index;
    return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
  }
  function conversationGroup(timestamp, now = Date.now()) {
    const value = new Date(timestamp).getTime();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const day = 864e5;
    if (value >= startToday.getTime()) return "\u12DB\u122C";
    if (value >= startToday.getTime() - day) return "\u1275\u1293\u1295\u1275";
    if (value >= startToday.getTime() - day * 7) return "\u1263\u1208\u1349\u1275 7 \u1240\u1293\u1275";
    return "\u12A8\u12DA\u12EB \u1260\u134A\u1275";
  }
  var STOP_WORDS = /* @__PURE__ */ new Set([
    "the",
    "and",
    "that",
    "this",
    "with",
    "from",
    "have",
    "what",
    "when",
    "where",
    "which",
    "your",
    "about",
    "into",
    "\u121D\u1295",
    "\u1290\u12CD",
    "\u12A5\u1293",
    "\u12E8\u121A",
    "\u12ED\u1205",
    "\u12A5\u1295\u12F4\u1275",
    "\u1235\u1208",
    "\u12A8",
    "\u1208",
    "\u1260",
    "\u12CD\u1235\u1325",
    "\u130B\u122D",
    "\u1290\u1308\u122D",
    "\u12A0\u1295\u12F5"
  ]);
  function tokenize(value = "") {
    const matches = String(value).toLocaleLowerCase().match(/[\p{L}\p{N}_-]{2,}/gu) || [];
    return matches.filter((token) => !STOP_WORDS.has(token));
  }
  function chunkText(content = "", chunkSize = 1100, overlap = 140) {
    const text = String(content).replace(/\s+/g, " ").trim();
    if (!text) return [];
    const chunks = [];
    let cursor = 0;
    while (cursor < text.length) {
      let end = Math.min(text.length, cursor + chunkSize);
      if (end < text.length) {
        const sentenceEnd = Math.max(
          text.lastIndexOf("\u1362", end),
          text.lastIndexOf(".", end),
          text.lastIndexOf(" ", end)
        );
        if (sentenceEnd > cursor + chunkSize * 0.6) end = sentenceEnd + 1;
      }
      chunks.push(text.slice(cursor, end).trim());
      if (end >= text.length) break;
      cursor = Math.max(cursor + 1, end - overlap);
    }
    return chunks;
  }
  function retrieveKnowledge(query, documents = [], limit = 3) {
    const queryTokens = tokenize(query);
    if (!queryTokens.length || !documents.length) return [];
    const uniqueQuery = [...new Set(queryTokens)];
    const scored = [];
    for (const document2 of documents) {
      const chunks = chunkText(document2.content);
      chunks.forEach((content, index) => {
        const lower = content.toLocaleLowerCase();
        const chunkTokens = tokenize(content);
        const counts = /* @__PURE__ */ new Map();
        chunkTokens.forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
        let score = 0;
        for (const token of uniqueQuery) {
          const count = counts.get(token) || 0;
          if (count) score += 2 + Math.min(count, 4);
        }
        const normalizedQuery = String(query).trim().toLocaleLowerCase();
        if (normalizedQuery.length > 4 && lower.includes(normalizedQuery)) score += 12;
        if (score > 0) scored.push({ documentId: document2.id, name: document2.name, index, content, score });
      });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }
  function trimConversation(messages = [], maxCharacters = 12500) {
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
  function buildSystemPrompt(settings = {}, knowledge = [], attachmentText = "") {
    const languageRule = {
      am: "Respond in clear, natural Amharic unless a technical term is clearer in English.",
      en: "Respond in English.",
      auto: "Reply in the same language as the user's latest message. You understand Amharic and English."
    }[settings.language || "auto"];
    let prompt2 = [
      "You are one member of Zola's open-model AI council.",
      languageRule,
      "Be honest about uncertainty. Never invent sources, recent facts, or actions you did not perform.",
      "Give a direct answer first, then useful detail. Use concise Markdown when it improves readability.",
      "For code, provide complete runnable examples and state important assumptions.",
      "Do not claim to be Claude, Fable 5, or any model other than the model actually serving this request."
    ].join(" ");
    if (settings.systemPrompt?.trim()) prompt2 += `

User preferences:
${settings.systemPrompt.trim()}`;
    if (knowledge.length) {
      prompt2 += "\n\nRelevant excerpts selected from the user's knowledge files follow. Use them when they answer the question. If they conflict or are insufficient, say so. Cite a file inline as [filename].";
      knowledge.forEach((item) => {
        prompt2 += `

[${item.name}]
${item.content}`;
      });
    }
    if (attachmentText.trim()) {
      prompt2 += `

Files attached to the latest message:
${attachmentText.trim()}`;
    }
    return prompt2;
  }

  // app.js
  var OPENROUTER_API = "https://openrouter.ai/api/v1";
  var STORAGE_KEY = "zola.ai.local.v1";
  var SESSION_API_KEY = "zola.openrouter.key.session";
  var SAVED_API_KEY = "zola.openrouter.key.saved";
  var MAX_KNOWLEDGE_CHARS = 25e5;
  var MAX_FILE_BYTES = 2 * 1024 * 1024;
  var MAX_PROPOSAL_STORAGE = 5e3;
  var $ = (id) => document.getElementById(id);
  var refs = {
    shell: $("appShell"),
    scrim: $("sidebarScrim"),
    conversationList: $("conversationList"),
    conversationTitle: $("conversationTitle"),
    chatSearch: $("chatSearchInput"),
    welcome: $("welcomePanel"),
    firstRunNotice: $("firstRunNotice"),
    messages: $("messages"),
    chatMain: $("chatMain"),
    prompt: $("promptInput"),
    composer: $("composerForm"),
    send: $("sendBtn"),
    stop: $("stopBtn"),
    generationStatus: $("generationStatus"),
    generationStatusText: $("generationStatusText"),
    modelDialog: $("modelDialog"),
    modelDot: $("modelDot"),
    modelPillText: $("modelPillText"),
    connectionStatusBox: $("connectionStatusBox"),
    connectionStatusTitle: $("connectionStatusTitle"),
    connectionStatusText: $("connectionStatusText"),
    apiKeyInput: $("apiKeyInput"),
    rememberKey: $("rememberKeyInput"),
    connect: $("connectBtn"),
    disconnect: $("disconnectBtn"),
    availableModelsCount: $("availableModelsCount"),
    availableModelsText: $("availableModelsText"),
    settingsDialog: $("settingsDialog"),
    settingsConnectionText: $("settingsConnectionText"),
    knowledgeDialog: $("knowledgeDialog"),
    privacyDialog: $("privacyDialog"),
    knowledgeList: $("knowledgeList"),
    knowledgeCount: $("knowledgeCount"),
    knowledgeFileInput: $("knowledgeFileInput"),
    knowledgeDropZone: $("knowledgeDropZone"),
    fileInput: $("fileInput"),
    attachmentList: $("attachmentList"),
    councilMode: $("councilModeBtn"),
    toastRegion: $("toastRegion")
  };
  var state = loadState();
  var freeModelCatalog = [];
  var catalogLoading = false;
  var connectionVerified = false;
  var generating = false;
  var activeController = null;
  var pendingAttachments = [];
  var speechRecognition = null;
  function makeDefaultState() {
    const chat = makeChat();
    return {
      chats: [chat],
      activeChatId: chat.id,
      knowledge: [],
      settings: {
        language: "auto",
        temperature: 0.7,
        systemPrompt: "",
        autoSpeak: false,
        councilMode: true,
        councilSize: 3
      }
    };
  }
  function makeChat() {
    const now = Date.now();
    return { id: uid("chat"), title: "\u12A0\u12F2\u1235 \u12CD\u12ED\u12ED\u1275", createdAt: now, updatedAt: now, messages: [] };
  }
  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || !Array.isArray(saved.chats)) return makeDefaultState();
      const fallback = makeDefaultState();
      const chats = saved.chats.filter((chat) => chat && Array.isArray(chat.messages));
      if (!chats.length) chats.push(fallback.chats[0]);
      const settings = { ...fallback.settings, ...saved.settings || {} };
      if (saved.settings?.councilMode === void 0 && saved.settings?.deepMode !== void 0) {
        settings.councilMode = Boolean(saved.settings.deepMode);
      }
      settings.councilSize = Math.max(2, Math.min(4, Number(settings.councilSize) || 3));
      return {
        ...fallback,
        ...saved,
        chats,
        knowledge: Array.isArray(saved.knowledge) ? saved.knowledge : [],
        settings,
        activeChatId: chats.some((chat) => chat.id === saved.activeChatId) ? saved.activeChatId : chats[0].id
      };
    } catch {
      return makeDefaultState();
    }
  }
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error("Could not save local state", error);
      toast("\u12E8browser \u121B\u12A8\u121B\u127B\u12CD \u121E\u120D\u1277\u120D\u1362 \u12A0\u1295\u12F3\u1295\u12F5 \u12E8\u12A5\u12CD\u1240\u1275 \u134B\u12ED\u120E\u127D\u1295 \u12EB\u1325\u1349\u1362", "error", 5e3);
      return false;
    }
  }
  function getApiKey() {
    return sessionStorage.getItem(SESSION_API_KEY) || localStorage.getItem(SAVED_API_KEY) || "";
  }
  function storeApiKey(key, remember) {
    sessionStorage.removeItem(SESSION_API_KEY);
    localStorage.removeItem(SAVED_API_KEY);
    (remember ? localStorage : sessionStorage).setItem(remember ? SAVED_API_KEY : SESSION_API_KEY, key);
  }
  function forgetApiKey() {
    sessionStorage.removeItem(SESSION_API_KEY);
    localStorage.removeItem(SAVED_API_KEY);
    connectionVerified = false;
  }
  function activeChat() {
    let chat = state.chats.find((item) => item.id === state.activeChatId);
    if (!chat) {
      chat = makeChat();
      state.chats.unshift(chat);
      state.activeChatId = chat.id;
    }
    return chat;
  }
  function setSidebar(open) {
    refs.shell.classList.toggle("sidebar-open", open);
    if (open) setTimeout(() => refs.chatSearch.focus(), 180);
  }
  function groupChats(chats) {
    const groups = /* @__PURE__ */ new Map();
    chats.forEach((chat) => {
      const group = conversationGroup(chat.updatedAt);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(chat);
    });
    return groups;
  }
  function renderConversationList() {
    const search = refs.chatSearch.value.trim().toLocaleLowerCase();
    const chats = [...state.chats].filter((chat) => !search || chat.title.toLocaleLowerCase().includes(search)).sort((a, b) => b.updatedAt - a.updatedAt);
    if (!chats.length) {
      refs.conversationList.innerHTML = '<p class="empty-history">\u12E8\u121A\u12DB\u1218\u12F5 \u12CD\u12ED\u12ED\u1275 \u12A0\u120D\u1270\u1308\u1298\u121D\u1362</p>';
      return;
    }
    let html = "";
    for (const [group, items] of groupChats(chats)) {
      html += `<p class="conversation-group-title">${escapeHTML(group)}</p>`;
      html += items.map((chat) => `
      <div class="conversation-item ${chat.id === state.activeChatId ? "active" : ""}" data-chat-id="${escapeHTML(chat.id)}" role="button" tabindex="0" aria-label="${escapeHTML(chat.title)}">
        <svg viewBox="0 0 24 24"><path d="M5 5h14v11H9l-4 4V5Z"/></svg>
        <span class="item-title">${escapeHTML(chat.title)}</span>
        <button class="conversation-menu" type="button" data-delete-chat="${escapeHTML(chat.id)}" aria-label="\u12CD\u12ED\u12ED\u1271\u1295 \u12A0\u1325\u134B" title="\u12A0\u1325\u134B">
          <svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>
        </button>
      </div>`).join("");
    }
    refs.conversationList.innerHTML = html;
  }
  function renderKnowledge() {
    const files = state.knowledge;
    refs.knowledgeCount.textContent = files.length ? `${files.length} \u134B\u12ED\u120D${files.length === 1 ? "" : "\u127D"}` : "\u121D\u1295\u121D \u134B\u12ED\u120D \u12E8\u1208\u121D";
    if (!files.length) {
      refs.knowledgeList.innerHTML = '<p class="knowledge-empty">\u12A5\u1235\u12AB\u1201\u1295 \u121D\u1295\u121D \u134B\u12ED\u120D \u12A0\u120D\u1328\u1218\u1229\u121D\u1362</p>';
      return;
    }
    refs.knowledgeList.innerHTML = files.map((file) => `
    <div class="knowledge-item">
      <span class="knowledge-item-icon"><svg viewBox="0 0 24 24"><path d="M5 3h10l4 4v14H5V3Z"/><path d="M14 3v5h5M8 12h8M8 16h6"/></svg></span>
      <span><b>${escapeHTML(file.name)}</b><small>${formatBytes(file.size)} \xB7 browser storage</small></span>
      <button class="remove-knowledge" type="button" data-remove-knowledge="${escapeHTML(file.id)}" aria-label="\u134B\u12ED\u1209\u1295 \u12A0\u1325\u134B"><svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V4h6v3M8 7l1 14h6l1-14M10 11v6M14 11v6"/></svg></button>
    </div>`).join("");
  }
  function shortModelName(model = "") {
    return String(model).split("/").pop().replace(/:free$/i, "").replaceAll("-", " ");
  }
  function councilDetails(message) {
    const council = message.council;
    if (!council?.proposals?.length) return "";
    const proposals = council.proposals.map((proposal, index) => `
    <article class="council-draft">
      <header><span>${index + 1}</span><b>${escapeHTML(proposal.role || "AI")}</b><small>${escapeHTML(shortModelName(proposal.model))}</small></header>
      <div>${renderMarkdown(proposal.content)}</div>
    </article>`).join("");
    return `<details class="council-details">
    <summary><span class="council-orbit"><i></i><i></i><i></i></span><b>${council.proposals.length} AI \u12A0\u1295\u130E\u120E\u127D \u1270\u12CB\u1205\u12F0\u12CB\u120D</b><small>${escapeHTML(council.task || "general")} \xB7 Chair: ${escapeHTML(shortModelName(council.chairman || "free router"))}</small><svg viewBox="0 0 24 24"><path d="m8 10 4 4 4-4"/></svg></summary>
    <div class="council-drafts">${proposals}</div>
  </details>`;
  }
  function messageActions(message, index) {
    if (!message.content) return "";
    const speak = message.role === "assistant" ? `
    <button class="message-action" type="button" data-speak-message="${index}" title="\u1260\u12F5\u121D\u1345 \u12A0\u1295\u1265\u1265" aria-label="\u1260\u12F5\u121D\u1345 \u12A0\u1295\u1265\u1265">
      <svg viewBox="0 0 24 24"><path d="M5 9v6h4l5 4V5L9 9H5Z"/><path d="M17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg>
    </button>` : "";
    return `<div class="message-actions">
    <button class="message-action" type="button" data-copy-message="${index}" title="\u1245\u12F3" aria-label="\u1218\u120D\u12D5\u12AD\u1271\u1295 \u1245\u12F3">
      <svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/></svg>
    </button>${speak}
  </div>`;
  }
  function renderMessages() {
    const chat = activeChat();
    refs.conversationTitle.textContent = chat.title;
    const hasMessages = chat.messages.length > 0;
    refs.welcome.hidden = hasMessages;
    refs.messages.classList.toggle("active", hasMessages);
    if (!hasMessages) {
      refs.messages.innerHTML = "";
      return;
    }
    refs.messages.innerHTML = chat.messages.map((message, index) => {
      const attachments = message.attachments?.length ? `<div>${message.attachments.map((name) => `<span class="attachment-chip"><svg viewBox="0 0 24 24"><path d="M5 3h10l4 4v14H5V3Z"/><path d="M14 3v5h5"/></svg>${escapeHTML(name)}</span>`).join(" ")}</div>` : "";
      if (message.role === "user") {
        return `<article class="message user"><div class="message-body">${escapeHTML(message.content)}${attachments}${messageActions(message, index)}</div></article>`;
      }
      return `<article class="message assistant">
      <div class="message-avatar" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 3.5 19.1 12l8.4 3.2-8.4 3.1L16 27l-3.1-8.7-8.4-3.1 8.4-3.2L16 3.5Z"/></svg></div>
      <div class="message-body"><div class="message-role">Zola Council</div><div class="message-content">${renderMarkdown(message.content)}${message.streaming ? '<span class="typing-cursor"></span>' : ""}</div>${councilDetails(message)}${messageActions(message, index)}</div>
    </article>`;
    }).join("");
    scrollToBottom();
  }
  function updateStreamingMessage(message) {
    const content = refs.messages.querySelector(".message.assistant:last-child .message-content");
    if (content) content.innerHTML = `${renderMarkdown(message.content)}<span class="typing-cursor"></span>`;
    scrollToBottom();
  }
  function scrollToBottom() {
    requestAnimationFrame(() => {
      refs.chatMain.scrollTop = refs.chatMain.scrollHeight;
    });
  }
  function renderConnectionUI() {
    const connected = Boolean(getApiKey());
    const count = normalizeFreeModels(freeModelCatalog).filter((model) => model.id !== FREE_ROUTER_MODEL).length;
    refs.modelPillText.textContent = connected ? count ? `${count} \u1290\u1343 AI \xB7 Council` : "Free AI Council" : "\u1290\u1343 AI\u12CE\u127D\u1295 \u12EB\u1308\u1293\u1299";
    refs.modelDot.className = `model-dot${connected ? " ready" : ""}`;
    refs.firstRunNotice.hidden = connected;
    refs.settingsConnectionText.textContent = connected ? "\u1270\u1308\u1293\u129D\u1277\u120D \xB7 free models only" : "\u12A0\u120D\u1270\u1308\u1293\u1298\u121D";
    refs.disconnect.hidden = !connected;
  }
  function renderAll() {
    renderConversationList();
    renderKnowledge();
    renderMessages();
    refs.councilMode.setAttribute("aria-pressed", String(Boolean(state.settings.councilMode)));
    renderConnectionUI();
  }
  function createNewChat() {
    if (generating) return toast("\u1218\u120D\u1231 \u12A5\u1235\u12AA\u1320\u1293\u1240\u1245 \u12ED\u1320\u1265\u1241\u1362", "error");
    const current = activeChat();
    if (!current.messages.length) {
      refs.prompt.focus();
      setSidebar(false);
      return;
    }
    const chat = makeChat();
    state.chats.unshift(chat);
    state.activeChatId = chat.id;
    saveState();
    pendingAttachments = [];
    renderAttachments();
    renderAll();
    setSidebar(false);
    refs.prompt.focus();
  }
  function selectChat(id) {
    if (generating || !state.chats.some((chat) => chat.id === id)) return;
    state.activeChatId = id;
    saveState();
    renderAll();
    setSidebar(false);
  }
  function deleteChat(id) {
    if (generating) return;
    const chat = state.chats.find((item) => item.id === id);
    if (!chat || !confirm(`\u201C${chat.title}\u201D \u12CD\u12ED\u12ED\u1275 \u12ED\u1325\u134B?`)) return;
    state.chats = state.chats.filter((item) => item.id !== id);
    if (!state.chats.length) state.chats.push(makeChat());
    if (state.activeChatId === id) state.activeChatId = state.chats[0].id;
    saveState();
    renderAll();
  }
  function renameActiveChat() {
    const chat = activeChat();
    const next = prompt("\u12E8\u12CD\u12ED\u12ED\u1271 \u122D\u12D5\u1235", chat.title)?.trim();
    if (!next) return;
    chat.title = next.slice(0, 80);
    chat.updatedAt = Date.now();
    saveState();
    renderAll();
  }
  function autoResizePrompt() {
    refs.prompt.style.height = "auto";
    refs.prompt.style.height = `${Math.min(refs.prompt.scrollHeight, 170)}px`;
  }
  function setGenerating(value, text = "AI Council \u12A5\u12EB\u1230\u1260 \u1290\u12CD\u2026") {
    generating = value;
    refs.prompt.disabled = value;
    refs.send.hidden = value;
    refs.stop.hidden = !value;
    refs.generationStatus.hidden = !value;
    refs.generationStatusText.textContent = text;
    document.querySelectorAll(".suggestion-card").forEach((button) => {
      button.disabled = value;
    });
  }
  function setConnectionStatus(type, title, text) {
    refs.connectionStatusBox.className = `compatibility ${type || ""}`.trim();
    refs.connectionStatusTitle.textContent = title;
    refs.connectionStatusText.textContent = text;
  }
  async function loadFreeCatalog() {
    if (catalogLoading) return;
    catalogLoading = true;
    refs.availableModelsCount.textContent = "\u2026";
    try {
      const response = await fetch(`${OPENROUTER_API}/models`);
      if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
      const payload = await response.json();
      freeModelCatalog = Array.isArray(payload.data) ? payload.data : [];
      const free = normalizeFreeModels(freeModelCatalog).filter((model) => model.id !== FREE_ROUTER_MODEL);
      const families = [...new Set(free.slice(0, 8).map((model) => model.provider))];
      refs.availableModelsCount.textContent = String(free.length || "1+");
      refs.availableModelsText.textContent = families.length ? `${families.join(" \xB7 ")} \xB7 live` : "OpenRouter Free Models Router";
      renderConnectionUI();
    } catch (error) {
      console.warn("Could not load model catalog", error);
      refs.availableModelsCount.textContent = "AUTO";
      refs.availableModelsText.textContent = "Free Models Router \u1260\u122B\u1231 \u1290\u1343 \u121E\u12F4\u120D \u12ED\u1218\u122D\u1323\u120D";
    } finally {
      catalogLoading = false;
    }
  }
  function openConnectionDialog() {
    refs.apiKeyInput.value = getApiKey();
    refs.rememberKey.checked = Boolean(localStorage.getItem(SAVED_API_KEY));
    refs.apiKeyInput.type = "password";
    $("toggleKeyBtn").textContent = "\u12A0\u1233\u12ED";
    if (getApiKey()) {
      setConnectionStatus(connectionVerified ? "success" : "", connectionVerified ? "\u130D\u1295\u1299\u1290\u1271 \u1270\u1228\u130B\u130D\u1327\u120D" : "Key \u1270\u1240\u121D\u1327\u120D", "Free models only \u1245\u1295\u1265\u122D \u1295\u1241 \u1290\u12CD\u1362");
    } else {
      setConnectionStatus("", "\u1208\u1218\u1308\u1293\u1298\u1275 \u12DD\u130D\u1301", "\u12AD\u134D\u12EB \u12C8\u12ED\u121D credit card \u1233\u12EB\u1235\u1348\u120D\u130D \u1290\u1343 key \u1218\u134D\u1320\u122D \u12ED\u127D\u120B\u1209\u1362");
    }
    if (!refs.modelDialog.open) refs.modelDialog.showModal();
    loadFreeCatalog();
  }
  async function connectOpenRouter() {
    const key = refs.apiKeyInput.value.trim();
    if (!key) return toast("OpenRouter API key \u12EB\u1235\u1308\u1261\u1362", "error");
    refs.connect.disabled = true;
    refs.connect.textContent = "\u130D\u1295\u1299\u1290\u1271\u1295 \u1260\u1218\u1348\u1270\u123D \u120B\u12ED\u2026";
    setConnectionStatus("", "\u1260\u1218\u1348\u1270\u123D \u120B\u12ED\u2026", "Key\u12CE \u12E8\u121A\u1220\u122B \u1218\u1206\u1291\u1295 \u12A5\u12EB\u1228\u130B\u1308\u1325\u1295 \u1290\u12CD\u1362");
    try {
      const response = await fetch(`${OPENROUTER_API}/key`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error?.message || payload.message || `HTTP ${response.status}`);
      storeApiKey(key, refs.rememberKey.checked);
      connectionVerified = true;
      const remaining = payload.data?.limit_remaining;
      const quota = Number.isFinite(Number(remaining)) ? ` \xB7 ${remaining} requests/credits remaining` : "";
      setConnectionStatus("success", "AI Council \u1270\u1308\u1293\u129D\u1277\u120D", `Key \u1275\u12AD\u12AD\u120D \u1290\u12CD${quota}\u1362`);
      renderConnectionUI();
      toast("\u1290\u1343 AI Council \u1270\u1308\u1293\u129D\u1277\u120D\u1362 Model \u12A0\u12ED\u12C8\u122D\u12F5\u121D\u1362", "success", 4500);
      setTimeout(() => {
        if (refs.modelDialog.open) refs.modelDialog.close();
        refs.prompt.focus();
      }, 650);
    } catch (error) {
      console.error("OpenRouter connection failed", error);
      setConnectionStatus("error", "\u1218\u1308\u1293\u1298\u1275 \u12A0\u120D\u1270\u127B\u1208\u121D", error.message || "Key\u12CE\u1295\u1293 internet connection\u1295 \u12EB\u1228\u130B\u130D\u1321\u1362");
      toast("\u130D\u1295\u1299\u1290\u1271 \u12A0\u120D\u1270\u1233\u12AB\u121D\u1362 Key\u12CE\u1295 \u12EB\u1228\u130B\u130D\u1321\u1362", "error", 5500);
    } finally {
      refs.connect.disabled = false;
      refs.connect.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 12h8M13 7l5 5-5 5M6 5H4v14h2"/></svg> \u1290\u1343 AI Council \u12A0\u1308\u1293\u129D';
    }
  }
  function disconnectOpenRouter() {
    forgetApiKey();
    refs.apiKeyInput.value = "";
    refs.rememberKey.checked = false;
    setConnectionStatus("", "\u130D\u1295\u1299\u1290\u1271 \u1270\u124B\u122D\u1327\u120D", "API key\u12CE \u12A8\u12DA\u1205 browser \u1270\u12C8\u130D\u12F7\u120D\u1362");
    renderConnectionUI();
    toast("OpenRouter key \u1270\u12C8\u130D\u12F7\u120D\u1362");
  }
  function safeFreeModel(model) {
    return model === FREE_ROUTER_MODEL || String(model).endsWith(":free");
  }
  function requestHeaders(key) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "X-OpenRouter-Title": "Zola AI Council"
    };
    if (location.origin.startsWith("http")) headers["HTTP-Referer"] = location.origin;
    return headers;
  }
  async function parseApiError(response) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.error?.message || payload.message || `OpenRouter request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  function responseText(message) {
    if (typeof message?.content === "string") return message.content;
    if (Array.isArray(message?.content)) return message.content.map((part) => part.text || "").join("");
    return "";
  }
  async function requestCompletion({ key, model, messages, temperature = 0.7, maxTokens = 850, signal }) {
    if (!safeFreeModel(model)) throw new Error("Paid model blocked: Zola only permits explicit :free routes.");
    const response = await fetch(`${OPENROUTER_API}/chat/completions`, {
      method: "POST",
      headers: requestHeaders(key),
      signal,
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });
    if (!response.ok) return parseApiError(response);
    const payload = await response.json();
    const content = responseText(payload.choices?.[0]?.message).trim();
    if (!content) throw new Error("The selected free model returned an empty response.");
    return { content, model: payload.model || model };
  }
  async function requestCompletionWithFallback(options) {
    try {
      return await requestCompletion(options);
    } catch (error) {
      if (options.signal?.aborted || !options.fallbackModel || options.fallbackModel === options.model) throw error;
      return requestCompletion({ ...options, model: options.fallbackModel });
    }
  }
  async function streamCompletion({ key, model, messages, temperature = 0.7, maxTokens = 1400, signal, onToken }) {
    if (!safeFreeModel(model)) throw new Error("Paid model blocked: Zola only permits explicit :free routes.");
    const response = await fetch(`${OPENROUTER_API}/chat/completions`, {
      method: "POST",
      headers: requestHeaders(key),
      signal,
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: true })
    });
    if (!response.ok) return parseApiError(response);
    if (!response.body) throw new Error("Streaming is not supported by this browser.");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let actualModel = model;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        const chunk = JSON.parse(data);
        if (chunk.error) throw new Error(chunk.error.message || "Free model stream failed.");
        actualModel = chunk.model || actualModel;
        const token = chunk.choices?.[0]?.delta?.content || "";
        if (token) onToken(token);
      }
    }
    return actualModel;
  }
  async function streamWithFallback(options) {
    try {
      return await streamCompletion(options);
    } catch (error) {
      if (options.signal?.aborted || options.hasOutput() || !options.fallbackModel || options.fallbackModel === options.model) throw error;
      return streamCompletion({ ...options, model: options.fallbackModel });
    }
  }
  function attachmentContext() {
    return pendingAttachments.map((file) => `--- ${file.name} ---
${file.content.slice(0, 7e3)}`).join("\n\n");
  }
  function agentMessages(basePrompt, role, history) {
    return [
      { role: "system", content: `${basePrompt}

Council role: ${role.instruction}
Work independently. Do not refer to other council members or claim consensus.` },
      ...history
    ];
  }
  async function generateCouncilAnswer({ key, assistant, history, basePrompt, userPrompt, signal }) {
    const councilSize = Math.max(2, Math.min(4, Number(state.settings.councilSize) || 3));
    const selection = selectCouncilModels(freeModelCatalog, userPrompt, councilSize + 1);
    const participants = selection.models.slice(0, councilSize);
    const chairman = selection.models[councilSize]?.id || FREE_ROUTER_MODEL;
    let finished = 0;
    refs.generationStatusText.textContent = `${participants.length} \u1290\u1343 AI \u12A0\u1295\u130E\u120E\u127D \u1260\u1270\u1293\u1320\u120D \u12A5\u12EB\u1230\u1261 \u1290\u12CD\u2026`;
    const settled = await Promise.allSettled(participants.map(async (candidate, index) => {
      const role = COUNCIL_ROLES[index % COUNCIL_ROLES.length];
      const result = await requestCompletionWithFallback({
        key,
        model: candidate.id,
        fallbackModel: participants[(index + 1) % participants.length]?.id,
        messages: agentMessages(basePrompt, role, history),
        temperature: Number(state.settings.temperature) || 0.7,
        maxTokens: 850,
        signal
      });
      finished += 1;
      refs.generationStatusText.textContent = `${finished}/${participants.length} AI \u1218\u120D\u1230\u12CB\u120D \xB7 \u120C\u120E\u1279\u1295 \u1260\u1218\u1320\u1260\u1245 \u120B\u12ED\u2026`;
      return { role: role.label, model: result.model, content: result.content };
    }));
    const proposals = settled.filter((item) => item.status === "fulfilled").map((item) => item.value);
    if (!proposals.length) {
      const reason = settled.find((item) => item.status === "rejected")?.reason;
      throw reason || new Error("No free council model was available.");
    }
    assistant.council = {
      task: selection.task,
      proposals: proposals.map((item) => ({ ...item, content: item.content.slice(0, MAX_PROPOSAL_STORAGE) })),
      chairman
    };
    renderMessages();
    refs.generationStatusText.textContent = "Council Chair \u1218\u120D\u1236\u1279\u1295 \u12A5\u12EB\u12C8\u12F3\u12F0\u1228\u1293 \u12A5\u12EB\u12CB\u1203\u12F0 \u1290\u12CD\u2026";
    const synthesis = buildSynthesisPrompt(proposals, state.settings.language);
    const chairMessages = [
      { role: "system", content: `${basePrompt}

${synthesis}` },
      ...history
    ];
    let lastPaint = 0;
    const actualChair = await streamWithFallback({
      key,
      model: chairman,
      fallbackModel: participants[0]?.id,
      messages: chairMessages,
      temperature: Math.min(Number(state.settings.temperature) || 0.7, 0.8),
      maxTokens: 1500,
      signal,
      hasOutput: () => Boolean(assistant.content),
      onToken: (token) => {
        assistant.content += token;
        const now = performance.now();
        if (now - lastPaint > 45) {
          updateStreamingMessage(assistant);
          lastPaint = now;
        }
      }
    });
    assistant.council.chairman = actualChair;
  }
  async function generateSingleAnswer({ key, assistant, history, basePrompt, userPrompt, signal }) {
    refs.generationStatusText.textContent = "\u1290\u1343 open-weight AI \u1218\u120D\u1235 \u12A5\u12EB\u12D8\u130B\u1300 \u1290\u12CD\u2026";
    const selected = selectCouncilModels(freeModelCatalog, userPrompt, 1).models[0]?.id || FREE_ROUTER_MODEL;
    let lastPaint = 0;
    const actualModel = await streamWithFallback({
      key,
      model: selected,
      messages: [{ role: "system", content: basePrompt }, ...history],
      temperature: Number(state.settings.temperature) || 0.7,
      maxTokens: 1400,
      signal,
      hasOutput: () => Boolean(assistant.content),
      onToken: (token) => {
        assistant.content += token;
        const now = performance.now();
        if (now - lastPaint > 45) {
          updateStreamingMessage(assistant);
          lastPaint = now;
        }
      }
    });
    assistant.model = actualModel;
  }
  async function generateResponse(attachedText = "") {
    const chat = activeChat();
    const lastUser = [...chat.messages].reverse().find((message) => message.role === "user");
    const key = getApiKey();
    if (!lastUser || !key || generating) return;
    const assistant = { role: "assistant", content: "", createdAt: Date.now(), streaming: true };
    chat.messages.push(assistant);
    chat.updatedAt = Date.now();
    activeController = new AbortController();
    setGenerating(true);
    renderMessages();
    renderConversationList();
    try {
      const relevantKnowledge = retrieveKnowledge(lastUser.content, state.knowledge, 3);
      const basePrompt = buildSystemPrompt(state.settings, relevantKnowledge, attachedText);
      const history = trimConversation(chat.messages.filter((message) => message !== assistant), 24e3);
      if (state.settings.councilMode) {
        await generateCouncilAnswer({ key, assistant, history, basePrompt, userPrompt: lastUser.content, signal: activeController.signal });
      } else {
        await generateSingleAnswer({ key, assistant, history, basePrompt, userPrompt: lastUser.content, signal: activeController.signal });
      }
      assistant.content = assistant.content.trim();
      if (!assistant.content) assistant.content = "\u12ED\u1245\u122D\u1273\u1363 \u1290\u1343\u12CD model \u1263\u12F6 \u1218\u120D\u1235 \u1230\u1325\u1277\u120D\u1362 \u12A5\u1295\u12F0\u1308\u1293 \u12ED\u121E\u12AD\u1229\u1362";
      assistant.streaming = false;
      chat.updatedAt = Date.now();
      saveState();
      renderMessages();
      renderConversationList();
      if (state.settings.autoSpeak) speakText(assistant.content);
    } catch (error) {
      console.error("Generation failed", error);
      assistant.streaming = false;
      if (!assistant.content) chat.messages = chat.messages.filter((message2) => message2 !== assistant);
      const aborted = error.name === "AbortError" || activeController?.signal.aborted;
      const quota = error.status === 429;
      const message = aborted ? "\u1218\u120D\u1231 \u1246\u121F\u120D\u1362" : quota ? "\u12E8\u1290\u1343\u12CD API \u12E8\u12DB\u122C \u12C8\u12ED\u121D \u12E8\u12F0\u1242\u1243 \u1308\u12F0\u1265 \u12F0\u122D\u1237\u120D\u1362 \u1246\u12ED\u1270\u12CD \u12ED\u121E\u12AD\u1229 \u12C8\u12ED\u121D Council mode\u1295 \u12EB\u1325\u1349\u1362" : `\u1218\u120D\u1235 \u12A0\u120D\u1270\u1308\u1298\u121D\u1366 ${error.message || "free cloud model unavailable"}`;
      toast(message, aborted ? "" : "error", 7e3);
      saveState();
      renderMessages();
    } finally {
      activeController = null;
      setGenerating(false);
      refs.prompt.focus();
    }
  }
  async function submitPrompt() {
    const content = refs.prompt.value.trim();
    if (!content || generating) return;
    if (!getApiKey()) {
      openConnectionDialog();
      toast("\u1218\u1300\u1218\u122A\u12EB \u1290\u1343\u12CD\u1295 AI Council \u12EB\u1308\u1293\u1299\u1362");
      return;
    }
    const chat = activeChat();
    const names = pendingAttachments.map((file) => file.name);
    const attachedText = attachmentContext();
    chat.messages.push({ role: "user", content, attachments: names, createdAt: Date.now() });
    if (chat.messages.filter((message) => message.role === "user").length === 1) chat.title = createTitle(content);
    chat.updatedAt = Date.now();
    refs.prompt.value = "";
    autoResizePrompt();
    pendingAttachments = [];
    renderAttachments();
    saveState();
    renderAll();
    await generateResponse(attachedText);
  }
  function stopGeneration() {
    if (!generating || !activeController) return;
    refs.generationStatusText.textContent = "\u1260\u121B\u1246\u121D \u120B\u12ED\u2026";
    activeController.abort();
  }
  function renderAttachments() {
    refs.attachmentList.hidden = !pendingAttachments.length;
    refs.attachmentList.innerHTML = pendingAttachments.map((file, index) => `
    <span class="pending-file"><span>${escapeHTML(file.name)}</span><small>${formatBytes(file.size)}</small><button type="button" data-remove-attachment="${index}" aria-label="\u12A0\u1235\u12C8\u130D\u12F5">\xD7</button></span>`).join("");
  }
  async function readAttachments(fileList) {
    for (const file of [...fileList]) {
      if (file.size > MAX_FILE_BYTES) {
        toast(`${file.name} \u12A82 MB \u12ED\u1260\u120D\u1323\u120D\u1362`, "error");
        continue;
      }
      try {
        pendingAttachments.push({ name: file.name, size: file.size, content: await file.text() });
      } catch {
        toast(`${file.name} \u121B\u1295\u1260\u1265 \u12A0\u120D\u1270\u127B\u1208\u121D\u1362`, "error");
      }
    }
    renderAttachments();
    toast("Attachment \u1232\u120B\u12AD \u12ED\u12D8\u1271 \u12C8\u12F0 cloud AI provider \u12A5\u1295\u12F0\u121A\u1204\u12F5 \u12EB\u1235\u1273\u12CD\u1231\u1362");
  }
  async function addKnowledgeFiles(fileList) {
    const files = [...fileList];
    let total = state.knowledge.reduce((sum, item) => sum + item.content.length, 0);
    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        toast(`${file.name} \u12A82 MB \u12ED\u1260\u120D\u1323\u120D\u1362`, "error");
        continue;
      }
      try {
        const content = await file.text();
        if (!content.trim()) continue;
        if (total + content.length > MAX_KNOWLEDGE_CHARS) {
          toast("\u12E8\u12A5\u12CD\u1240\u1275 \u121B\u12A8\u121B\u127B\u12CD \u1308\u12F0\u1265 \u12F0\u122D\u1237\u120D\u1362", "error", 5500);
          break;
        }
        state.knowledge.push({ id: uid("doc"), name: file.name, size: file.size, content, addedAt: Date.now() });
        total += content.length;
      } catch {
        toast(`${file.name} \u121B\u1295\u1260\u1265 \u12A0\u120D\u1270\u127B\u1208\u121D\u1362`, "error");
      }
    }
    saveState();
    renderKnowledge();
    refs.knowledgeFileInput.value = "";
  }
  function openSettings() {
    $("languageSelect").value = state.settings.language;
    $("temperatureInput").value = state.settings.temperature;
    $("temperatureValue").textContent = Number(state.settings.temperature).toFixed(1);
    $("councilSizeSelect").value = String(state.settings.councilSize);
    $("systemPromptInput").value = state.settings.systemPrompt;
    $("autoSpeakInput").checked = Boolean(state.settings.autoSpeak);
    renderConnectionUI();
    refs.settingsDialog.showModal();
  }
  function saveSettings() {
    state.settings.language = $("languageSelect").value;
    state.settings.temperature = Number($("temperatureInput").value);
    state.settings.councilSize = Number($("councilSizeSelect").value);
    state.settings.systemPrompt = $("systemPromptInput").value.trim();
    state.settings.autoSpeak = $("autoSpeakInput").checked;
    saveState();
    refs.settingsDialog.close();
    toast("\u121B\u1235\u1270\u12AB\u12A8\u12EB\u12CD \u1270\u1240\u121D\u1327\u120D\u1362", "success");
  }
  function clearLocalContent() {
    if (!confirm("\u1201\u1209\u121D \u12CD\u12ED\u12ED\u1276\u127D\u1293 \u12E8\u12A5\u12CD\u1240\u1275 \u134B\u12ED\u120E\u127D \u12ED\u1320\u134B\u1209\u1362 API key\u12CE \u130D\u1295 \u12ED\u1246\u12EB\u120D\u1362 \u12ED\u1240\u1325\u120D?")) return;
    const settings = { ...state.settings };
    state = makeDefaultState();
    state.settings = settings;
    saveState();
    refs.settingsDialog.close();
    renderAll();
    toast("\u12CD\u12ED\u12ED\u1275\u1293 \u12E8\u12A5\u12CD\u1240\u1275 \u12F3\u1273 \u1320\u134D\u1277\u120D\u1362", "success");
  }
  function exportConversation() {
    const chat = activeChat();
    if (!chat.messages.length) return toast("\u1208\u121B\u12CD\u1228\u12F5 \u12CD\u12ED\u12ED\u1275 \u12E8\u1208\u121D\u1362");
    const markdown = [
      `# ${chat.title}`,
      "",
      `Exported from Zola AI Council \xB7 ${(/* @__PURE__ */ new Date()).toLocaleString()}`,
      "",
      ...chat.messages.flatMap((message) => [
        `## ${message.role === "user" ? "You" : "Zola Council"}`,
        "",
        message.content,
        ""
      ])
    ].join("\n");
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${chat.title.replace(/[^\p{L}\p{N}_-]+/gu, "-").slice(0, 50) || "zola-council-chat"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("\u1270\u1240\u12F5\u1277\u120D\u1362", "success");
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      toast("\u1270\u1240\u12F5\u1277\u120D\u1362", "success");
    }
  }
  function speakText(text) {
    if (!("speechSynthesis" in window)) return toast("\u12E8\u12F5\u121D\u1345 \u1295\u1263\u1265 \u1260\u12DA\u1205 browser \u12A0\u12ED\u12F0\u1308\u134D\u121D\u1362", "error");
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```|[#*_`>-]/g, " "));
    utterance.lang = state.settings.language === "en" ? "en-US" : "am-ET";
    utterance.rate = 0.95;
    speechSynthesis.speak(utterance);
  }
  function toggleMicrophone() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return toast("\u12E8\u12F5\u121D\u1345 \u133D\u1211\u134D \u1260\u12DA\u1205 browser \u12A0\u12ED\u12F0\u1308\u134D\u121D\u1362 Chrome \u12ED\u121E\u12AD\u1229\u1362", "error", 5e3);
    if (speechRecognition) {
      speechRecognition.stop();
      return;
    }
    const recognition = new Recognition();
    speechRecognition = recognition;
    recognition.lang = state.settings.language === "en" ? "en-US" : "am-ET";
    recognition.interimResults = true;
    recognition.continuous = false;
    const startingText = refs.prompt.value;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) transcript += event.results[index][0].transcript;
      refs.prompt.value = `${startingText}${startingText ? " " : ""}${transcript}`;
      autoResizePrompt();
    };
    recognition.onerror = () => toast("\u12F5\u121D\u1345\u12CE\u1295 \u1218\u1235\u121B\u1275 \u12A0\u120D\u1270\u127B\u1208\u121D\u1362", "error");
    recognition.onend = () => {
      speechRecognition = null;
      $("micBtn").classList.remove("active");
    };
    $("micBtn").classList.add("active");
    recognition.start();
  }
  function toast(message, type = "", duration = 3200) {
    const item = document.createElement("div");
    item.className = `toast ${type}`.trim();
    item.textContent = message;
    refs.toastRegion.append(item);
    setTimeout(() => {
      item.classList.add("out");
      setTimeout(() => item.remove(), 220);
    }, duration);
  }
  refs.conversationList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-chat]");
    if (deleteButton) {
      event.stopPropagation();
      deleteChat(deleteButton.dataset.deleteChat);
      return;
    }
    const item = event.target.closest("[data-chat-id]");
    if (item) selectChat(item.dataset.chatId);
  });
  refs.conversationList.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-chat-id]")) {
      event.preventDefault();
      selectChat(event.target.dataset.chatId);
    }
  });
  refs.chatSearch.addEventListener("input", renderConversationList);
  $("newChatBtn").addEventListener("click", createNewChat);
  $("menuBtn").addEventListener("click", () => setSidebar(true));
  $("closeSidebarBtn").addEventListener("click", () => setSidebar(false));
  refs.scrim.addEventListener("click", () => setSidebar(false));
  $("conversationTitleBtn").addEventListener("click", renameActiveChat);
  $("modelBtn").addEventListener("click", openConnectionDialog);
  $("welcomeLoadBtn").addEventListener("click", openConnectionDialog);
  refs.connect.addEventListener("click", connectOpenRouter);
  refs.apiKeyInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      connectOpenRouter();
    }
  });
  refs.disconnect.addEventListener("click", disconnectOpenRouter);
  $("toggleKeyBtn").addEventListener("click", () => {
    const reveal = refs.apiKeyInput.type === "password";
    refs.apiKeyInput.type = reveal ? "text" : "password";
    $("toggleKeyBtn").textContent = reveal ? "\u12F0\u1265\u1245" : "\u12A0\u1233\u12ED";
  });
  $("exportBtn").addEventListener("click", exportConversation);
  $("settingsBtn").addEventListener("click", openSettings);
  $("manageConnectionBtn").addEventListener("click", () => {
    refs.settingsDialog.close();
    openConnectionDialog();
  });
  $("knowledgeBtn").addEventListener("click", () => refs.knowledgeDialog.showModal());
  $("privacyInfoBtn").addEventListener("click", () => refs.privacyDialog.showModal());
  $("saveSettingsBtn").addEventListener("click", saveSettings);
  $("clearAllBtn").addEventListener("click", clearLocalContent);
  $("temperatureInput").addEventListener("input", (event) => {
    $("temperatureValue").textContent = Number(event.target.value).toFixed(1);
  });
  refs.composer.addEventListener("submit", (event) => {
    event.preventDefault();
    submitPrompt();
  });
  refs.prompt.addEventListener("input", autoResizePrompt);
  refs.prompt.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      submitPrompt();
    }
  });
  refs.stop.addEventListener("click", stopGeneration);
  refs.councilMode.addEventListener("click", () => {
    state.settings.councilMode = !state.settings.councilMode;
    refs.councilMode.setAttribute("aria-pressed", String(state.settings.councilMode));
    saveState();
    toast(state.settings.councilMode ? `AI Council \u1260\u122D\u1277\u120D\u1362 ${state.settings.councilSize} AI\u12CE\u127D\u1293 Chair \u12A0\u1265\u1228\u12CD \u12ED\u1220\u122B\u1209\u1362` : "\u1348\u1323\u1295 single-AI mode \u1260\u122D\u1277\u120D\u1364 \u1260\u1325\u12EB\u1244 1 free request \u1265\u127B \u12ED\u1320\u1240\u121B\u120D\u1362");
  });
  document.querySelectorAll(".suggestion-card").forEach((button) => {
    button.addEventListener("click", () => {
      refs.prompt.value = button.dataset.prompt;
      autoResizePrompt();
      refs.prompt.focus();
      if (!getApiKey()) openConnectionDialog();
    });
  });
  $("attachBtn").addEventListener("click", () => refs.fileInput.click());
  refs.fileInput.addEventListener("change", (event) => {
    readAttachments(event.target.files);
    event.target.value = "";
  });
  refs.attachmentList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-attachment]");
    if (!button) return;
    pendingAttachments.splice(Number(button.dataset.removeAttachment), 1);
    renderAttachments();
  });
  $("micBtn").addEventListener("click", toggleMicrophone);
  refs.knowledgeDropZone.addEventListener("click", () => refs.knowledgeFileInput.click());
  refs.knowledgeFileInput.addEventListener("change", (event) => addKnowledgeFiles(event.target.files));
  ["dragenter", "dragover"].forEach((type) => refs.knowledgeDropZone.addEventListener(type, (event) => {
    event.preventDefault();
    refs.knowledgeDropZone.classList.add("dragging");
  }));
  ["dragleave", "drop"].forEach((type) => refs.knowledgeDropZone.addEventListener(type, (event) => {
    event.preventDefault();
    refs.knowledgeDropZone.classList.remove("dragging");
    if (type === "drop" && event.dataTransfer.files.length) addKnowledgeFiles(event.dataTransfer.files);
  }));
  refs.knowledgeList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-knowledge]");
    if (!button) return;
    state.knowledge = state.knowledge.filter((file) => file.id !== button.dataset.removeKnowledge);
    saveState();
    renderKnowledge();
  });
  refs.messages.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy-message]");
    if (copyButton) return copyText(activeChat().messages[Number(copyButton.dataset.copyMessage)]?.content || "");
    const speakButton = event.target.closest("[data-speak-message]");
    if (speakButton) return speakText(activeChat().messages[Number(speakButton.dataset.speakMessage)]?.content || "");
    const codeButton = event.target.closest(".copy-code");
    if (codeButton) copyText(codeButton.closest(".code-block")?.querySelector("code")?.textContent || "");
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
      event.preventDefault();
      createNewChat();
    }
    if (event.key === "Escape") setSidebar(false);
  });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.warn));
  }
  renderAll();
  autoResizePrompt();
  loadFreeCatalog();
})();
