---
name: perquiro-create
description: Write proposed Scenarios in a Perquiro Test repository. Use when the human asks you to Create or what to cover next, when Explore has enough Knowledge for a Coverage Review, or when pending revision or replacement Create work exists. If Knowledge is too thin to propose coverage, Explore instead.
---

# Create

Follow the Agent operating contract in `AGENTS.md`. Create has two paths. New coverage chooses Journeys to cover next and writes their Scenarios as one Coverage Review. Linked work claims one pending revision or replacement work item and proposes exactly what its source Scenarios require. Only a human Decision pins Expected Behavior.

## Tools you use

| Job | Tool | Arguments |
|---|---|---|
| Read Setup | `read_setup` | none |
| Read open Reviews | `list_open_reviews` | none |
| Read Follow-on work | `read_follow_on_work` | none |
| Read Knowledge catalog | `read_knowledge_catalog` | optional `entryContinuation`, `relationshipContinuation` |
| Read Knowledge context | `read_knowledge_context` | `anchor`, `productVersions`, `observations`; optional `relationshipContinuation`, `projectionContinuation` |
| Read Explore checks and support | `read_explore` | `surfaceId`, `actorIds`, `productVersions` (`scope`, `values`); optional `itemId`, `continuations` (`inventory`, `history`, `gaps`, `recovery`, `accessHints`, `coverageClues`, `testVerification`, `evidenceLinks`) |
| Open a Create Review | `start_create` | `requestToken`; new coverage: `journeyGroups` of `journeyId`, `why`, and `scenarios` with `name`, `gherkin`, `surfaces` (`surfaceId`, `platform`), `actors`, and optional `contradictions` (`acceptedScenarioId`, `why`); linked work: `followOnWorkId` and flat `scenarios` with those fields plus `journeyId` and `sourceScenarioId` |

Every tool returns JSON. Perquiro generates ids for stored records. Reuse the ids returned by reads; do not infer them from names or chat.

## Read Project state

Use `read_explore` for item history and exact check support. An offered item is not exercised; an advertised destination is not reached. An `attempting` Look declares intent and its Observation records preconditions, never an inferred outcome. Suggested checks have no grounded Look. Unresolved attempts and blockers remain unfinished. Qualifying Test verification accounts only for its mapped check, Actor, Platform, conditions and known version; it does not refresh inventory or establish another branch. Scenario membership remains a coverage clue. Base proposals on saved observed outcomes and preserve these distinctions; only the human accepts Expected Behavior.

Before choosing a path:

1. Call `read_setup`. Note the Product, URL, and current Actors. A proposed Scenario may name only current Actors.
2. Call `list_open_reviews`. An open Coverage Review blocks another Coverage Review, but not a linked revision or replacement Review. Do not add new proposals to an open Review.
3. Call `read_follow_on_work`. Note every pending `create_revision` and `create_replacement` item and the source Scenarios it names.
4. Call `read_knowledge_catalog` and follow every entry and stored-relationship continuation. Use its coverage counts, entries, and non-Observation stored relationships to identify eligible Journeys and accepted Scenarios without loading every Observation body.
5. Call `read_knowledge_context` for each Journey you may cover. State Product versions explicitly: use `all` unless the human asked about exact values; `unknown` means only records stored without a version. Start with Observation `summaries` for the relevant Actor ids and `both` Journey-linked and Surface-only scope. Load `records` for the Journeys you are actively grounding. Follow every relationship and projection continuation. Load each accepted or sent-back Scenario you need as a Scenario anchor so you read its complete Gherkin. Compare new proposals only with accepted Scenarios; sent-back, rejected, proposed, and withdrawn Scenarios do not pin Expected Behavior.
6. Read root `AGENTS.md` outside Perquiro's managed section. Apply any `## Perquiro Project guidance` that changes the coverage defaults below.

Treat these reads as Project truth. Do not query SQLite, enumerate `.perquiro/`, or reconstruct state from chat.

## Choose one Create path

Honor an explicit request for new coverage or for a named work item. For a general Create request, handle exactly one pending `create_revision` or `create_replacement` item first. Otherwise, prepare new coverage. Pending linked work does not make a Journey ineligible for new coverage, and an open Coverage Review does not block linked work.

One `start_create` call uses one request shape. Do not combine `journeyGroups` with `followOnWorkId` or the flat linked-work `scenarios` list.

## New coverage

If `list_open_reviews` shows a Coverage Review already open, do not call `start_create` for new coverage. Tell the human that the existing Review must be resolved first and point them to `perquiro review --kind create`. You may still Explore or handle linked work.

### Choose Journey groups

