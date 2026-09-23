# HR01 navigation completeness review

This review leaves `grade.initial.json` unchanged.

HR01 has complete saved support. The frozen item asks for the navigation visible for each configured Actor; it does not require each actor’s list to be serialized independently when the saved material provides an explicit baseline and actor-specific additions.

`e2c2a207-605b-4218-9d85-a1f45b8afc0f` supplies the explicit employee baseline: Dashboard, Directory, My Leave, Timesheet, and My Profile. `d25ffaab-9a76-4d81-bedf-c621c66ae903` then records Michael’s dashboard and says that the sidebar “adds Approvals /approvals.” Read as a differential navigation observation, that preserves the baseline list plus Michael’s sole recorded addition; it does not infer that a shared Surface grants him any other role-specific item. The underlying actor snapshots are events 25 and 141.

For Hannah, `8fd76029-e655-40c9-819f-5107ca9e8bb2` records the dashboard and says that Onboarding is added alongside Approvals, supported by event 324. There is also a stronger full-list saved alternative: `1de543cf-51b1-47e4-9cd1-b1c5bcc908de` records Hannah’s visible sidebar as Dashboard, Directory, My Leave, Timesheet, Approvals, Onboarding, and My Profile, supported by events 341–343. It is consistent with the dashboard observation and confirms both stated additions without relying on surface sharing.

A complete saved support set is therefore observations `e2c2a207-605b-4218-9d85-a1f45b8afc0f`, `d25ffaab-9a76-4d81-bedf-c621c66ae903`, `8fd76029-e655-40c9-819f-5107ca9e8bb2`, and `1de543cf-51b1-47e4-9cd1-b1c5bcc908de`, with events 25, 141, 324, and 341–343. The raw trace independently contains the complete three dashboard lists at events 25, 141, and 324.

The only possible narrower reading would demand a standalone full serialized manager list in saved Knowledge. That would treat “adds Approvals” as unusable despite its explicit differential meaning. The frozen guidance permits an explicit saved baseline plus clear differences, so that narrower reading is not applied here.
