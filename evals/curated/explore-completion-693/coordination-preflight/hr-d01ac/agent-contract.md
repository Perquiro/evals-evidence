<!-- perquiro:agent-contract:start -->
## Perquiro

This is a Perquiro Test repository. It contains Tests and Project state, not Product source.

Work on Perquiro when the human asks you to Explore, Learn, Create, Generate, Run, Investigate, or Bughunt.

An authorized Investigate or replacement-continuation request includes carrying durable `create_replacement` Follow-on work through Create, waiting when a human Create Decision is required, and after acceptance continuing through Generate and its recorded check Runs. Do not wait for a separate routine instruction to Create or Generate for that authorized work. Explicit instructions to stop, perform only one command, or avoid execution retain their scope. Unrelated requests do not inherit that continuation. Perquiro does not start the Agent; pending work stays durable until an Agent resumes an authorized workflow.

Before each command:

1. Read Setup, relevant Knowledge, pending Follow-on work, and open Reviews through Perquiro MCP.
2. Treat Perquiro's stored state as truth. Do not query SQLite, enumerate `.perquiro/`, inspect internal files other than an exact Evidence path returned by MCP, or infer Project state from chat.
3. If Setup is missing or invalid, stop and tell the human to run `perquiro setup`.

Commands:

- Before starting Explore, read `.agents/skills/perquiro-explore/SKILL.md`. Explore records Surfaces, Surface items, typed Looks, Journeys, Observations, and Evidence, never Findings or Expected Behavior. Each pass uses one current Actor, plus the scope's second Actor only for the two-Actor checks the launch prompt names.
- Before starting Learn, read `.agents/skills/perquiro-learn/SKILL.md`. Learn records versioned teaching specs and documentation as source-backed Knowledge, with associations to known Surfaces, Journeys, or Scenarios, without accepting Expected Behavior or starting Create by itself.
- Before starting Create, read `.agents/skills/perquiro-create/SKILL.md`. Create chooses Journeys to cover next or claims pending Create work, writes proposed Scenarios, and leaves acceptance to Perquiro automatic policy or a human Decision. Under an authorized Investigate or replacement-continuation request, Create claims pending replacement work without another routine Create instruction and, after acceptance, continues to Generate.
- Before starting Generate, read `.agents/skills/perquiro-generate/SKILL.md`. Generate writes ordinary Tests only from accepted Scenarios, records each Test after its file exists, and checks every delivered Test through recorded Runs with purpose `check`. The Generate request authorizes these checks without another routine confirmation. An authorized replacement-continuation that accepted replacements also authorizes Generate for those accepted Scenarios without another routine Generate instruction. Honor explicit execution restrictions and report affected Tests as unverified.
- Before starting Run, read `.agents/skills/perquiro-run/SKILL.md`. Run executes an explicit, non-empty selection of recorded Tests with purpose `check`, `verify`, or `investigate`.
- Before starting Investigate, read `.agents/skills/perquiro-investigate/SKILL.md`. Investigate starts from a recorded Run, gathers Evidence, and writes Findings without guessing the human's Decision. An authorized Investigate request continues through pending replacement Create work and, after human acceptance, Generate with its check Runs, without another routine Create or Generate instruction.
- Before starting Bughunter, read `.agents/skills/perquiro-bughunter/SKILL.md`. Bughunter exercises existing Journeys, Surfaces, and Scenarios through manual Runs, records possible Findings, and proposes missing coverage for Review.

Only a human runs `perquiro setup`, adds an Actor with `perquiro actor add`, or makes a human Review Decision. Perquiro may automatically accept eligible coverage proposals; the Agent cannot resolve Reviews. If a command needs an Actor that does not exist, tell the human to run `perquiro actor add`; do not run it yourself. You may read Reviews and tell the human to run `perquiro review`.

Only a human grants or revokes Investigate sharing through `perquiro investigate-sharing`. Never run that command yourself or submit its confirmation. A configured TypeSafe key does not grant consent.

Only Perquiro writes `.perquiro/evidence/`. Keep secrets out of git and SQLite. Work only against trusted test environments.
<!-- perquiro:agent-contract:end -->
