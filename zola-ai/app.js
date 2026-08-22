import {
  COUNCIL_ROLES,
  FREE_ROUTER_MODEL,
  buildSynthesisPrompt,
  buildSystemPrompt,
  conversationGroup,
  createTitle,
  escapeHTML,
  formatBytes,
  normalizeFreeModels,
  renderMarkdown,
  retrieveKnowledge,
  selectCouncilModels,
  trimConversation,
  uid,
} from "./core.js";

const OPENROUTER_API = "https://openrouter.ai/api/v1";
const STORAGE_KEY = "zola.ai.local.v1";
const SESSION_API_KEY = "zola.openrouter.key.session";
const SAVED_API_KEY = "zola.openrouter.key.saved";
const MAX_KNOWLEDGE_CHARS = 2_500_000;
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_PROPOSAL_STORAGE = 5_000;

const $ = (id) => document.getElementById(id);
const refs = {
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
  toastRegion: $("toastRegion"),
};

let state = loadState();
let freeModelCatalog = [];
let catalogLoading = false;
let connectionVerified = false;
let generating = false;
let activeController = null;
let pendingAttachments = [];
let speechRecognition = null;

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
      councilSize: 3,
    },
  };
}

function makeChat() {
  const now = Date.now();
  return { id: uid("chat"), title: "አዲስ ውይይት", createdAt: now, updatedAt: now, messages: [] };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.chats)) return makeDefaultState();
    const fallback = makeDefaultState();
    const chats = saved.chats.filter((chat) => chat && Array.isArray(chat.messages));
    if (!chats.length) chats.push(fallback.chats[0]);
    const settings = { ...fallback.settings, ...(saved.settings || {}) };
    if (saved.settings?.councilMode === undefined && saved.settings?.deepMode !== undefined) {
      settings.councilMode = Boolean(saved.settings.deepMode);
    }
    settings.councilSize = Math.max(2, Math.min(4, Number(settings.councilSize) || 3));
    return {
      ...fallback,
      ...saved,
      chats,
      knowledge: Array.isArray(saved.knowledge) ? saved.knowledge : [],
      settings,
      activeChatId: chats.some((chat) => chat.id === saved.activeChatId) ? saved.activeChatId : chats[0].id,
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
    toast("የbrowser ማከማቻው ሞልቷል። አንዳንድ የእውቀት ፋይሎችን ያጥፉ።", "error", 5000);
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
  const groups = new Map();
  chats.forEach((chat) => {
    const group = conversationGroup(chat.updatedAt);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(chat);
  });
  return groups;
}

function renderConversationList() {
  const search = refs.chatSearch.value.trim().toLocaleLowerCase();
  const chats = [...state.chats]
    .filter((chat) => !search || chat.title.toLocaleLowerCase().includes(search))
    .sort((a, b) => b.updatedAt - a.updatedAt);
  if (!chats.length) {
    refs.conversationList.innerHTML = '<p class="empty-history">የሚዛመድ ውይይት አልተገኘም።</p>';
    return;
  }
  let html = "";
  for (const [group, items] of groupChats(chats)) {
    html += `<p class="conversation-group-title">${escapeHTML(group)}</p>`;
    html += items.map((chat) => `
      <div class="conversation-item ${chat.id === state.activeChatId ? "active" : ""}" data-chat-id="${escapeHTML(chat.id)}" role="button" tabindex="0" aria-label="${escapeHTML(chat.title)}">
        <svg viewBox="0 0 24 24"><path d="M5 5h14v11H9l-4 4V5Z"/></svg>
        <span class="item-title">${escapeHTML(chat.title)}</span>
        <button class="conversation-menu" type="button" data-delete-chat="${escapeHTML(chat.id)}" aria-label="ውይይቱን አጥፋ" title="አጥፋ">
          <svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>
        </button>
      </div>`).join("");
  }
  refs.conversationList.innerHTML = html;
}

