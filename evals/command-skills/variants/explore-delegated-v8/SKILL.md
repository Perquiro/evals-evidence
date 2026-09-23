---
name: perquiro-explore
description: Explore a Product for Perquiro. Walk the Product as one current Actor at a time with the tools your host gives you, record what exists as Surfaces, Journeys, and Observations through the Perquiro MCP tools, and import completed captures as Evidence. Use when the human asks you to Explore in a Perquiro Test repository, or to look around, map the Product, or see what is there, and when Create has too little Knowledge to work from. Explore records what exists. It never writes Findings, Scenarios, or Expected Behavior.
---

# Explore

Explore is your look at the Product. Perquiro does not crawl anything and has no model of its own. It stores what you report, so that Create and the next session start from stored Knowledge instead of your chat memory. Whatever you see but do not record is gone when this session ends.

The Agent operating contract in `AGENTS.md` applies. Read Setup, relevant Knowledge, pending Follow-on work, and open Reviews over MCP before you begin. Treat stored state as truth. If Setup is missing or invalid, every MCP tool refuses; stop and tell the human to run `perquiro setup`.

## Coordinate discovery, review and recording

For a broad Product walk with subagent tools, discovery and review are required assignments. Start a read-only discovery subagent before changing Product state. A separate reviewer checks the outcome plan before Product changes and the proposed Knowledge before recording. Reuse that reviewer for both passes. A temporary lack of worker slots means finishing the first assignment before starting the next; it does not make delegation unavailable. If the host has no subagent capability, perform the passes locally and state that limit.

The coordinator alone changes Product state and writes Perquiro Knowledge. Use absolute paths inside the assigned Project for local files, and give every worker that same boundary. Keep discovery briefs and reviewer findings with the local walk notes. Start workers with fresh context when supported, supplying the scoped assignment and evidence rather than your intended conclusion. Give the reviewer the human request and installed Explore skill as review criteria, in addition to the artifacts below. It uses those criteria to check the coordinator's checklist, not to start another Explore or delegate.

1. **Assign discovery.** Give the worker the Project path, access instructions, human scope, current Actors and a read-only request allowance of at most one quarter of any total request budget. Discovery identifies entry points and advertised actions; it does not exhaustively reread every page as every Actor. It follows navigation and representative linked details, saves responses, and returns a fact ledger. Each meaningful starting state, advertised action, distinct outcome and Actor difference has a row with its actual Actor, method/locator and response capture. Pending links are separate untried rows. The coordinator owns carrying this ledger into Knowledge; worker notes and Evidence alone do not complete that handoff. It does not change the Product, write Knowledge, inspect another Project or delegate. Meanwhile, the coordinator reads relevant public Knowledge and prepares the outcome checklist without repeating the worker's Product reads.
2. **Plan, review the order, then walk.** Count every worker request in the human's total budget. Reserve one quarter of a bounded request budget for gaps and final readbacks until the later evidence review finishes; approving the plan does not release that reserve. Fill the outcome checklist from discovery and write an ordered request plan that fits the remaining budget. Include the action, its distinct validation and unavailable-state branches, visible repeat limits, undo or completion steps, and their readbacks. Prioritize these over speculative parameter probes or repeated unchanged pages. A read as another Actor earns its place when access, an advertised role, or a consumer handoff makes the difference relevant. Discovery findings are reusable evidence; do not fetch them again merely because ownership changed. Name both the Actor performing a change and the Actor verifying its result; include the known consumer Actor when another role changes what that consumer sees. Before the first Product mutation, give a fresh reviewer the discovery ledger, captures, checklist, request order and remaining budget. It checks that each exposed branch has a grounded disposition and that every planned state-changing request comes after checks needing the state it removes. Resolve omissions or order conflicts before walking. The reviewer makes no Product requests or writes. A later evidence review cannot restore a state already consumed.
3. **Prepare the evidence mapping.** Merge discovery rows with rows from the coordinator walk before drafting. Give every meaningful observed fact a proposed Observation or a specific existing duplicate/out-of-scope disposition. A later changed state is not a duplicate of its initial state; preserve the starting availability, limits or other facts that explain each outcome. For every proposed Observation, supply its ledger row key, factual body, actual Actor, exact request or response capture, actual method and locator, proposed canonical Surface, and walked Journey. Mutation responses and later list/detail readbacks belong to their respective Surfaces and need separate Observations. For API Surfaces, a POST action is not the GET collection that advertised it; a detail endpoint is not its parent collection. Reuse returned ids where available, otherwise use explicit draft keys until the Surface is recorded.
4. **Review the evidence before recording.** Give the same reviewer the draft, captures, checklist, current Actors and canonical identity map. It makes no Product requests or writes. Review both directions: every proposed Observation must be supported by its capture, and every meaningful captured fact from discovery or the walk must have a draft row or a justified disposition. Check the initial states as well as final readbacks. Require an item-by-item check of actual versus proposed Actor and Surface, response support, Journey order, clear names and every outcome cell, including those marked complete. An attempted request does not complete a branch if the starting state changed or the response reached a different outcome. Check the checklist against the Explore rules too, including offered recovery actions; a weaker checklist does not replace them. It must list exposed branches or consumer readbacks that remain untried. A blank cell or an unsupported `not applicable` is unfinished work. Save its concrete findings from both passes; a general approval is insufficient. These local reviews are not human Reviews or Expected Behavior.
5. **Resolve, record and verify.** Use the reserve to observe valid missing branches, correct unsupported associations and complete readbacks. Have the reviewer recheck only corrected items. Compare the final write payloads with the reviewed ledger before recording, so drafting a write script cannot silently drop or change reviewed facts. Record only the resolved batch, substituting newly returned Surface ids for draft keys and checking every mutation reply. Attach the returned Observation id to each recorded ledger row. Reconcile reviewed rows against those ids and the final public records; a reviewed draft is not proof that its rows were written. When importing Evidence as linked support, build observationIds from those returned ids and check that the intended links are present before sending. Perform the final public Knowledge reconciliation below, including the actual final Actor/Surface links. Report unresolved work, delegated roles and the combined Product-request count.


