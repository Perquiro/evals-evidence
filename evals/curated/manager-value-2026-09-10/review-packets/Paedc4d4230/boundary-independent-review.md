# Boundary independent review

`grade.independent.json` remains unchanged. This review answers only the three stated rubric boundaries from the saved packet and the literal frozen inventory.

## HR15 — immediate confirmation aftermath

Revised flags: `seen: true`, `saved: false`, `directlyJourneyLinked: false`.

The raw trace fully sees the required two-stage result. Events 292–294 show Michael's first Approve opening the confirmation while Emily remains in the pending table. Event 298 is a separate immediate snapshot after the final Approve click: the confirmation is gone, but Emily's pending row is still rendered. Event 299 then returns the approved decision, and events 300–302 show the settled queue with only George's row.

The cited saved Observations do not preserve the event-298 state. `6cd4e40a-faf9-45ed-baaa-99ba57ac274b` records the opening confirmation. `9575e57a-7162-4052-ac22-b018d4f8af79` records the API result and settled removal. The directly linked summary `3c97d3db-fbcf-45cf-8d6f-49dbb7fa6b9d` also moves from confirmation opening to final removal. None records that the confirmation closed while Emily was still pending before response 299. Because HR15 explicitly requires both the immediate and settled queue result, the saved condition is not complete.

The complete seen support set is `[292, 293, 294, 298, 299, 300, 301, 302]`. There is no complete saved support set under the frozen rule. The uncertainty is narrow: the immediate state is unambiguous in raw UI evidence, but absent from final public Knowledge.

## HR14 — later directly linked queue opening

Revised flags: `seen: true`, `saved: true`, `directlyJourneyLinked: true`.

HR14 requires an opening of the manager queue and the requesters and pending-request identities that appear; it does not require the first opening or the initial collection. The later sequence is a new manager navigation: event 352 goes to `/approvals`, event 354 returns the later one-item pending collection, and events 356–357 render the settled queue containing George Tanaka request 2. `fc3365d1-5848-44b9-9140-86f885ed968a` preserves that result and is directly linked to journey `aaf0b73c-4066-4796-9368-a0794281b8f9`.

Thus `[352, 354, 356, 357]` with Observation `fc3365d1-5848-44b9-9140-86f885ed968a` is a complete later directly linked alternative. The earlier complete saved support (`863cb21a-508f-47e4-b565-74a439d7b901`, events 278–282) remains the earliest support for checkpoint accounting. The later alternative is also before the 40-minute cutoff, so it establishes direct linkage there. There is no uncertainty about the later collection differing from the original one; that difference is permitted by the literal "an opening" wording.

## HR17 — post-decision employee reading without refresh

Revised flags: `seen: true`, `saved: true`, `directlyJourneyLinked: false`.

Event 399 is a newly captured `browser_snapshot` at 16:10:17, after the decision events 299–302. It is not an old trace event reused as if newly observed. Its session is `Emily.dawson`, its URL is `/leave`, and its top-level UI records the employee-visible history row as pending. Observation `ef5811e9-9ef7-4753-b9c5-a4fcec7c39b1` saves the same employee-visible result.

The frozen HR17 wording asks to create the request, decide it as manager, then read it again as employee and record the employee-visible result. It does not require a reload, navigation, or server-fresh state. Crediting the actual post-decision capture therefore satisfies the literal check, even though it only proves what Emily's already rendered UI showed. It does not prove that a refresh would show the same pending state, nor does it override the manager's approved Product response.

Complete seen support is `[163, 164, 167, 168, 298, 299, 300, 301, 302, 399]`. Complete saved support is Observations `861b9d9d-41f1-4cbb-a634-79c8e47376c0`, `3c97d3db-fbcf-45cf-8d6f-49dbb7fa6b9d`, and `ef5811e9-9ef7-4753-b9c5-a4fcec7c39b1` with those events. Direct Journey linkage remains false because the saved creation Observation `861b9d9d-41f1-4cbb-a634-79c8e47376c0` is not Journey-linked; the manager decision and employee reading are linked across their respective Journeys.

At minute 40, these revisions exchange saved HR15 for saved HR17, leaving the saved total at 7/27. HR14 gains direct linkage while HR15 loses it, leaving the directly linked saved total at 5/27.
