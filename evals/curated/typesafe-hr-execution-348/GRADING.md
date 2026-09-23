# Anonymous grading instructions

Read only the anonymous packet directory supplied for this assignment and this
guide. Do not inspect the launch, source Product, candidate instructions,
planning, advice, timing, cost, other grades, or condition mapping. Every sample
contains actual captured Product actions, network results, and saved
Observations. Sample numbers are shuffled and convey no condition or order.

Use `checklist.json` as the grading authority. Judge each sample independently.
Credit requires the complete action and result described by the item, supported
by executed actions and saved Observations. A proposed action, raw trace without
a saved Observation, or partial composite check receives zero. Unexpected
Product behavior can earn exercise credit when the actual result was saved.

An action's `ordinal` gives its position. `saved_after_action` is only an upper
bound on when an Observation was saved; it does not associate that Observation
with every earlier action. `saved_before_close: false` disqualifies a saved
record from credit. An evaluator refusal is never a Product denial. Use later
captures and network settlement to distinguish an intermediate view from the
result. Do not infer readback from an immediate save response.

Credential values are redacted. Use the submitted account identity and captured
authentication result; plaintext passwords are not required for login credit.

For each of the 17 items, retain the decision, concrete rationale, exact action
IDs, and exact Observation IDs. Check every clause of composite items. Give a
specific reason for every zero. Do not infer coverage from Journey names.

Also identify distinct behavior learned, deduplicated by meaning; concrete open
questions; and unsupported material claims. An intent or precondition statement
does not claim that an action succeeded. Explain which saved claims lack
capture support rather than counting all untested questions as unsupported.

Write one JSON file with this shape, using the reviewer identity supplied in the
assignment. Do not read another grader's file.

```json
{
  "reviewer": "/root/blind_grader_a",
  "samples": {
    "sample-01": {
      "items": [
        {
          "item_id": "login",
          "credit": true,
          "action_ids": ["action-2"],
          "observation_ids": ["the original UUID"],
          "rationale": "Specific captured inputs, result and saved support."
        }
      ],
      "observation_actions": {
        "the original UUID": ["action-2"]
      },
      "behaviors": [
        {
          "id": "behavior-1",
          "description": "A distinct observed behavior.",
          "action_ids": ["action-2"],
          "observation_ids": ["the original UUID"]
        }
      ],
      "open_questions": ["A concrete unresolved question."],
      "unsupported_claims": []
    }
  }
}
```

Include all samples and all checklist items. Use empty evidence lists for an
unsupported item. `observation_actions` must link each credited Observation to
the actions its body actually supports, including behavior-only credit. Retain
uncertainty explicitly. Do not fill missing evidence with expected behavior.
