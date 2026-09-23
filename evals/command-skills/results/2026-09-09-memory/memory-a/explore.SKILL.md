---
name: perquiro-explore
description: Explore a Product for Perquiro. Walk the Product as one current Actor at a time with the tools your host gives you, record what exists as Surfaces, Journeys, and Observations through the Perquiro MCP tools, and import completed captures as Evidence. Use when the human asks you to Explore in a Perquiro Test repository, or to look around, map the Product, or see what is there, and when Create has too little Knowledge to work from. Explore records what exists. It never writes Findings, Scenarios, or Expected Behavior.
---

# Explore

Explore is your look at the Product. Perquiro does not crawl anything and has no model of its own. It stores what you report, so that Create and the next session start from stored Knowledge instead of your chat memory. Whatever you see but do not record is gone when this session ends.

The Agent operating contract in `AGENTS.md` applies. Read Setup, relevant Knowledge, pending Follow-on work, and open Reviews over MCP before you begin. Treat stored state as truth. If Setup is missing or invalid, every MCP tool refuses; stop and tell the human to run `perquiro setup`.

## Tools you use

| Job | Tool | Arguments |
|---|---|---|
| Read Setup | `read_setup` | none |
| Read Knowledge catalog | `read_knowledge_catalog` | optional `entryContinuation`, `relationshipContinuation` |
| Read Knowledge context | `read_knowledge_context` | `anchor`, `productVersions`, `observations`; optional `relationshipContinuation`, `projectionContinuation` |
| Read Explore contents and remainder | `read_explore` | `surfaceId`, `actorIds`, `productVersions` (`scope`, `values`); optional `itemId`, `continuations` (`inventory`, `history`, `gaps`, `recovery`, `accessHints`, `coverageClues`, `testVerification`, `evidenceLinks`) |
| Read open Reviews | `list_open_reviews` | none |
| Read Follow-on work | `read_follow_on_work` | none |
| Record a Surface | `record_surface` | `requestToken`, `name`, `locator` |
| Record a Journey | `record_journey` | `requestToken`, `name`, `surfaceIds` |
| Record an Observation | `record_observation` | `requestToken`, `surfaceId`, `actor`, `body`; optional `journey`, `productVersion` |
| Record a structured inspection | `record_inspection` | `requestToken`, `surfaceId`, `actorId`, `platform`, `items` (`key`, `name`, `kind`), `reports`; optional `journeyId`, `productVersion` |
| Import Evidence | `import_evidence` | `requestToken`, `sourcePath`; optional `productVersion`, `observationIds` |
| Read one Evidence item | `read_evidence` | `evidenceId` |

Every tool returns JSON. Ids are UUIDs that Perquiro generates. Keep the ones you get back, because later calls take them. Read tools take no request token. The catalog and context reads may return an opaque continuation; follow it until that collection reports `complete: true`. If Knowledge changes, a continuation becomes stale and you restart that read.

There is no Explore tool that writes Findings, Scenarios, Actors, Setup, or Reviews.

## Before you look