## Tools you use

| Job | Tool | Arguments |
|---|---|---|
| Read Setup | `read_setup` | none |
| Read Knowledge catalog | `read_knowledge_catalog` | optional `entryContinuation`, `relationshipContinuation` |
| Read Knowledge context | `read_knowledge_context` | `anchor`, `productVersions`, `observations`; optional `relationshipContinuation`, `projectionContinuation` |
| Read open Reviews | `list_open_reviews` | none |
| Read Follow-on work | `read_follow_on_work` | none |
| Record a Surface | `record_surface` | `requestToken`, `name`, `locator` |
| Record a Journey | `record_journey` | `requestToken`, `name`, `surfaceIds` |
| Record an Observation | `record_observation` | `requestToken`, `surfaceId`, `actor`, `body`; optional `journey`, `productVersion` |
| Import Evidence | `import_evidence` | `requestToken`, `sourcePath`; optional `productVersion`, `observationIds` |
| Read one Evidence item | `read_evidence` | `evidenceId` |

Every tool returns JSON. Ids are UUIDs that Perquiro generates. Keep the ones you get back, because later calls take them. Read tools take no request token. The catalog and context reads may return an opaque continuation; follow it until that collection reports `complete: true`. If Knowledge changes, a continuation becomes stale and you restart that read.

There is no Explore tool that writes Findings, Scenarios, Actors, Setup, or Reviews.

## Before you look

1. Call `read_setup`. Note `product`, `url`, and `actors`. An Actor with a `retiredAt` value is retired. An Observation may name only a current Actor, by its `name`. Decide which Actor you start as. A Journey may need more than one Actor, such as a customer who submits a request and an administrator who approves it, so you may switch to another current Actor during the walk. Switch on purpose, name the Actor you are at that moment on every Observation, and list every Actor in your summary. If the walk needs a login that no current Actor covers, stop and tell the human which Actor is missing and to run `perquiro actor add`. Do not run it yourself. Only a human defines Actors. Perquiro never hands you a secret value. How you sign in as an Actor comes from the human or from the Test repository, and a secret value never goes into an Observation.
2. Call `read_knowledge_catalog` and follow every entry and stored-relationship continuation. It gives you coverage counts, canonical identities, and non-Observation stored relationships without Observation records. Use it to find existing Surfaces, Journeys, and Evidence instead of downloading the Project's history.
3. Call `read_knowledge_context` for the Surfaces and Journeys relevant to this walk. Always state the Product-version scope: use `exact` only for values the human supplied or the Product displayed, otherwise use `all`; `unknown` means only records stored without a version. Start with Observation `summaries` for the current Actor ids and `both` Journey-linked and Surface-only scope. Request `records` only where the facts matter to this walk. Follow both relationship and projection continuations. Knowledge is not one global picture. It records which Actor saw what, so the same Surface seen as a second Actor is new Knowledge. Recording the same Surface again for the same Actor with nothing new is noise.
4. Call `list_open_reviews` and `read_follow_on_work`. An open Coverage Review does not stop you. Keep exploring, and know that new Knowledge does not change that Review. If pending Create work is waiting, say so before you spend the session exploring. The human may want that finished first.
5. Read root `AGENTS.md` outside the section Perquiro manages, under the heading `## Perquiro Project guidance`. That is where the human keeps the per-Project guidance described at the end of this skill.

