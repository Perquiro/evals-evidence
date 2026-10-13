# Unscored coordination capability checks

These checks preceded the fixed three-arm pilot. They are operational capability evidence and contribute no saved-check score. Failed checks remain retained.

- `hr-d01ac`: the exploring seat claimed read-only access without attempting a write. The directing seat wrote under the same launch flags. Capability failed despite normal native closure.
- `hr-e26bd`: the marker write and browser operations worked, but the exploring seat used a plain Observation write instead of the required inspection. The director identified an omitted loading fact and a recording worker appended it from the original capture without new Product requests. The required inspection contract still failed.
- `hr-f37ca`: the inspection returned separate immediate and settled Observations with appropriate Evidence and readback. The old checker incorrectly required both captures to link to the first Observation. Its failed receipt remains unchanged. `reassessment-f37ca.json` records the corrected operational assessment. The director read captures and handoff summaries but did not freshly fetch public saved bodies; this does not certify semantic review.

The review statuses preserve a capacity failure and a timeout without a verdict. The subsequent focused correction review passed at `96fa5fd82cd3062dfc0176cb9d29385081b4388b`, with the stated limitations. It authorized the bounded pilot, not a claim of score improvement. Full private rollouts are excluded.
