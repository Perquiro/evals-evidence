# Boundary review

`grade.initial.json` remains unchanged. This review records the flags and support that a corrected grade should use.

## HR15 — immediate approval aftermath

No. The cited saved records do not preserve the immediate queue result required by the frozen rubric. `6cd4e40a-faf9-45ed-baaa-99ba57ac274b` records the opening confirmation, and `9575e57a-7162-4052-ac22-b018d4f8af79` records the settled approved/removal result. The journey recap `3c97d3db-fbcf-45cf-8d6f-49dbb7fa6b9d` also omits the intermediate result.

Raw event 298 is the required immediate evidence: the final Approve was selected, the confirmation was no longer rendered, and Emily's pending row was still rendered. The decision response follows at event 299, with the settled browser result at events 301–302. No final public Observation records that event-298 state.

Revised HR15 flags: `seen: true`, `saved: false`, `directlyJourneyLinked: false`. Its complete seen support is `[292, 293, 294, 298, 299, 300, 301, 302]`; it has no complete saved support set. This is a saved-coverage gap, not a lack of raw behavior.

## HR14 — later directly linked queue opening

Yes. `fc3365d1-5848-44b9-9140-86f885ed968a` is directly linked to the manager journey and is a complete later alternative for HR14. Michael navigated to `/approvals` at event 352, the settled browser queue at events 356–357 rendered George Tanaka's pending request, and event 354 returned the corresponding pending object, id 2. The Observation records the requester and pending-request identity. HR14 permits any opening of the manager queue; it does not require the original two-row collection.

The later direct saved-support alternative is `{ observationIds: ["fc3365d1-5848-44b9-9140-86f885ed968a"], eventIds: [352, 353, 354, 355, 356, 357] }`. The earlier surface-only set using `863cb21a-508f-47e4-b565-74a439d7b901` and events 278–282 remains valid for saved coverage and checkpoint timing. Revised HR14 flags: `seen: true`, `saved: true`, `directlyJourneyLinked: true`.

## HR17 — employee readback without a reload

Event 399 is a distinct browser snapshot recorded at 2026-09-10T16:10:17.715Z, after the manager's decision at event 299. It is not an older trace event reused under a later label: it has its own event id, timestamp, employee session, and employee My leave UI. The literal HR17 wording requires the employee to read the request again and record the employee-visible result. It does not require a reload, unlike HR08, HR23, and HR27.

Accordingly, the observed unrefreshed employee UI satisfies HR17's readback wording: it visibly shows request 3 as pending after the manager approved it. It does not establish refreshed UI state or current server state. The recorded refusal explains why no fresh Product navigation or reload was dispatched. HR17 remains `seen: true`, `saved: true`, and `directlyJourneyLinked: false`; its complete saved chain still needs the non-journey-linked submission Observation `861b9d9d-41f1-4cbb-a634-79c8e47376c0` together with the journey-linked manager and employee records.

## HR11 — number of newly pending requests

The single successful POST response alone is insufficiently explicit for the required number. Complete saved support should combine the zero-pending baseline `f8793585-ab3f-4598-8679-6000f873322f`, one valid POST/create record (`861b9d9d-41f1-4cbb-a634-79c8e47376c0` or `c1084695-11a3-484d-a195-282be624c1c5`), and a post-create history record (`5e7611d3-5220-4417-89b7-448b84ddb417` or `9b58238b-4d93-40ab-8642-1ee61c306b36`). Raw events 33, 163–168 establish the same baseline, one create, and one pending history row. HR11 remains seen and saved, but not directly journey-linked.

## Revised checkpoint estimates

Using candidate start `2026-09-10T15:31:32.593Z`, the cutoffs are 15:41:32.593Z, 15:51:32.593Z, and 16:11:32.593Z. The first manager-queue opening begins at event 278 (15:55:14Z), after minute 20.

| Checkpoint | Seen | Saved |
| --- | ---: | ---: |
| 10 minutes | 2/27 | 0/27 |
| 20 minutes | 5/27 | 5/27 |
| 40 minutes | 8/27 | 7/27 |

The minute-40 saved reduction is HR15's missing saved immediate-aftermath Observation. The HR14 later direct alternative and HR17 snapshot both fall before the minute-40 cutoff. The remaining uncertainty is limited to the stale-versus-fresh scope of HR17's employee UI; it does not change the literal unrefreshed-readback conclusion.