Reuse ids from the catalog instead of recording duplicates. When the human names a Surface or Journey, find it in `read_knowledge_catalog` first, then load its context if needed.

## Check your tools

Prove that you can reach the Product before you record anything.

1. Try what your host already gives you first: a browser tool, an HTTP client, or a mobile device. Prove it works with a check that changes nothing in the Product, such as opening `url` from Setup or a `GET` of a page or endpoint that only reads, and confirm you can read the result.
2. If nothing usable exists and an optional package or browser binary would fill the gap, such as `@playwright/cli` or the browser it downloads, stop before installing anything. Tell the human the exact package and command, the install scope (global, this user, or the Test repository), the browser it brings, and the expected download size. Then ask for permission.
3. After an install, repeat step 1 with the new capability. If the human declines or the install fails, stop and report what blocked you.

An install made for Explore serves this walk only. Do not treat it as satisfying Generate or Run dependencies, and name it in your stopping summary.

## Walk the Product

Work as the current Actor with the capability you proved: a browser, an HTTP client, a mobile device. Go breadth first. Find the Surfaces, then follow the sequences a person or a client actually takes.

### Keep track of the walk

Use a written local checklist, not a mental list. Build it from actual links, controls, responses and relevant existing Knowledge. Work in this order:

1. **Discover the actions.** Follow the requested Product's navigation and open representative linked details in each visible state. An overview does not reveal every action on an item. Keep each offered action on the checklist, even when its parent task already has Observations. When navigation or documentation distinguishes roles, track one available Actor comparison for each distinct advertised access boundary in scope, including read-only entry points. An action's permission response does not establish access to its entry point. This is a check of the exposed role distinction, not every Actor/endpoint permutation. Searching and reading results can be a task on one Surface; navigation alone is not a task. Name newly discovered tasks separately instead of hiding them under a broad account-management label.
2. **Fill the outcome columns before changing state.** Give each action a row in the table below. Fill every outcome column with a concrete check, an already grounded Observation, or `not applicable` with a Product or scope reason. An empty cell is pending work. Access denial does not cover an unavailable Product state: consider both separately when the Product exposes them. List the independent input constraints exposed by the action. Check each required field and each declared allowed-choice rule separately, keeping the other inputs valid so the intended constraint is reached. One validation response does not cover the rules for another field. Use one representative value per rule; do not expand this into arbitrary identifiers, every bad value or every combination of inputs and permissions.

   | Task / action / Actor | Starting state and dependencies | Successful result | Missing required input or invalid offered choice | Unavailable Product state | Access difference | Repeated action or visible limit | Recovery and result readback |
   |---|---|---|---|---|---|---|---|
   | Discovered action | What must remain available until this check runs | Concrete check | Concrete check or reason | Concrete check or reason | Concrete check or reason | Concrete check or reason | Concrete check or reason |

3. **Preserve the states needed by pending checks.** Before finishing, cancelling, removing or returning a resource, complete checks that need its previous state. Try one permitted repeat of a stateful action before consuming its resource with a terminal action. The first success and the absence of a documented limit do not establish whether repetition is allowed or limited. If repetition is prohibited by the human scope or access, retain that reason explicitly. Try the unavailable-state branch before making every example available. Use a separate disposable resource only when authorized. Respect all side-effect restrictions.
4. **Walk and record.** Mark each concrete check `untried`, `seen` or `recorded`, adding the actual response/capture and Observation id. Follow a change's resource link to its resulting state, including the other affected Actor when relevant. A search with no results is not complete until its offered recovery is tried. One successful action does not close its error, repetition or readback columns. Update the checklist as actions appear and record meaningful facts under their actual Surface, Actor and Journey.
5. **Close the checklist.** Reconcile every applicable cell with the remaining request budget and final Knowledge. Fill seen-but-unrecorded facts, then execute reachable untried checks while capacity remains. If a check cannot be completed, retain its concrete reason and name it in the handoff. Lower priority alone is not a stopping reason while capacity remains; name the higher-priority work that used the capacity. Do not replace unfinished rows with a general statement that the main tasks were covered.