function renderKnowledge() {
  const files = state.knowledge;
  refs.knowledgeCount.textContent = files.length ? `${files.length} ፋይል${files.length === 1 ? "" : "ች"}` : "ምንም ፋይል የለም";
  if (!files.length) {
    refs.knowledgeList.innerHTML = '<p class="knowledge-empty">እስካሁን ምንም ፋይል አልጨመሩም።</p>';
    return;
  }
  refs.knowledgeList.innerHTML = files.map((file) => `
    <div class="knowledge-item">
      <span class="knowledge-item-icon"><svg viewBox="0 0 24 24"><path d="M5 3h10l4 4v14H5V3Z"/><path d="M14 3v5h5M8 12h8M8 16h6"/></svg></span>
      <span><b>${escapeHTML(file.name)}</b><small>${formatBytes(file.size)} · browser storage</small></span>
      <button class="remove-knowledge" type="button" data-remove-knowledge="${escapeHTML(file.id)}" aria-label="ፋይሉን አጥፋ"><svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V4h6v3M8 7l1 14h6l1-14M10 11v6M14 11v6"/></svg></button>
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
    <summary><span class="council-orbit"><i></i><i></i><i></i></span><b>${council.proposals.length} AI አንጎሎች ተዋህደዋል</b><small>${escapeHTML(council.task || "general")} · Chair: ${escapeHTML(shortModelName(council.chairman || "free router"))}</small><svg viewBox="0 0 24 24"><path d="m8 10 4 4 4-4"/></svg></summary>
    <div class="council-drafts">${proposals}</div>
  </details>`;
}

function messageActions(message, index) {
  if (!message.content) return "";
  const speak = message.role === "assistant" ? `
    <button class="message-action" type="button" data-speak-message="${index}" title="በድምፅ አንብብ" aria-label="በድምፅ አንብብ">
      <svg viewBox="0 0 24 24"><path d="M5 9v6h4l5 4V5L9 9H5Z"/><path d="M17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg>
    </button>` : "";
  return `<div class="message-actions">
    <button class="message-action" type="button" data-copy-message="${index}" title="ቅዳ" aria-label="መልዕክቱን ቅዳ">
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
    const attachments = message.attachments?.length
      ? `<div>${message.attachments.map((name) => `<span class="attachment-chip"><svg viewBox="0 0 24 24"><path d="M5 3h10l4 4v14H5V3Z"/><path d="M14 3v5h5"/></svg>${escapeHTML(name)}</span>`).join(" ")}</div>`
      : "";
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
  requestAnimationFrame(() => { refs.chatMain.scrollTop = refs.chatMain.scrollHeight; });
}

function renderConnectionUI() {
  const connected = Boolean(getApiKey());
  const count = normalizeFreeModels(freeModelCatalog).filter((model) => model.id !== FREE_ROUTER_MODEL).length;
  refs.modelPillText.textContent = connected ? (count ? `${count} ነፃ AI · Council` : "Free AI Council") : "ነፃ AIዎችን ያገናኙ";
  refs.modelDot.className = `model-dot${connected ? " ready" : ""}`;
  refs.firstRunNotice.hidden = connected;
  refs.settingsConnectionText.textContent = connected ? "ተገናኝቷል · free models only" : "አልተገናኘም";
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
  if (generating) return toast("መልሱ እስኪጠናቀቅ ይጠብቁ።", "error");
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
  if (!chat || !confirm(`“${chat.title}” ውይይት ይጥፋ?`)) return;
  state.chats = state.chats.filter((item) => item.id !== id);
  if (!state.chats.length) state.chats.push(makeChat());
  if (state.activeChatId === id) state.activeChatId = state.chats[0].id;
  saveState();
  renderAll();
}

function renameActiveChat() {
  const chat = activeChat();
  const next = prompt("የውይይቱ ርዕስ", chat.title)?.trim();
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

function setGenerating(value, text = "AI Council እያሰበ ነው…") {
  generating = value;
  refs.prompt.disabled = value;
  refs.send.hidden = value;
  refs.stop.hidden = !value;
  refs.generationStatus.hidden = !value;
  refs.generationStatusText.textContent = text;
  document.querySelectorAll(".suggestion-card").forEach((button) => { button.disabled = value; });
}

function setConnectionStatus(type, title, text) {
  refs.connectionStatusBox.className = `compatibility ${type || ""}`.trim();
  refs.connectionStatusTitle.textContent = title;
  refs.connectionStatusText.textContent = text;
}

async function loadFreeCatalog() {
  if (catalogLoading) return;
  catalogLoading = true;
  refs.availableModelsCount.textContent = "…";
  try {
    const response = await fetch(`${OPENROUTER_API}/models`);
    if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
    const payload = await response.json();
    freeModelCatalog = Array.isArray(payload.data) ? payload.data : [];
    const free = normalizeFreeModels(freeModelCatalog).filter((model) => model.id !== FREE_ROUTER_MODEL);
    const families = [...new Set(free.slice(0, 8).map((model) => model.provider))];
    refs.availableModelsCount.textContent = String(free.length || "1+");
    refs.availableModelsText.textContent = families.length ? `${families.join(" · ")} · live` : "OpenRouter Free Models Router";
    renderConnectionUI();
  } catch (error) {
    console.warn("Could not load model catalog", error);
    refs.availableModelsCount.textContent = "AUTO";
    refs.availableModelsText.textContent = "Free Models Router በራሱ ነፃ ሞዴል ይመርጣል";
  } finally {
    catalogLoading = false;
  }
}

function openConnectionDialog() {
  refs.apiKeyInput.value = getApiKey();
  refs.rememberKey.checked = Boolean(localStorage.getItem(SAVED_API_KEY));
  refs.apiKeyInput.type = "password";
  $("toggleKeyBtn").textContent = "አሳይ";
  if (getApiKey()) {
    setConnectionStatus(connectionVerified ? "success" : "", connectionVerified ? "ግንኙነቱ ተረጋግጧል" : "Key ተቀምጧል", "Free models only ቅንብር ንቁ ነው።");
  } else {
    setConnectionStatus("", "ለመገናኘት ዝግጁ", "ክፍያ ወይም credit card ሳያስፈልግ ነፃ key መፍጠር ይችላሉ።");
  }
  if (!refs.modelDialog.open) refs.modelDialog.showModal();
  loadFreeCatalog();
}

async function connectOpenRouter() {
  const key = refs.apiKeyInput.value.trim();
  if (!key) return toast("OpenRouter API key ያስገቡ።", "error");
  refs.connect.disabled = true;
  refs.connect.textContent = "ግንኙነቱን በመፈተሽ ላይ…";
  setConnectionStatus("", "በመፈተሽ ላይ…", "Keyዎ የሚሠራ መሆኑን እያረጋገጥን ነው።");
  try {
    const response = await fetch(`${OPENROUTER_API}/key`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error?.message || payload.message || `HTTP ${response.status}`);
    storeApiKey(key, refs.rememberKey.checked);
    connectionVerified = true;
    const remaining = payload.data?.limit_remaining;
    const quota = Number.isFinite(Number(remaining)) ? ` · ${remaining} requests/credits remaining` : "";
    setConnectionStatus("success", "AI Council ተገናኝቷል", `Key ትክክል ነው${quota}።`);
    renderConnectionUI();
    toast("ነፃ AI Council ተገናኝቷል። Model አይወርድም።", "success", 4500);
    setTimeout(() => {
      if (refs.modelDialog.open) refs.modelDialog.close();
      refs.prompt.focus();
    }, 650);
  } catch (error) {
    console.error("OpenRouter connection failed", error);
    setConnectionStatus("error", "መገናኘት አልተቻለም", error.message || "Keyዎንና internet connectionን ያረጋግጡ።");
    toast("ግንኙነቱ አልተሳካም። Keyዎን ያረጋግጡ።", "error", 5500);
  } finally {
    refs.connect.disabled = false;
    refs.connect.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 12h8M13 7l5 5-5 5M6 5H4v14h2"/></svg> ነፃ AI Council አገናኝ';
  }
}

function disconnectOpenRouter() {
  forgetApiKey();
  refs.apiKeyInput.value = "";
  refs.rememberKey.checked = false;
  setConnectionStatus("", "ግንኙነቱ ተቋርጧል", "API keyዎ ከዚህ browser ተወግዷል።");
  renderConnectionUI();
  toast("OpenRouter key ተወግዷል።");
}

function safeFreeModel(model) {
  return model === FREE_ROUTER_MODEL || String(model).endsWith(":free");
}

function requestHeaders(key) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
    "X-OpenRouter-Title": "Zola AI Council",
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
      stream: false,
    }),
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
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: true }),
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
    if (
      options.signal?.aborted
      || options.hasOutput()
      || !options.fallbackModel
      || options.fallbackModel === options.model
    ) throw error;
    return streamCompletion({ ...options, model: options.fallbackModel });
  }
}

function attachmentContext() {
  return pendingAttachments.map((file) => `--- ${file.name} ---\n${file.content.slice(0, 7000)}`).join("\n\n");
}

function agentMessages(basePrompt, role, history) {
  return [
    { role: "system", content: `${basePrompt}\n\nCouncil role: ${role.instruction}\nWork independently. Do not refer to other council members or claim consensus.` },
    ...history,
  ];
}

async function generateCouncilAnswer({ key, assistant, history, basePrompt, userPrompt, signal }) {
  const councilSize = Math.max(2, Math.min(4, Number(state.settings.councilSize) || 3));
  const selection = selectCouncilModels(freeModelCatalog, userPrompt, councilSize + 1);
  const participants = selection.models.slice(0, councilSize);
  const chairman = selection.models[councilSize]?.id || FREE_ROUTER_MODEL;
  let finished = 0;
  refs.generationStatusText.textContent = `${participants.length} ነፃ AI አንጎሎች በተናጠል እያሰቡ ነው…`;

  const settled = await Promise.allSettled(participants.map(async (candidate, index) => {
    const role = COUNCIL_ROLES[index % COUNCIL_ROLES.length];
    const result = await requestCompletionWithFallback({
      key,
      model: candidate.id,
      fallbackModel: participants[(index + 1) % participants.length]?.id,
      messages: agentMessages(basePrompt, role, history),
      temperature: Number(state.settings.temperature) || 0.7,
      maxTokens: 850,
      signal,
    });
    finished += 1;
    refs.generationStatusText.textContent = `${finished}/${participants.length} AI መልሰዋል · ሌሎቹን በመጠበቅ ላይ…`;
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
    chairman,
  };
  renderMessages();
  refs.generationStatusText.textContent = "Council Chair መልሶቹን እያወዳደረና እያዋሃደ ነው…";

  const synthesis = buildSynthesisPrompt(proposals, state.settings.language);
  const chairMessages = [
    { role: "system", content: `${basePrompt}\n\n${synthesis}` },
    ...history,
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
    },
  });
  assistant.council.chairman = actualChair;
}

async function generateSingleAnswer({ key, assistant, history, basePrompt, userPrompt, signal }) {
  refs.generationStatusText.textContent = "ነፃ open-weight AI መልስ እያዘጋጀ ነው…";
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
    },
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
    const history = trimConversation(chat.messages.filter((message) => message !== assistant), 24_000);
    if (state.settings.councilMode) {
      await generateCouncilAnswer({ key, assistant, history, basePrompt, userPrompt: lastUser.content, signal: activeController.signal });
    } else {
      await generateSingleAnswer({ key, assistant, history, basePrompt, userPrompt: lastUser.content, signal: activeController.signal });
    }
    assistant.content = assistant.content.trim();
    if (!assistant.content) assistant.content = "ይቅርታ፣ ነፃው model ባዶ መልስ ሰጥቷል። እንደገና ይሞክሩ።";
    assistant.streaming = false;
    chat.updatedAt = Date.now();
    saveState();
    renderMessages();
    renderConversationList();
    if (state.settings.autoSpeak) speakText(assistant.content);
  } catch (error) {
    console.error("Generation failed", error);
    assistant.streaming = false;
    if (!assistant.content) chat.messages = chat.messages.filter((message) => message !== assistant);
    const aborted = error.name === "AbortError" || activeController?.signal.aborted;
    const quota = error.status === 429;
    const message = aborted
      ? "መልሱ ቆሟል።"
      : quota
        ? "የነፃው API የዛሬ ወይም የደቂቃ ገደብ ደርሷል። ቆይተው ይሞክሩ ወይም Council modeን ያጥፉ።"
        : `መልስ አልተገኘም፦ ${error.message || "free cloud model unavailable"}`;
    toast(message, aborted ? "" : "error", 7000);
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
    toast("መጀመሪያ ነፃውን AI Council ያገናኙ።");
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
  refs.generationStatusText.textContent = "በማቆም ላይ…";
  activeController.abort();
}

function renderAttachments() {
  refs.attachmentList.hidden = !pendingAttachments.length;
  refs.attachmentList.innerHTML = pendingAttachments.map((file, index) => `
    <span class="pending-file"><span>${escapeHTML(file.name)}</span><small>${formatBytes(file.size)}</small><button type="button" data-remove-attachment="${index}" aria-label="አስወግድ">×</button></span>`).join("");
}

async function readAttachments(fileList) {
  for (const file of [...fileList]) {
    if (file.size > MAX_FILE_BYTES) {
      toast(`${file.name} ከ2 MB ይበልጣል።`, "error");
      continue;
    }
    try {
      pendingAttachments.push({ name: file.name, size: file.size, content: await file.text() });
    } catch {
      toast(`${file.name} ማንበብ አልተቻለም።`, "error");
    }
  }
  renderAttachments();
  toast("Attachment ሲላክ ይዘቱ ወደ cloud AI provider እንደሚሄድ ያስታውሱ።");
}

async function addKnowledgeFiles(fileList) {
  const files = [...fileList];
  let total = state.knowledge.reduce((sum, item) => sum + item.content.length, 0);
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      toast(`${file.name} ከ2 MB ይበልጣል።`, "error");
      continue;
    }
    try {
      const content = await file.text();
      if (!content.trim()) continue;
      if (total + content.length > MAX_KNOWLEDGE_CHARS) {
        toast("የእውቀት ማከማቻው ገደብ ደርሷል።", "error", 5500);
        break;
      }
      state.knowledge.push({ id: uid("doc"), name: file.name, size: file.size, content, addedAt: Date.now() });
      total += content.length;
    } catch {
      toast(`${file.name} ማንበብ አልተቻለም።`, "error");
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
  toast("ማስተካከያው ተቀምጧል።", "success");
}

function clearLocalContent() {
  if (!confirm("ሁሉም ውይይቶችና የእውቀት ፋይሎች ይጠፋሉ። API keyዎ ግን ይቆያል። ይቀጥል?")) return;
  const settings = { ...state.settings };
  state = makeDefaultState();
  state.settings = settings;
  saveState();
  refs.settingsDialog.close();
  renderAll();
  toast("ውይይትና የእውቀት ዳታ ጠፍቷል።", "success");
}

function exportConversation() {
  const chat = activeChat();
  if (!chat.messages.length) return toast("ለማውረድ ውይይት የለም።");
  const markdown = [
    `# ${chat.title}`,
    "",
    `Exported from Zola AI Council · ${new Date().toLocaleString()}`,
    "",
    ...chat.messages.flatMap((message) => [
      `## ${message.role === "user" ? "You" : "Zola Council"}`,
      "",
      message.content,
      "",
    ]),
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
    toast("ተቀድቷል።", "success");
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    toast("ተቀድቷል።", "success");
  }
}