Consider every eligible Journey in `read_knowledge_catalog`, including Journeys that already have accepted Scenarios. Once no Coverage Review is open, every recorded Journey is eligible; a previous accept or skip does not create a permanent gate.

Choose a short ordered set whose concrete Scenarios make the next coverage decision useful. Unless Project guidance says otherwise, choose three to six Journeys, and fewer when fewer deserve coverage or their groups contain many Scenarios. Perquiro enforces no numeric cap. Order groups by how strongly the Observations and accepted-Scenario comparison support covering them now.

A Journey is a strong candidate when:

- its Observations show real behavior to pin, not only that a Surface loaded;
- it is where the money, the data, or the account lives, such as sign-up, login, payment, permissions, or a destructive action;
- its Observations show fragile or surprising behavior, such as an error, timing-sensitive outcome, input-dependent branch, or difference between Actors;
- its observed behavior is not already expressed by its accepted Scenarios.

At least one grounding Observation must name the Journey. An Observation for one of its Surfaces but no Journey, or for another Journey, may add context when its body bears on this Journey, but it cannot be the only ground. A Journey with no Observation that names it is not a coverage candidate. Record it as an Explore target instead.

For each chosen Journey:

- Write one required why and one or more Scenarios.
- Ground the why in named Observations and the relevant Actor. Explain why those facts make this Journey worth covering now.
- If the Journey already has accepted Scenarios, name that comparison and the distinct observed behavior the new group would cover. Do not return it merely to repeat existing coverage.
- Keep the why outside the Scenario. The why is not Scenario text, creates no Expected Behavior, and pins nothing.

Write the why as one line with these parts:

- `Why now:` one sentence naming the strongest observed behavior that warrants Scenarios now.
- `Observations:` the Observation sequence numbers and the Actor when identity affects the behavior.
- `Accepted comparison:` for a Journey with accepted Scenarios, name the relevant accepted Scenario ids or names and the distinct behavior this group adds.

Keep one behavior in each why. Several outcomes of that behavior may justify several Scenarios in the group.

If Knowledge is too thin to ground a proposal, nothing grounded can be proposed. Do not open an empty Review. Explore until Knowledge can support coverage.

### Write proposed Scenarios

Each Scenario belongs to the group Journey and contains:

- a short `name`;
- v1 `gherkin` step lines using Given for context, When for actions or events, Then for an expected observable outcome, and And or But where useful;
- the ordered Surfaces it exercises, each paired with its Platform: Browser, API, Android, or iOS;
- the ordered names of every current Actor it uses, or an empty list for an anonymous visit that needs no Actor;
- every contradiction you read against an accepted Scenario, naming its `acceptedScenarioId` and why the two conflict.

The `gherkin` field contains step lines only. Do not include Feature, Scenario, Background, Rule, Scenario Outline, Examples, tags, data tables, or doc strings. Values that materially define Expected Behavior belong in the steps. Selectors, credentials, Product versions, waits, helpers, framework calls, device details, and Run conditions do not. Platform stays in `surfaces`, not in Gherkin.

The `platform` request value is exactly one of `browser`, `api`, `android`, or `ios`. These lowercase wire values correspond to the Platform names above.

A Scenario says what the Product observably does across its named boundaries. A Scenario is not a Test, a Feature file, an Explore trace, or implementation guidance. A later Generate writes the ordinary Test after acceptance.

The proposal is frozen when `start_create` succeeds. Do not add, remove, reorder, or rewrite its Journey groups, why text, Scenarios, Surfaces, Platforms, Actors, source mappings, or contradiction reports while the Review is open. New Knowledge belongs in a later proposal.

### New coverage request shape

Call `start_create` with exactly this shape. Omit `contradictions` when there are none:

```json
{
  "requestToken": "a fresh token",
  "journeyGroups": [
    {
      "journeyId": "a recorded Journey id",
      "why": "Observation-grounded coverage reason",
      "scenarios": [
        {
          "name": "Scenario name",
          "gherkin": "Given ...\nWhen ...\nThen ...",
          "surfaces": [
            { "surfaceId": "a recorded Surface id", "platform": "browser" }
          ],
          "actors": ["a current Actor name"],
          "contradictions": [
            {
              "acceptedScenarioId": "an accepted Scenario id",
              "why": "Why the proposed and accepted Scenarios conflict"
            }
          ]
        }
      ]
    }
  ]
}
```

Each Journey appears in at most one group. A grouped Scenario inherits `journeyId`; do not put `journeyId` or `sourceScenarioId` inside it. Do not send `followOnWorkId` on this path.

## Revision and replacement work

