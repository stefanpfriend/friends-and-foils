# F&F Holiday Hunt — build preview

The site now has a campaign landing page at `/holiday-hunt/`, a tag checker at
`/holiday-hunt/found/#CODE`, and the complete rules draft at
`/holiday-hunt/rules/`. Home and Events link to the campaign. The existing shop,
signup behavior, shared stylesheet, hosting files and event dates are preserved.

The confirmed window is November 27–December 9, 2026. In-person entries close
December 9 at 9:30 PM Eastern; the live drawing follows at about 9:30 PM at the
7–9:30 PM trade night. Mail alternate entries must be postmarked December 4 and
received December 9. Prize pickup ends December 18 at 5 PM Eastern. There are
no added Saturday hours.

This is a preview, with a visible draft notice and noindex metadata. Twelve
highlighted rule fields still need confirmation: prize items/quantities/ARVs,
sponsor legal entity, promotion contact, notification timing and winner-list date.
The full updated source was supplied in the Ando thread on November 7. Private
operator notes and the unconfirmed host shortlist are excluded. One clarity edit
changes “private property” to “unapproved private property,” since hosts are
businesses granting permission. No entry or prize mechanic was changed.

The repository's existing giveaway instructions require confirmed fields and
North Carolina attorney review of the final official rules before publication.
Keep this branch out of production until those launch requirements are resolved.

## What the QR flow does

Each of 100 tags has a distinct random code, 25 per design. The public manifest
contains SHA-256 code hashes and design IDs, not the printable codes. A valid tag
identifies its design and updates a four-design checklist on that browser.
Repeated finds do not inflate that checklist. The raw QR code is in the URL
fragment, not a query parameter. Manual checks use the same fragment route.

This is not a central redemption system. Scanning does not create an entry,
reserve a prize or establish physical possession. Staff verify the physical
keychain and log a unique code once at the counter. The household spin limit is
also administered by staff. There is no online entrant/contact form, digital
prize wheel, social-share entry or new marketing integration.

Only design IDs are stored in the browser. Corrupt or blocked storage fails
safely; a visitor can still bring the physical keychain to the counter. A failed
script leaves the optional check form disabled, with a no-script counter fallback.
In-page accessibility navigation does not get mistaken for a tag scan.

## Private printing handoff

The master inventory, printable SVG/PNG files, print sheet and counter CSV live
outside this public repository. Do not upload those files to the public site or
commit the code inventory. No participant names or contacts were collected.

`tools/make-hunt-tags.mjs` is an offline helper. Its optional tooling dependencies
(qrcode 1.5.4, jsQR 1.4.0, pngjs 7.0.0) are installed in a separate private folder;
the website itself has no new dependencies or build step. Supply absolute
`--inventory`, `--out` and `--tooling` paths. `--create-inventory` is only for the
first preparation. Always reuse the same master inventory after printing.
The helper refuses to replace a different public inventory and never overwrites
an existing counter ledger.

The print sheet uses black-and-white 50 mm QR images, M error correction and a
four-module quiet zone. Test a physical sample with a real phone before making
the full 3D-printed batch. Digital decoding does not prove manufacturing quality.

## Validation and rollback

- Eight Node tests pass under Node 24.21.0: issued/design-matching codes, invalid
  input/fragments, repeat finds, hostile/corrupt/blocked storage, manifest counts,
  calendar times, current rules dates and inert no-script behavior.
- All 100 PNG codes independently decode to their intended URL, as do four
  180px samples. Repeat generation keeps all 200 SVG/PNG assets identical and
  preserves an existing ledger.
- Actual Chromium checks pass at 1440×1000, 768×1024, 390×844 and 320×760, with
  no horizontal page overflow or clipped controls. Valid scans, all four finds,
  reload persistence, invalid input, keyboard submission, skip navigation,
  checklist reset, mobile menu and Home/Events discovery work. No browser
  console warnings/errors were observed.
- All 124 local links/assets/anchors resolve; no duplicate HTML IDs occur.
  Shared app.js/styles.css, CNAME and .nojekyll match the original main source.

Physical devices, Safari, a real printed-camera scan, in-person counter operations,
prize stock and legal approval are not verified. No production deployment, list
submission, payment, real entry or prize draw was performed.

Before tag distribution, rollback is the previous main commit 73926ab. After
printed tags are distributed, keep the issued manifest and `/holiday-hunt/found/`
route available even if other campaign presentation is rolled back.
