#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const INBOX = path.join(ROOT, "docs", "critique", "inbox");
const OUTBOX = path.join(ROOT, "docs", "critique", "outbox");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-5.4";
const POLL_MS = Number(process.env.CRITIC_POLL_MS || 5000);

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

fs.mkdirSync(INBOX, { recursive: true });
fs.mkdirSync(OUTBOX, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function newestRequestFiles() {
  return fs
    .readdirSync(INBOX)
    .filter((f) => /^SPRINT-.*-REQUEST\.md$/i.test(f))
    .sort((a, b) => {
      const ap = path.join(INBOX, a);
      const bp = path.join(INBOX, b);
      return fs.statSync(ap).mtimeMs - fs.statSync(bp).mtimeMs;
    });
}

function responsePathFor(requestFile) {
  return path.join(
    OUTBOX,
    requestFile.replace(/-REQUEST\.md$/i, "-RESPONSE.md")
  );
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

async function critiqueMarkdown(requestMarkdown, requestFileName) {
  const system = `
You are the external Sprint Critic for TopRanker.

Your job:
- review the provided sprint packet/request
- identify verified wins
- identify contradictions or drift
- identify stale or unclosed action items
- score core-loop focus
- give top priorities for the next sprint

Be evidence-based, blunt, and concise.
Do not be motivational.
Do not invent repo facts that are not in the request.
Prefer contradictions over praise.

Output markdown only using exactly this structure:

# <same sprint name> External Critique

## Verified wins
## Contradictions / drift
## Unclosed action items
## Core-loop focus score
Give a 0-10 score and 3-6 bullets explaining it.
## Top 3 priorities for next sprint

**Verdict:** one blunt paragraph.
`.trim();

  const user = `
Request filename: ${requestFileName}

Here is the full sprint critique request packet:

${requestMarkdown}
`.trim();

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      input: [
        { role: "system", content: [{ type: "input_text", text: system }] },
        { role: "user", content: [{ type: "input_text", text: user }] },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${text}`);
  }

  const data = await res.json();

  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      ?.map((c) => c.text)
      ?.filter(Boolean)
      ?.join("\n\n");

  if (!outputText) {
    throw new Error("No output_text returned from OpenAI");
  }

  return outputText.trim() + "\n";
}

async function processOne(requestFile) {
  const requestPath = path.join(INBOX, requestFile);
  const outPath = responsePathFor(requestFile);

  if (fs.existsSync(outPath)) return;

  const requestMarkdown = read(requestPath);
  console.log(`Processing ${requestFile} ...`);

  try {
    const critique = await critiqueMarkdown(requestMarkdown, requestFile);
    write(outPath, critique);
    console.log(`Wrote ${path.relative(ROOT, outPath)}`);
  } catch (err) {
    const failPath = outPath.replace(/-RESPONSE\.md$/i, "-ERROR.md");
    write(
      failPath,
      `# Critique generation failed\n\n- File: ${requestFile}\n- Error: ${String(
        err.message || err
      )}\n`
    );
    console.error(`Failed ${requestFile}:`, err.message || err);
  }
}

async function main() {
  console.log(`Watching ${path.relative(ROOT, INBOX)} ...`);
  console.log(`Writing to ${path.relative(ROOT, OUTBOX)} ...`);
  console.log(`Model: ${MODEL}`);

  while (true) {
    const files = newestRequestFiles();
    for (const f of files) {
      await processOne(f);
    }
    await sleep(POLL_MS);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