Choose exactly one pending `create_revision` or `create_replacement` item from `read_follow_on_work`. `start_create` claims it in the same transaction that opens one linked Create Review. There is no separate claim tool.

Write exactly one proposed Scenario for every source Scenario named by that work item, on the same Journey, and add nothing else. Every proposal must include its source in `sourceScenarioId`:

- For `create_revision`, read the source Scenario and its send-back history in `read_follow_on_work.sources`. Use the exact human reason and any suggested wording to revise it without widening the requested behavior. The history identifies the ruling, Review, human, and time. Suggested wording is guidance, not accepted Expected Behavior.
- For `create_replacement`, replace the withdrawn source with the corrected Expected Behavior supported by the Decision and Knowledge. A difference from its withdrawn source is not itself a contradiction.

Compare each proposal with all accepted Scenarios and report every contradiction. An open Coverage Review does not absorb the linked proposal; open one linked Create Review for the chosen work item.

### Linked-work request shape

Call `start_create` with exactly this shape. Omit `contradictions` when there are none:

```json
{
  "requestToken": "a fresh token",
  "followOnWorkId": "one pending Create work id",
  "scenarios": [
    {
      "journeyId": "the source Scenario's Journey id",
      "sourceScenarioId": "the source Scenario id",
      "name": "Scenario name",
      "gherkin": "Given ...\nWhen ...\nThen ...",
      "surfaces": [
        { "surfaceId": "a recorded Surface id", "platform": "api" }
      ],
      "actors": ["a current Actor name"],
      "contradictions": [
        {
          "acceptedScenarioId": "an accepted Scenario id",
          "why": "Why the proposed and accepted Scenarios conflict"
        }
      ]
    }
  ]
}
```

Do not send `journeyGroups` on this path. Revision and replacement requests are rejected unless the source mapping is complete, one-to-one, and same-Journey.

## Request tokens

Generate a fresh opaque `requestToken`, such as a UUID, for each logical `start_create` call. If the response is lost, retry the same token with the same arguments; Perquiro returns the committed Review instead of opening another. If a request is rejected and you change any argument, use a new token.

## Handoff

Tell the human to run `perquiro review --kind create`. For each Scenario they may accept, send back, reject, or leave it. Send-back and rejection require reasons; send-back also allows suggested wording. Left and skipped proposals remain available for human resume in a linked Review. Only acceptance pins Expected Behavior.

After a Coverage Review, explain the Journey-group order and why any eligible Journey was not chosen. For each Scenario, explain the behavior it covers, its Observation grounds, its accepted-Scenario comparison, and any contradiction report. The human may skip a whole Journey group. The why never pins Expected Behavior.

List the Explore targets found during that sweep: Journeys with no Observation naming them, Surfaces on no Journey, and current Actors with no Observation or no use on a Journey where authorization may change the outcome. These are directions for later Explore, not a completeness requirement.

After a linked Review, explain each source mapping, the human Decision that created the work, the accepted-Scenario comparison, and any contradiction report. Do not invent a Journey-group order or justify omitted Journeys.

## After the Decision

Read Project state again before later work.

- **Accepted:** the Scenario pins Expected Behavior. Generate may later write and record its ordinary Test.
- **Sent back:** it does not pin Expected Behavior. The resolved Review creates one `create_revision` Follow-on work item for its sent-back Scenarios; a later Create claims that item and uses the linked-work path.
- **Rejected:** it does not pin Expected Behavior and creates no Follow-on work. Do not simply resubmit the rejected proposal. New Knowledge or materially different behavior may justify a later proposal.
- **Skipped:** skipping a Coverage Review Journey group leaves all of its Scenarios proposed, with no history row and no Follow-on work. The human can resume those exact proposals from `perquiro review`; do not recreate them as a substitute for resume. The Journey may still be considered for distinct coverage on the next Coverage Review.
- **Left:** a Scenario the human leaves unruled stays proposed, with no history row and no Follow-on work. It is not Expected Behavior.

An empty open-Review list does not mean coverage is complete. The human inbox also shows deferred proposals and accepted Scenarios awaiting Tests. Resume is human-only, reuses the frozen proposals, and creates no Agent Follow-on work. A resumed Review does not count as an open Coverage Review.

When a linked Review resolves, its claimed work item completes. Acceptance of a replacement pins the new Scenario and leaves the old source withdrawn. Generate follows only for accepted Scenarios, never merely because Create opened or a why was persuasive.

## Project guidance

Human instructions in the Test repository or the current request override the defaults above. Look for guidance on how many Journey groups to propose, breadth versus depth, Journeys to leave out while no supported Test can exercise them, what a why must cite, and Journeys to keep out of coverage proposals.
