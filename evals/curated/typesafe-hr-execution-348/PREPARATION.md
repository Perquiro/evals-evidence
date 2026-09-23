# Preparation record

No scored execution began until launch validation passed and both independent
review axes approved driver commit `8f6255ac23854a578b35490ae00b5fc2096183f2`.
The frozen launch SHA-256 is
`b7b3c6e4383d137e0cb08f592e7e3d6d5565192ff3b9c43f13970d27df658885`.

Preparation attempts are retained separately from candidate outcomes:

| Attempt | Result and disposition |
| --- | --- |
| `host-probe` | CLI probe timed out because its input stream stayed open. Retained. |
| `host-probe-2` | CLI completed after closing input; its output did not provide enough host-setting evidence for launch. |
| `app-server-probe` | Confirmed the app-server exposes requested/effective host settings and usage events. |
| `preflight-1` | Setup rejected the unsupported Agent value `codex`; the actual Setup value is `openai`. Retained. |
| `preflight-2` | Live advice worked, but an inherited native MCP server was still available. Rejected as isolation proof. |
| `host-isolation-probe` | Confirmed inherited MCP exposure remained despite an empty-table override. Rejected. |
| `host-isolation-fixed` | Quoted configuration keys produced an invalid MCP transport entry. Retained. |
| `host-isolation-fixed-2` | Explicit per-server disablement produced only empty MCP stubs; the candidate reported no arbitrary file-reading tool. |
| `driver-probe-1` | Saved a login-page Observation. The first Knowledge export used invalid arguments; both the failed export and corrected public export are retained. |
| `preflight-3` | Live advice, case-insensitive API gating, empty state, evidence-import confinement, and native-MCP isolation passed. |
| `driver-probe-2` | Corrected isolated host saved an Observation and exported it through public MCP. |
| `timeout-probe-1` | Forced termination at 60.043 seconds retained the final capture and public Knowledge. This was an unscored control with a shorter host timeout. |
| `preflight-4` | Added proof of rejected instruction-file reads and canonical fixed-date receipt; every assertion passed. This is the launch's isolation receipt. |

The browser tests cover immediate grace on cap admission, delayed response
settlement, request bursts, rejected late actions and snapshots, capture after
stop, credential redaction, and origin confinement. The public export test
retains all 70 Observations across pagination. Independent source verification
matched all 31 tracked files to the pinned BugBusters commit.

The full repository suite initially reported 1,618 passes, six failures, and
three skips. All failures are in unchanged `src/ui/derive.test.ts`: four
Expected Behavior consequence assertions, a resolved Investigate Review
heading, and a Deferred inbox summary. Type checking passed. The evaluation
adds no production changes or glossary terms.

Preparation, authoring, and review are excluded from candidate elapsed time
and reported separately as overhead. Available preparation counters remain in
the original host/provider artifacts. Authoring and reviewer usage, and actual
charges, are unknown.
