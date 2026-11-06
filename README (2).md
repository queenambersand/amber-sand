# HOUSE OF SAND

Portfolio + sticker shop for Amber Sand. Plain HTML/CSS/JS, no build step, so it
runs free on GitHub Pages. Only the card checkout needs a tiny function, which
runs free on Cloudflare Pages.

## What's where

```
public/
  index.html      home / landing page
  about.html      about me
  stickers.html   the shop + cart
  bookings.html   booking inquiry form
  style.css       colors + layout for EVERY page (change the look here)
  site.js         my email, instagram, and the checkout address (change contact info here)
  stickers.json   my stickers + prices (prices are in cents)
  img/            all photos and sticker images
functions/api/
  checkout.js     creates the Stripe checkout page (Cloudflare only)
```

## Quick edits

| I want to...                    | Edit this                                             |
|---------------------------------|-------------------------------------------------------|
| change colors                   | the 5 lines at the top of `public/style.css`          |
| change my email / instagram     | `public/site.js`                                      |
| add a sticker                   | `public/stickers.json` + put the image in `public/img/` |
| change prices                   | `public/stickers.json`, then the price line in `stickers.html` |
| change words on a page          | that page's `.html` file (look for `[brackets]`)      |
| add portfolio photos            | `public/index.html` (the gallery comment shows how)   |
| list upcoming shows             | `public/index.html` (the "catch me live" section)     |
| add a new page                  | copy `about.html`, rename it, then add its link to the nav on every page |

Sticker images: `"image": "img/yourfile.jpg"` with **no leading slash**, a real
JPG/PNG (not a renamed phone HEIC), about 1000x1000 and under 300 KB.
Portfolio photos: about 1200px wide and under 400 KB. Tapping any photo on the
site opens it full screen, so a little extra resolution keeps it crisp.

## Turning pages on (under construction switches)

Home, about, and bookings start out showing a cute "under construction" notice.
The real page code is all still in the file, just hidden. When a page is ready:

1. Open `public/site.js`.
2. Find the `live:` list and change that page's `false` to `true`:
   ```js
   live: {
     home: true,       // <- ready!
     about: false,
     bookings: false
   }
   ```
3. Commit. The real page shows after a minute or two (hard-refresh with Ctrl+Shift+R).

To peek at a hidden page before it's live, add `?preview` to its address, like
`about.html?preview`. A little tag in the corner reminds you it's still hidden from visitors.
The stickers page is always on. To change the construction wording, edit the
`wip-notice` section near the top of each page's `.html` file.

## Hosting (all free)

### Option A: GitHub Pages only (simplest)
1. Repo settings > Pages > Deploy from a branch > `main`, folder `/ (root)`.
2. The site is at `https://USERNAME.github.io/REPO/public/`.
3. Everything works except card checkout. People who hit "checkout" get a
   message telling them to email me. Bookings, about, and browsing all work.

### Option B: GitHub Pages for the site + Cloudflare for checkout (all free)
1. Do option A.
2. Create a Stripe account and copy your **secret key** (`sk_test_...` to start).
3. Cloudflare dashboard > Workers & Pages > Create > Pages > connect this repo.
   Build command: *(none)*. Build output directory: `public`.
4. In that Cloudflare project > Settings > Variables and Secrets add:
   - `STRIPE_SECRET_KEY` (type: Secret) = your Stripe key
   - `ALLOWED_ORIGINS` (type: Text) = `https://USERNAME.github.io` (no path, no trailing slash)
   Then redeploy.
5. In `public/site.js` set `checkoutUrl` to
   `https://YOUR-PROJECT.pages.dev/api/checkout`.
6. Test with card `4242 4242 4242 4242`, any future date, any CVC.
7. When ready, swap in the live key (`sk_live_...`) and redeploy.

### Option C: everything on Cloudflare Pages
Same as option B steps 2 to 4, skip `ALLOWED_ORIGINS`, and leave `checkoutUrl`
as `/api/checkout`. Your site is then at your `.pages.dev` address.

## Local testing
Create `.dev.vars` containing `STRIPE_SECRET_KEY=sk_test_...`, then run
`npx wrangler pages dev public`.