1. Call `read_setup`. Note `product`, `url`, and `actors`. Use exactly one current Actor for this execution. Keep its canonical `id` for structured inspections and its name for plain Observations. A Journey may involve more than one Actor across separate executions; changing Actor starts or resumes another Explore context. Attribute facts to the Actor actually used, including signed-out facts. If no current Actor covers the needed access, tell the human which Actor is missing and to run `perquiro actor add`. Do not run it yourself. Only a human defines Actors. Perquiro never hands you a secret value; use the human's or Test repository's access instructions and keep secret values out of Observations.
2. Call `read_knowledge_catalog` and follow every entry and stored-relationship continuation. It gives you coverage counts, canonical identities, and non-Observation stored relationships without Observation records. Use it to find existing Surfaces, Journeys, and Evidence instead of downloading the Project's history.
3. Call `read_knowledge_context` for the Surfaces and Journeys relevant to this walk. Always state the Product-version scope: use `exact` only for values the human supplied or the Product displayed, otherwise use `all`; `unknown` means only records stored without a version. Start with Observation `summaries` for the current Actor ids and `both` Journey-linked and Surface-only scope. Request `records` only where the facts matter to this walk. Follow both relationship and projection continuations. Knowledge is not one global picture. It records which Actor saw what, so the same Surface seen as a second Actor is new Knowledge. Recording the same Surface again for the same Actor with nothing new is noise.
4. Call `list_open_reviews` and `read_follow_on_work`. An open Coverage Review does not stop you. Keep exploring, and know that new Knowledge does not change that Review. If pending Create work is waiting, say so before you spend the session exploring. The human may want that finished first.
5. Read root `AGENTS.md` outside the section Perquiro manages, under the heading `## Perquiro Project guidance`. That is where the human keeps the per-Project guidance described at the end of this skill.

Reuse ids from the catalog instead of recording duplicates. When the human names a Surface or Journey, find it in `read_knowledge_catalog` first, then load its context if needed.

Keep the human's selected scope, action limits, time/tool budget and Project guidance in the host execution. These are host guidance, not a durable budget ledger or a Product resource lock. A pause or skip changes authorization or priority; it is not an exercised result or an observed Product denial. Do not start workers or change Actors merely because another Surface appeared.

For each relevant Surface, call `read_explore` with this Actor id and explicit version selection. Use `exact` for a known version and `unknown` when the Product version is unknown; use `all` to inspect grouped history. Read `recovery` even when its Actor/version differs from the display selection. Read the named scope's pending checks, blockers, suggested checks, access hints and their supporting records before choosing an action. A historical item may have no Look for this version. Test verification accounts only for its exact mapped check; it does not refresh Surface inventory or resolve another reservation's uncertain action.

## Check your tools

Prove that you can reach the Product before you record anything.

1. Try what your host already gives you first: a browser tool, an HTTP client, or a mobile device. Prove it works with a check that changes nothing in the Product, such as opening `url` from Setup or a `GET` of a page or endpoint that only reads, and confirm you can read the result.
2. If nothing usable exists and an optional package or browser binary would fill the gap, such as `@playwright/cli` or the browser it downloads, stop before installing anything. Tell the human the exact package and command, the install scope (global, this user, or the Test repository), the browser it brings, and the expected download size. Then ask for permission.
3. After an install, repeat step 1 with the new capability. If the human declines or the install fails, stop and report what blocked you.

An install made for Explore serves this walk only. Do not treat it as satisfying Generate or Run dependencies, and name it in your stopping summary.

## Walk the Product

Work as the current Actor with the capability you proved: a browser, an HTTP client, a mobile device. Go breadth first. Find the Surfaces, then follow the sequences a person or a client actually takes.

Alternate focused Surface inspection with a meaningful Journey task in the same Product session. Inspect relevant state, save useful contents and facts promptly, choose a known authorized check, record its required pre-action marker, perform it, and save its outcome. Discoveries feed the next check continuously. Do not wait for a whole-Product inventory or a Journey before saving a Surface-only fact.

### Record a Surface

Call `record_surface` the first time you reach a Surface. `name` is short and stable, such as `Login`, `Cart`, or `POST /orders`. `locator` is how someone gets back there: a route pattern for a page, such as `/customers/:id` rather than `/customers/42`; `METHOD /route` for an endpoint; a screen name for Android or iOS. Both must be non-empty. Perquiro allows repeated Surface names. Prefer distinct ones anyway. Keep the returned `id`.

A Surface is recorded once per Project. A second Actor's look at it is a new Observation with the existing `surfaceId`, not a second Surface.

Endpoint identity stays `METHOD /path`. If an endpoint advertises another operation, record an offered link item on the source Surface. Bind the reached endpoint Surface only after observing that operation. Different methods or paths never become one container Surface.

