# Friends &amp; Foils

Landing page for **Friends &amp; Foils** — Pokémon card shows, buy/sell/trade, and table time, coming to the Charlotte area (hosted at Tabbris).

Live at: <https://friendsandfoils.com>

## What this is

A single static `index.html` — no build step, no dependencies. Its whole job is to
capture emails for first show dates, table reservations, and shop news.

## Email capture

The signup forms run in **demo mode** until wired to Mailchimp. To go live:

1. In Mailchimp: **Audience → Signup forms → Embedded form**.
2. From the generated `<form>`, copy the action URL (ends in `/subscribe/post`) and
   the hidden bot field name (looks like `b_xxxxxxxx_yyyyyyyy`).
3. Fill in the `CONFIG` block near the bottom of `index.html`:
   - `ACTION` — the action URL
   - `BOT_FIELD` — the `b_xxxx_yyyy` field
   - `VENDOR_FIELD` — (optional) a merge/group field to flag vendor interest

With `ACTION` empty, the form shows the success message but sends nothing.

## Hosting

Deployed via **GitHub Pages** from the `main` branch. The `CNAME` file binds the
custom domain `friendsandfoils.com`; `.nojekyll` disables Jekyll processing so the
file is served as-is.

## Local preview

Open `index.html` directly in a browser, or:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```
