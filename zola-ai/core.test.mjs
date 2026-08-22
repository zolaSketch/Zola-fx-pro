import test from "node:test";
import assert from "node:assert/strict";
import {
  FREE_ROUTER_MODEL,
  buildSynthesisPrompt,
  buildSystemPrompt,
  chunkText,
  classifyTask,
  conversationGroup,
  createTitle,
  escapeHTML,
  formatBytes,
  isFreeModel,
  normalizeFreeModels,
  renderMarkdown,
  retrieveKnowledge,
  selectCouncilModels,
  tokenize,
  trimConversation,
} from "./core.js";

test("escapeHTML neutralizes executable markup", () => {
  assert.equal(escapeHTML('<script src="x">&</script>'), "&lt;script src=&quot;x&quot;&gt;&amp;&lt;/script&gt;");
});

test("renderMarkdown supports safe basic formatting and fenced code", () => {
  const html = renderMarkdown("## Hello\n\n**bold**\n\n```js\nconst x = '<x>';\n```");
  assert.match(html, /<h2>Hello<\/h2>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /class="code-block"/);
  assert.match(html, /&lt;x&gt;/);
  assert.doesNotMatch(html, /<x>/);
});

test("renderMarkdown rejects unsafe links", () => {
  const html = renderMarkdown("[bad](javascript:alert(1))");
  assert.match(html, /href="#"/);
  assert.doesNotMatch(html, /href="javascript:/);
});

test("createTitle compacts and truncates prompts", () => {
  assert.equal(createTitle("  Hello    world  "), "Hello world");
  assert.ok(createTitle("x".repeat(100)).length <= 48);
  assert.equal(createTitle(""), "አዲስ ውይይት");
});

test("formatBytes creates human readable sizes", () => {
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(1024), "1.0 KB");
  assert.equal(formatBytes(5 * 1024 * 1024), "5.0 MB");
});

test("conversationGroup groups timestamps relative to today", () => {
  const now = new Date("2026-08-22T12:00:00Z").getTime();
  assert.equal(conversationGroup(now, now), "ዛሬ");
  assert.equal(conversationGroup(now - 24 * 60 * 60 * 1000, now), "ትናንት");
});

test("Amharic and English tokens are extracted", () => {
  const tokens = tokenize("Synthetic data ሰው ሠራሽ መረጃ");
  assert.ok(tokens.includes("synthetic"));
  assert.ok(tokens.includes("መረጃ"));
});

test("chunkText uses overlap while covering content", () => {
  const chunks = chunkText("word ".repeat(500), 200, 20);
  assert.ok(chunks.length > 2);
  assert.ok(chunks.every((chunk) => chunk.length <= 205));
});

test("retrieveKnowledge ranks matching local documents", () => {
  const docs = [
    { id: "a", name: "coffee.txt", content: "Ethiopian coffee grows in several regions including Sidama and Yirgacheffe." },
    { id: "b", name: "space.txt", content: "The moon travels around Earth." },
  ];
  const results = retrieveKnowledge("Where does Ethiopian coffee grow?", docs, 2);
  assert.equal(results[0].name, "coffee.txt");
  assert.ok(results[0].score > 0);
});

test("trimConversation keeps the most recent messages", () => {
  const messages = [
    { role: "user", content: "a".repeat(20) },
    { role: "assistant", content: "b".repeat(20) },
    { role: "user", content: "latest" },
  ];
  const result = trimConversation(messages, 25);
  assert.deepEqual(result, [{ role: "user", content: "latest" }]);
});

test("only explicit zero-price free routes are admitted", () => {
  assert.equal(isFreeModel({ id: FREE_ROUTER_MODEL }), true);
  assert.equal(isFreeModel({ id: "qwen/test:free", pricing: { prompt: "0", completion: "0" } }), true);
  assert.equal(isFreeModel({ id: "qwen/test:free", pricing: { prompt: "0", completion: "0.01" } }), false);
  assert.equal(isFreeModel({ id: "qwen/temporary-promo", pricing: { prompt: "0", completion: "0" } }), false);
});

test("free catalog normalization removes paid entries and duplicates", () => {
  const catalog = [
    { id: "qwen/a:free", name: "A", pricing: { prompt: "0", completion: "0" }, context_length: 1000 },
    { id: "qwen/a:free", name: "A duplicate", pricing: { prompt: "0", completion: "0" } },
    { id: "paid/model", pricing: { prompt: "1", completion: "2" } },
    { id: "stealth/unknown-alpha:free", pricing: { prompt: "0", completion: "0" } },
  ];
  const free = normalizeFreeModels(catalog);
  assert.equal(free.length, 1);
  assert.equal(free[0].id, "qwen/a:free");
  assert.equal(free[0].contextLength, 1000);
});

test("task router selects diverse free model families", () => {
  const catalog = [
    { id: "qwen/qwen-coder:free", name: "Qwen Coder", pricing: { prompt: "0", completion: "0" }, context_length: 128000 },
    { id: "meta-llama/llama-code:free", name: "Llama Code", pricing: { prompt: "0", completion: "0" }, context_length: 128000 },
    { id: "google/gemma:free", name: "Gemma", pricing: { prompt: "0", completion: "0" }, context_length: 128000 },
  ];
  assert.equal(classifyTask("Debug this JavaScript code"), "code");
  const selection = selectCouncilModels(catalog, "Write and debug Python code", 3);
  assert.equal(selection.task, "code");
  assert.equal(selection.models.length, 3);
  assert.equal(new Set(selection.models.map((model) => model.provider)).size, 3);
  assert.ok(selection.models.every((model) => model.id.endsWith(":free")));
});

test("council selector falls back to the explicit free router", () => {
  const selection = selectCouncilModels([], "Explain this", 3);
  assert.deepEqual(selection.models.map((model) => model.id), [FREE_ROUTER_MODEL, FREE_ROUTER_MODEL, FREE_ROUTER_MODEL]);
});

test("synthesis prompt includes independent proposals and uncertainty rule", () => {
  const prompt = buildSynthesisPrompt([
    { role: "Analyst", model: "qwen/a:free", content: "Answer A" },
    { role: "Critic", model: "google/b:free", content: "Answer B" },
  ], "am");
  assert.match(prompt, /Candidate 1/);
  assert.match(prompt, /Answer B/);
  assert.match(prompt, /agreement proves truth/);
  assert.match(prompt, /natural Amharic/);
});

test("buildSystemPrompt includes preferences and retrieved citations", () => {
  const prompt = buildSystemPrompt(
    { language: "am", systemPrompt: "Be brief." },
    [{ name: "notes.txt", content: "Private fact" }],
    "--- task.txt ---\nDo the task",
  );
  assert.match(prompt, /natural Amharic/);
  assert.match(prompt, /Be brief/);
  assert.match(prompt, /\[notes.txt]/);
  assert.match(prompt, /task.txt/);
  assert.match(prompt, /Do not claim to be Claude/);
});
