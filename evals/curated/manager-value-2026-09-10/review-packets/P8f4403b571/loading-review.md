# HR19 loading-state adjudication

This review leaves all existing grades and notes unchanged.

HR19 is **seen: true**, **saved: false**, and **directlyJourneyLinked: false**.

The complete raw-trace support set is `[356, 357, 358]` (event 359 is a duplicate settled snapshot). Event 356 is Hannah’s browser-immediate Next action into `/onboarding/step-2`. It captures the required initial loading state: the Department selector is disabled with only `Loading departments…`, and the Manager selector is disabled with only `Loading…`. Event 357 is the metadata response. Event 358 is the settled action snapshot: both selectors are enabled, Department offers the five departments, and Manager offers `No manager` plus the five named managers. This is a complete capture of the specified action and before/after selector result. Seen credit does not depend on a candidate-written Observation saying that the loading state was noticed.

There is no complete saved support set. `4cd8cb75-e4c9-49be-9b39-6ba5f5687d7f` records reaching step 2 and that metadata supplied departments and managers; `1bdebab3-77f3-481f-8d57-6b1976f9aa59` records only the settled enabled selectors and their options; and `7ba96191-7caa-429a-992c-f02d0fdfa468` records only the metadata API response. Later saved records retain the same settled selector state. Neither those records nor their duplicated public-state representations preserve the required initial disabled loading state.

Therefore the corrected complete-check representation would use `seenSupportSets: [[356, 357, 358]]` and `savedSupportSets: []`. The original `HR19` entry remains untouched as requested.
