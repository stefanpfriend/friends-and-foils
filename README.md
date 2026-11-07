# Friends & Foils

Website for **Friends & Foils** — trading card game shows, buy/sell/trade, and table
time (Pokémon, Magic, Lorcana, One Piece and more), coming to the Charlotte area
(hosted at Tabbris).

Live at: <https://friendsandfoils.com>

## What this is

A small static site — no build step, no dependencies. Every page is hand-written
HTML that links one shared stylesheet and one shared script.

## Structure

```
/                     index.html          Home — open-shop hub (Visit the Shop, What's in the case)
/buy-sell-trade/      index.html          Face-to-face buy / sell / trade at the counter
/events/              index.html          Events hub — trade nights, card shows, play & league
/play-space/          index.html          Dedicated play rooms + event space
/card-shows/          index.html          Redirect → /events/#shows (folded into Events)
/spaced-play/         index.html          Redirect → /play-space/ (legacy name)
/giveaway/            index.html          Launch giveaway (30th Anniversary Pokémon ETB)
/giveaway/rules/      index.html          Official Rules for the giveaway (attorney-reviewed)
/assets/styles.css                        Shared design system (single source of truth)
/assets/app.js                            Shared behavior: email capture, holo card, mobile nav
/assets/img/                              Venue photography + prize/OG images

Nav (4 items): Visit the Shop (home #visit anchor) · Buy · Sell · Trade · Events · Giveaway.
Shop NAP (footer, every page): 1300 South Blvd, Suite D, Charlotte, NC 28203 (inside Tabbris), Monday–Friday, 10 AM–5 PM.
```

The header nav and footer are duplicated as static HTML in each page (no build step =
no server-side includes). If you change a nav or footer link, update it in every
page. Styling and JS are shared, so those change in one place.

## Giveaway — before it goes live

`/giveaway/` and `/giveaway/rules/` are built as a **giveaway / sweepstakes** (not a
"raffle" — in NC that term is reserved for nonprofits). Both pages contain highlighted
`[confirm: …]` placeholders (cap, per-entry price, dates, ARV, sponsor entity,
eligibility). Fill every one, then have a North Carolina attorney review the Official
Rules before publishing. Keep the "no purchase necessary" and equal-odds language.

## Email capture

The signup forms POST to **Buttondown** (`buttondown.com/friendsandfoils`). Config
lives in the `CONFIG` block at the top of `assets/app.js`:

- `ACTION` — Buttondown embed-subscribe endpoint (leave empty for demo mode: shows the
  success message but sends nothing)
- `VENDOR_FIELD` / `VENDOR_VALUE` — Buttondown tag applied when the vendor box is checked

## Hosting

Deployed via **GitHub Pages** from the `main` branch. The `CNAME` file binds the custom
domain `friendsandfoils.com`; `.nojekyll` disables Jekyll processing so files are served
as-is.

## Local preview

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

Use the server (not `file://`) so the absolute `/assets/…` and `/play-space/` paths
resolve.

## Holiday Hunt teaser

`/holiday-hunt/` announces the Nov 27–Dec 9, 2026 dates and Dec 9 trade-night finale.
Home and Events link to the teaser. `/holiday-hunt/found/` displays the same
coming-soon information for early QR scans; it does not validate a code.

The prize offer, entry mechanics, rules draft, code lookup manifest and browser
passport remain in draft PR #9. Do not publish those until the outstanding
promotion decisions and final rules review are complete. This teaser uses only
the existing shared script; it has no entry form or hunt data collection.

## Holiday Hunt (build preview)

`/holiday-hunt/` contains the holiday campaign, `/holiday-hunt/found/#CODE` checks a
tag, and `/holiday-hunt/rules/` contains the updated rules draft. Home and Events
link to it. The checklist is browser-local; entries and household spins are checked
at the physical counter, not registered online.

The prize/sponsor/contact fields are still highlighted for confirmation. Production currently serves the dates-only teaser. Keep this branch’s full
promotion out of production until the final rules and existing giveaway launch
requirements above are resolved. Do not commit or publish the private master code
inventory, QR print kit or counter ledger.

See [build, verification and print handoff](docs/holiday-hunt-build.md).
Run the small behavior checks with `node --test tests/holiday-hunt.test.mjs`.