### Record a Journey

Call `record_journey` once you have walked a sequence that means something on its own: sign up, check out, reset a password, create then fetch a resource. `surfaceIds` is the ordered list of Surface ids you actually walked, at least one, and the same Surface may appear more than once. Every id must be a recorded Surface.

Journey names never change. Lookup trims whitespace, applies Unicode NFC, and lowercases, so `Checkout` and `checkout ` are the same Journey. Recording an existing name replaces that Journey's Surface sequence and keeps its id and its Observations. A corrected name is a new Journey, and Tests are later filed under a folder derived from the name. Pick the name a product person would use, keep it short (very long names are rejected), and check Journey entries from `read_knowledge_catalog` before you record a near-duplicate.

### Save contents and typed Looks

Use `record_inspection` for the normal Explore loop. One call accepts up to 64 item definitions and 16 distinct grounded reports. Each item has a local `key`, a meaningful `name`, and a kind: `information`, `form`, `field`, `action`, `tab`, `link`, or `rule`. Use `{ "key": "cancel" }` to refer to an item defined in this call and prefer `{ "id": "<canonical item UUID>" }` for a known item. Keep the returned item and Observation ids.

Lookup uses Surface + kind + normalized name: surrounding whitespace is trimmed, Unicode NFC and lowercase are applied, and internal spacing is preserved. A section and action can share a label because kind differs. Give different same-kind controls distinguishable meaningful names and preserve their observed labels in the Observation. Repeated rows reuse definitions; resource ids, permissions and values remain observed examples. Name lookup cannot merge semantic duplicates such as Cancel and Cancel booking.

The first structured report for each Surface/Actor/Platform/version must have `kind: "inventory"`, a grounded `body`, and an explicit `looks` array, empty when inspection finds no meaningful contents. Inventory Looks use `offered` or explicitly inspected `absent`; one report can link several items. Later partial inventories do not remove omitted items. An ungrounded suggested check may have an item definition without a Look. Never invent a fact or Expected Behavior to complete a suggestion.

An action/state report has `kind: "action"`, one grounded `body` and exactly one `look`: `reached`, `attempting`, `exercised`, or `blocked`. Use `reachedSurfaceId` for a destination actually reached. A `blocked` Look requires a concrete `reason` and leaves work unfinished. An `exercised` Look records a performed check and observed outcome, including a validation rejection, without diagnosing a bug. An `attempting` Look declares intent; its body describes inspected preconditions and proves neither dispatch nor success.

Name each independent validation branch as a `rule` item and put a `ruleFor` reference to its field/action on its Look. Seeing Reason marked required, cancelling with a valid reason and observing empty-reason rejection are separate checks. Exercising a field does not close every associated rule.

Use contextual `revealedVia` references on the Looks that establish access. Actions, Edit, Cancel and Download remain separate items on Reservation details. Opening Actions accounts only for that access step. Closing it creates no absence record. Reopen it when needed for a pending child and record the repeat reason. Restore longer recorded paths one step at a time, inspecting current Product state before trusting old hints.

Set optional report `capture` to `pending` when a capture import will follow. Save facts first, then pass their Observation ids to `import_evidence`. Keep distinct facts in separate reports when batching. Missing optional capture does not erase saved Knowledge.

### Protect interruption recovery

Before a Product mutation, inspect the resource, identify the exact check and save an `attempting` Look with a non-secret `resourceRef`, such as `reservation:42`. Dispatch only if a new response lists the attempt's Observation id in `authorizedAttemptIds` and this host execution still owns the authorized action. Replay a lost write response with the same token and arguments. Replay returns no new dispatch permission.

Save the observed outcome promptly as an `exercised` Look on that item with `attemptObservationId` naming the accepted attempt. Keep its pre-action Observation unchanged. A fresh Agent resumes with `read_explore`, restores supported access and reads current Product state before deciding whether anything should be repeated. If the action completed, record the result without repeating it. Record the Product version actually observed; reconciliation may resolve a referenced older-version attempt without copying completion across versions.

