# Preparation record (#452)

No scored execution began until launch validation passed, the quality-floor decision was retained, and the driver proofs below succeeded. The frozen launch SHA-256 is
`e0d2b90e8d3f567e4ce1b054c964bc6cae8cc0289888324fb425402d49102296`.

Preparation attempts retained separately from candidate outcomes:

| Attempt | Result and disposition |
| --- | --- |
| `preflight-4` | Isolation, live TypeSafe advice, withheld import/read, case-variant gating and empty MCP stubs passed on first try. |
| `driver-probe-2` | Ordinary probe saved a login-page Observation and completed. |
| `timeout-probe-1-early-complete-retained` | First timeout attempt finished early (~17 s). Retained. |
| `timeout-probe-1-drain-fail-retained-*` | Hang-tool timeout hit 60 s but post-close drain threw before host.mjs tolerated timeout drains. Retained. |
| `timeout-probe-1` | Forced hang tool; host timed out at ~60.15 s with final capture retained. Drain error recorded without failing the timeout status. |
| `rehearsal-ordinary-1` | Ordinary Explore completed Request leave with POST submit and history readback Observations. Quality floor: `workflow_floor_met`. |
| `source-proof.json` | 31 pinned BugBusters paths matched the disposable export. |

Quality floor decision is in `.perquiro/452/quality-floor.json` and copied into launch preflight evidence. Graders A/B are model identities; grader H is human. Missing host cost remains unknown.
