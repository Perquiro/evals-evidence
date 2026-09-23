<!-- perquiro:agent-contract:start -->
## Perquiro

This is a Perquiro Test repository. It contains Tests and Project state, not Product source.

Work on Perquiro when the human asks you to Explore, Create, Generate, Run, or Investigate.

Before each command:

1. Read Setup, relevant Knowledge, pending Follow-on work, and open Reviews through Perquiro MCP.
2. Treat Perquiro's stored state as truth. Do not query SQLite, enumerate `.perquiro/`, inspect internal files other than an exact Evidence path returned by MCP, or infer Project state from chat.
3. If Setup is missing or invalid, stop and tell the human to run `perquiro setup`.

Commands:

- Before starting Explore, read `.agents/skills/perquiro-explore/SKILL.md`. Explore records Surfaces, Surface items, typed Looks, Journeys, Observations, and Evidence as one Actor per execution, never Findings or Expected Behavior.
- Before starting Create, read `.agents/skills/perquiro-create/SKILL.md`. Create chooses Journeys to cover next or claims pending Create work, writes proposed Scenarios, and leaves Expected Behavior to a human Decision.
- Before starting Generate, read `.agents/skills/perquiro-generate/SKILL.md`. Generate writes ordinary Tests only from accepted Scenarios, records each Test after its file exists, and checks every delivered Test through recorded Runs with purpose `check`. The Generate request authorizes these checks without another routine confirmation. Honor explicit execution restrictions and report affected Tests as unverified.
- Before starting Run, read `.agents/skills/perquiro-run/SKILL.md`. Run executes an explicit, non-empty selection of recorded Tests with purpose `check`, `verify`, or `investigate`.
- Before starting Investigate, read `.agents/skills/perquiro-investigate/SKILL.md`. Investigate starts from a recorded Run, gathers Evidence, and writes Findings without guessing the human's Decision.

Only a human runs `perquiro setup`, adds an Actor with `perquiro actor add`, or resolves a Review. If a command needs an Actor that does not exist, tell the human to run `perquiro actor add`; do not run it yourself. You may read Reviews and tell the human to run `perquiro review`.

Only Perquiro writes `.perquiro/evidence/`. Keep secrets out of git and SQLite. Work only against trusted test environments.
<!-- perquiro:agent-contract:end -->
