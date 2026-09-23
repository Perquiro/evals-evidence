# Product role-field review

`product-domain-fields.json` restores a `role` property at each listed item path in the existing Product responses. In particular, event 45 contains restored role values for all ten returned employee-list items, including `employee` for items 0–8 and `hr` for item 9.

This disproves the unsupported-claim finding in `grade.initial.json` that the default employee-list response lacked a role field. The prior finding arose from the packet anonymizer's recursive removal of keys named `role`, not from candidate overstatement.

`grade.initial.json` remains unchanged as directed. For a later adjudicated grade, remove that one unsupported-material-claim entry. Its checkpoint claim count would be zero rather than one; saved coverage remains 4/27 and all seen, saved, direct-Journey, and Scenario judgments remain unchanged.

No other judgment depends on the restored fields. The only other supplemented response is event 77, whose role values do not alter the saved Engineering-filter result, its support set, or its proposed Scenario.