function speakText(text) {
  if (!("speechSynthesis" in window)) return toast("የድምፅ ንባብ በዚህ browser አይደገፍም።", "error");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```|[#*_`>-]/g, " "));
  utterance.lang = state.settings.language === "en" ? "en-US" : "am-ET";
  utterance.rate = 0.95;
  speechSynthesis.speak(utterance);
}

function toggleMicrophone() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return toast("የድምፅ ጽሑፍ በዚህ browser አይደገፍም። Chrome ይሞክሩ።", "error", 5000);
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
  recognition.onerror = () => toast("ድምፅዎን መስማት አልተቻለም።", "error");
  recognition.onend = () => { speechRecognition = null; $("micBtn").classList.remove("active"); };
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
  $("toggleKeyBtn").textContent = reveal ? "ደብቅ" : "አሳይ";
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
$("temperatureInput").addEventListener("input", (event) => { $("temperatureValue").textContent = Number(event.target.value).toFixed(1); });
refs.composer.addEventListener("submit", (event) => { event.preventDefault(); submitPrompt(); });
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
  toast(state.settings.councilMode
    ? `AI Council በርቷል። ${state.settings.councilSize} AIዎችና Chair አብረው ይሠራሉ።`
    : "ፈጣን single-AI mode በርቷል፤ በጥያቄ 1 free request ብቻ ይጠቀማል።");
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
refs.fileInput.addEventListener("change", (event) => { readAttachments(event.target.files); event.target.value = ""; });
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