If non-execution is established, save a grounded `blocked` report with the accepted `attemptObservationId`, its concrete `reason`, and `reconciliation: "not_executed"`. A justified new attempt then names `repeat: { "kind": "non_execution", "reason": "...", "serves": { "id": "<check UUID>" } }`. If the outcome remains unknown, record a blocker without `reconciliation`. Do not rename a late result's attempt reference to get past a rejection.

An exercised check needs an explicit repeat reason. Use `precondition` to reopen Actions for unfinished Cancel, or `repetition`/`changed` to serve an independently named unfinished branch, such as repeated cancellation or a fresh-reservation prerequisite. `repeat.serves` names that branch. A new token, spelling or offered inventory is not permission to repeat consumed work. This workflow uses one host owner for Product mutations. SQLite protects conflicting attempting writes; it cannot make Product requests exactly-once or protect unrelated actions on a shared resource. Count and report every Product mutation without an accepted attempting record as a workflow failure.

If a performed check contradicts a mapped Test result, name that Run in the exercised Look's `contradictsRunId` and describe the observed contradiction. This keeps the earlier pass as history without presenting an unqualified verified claim. It does not create a Finding or change Expected Behavior.

### Record an Observation

The structured loop above is the default. Use a plain Observation for a useful fact that needs no item relationship after the first structured inventory. Older plain Observations remain readable and never imply an exhaustive inventory.

Call `record_observation` as you go, one fact per call. `surfaceId` is the Surface you looked at, `actor` is the name of the Actor you are at that moment, and `body` is what you saw, in plain language, stored exactly as you write it. Add `journey` (the Journey name, already recorded) when the fact belongs to a walk. Add `productVersion` only when the human told you one or the Product displays one. Omit it otherwise and never guess it.

Say what happened, not what should happen. The `actor` field already records who you were, so the body need not repeat it:

- Good: "Submitting the checkout form with an empty email field showed 'Email is required' under the field and stayed on Checkout."
- Good: "`GET /orders/123` returned 401 with body `{"error":"unauthenticated"}`."
- Not an Observation: "Checkout should validate email." That is Expected Behavior. Only a human pins it, by accepting a Scenario that Create proposes.
- Not an Observation: "Bug: checkout crashes on empty email." That is a Finding. Investigate writes it from a Run.

If something looks broken, still record it, as a fact about what happened. The human will see it in Knowledge, and Create can propose covering that Journey.

Perquiro rejects an Observation that names an unknown Surface, an unknown or retired Actor, an unrecorded Journey name, or an empty body, and it reports every problem at once. Fix the arguments and call again with a new token.

### Capture Evidence

Capture Evidence when a picture or a body says more than a sentence: a screenshot of a state, a saved response body, a HAR file. Record the Observation first, then import.

1. Save the capture to an absolute local path outside `.perquiro/`. A temp directory is fine. Wait until the file or directory is complete. Perquiro does not wait for you.
2. Call `import_evidence` with `sourcePath` and the `observationIds` it supports. One call imports one file or one directory as one Evidence item. Pass `productVersion` only when known.
3. Perquiro copies the source, indexes the copy, and returns the Evidence with its `id` and `containerPath`, the exact Project-relative path you may inspect. The source stays untouched, and you may delete it afterwards.

Perquiro rejects a relative or missing path, a symbolic link, junction, or special file anywhere in the source, a path inside or containing `.perquiro/`, an `observationIds` entry that is repeated or is not a recorded Observation, and a source larger than `evidenceMib` from Setup. A rejected import publishes nothing. Never write into `.perquiro/evidence/` yourself and never browse that directory. To find Evidence a previous session imported, find its entry with `read_knowledge_catalog`, then call `read_evidence` with its `evidenceId` for the linked Observation ids and the exact container path.

