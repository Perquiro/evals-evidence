# Advised Explore continuation walkthrough

This controlled walkthrough for [#346](https://github.com/Perquiro/Perquiro/issues/346) exercised the installed Explore instructions, public MCP tools, and a disposable local HTTP Product on 2026-09-18. The delivering Agent chose the actions in `advised.json` interactively, reading tool responses between groups. `ordinary.json` is an Agent-authored batch smoke: its commands were submitted together, so it demonstrates ordinary-mode execution without adaptive response-reading. `advised-replay.json` repeats the advised decisions with canonical API Surface locators (`GET /` and `GET /profile`); the original interactive trace retains its shorthand locators. The replay is executable regression evidence, not another independent Agent trial.

The candidate skill was installed byte for byte by Setup. Both walks used the same ongoing host without a requested model or effort change. The host supplied no effective-model or usage receipt, so both remain unknown. The fixture uses its Admin Actor and API Platform with unknown Product version. It does not impersonate the HR protocol's Employee or establish comparability for that trial.

The exact exercised skill is retained in [exercised-SKILL.md](exercised-SKILL.md), identified by [skill-provenance.json](skill-provenance.json). Its SHA-256 is `b642a7772a9a8893ebf6e401f62c68da25eae55a1ee81a0c6b14ea1834b38abe`, matching all three original traces. Those working-tree bytes contain Windows line endings. Replacing CRLF with LF produces `dfd49648b3109a0703303e29b9d6f338c499555f5c428251cc0e5d8506627c83`, the committed skill bytes at `8aeda4bda0654dad8f6c085ba13d50bb71e4baf4`. The difference is line endings, not instructions. The snapshot was recovered from the unchanged working-tree file by matching the recorded hashes; the original traces have not been rewritten or presented as new executions.

| Step | Observed result |
|---|---|
| Use advice | TypeSafe's controlled response selected `profile`; the Agent requested `/profile` and recorded the returned phone and links. |
| Refresh | The response revealed Recovery and Preferences. The next request changed objective and candidates and cited the new saved Observation. Its context baseline changed. |
| Override | The controlled response selected Preferences. The Agent chose Recovery, explained why, requested `/recovery`, and recorded `verified: false`. No required recovery or human priority was overridden. |
| No selection | A valid `none` response left useful Directory work and the preference question open. The Agent reconsidered the candidate set. |
| Fallback | The next provider response was HTTP 503. The Agent selected Directory through ordinary planning, without retrying, then saved the returned Ada/Lee result. |
| Grounding | Final `read_explore` results account for both Home checks and Recovery. Preferences remains pending. No advice or provider failure became an Observation or Look. |
| Ordinary mode | A fresh Project and Product ran ordinary planning, requested Directory, and saved its outcome with no advice call. Profile remains pending. |

The runner compares database bytes before and after every advice call. All four calls left the Project database unchanged. It retains exact MCP requests/results, provider requests/controlled responses, decisions and actual HTTP responses. Outcome entries link action labels to recorded Observation ids and exact item/Look kinds. Public final reads retain the corresponding stored Looks.

The trace partitions elapsed time into contiguous named phases and retains service diagnostics separately. Interactive phases include deliberation, tool orchestration and pauses between commands; replay timings exclude those deliberations. Failed provider usage, host tokens, effective model and charges are unknown, not zero. No latency ratio, cost estimate or savings claim is supported. This trace format is a local walkthrough record, not a scored #347 evaluator packet.

All Product requests here are read-only. The existing `src/knowledge/explore-recovery-acceptance.test.ts` owns mutation interruption and reconciliation proof. `src/explore-advice/advice.test.ts` covers recovery before human priority, exclusions, invalid replies, unknown usage and stale context through MCP. `src/explore-continuation/continuation.test.ts` and `src/knowledge/explore-transport.test.ts` cover continuation and attribution. The walkthrough adds a connected Agent path without replacing those checks or the paid, paired HR execution in #348.

## Reproduce

From the repository root, with its dependencies installed:

```powershell
node --import tsx --test src/explore-advice/walkthrough.test.ts
Get-Content evals/curated/advised-explore-346/advised.commands.jsonl | node --import tsx scripts/verify-advised-explore.mjs advised .perquiro/advised-replay.json replay
Get-Content evals/curated/advised-explore-346/ordinary.commands.jsonl | node --import tsx scripts/verify-advised-explore.mjs ordinary .perquiro/ordinary-replay.json replay
```

Use new output filenames; the runner refuses to overwrite a trace or its `<output>.skill.md` snapshot. New traces retain the exact installed skill hash, the LF-normalized text hash and the adjacent snapshot filename. It creates and removes only its disposable Project and local HTTP server. No live TypeSafe request or credential is needed. To walk interactively, omit `replay` and send one JSON command per stdin line. `phase` changes the measured phase, `provider` controls the next external response, `mcp` invokes a real tool, `product` reads the local fixture, `decision` retains the Agent's reasoning/result links, and `close` ends the trace. `@binding/path` reuses a prior command result. The runner obtains token requirements from MCP tool schemas, generates omitted required tokens (including for `import_evidence`), and preserves explicitly supplied tokens for replay. The runner does not choose actions or write outcomes on the Agent's behalf.

The two replay tests check current-tree execution, refreshed context, failed-call retention, unknown usage, phase continuity, advice-free ordinary mode and final unanswered checks. They verify the supplied path, not whether a fresh Agent would choose it reliably. The raw interactive advised capture predates the runner's explicit completion-status and cleanup-timing fields; its final `close` event marks completion. Later captures include those fields.

Additional regression checks verify all three historical trace hashes against the retained snapshot and its canonical text hash, successful Evidence import without a caller-supplied token, preservation of supplied write tokens, and absence of tokens on read tools. New replay traces verify their own adjacent skill snapshots.
