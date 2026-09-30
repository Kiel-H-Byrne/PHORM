# PHORM MVP launch checklist

**The MVP question:** Can a Prince Hall member find a business, and can a
business owner set up and manage their listing?

Items marked ✅ are done in code. Items marked ☐ need you: accounts,
consoles, or people.

---

## 1. Remove obvious bugs ✅

Fixed in the `shipit` branch:

- The add-listing wizard dropped categories (zod stripped `services`), so every listing was saved with `categories: []`.
- Adding a listing anywhere except `/map` failed with "Google Maps API not loaded".
- The homepage search box had no input field.
- The homepage crashed with an empty database (a hook was called inside a conditional).
- Soft-deleted listings still appeared publicly.
- Search only filtered the current page of results, and listings without `createdAt` were hidden.
- There was no business detail page, and share links pointed to a 404 (`/listing/<place_id>`).
- "Save/favorite" buttons showed success toasts but stored nothing. They're removed until favorites exist.
- Denying location permission on the map broke the map.
- The login page ignored where the user was going, and FirebaseUI raced its own redirect.
- The signed-out avatar was a random shape and the only way into Sign In. It's now a "Sign in" button.
- Mobile: listing cards clipped, the nav overflowed, the map page used `100vh`, the mobile menu stayed open after navigating, and pinch-zoom was disabled.
- Link previews said "Real Investment Decisions by Real People" and pointed at an og:image that doesn't exist.

## 2. Production Firebase rules

✅ Security model: **browsers never talk to Firestore directly.** Every read and write goes through `/api/*`, which verifies the caller's Firebase ID token (`util/apiAuth.ts`) and uses the Admin SDK (`db/admin.ts`):

| Action                   | Who can do it                                                      |
| ------------------------ | ------------------------------------------------------------------ |
| Read listings            | Anyone (hidden/deleted listings are filtered out)                  |
| Create a listing         | Signed-in users (owner comes from the token, not the request body) |
| Edit or remove a listing | Its owner, or an admin (custom claim `admin: true`)                |
| Read or edit a profile   | Only that user                                                     |
| See other members        | Signed-in users; only members who opted in, never contact details  |
| Create deals             | Signed-in users, only for their own listings                       |

`firestore.rules` denies all direct client access.

☐ **Deploy the rules** to the production database:

```sh
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules
```

`firebase.json` only targets the `phorm-db-prod` database. The project
(`momb-1b026`) looks like it may be shared with another app, so the rules are
**not** deployed to its `(default)` database. Only add `(default)` if no other
app uses it.

☐ **Set server env vars in Vercel** (Production and Preview). See `.env.example`.

- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`. Admin credentials, **no** `NEXT_PUBLIC_` prefix. The code falls back to the old `NEXT_PUBLIC_FSDB_PRIVATE_KEY` / `NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL` names so the current deploy keeps working. Rename them, then delete the old ones.
- Also delete the unused `NEXT_PUBLIC_*_SECRET`, `NEXT_PUBLIC_TEST_*` and `NEXTAUTH_*` variables. Nothing references them, but a `NEXT_PUBLIC_` secret gets bundled into the browser the moment someone uses it.
- `NEXT_PUBLIC_SITE_URL` (your production URL) and `NEXT_PUBLIC_SUPPORT_EMAIL` (enables the "report / claim this business" link on listings).

☐ Optional: grant yourself admin so you can fix anyone's listing:

```js
// node -e, with Admin credentials loaded
admin.auth().setCustomUserClaims("<your uid>", { admin: true });
```

## 3. Verify authentication flows ☐ (manual, about 10 minutes)

On production, in a private window:

- [ ] Phone sign-in (US number) → lands on `/dashboard`, user doc created in `users`
- [ ] Email sign-up → lands on `/dashboard`
- [ ] Visit `/dashboard` signed out → login → returns to `/dashboard`
- [ ] "Add your business" signed out → login → back to the dashboard
- [ ] Sign out → avatar becomes "Sign in"; `/dashboard` redirects to login
- [ ] Firebase console → Authentication → Settings → **Authorized domains** includes your production domain
- [ ] Phone auth: check SMS region policy and quota (Firebase console → Authentication → Settings)

MVP.md asks for Google sign-in. It's one line in `util/firebaseUI.ts`
(`GoogleAuthProvider.PROVIDER_ID`), but **enable the provider in the Firebase
console first**, or the button will error.

## 4. Verify listing creation ☐ (manual)

- [ ] Add a listing from the homepage, `/list`, `/map`, and `/dashboard`
- [ ] Try submitting with no phone, email or website → blocked with a clear message
- [ ] Success screen → "View your listing" opens `/listing/<id>`
- [ ] It appears in `/list`, on `/map`, and under "My Listings"
- [ ] Edit it (dashboard or listing page) → changes show immediately
- [ ] Remove it → it disappears everywhere
- [ ] A second account can't see Edit on your listing, and `PUT /api/listings/<id>` returns 403

## 5. Verify map and search ☐ (manual)

- [ ] `/list`: search "plumb", category chips, "Near me" (sorted by distance), pagination
- [ ] `/map`: markers and clusters, tap a marker → drawer → Details / Directions / Share
- [ ] Map search box (typeahead) → selects and pans to the listing
- [ ] Deny location permission → a friendly toast, and the map still works
- [ ] Listing page → "See on map" centers on the business

## 6. Verify mobile ☐ (real devices: one iPhone Safari, one Android Chrome)

- [ ] Nav fits at 360px wide; hamburger menu opens and closes on navigation
- [ ] Add-listing drawer: keyboard doesn't hide the Next button, and the numeric keypad appears for ZIP
- [ ] Tap-to-call, email and directions open the right apps
- [ ] Share opens the native share sheet, and the link preview in iMessage/WhatsApp shows the business name
- [ ] The map fills the screen without the page scrolling

## 7. Seed initial legitimate listings ☐

1. Copy `data/listings.template.csv` to `data/listings.csv` (gitignored) and fill it in.
2. Create a **server** Maps key with the Geocoding API enabled and no referrer restriction, and set it as `GOOGLE_GEOCODING_KEY` in `.env.local`.
3. Dry run, then commit:

```sh
yarn import-listings data/listings.csv --prod            # dry run: validates and geocodes
yarn import-listings data/listings.csv --prod --commit   # writes
```

- Add `owner_email` or `owner_phone` so owners can edit their listing when they sign in. If they haven't signed in yet, re-run with `--commit` afterwards and ownership gets assigned.
- Only import businesses you've confirmed are PHA-affiliated **and** that agreed to be listed.
- Aim for at least 20–30 listings, concentrated where your test users are, so searches don't come up empty.
- `yarn db-init` seeds **fake** data into the dev `(default)` database. It refuses to run in production.

## 8. Analytics ✅ (code) / ☐ (dashboards)

Events are sent to **Vercel Analytics** and **Google Analytics (Firebase)** from `util/analytics.ts`:

| Event                                                                                   | Use it to answer                                                   |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `search` / `search_no_results` (`term`, `category`)                                     | What do members want that we don't have? Recruit businesses there. |
| `listing_view`, `contact_click` (`method`: phone/email/website/directions)              | Are members actually reaching businesses?                          |
| `share`                                                                                 | Is it spreading in lodge group chats?                              |
| `add_listing_start` → `add_listing_step` → `add_listing_complete` / `add_listing_error` | Where do owners drop off?                                          |
| `edit_listing_complete`, `login`, `locate_me`                                           |                                                                    |

- ☐ Vercel custom events need a Pro plan. Page views work on all plans. GA4 events are free: Firebase console → Analytics.
- ☐ In GA4, mark `add_listing_complete` and `contact_click` as key events.

## 9–11. Recruit and observe ☐

**Recruit:** 10–25 Prince Hall members and 5–10 business owners. Mix ages and phone types, and include people who aren't very technical.

**Tasks** (hand them a phone, say only this, then stay quiet):

_Members_

1. "You need a [plumber/barber/accountant] near you from the PHAmily. Find one and get in touch."
2. "Send that business to a brother in your group chat."

_Owners_

1. "Put your business on PHORM."
2. "Your hours changed. Update your listing."
3. "Send your listing to your lodge."

**Record for each task:** completed (yes/no), time taken, where they hesitated or tapped the wrong thing, and what they said. Afterwards ask: "What did you expect to happen there?" and "Would you use this instead of asking in the group chat?"

**Ship criteria:** at least 80% of members finish task 1 without help, at least 80% of owners publish a listing without help, and there are no data or security issues. Fix the top 3 friction points, then ship.

## Known gaps (fine for MVP, next up)

- Vouch/flag and moderation queue (MVP.md P0 #3). Interim: "Let us know" email link on each listing, plus admin edit/remove.
- "Claim this business" in-app flow. Interim: `owner_email` in the import, or the email link.
- Favorites, logo/image upload, Algolia-grade search. Current search is in-memory and fine up to about 2,000 listings.
- Member directory is **opt-in**: members appear only after ticking "Show me in the Member Directory" in Edit Profile (never with email/phone). Deals and class-year pages work but weren't part of this pass.