Evidence is copied exactly as supplied, with no redaction, and it lives for the Project's lifetime. Before importing a capture that may show a password, token, cookie, session id, or personal data, prefer a capture that does not, or tell the human what it contains and let them choose.

## Request tokens

Every state-changing call carries `requestToken`, a caller-generated opaque token scoped to the Project. Generate a fresh one, such as a UUID, for each logical write. If a response is lost, retry with the same token and the same arguments. Perquiro returns the committed result instead of writing twice. Reusing a committed token with different arguments is rejected. After any rejection, fix the arguments and use a new token.

## Boundaries

- No Findings. A Finding starts from a Run, in Investigate.
- No Expected Behavior and no Scenarios. Create proposes Scenarios, and a human accepts them.
- No Actors. Only a human defines them. `perquiro actor add` adds one; `perquiro setup` adds, renames, retires, or restores them. Keep one current Actor fixed for this execution.
- No writes under `.perquiro/`, and no reading of it beyond an exact `containerPath` returned by MCP. Do not query SQLite or infer Project state from files or from chat.
- Trusted test environments only. If `url` or the Product looks like production, stop and say so.
- Keep secrets out of Observation bodies and out of git.

## When to stop

Stop when you have walked the Journeys the human cares about, or when the human's budget or your session is running out. End with a short summary:

- the one Actor used, the explicit version selection, and the human's named scope;
- pending checks, blockers, unresolved outcomes and accounted-for checks separately, with their saved support and any host limits;
- the Surfaces and Journeys you recorded, by name;
- the Evidence you imported, by id and what it shows;
- anything you installed for this walk, by package and command. It does not count as a Generate or Run dependency;
- what you did not reach and why;
- what looked broken, as the facts you recorded;
- the next step. If Knowledge now holds Journeys worth covering, that is Create. If Knowledge is too thin to propose coverage, stay with Explore. If you hit a login wall, a missing Actor, or an environment that looks like production, say so.

## Per-Project guidance

The defaults below cover routine recording choices. Humans can override them in root `AGENTS.md`, outside the section Perquiro manages, under this optional heading. Saved preferences survive a Setup rerun and reach the next session:

```markdown
## Perquiro Project guidance

- Surface granularity:
- Journey boundaries:
- Observation style:
- Evidence budget:
```

Read this section during orientation. If the section is absent, use the defaults below and continue. Follow supplied guidance. If it covers only some choices, use the defaults for the rest. Do not ask a generic preferences question or request an `AGENTS.md` edit because guidance is missing or incomplete.

Ask only when a concrete ambiguity in the Product materially affects the current exploration. Describe the actual choice and its effect, rather than asking the human to define conventions upfront. When the human expresses a preference, offer to save it under this heading for future sessions. Save it only if the human wants it persisted. Missing guidance is not a Setup problem.

| Call | Question | Default |
|---|---|---|
| Surface granularity | Is every tab of Settings its own Surface, or is Settings one Surface? | One Surface per route pattern, so `/customers/:id` is one Surface for every customer. Tabs without a locator of their own are one Surface, described in Observations. |
| Journey boundaries | Where does checkout end? Is checkout with a declined card its own Journey? | A Journey is one task the Actor sets out to do, such as Checkout, and it ends where that task ends. A different outcome of the same task, such as a declined card, is an Observation now and a Scenario later, not a new Journey. Record a new Journey only when the Actor starts a separately named task, such as recovering a declined payment. |
| Observation style | How terse, and how much detail? | One fact, usually one sentence, with messages and status codes quoted exactly. Naming the Actor in the body is optional, because the `actor` field already records it. |
| Evidence budget | How much Evidence per Observation is worth `evidenceMib` and lifetime storage? | Import a capture when it materially helps a human understand or verify the Observation, and none for routine navigation. There is no fixed count per Observation. |

Naming conventions for Surfaces and Journeys in this Product are per-Project guidance too. When the human has given none, reuse the names the Product shows.