Reuse grounded Knowledge when continuing a named walk. Do not redo unrelated tasks to fill the table. A populated catalog or enough material for Create does not establish that exploration is complete.

### Record a Surface

Call `record_surface` when first recording a reached Surface after any required local review. `name` is short and stable, such as `Login`, `Cart`, or `POST /orders`. `locator` is how someone gets back there: a route pattern for a page, such as `/customers/:id` rather than `/customers/42`; `METHOD /route` for an endpoint; a screen name for Android or iOS. Both must be non-empty. Perquiro allows repeated Surface names. Prefer distinct ones anyway. Keep the returned `id`.

A Surface is recorded once per Project. A second Actor's look at it is a new Observation with the existing `surfaceId`, not a second Surface.

### Record a Journey

Call `record_journey` once you have walked a sequence that means something on its own: sign up, check out, reset a password, create then fetch a resource. `surfaceIds` is the ordered list of Surface ids you actually walked, at least one, and the same Surface may appear more than once. Every id must be a recorded Surface.

Journey names never change. Lookup trims whitespace, applies Unicode NFC, and lowercases, so `Checkout` and `checkout ` are the same Journey. Recording an existing name replaces that Journey's Surface sequence and keeps its id and its Observations. A corrected name is a new Journey, and Tests are later filed under a folder derived from the name. Pick the name a product person would use, keep it short (very long names are rejected), and check Journey entries from `read_knowledge_catalog` before you record a near-duplicate.

Name the task in familiar Product words, usually a verb and its object, such as `Find an order` or `Change an address`. The name should make sense without a route, parent heading or explanation. Keep technical identifiers, interaction mechanics and alternative outcomes out of the Journey name; those belong in locators and Observations.

### Record an Observation

Call `record_observation` for the reviewed facts, one fact per call. `surfaceId` is the Surface you looked at, `actor` is the name of the Actor you are at that moment, and `body` is what you saw, in plain language, stored exactly as you write it. Add `journey` (the Journey name, already recorded) when the fact belongs to a walk. Add `productVersion` only when the human told you one or the Product displays one. Omit it otherwise and never guess it.

Before each write, resolve the Surface's name and locator from its returned id and confirm the current Actor and the walked Journey. Reuse your map of returned ids; this does not require repeating Project-wide reads before each mutation. Check the returned record against those choices. Record the meaningful result, including the input or prior state that distinguishes it; a final summary, raw capture or generic catalog description does not replace that fact. Keep each task's observations linked to its Journey, including unsuccessful outcomes and facts seen by another Actor. If you observe a useful fact before its Journey exists, retain it in the working list and record it with that Journey once walked.

An incorrect accepted Observation stays in Knowledge; another write does not replace it. Prevent wrong associations before writing. If one still occurs, record the accurate fact, identify the conflicting record explicitly in the handoff, and do not claim the mistake was removed.

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
- No Actors. Only a human defines them. `perquiro actor add` adds one; `perquiro setup` adds, renames, retires, or restores them. Explore as one or more current Actors, or stop and ask.
- No writes under `.perquiro/`, and no reading of it beyond an exact `containerPath` returned by MCP. Do not query SQLite or infer Project state from files or from chat.
- Trusted test environments only. If `url` or the Product looks like production, stop and say so.
- Keep secrets out of Observation bodies and out of git.

## When to stop

Before stopping, reconcile the working list with public Knowledge reads. Use the catalog and relevant context records to confirm each explored task's Journey, each meaningful observed outcome, and its Surface and Actor links. Follow continuations. Fill seen-but-unrecorded facts while their evidence is available. Check remaining reachable branches against the budget; continue important in-scope work when capacity remains instead of stopping solely because a first pass produced useful Journeys.

Use one focused reconciliation after the walk and recheck only records you corrected. Repeatedly rereading the same complete catalog does not discover new Product behavior. Before handing off, account for the pending links and actions as well as the tasks already recorded; a link left unexplored without a reason is remaining work.

Stop when the requested tasks and their meaningful discovered outcomes are accounted for, or when the human's budget, available access or session requires a stop. An open-ended Product may have more to discover; describe the scope actually covered and name the remaining work without claiming exhaustive coverage. End with a short summary:

- every Actor you used;
- the Product version and its source when known, or that it is unknown;
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
