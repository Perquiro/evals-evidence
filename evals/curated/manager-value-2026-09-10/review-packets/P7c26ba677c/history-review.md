# HR12 history review

The original withholding rationale added a requirement that HR12 does not contain. HR12 says: "Read back a submitted leave request in request history." It does not say that the candidate must first submit a new request. HR11 separately requires the employee to submit one valid request once and to establish the number newly pending. An already-existing request in the employee's request history can therefore satisfy HR12 when its displayed details are read back.

Emily is the employee actor. Browser event 49 is the settled capture after selecting My Leave and shows the request-history row: `Aug 11, 2026 – Aug 12, 2026`, `3`, `Vacation`, `approved`, and `Approved – enjoy!`. Event 50 independently preserves the same rendered row. The request is an existing approved leave request, so it is a submitted request for the literal HR12 action. Observation `72b908e3-2cc4-48b2-ac80-ed11c28ac790` saves those rendered details, including the actual UI dates, three days, Vacation, approved status, and manager comment.

Revised HR12 assessment: seen `true`; saved `true`; directlyJourneyLinked `false`. The earliest complete seen support is `[49]`. An equally complete later raw alternative is `[50]`. The earliest complete saved support is `{ observationIds: ["72b908e3-2cc4-48b2-ac80-ed11c28ac790"], eventIds: [49] }`. The Observation has no direct Journey link, so the diagnostic flag remains false.

Flag: the rendered request-history end date is Aug 12 while the related API leave record reports `endDate` 2026-08-13. HR12 requires displayed request details, so the browser-rendered dates are the relevant facts. This discrepancy does not defeat HR12 and does not require treating the saved Observation as unsupported.
