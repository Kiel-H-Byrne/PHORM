# MVP goal (single-line focus)

Help members quickly find and contact vetted Prince Hall–affiliated businesses near them, and make it effortless for members to add and maintain their listings.

## P0 scope (ship this first)

1. Core search + discovery

- Global search bar: “What do you need?” with typeahead for categories/tags.
- Location handling: “Use my location” + manual city/ZIP entry, with distance filter.
- Results: List + Map toggle, sorted by distance and relevance. Quick chips for categories (e.g., Trades, Legal, Health, Creative, Consulting, Food).
- Filters: Category, distance, affiliation (PHA/OES/etc.), jurisdiction/state.
- Business detail page: Name, categories, short description, location(s), service radius, contact (phone/email/site), affiliation info, “Share” button, “Suggest an edit.”

2. Frictionless onboarding + add business

- 2-click sign-in (Google now; add Apple/email link later).
- “Add Business” 4-field fast form:
  - Business name
  - Category (single required; optional tags)
  - City/ZIP (with “use my location”)
  - Public contact method (phone or email or website)
- Optional: affiliation fields (Jurisdiction, Lodge/Chapter, Year Raised), plus a short one-liner “What do you do?”
- On submit: immediate publish, soft-moderated (see Flagging below).

3. Trust signal without bureaucracy

- Affiliation clarity: Display affiliation fields prominently if provided.
- Community vouch: “Vouched by X members.” Any signed-in member can add a vouch with a one-tap “I can vouch.” Show count; threshold badge (e.g., 3+ = “Community Verified”).
- Flagging: “Report listing” with reasons (not member, spam, wrong info). Auto-hide after threshold; moderators review queue.

4. Performance + UX basics

- Instant search results with client-side filters (use indexing service).
- Fast image handling for logos via Next/Image.
- Mobile-first, thumb-friendly CTAs.

5. Safety, privacy, and ownership

- Owners can edit only their own listings.
- Public info = business fields only. Member profile details remain private by default.
- Clear terms + privacy link in footer.

## P1 scope (next)

- Edit dashboard: My businesses, edits, vouches, flags.
- “Claim this business” flow for unclaimed entries.
- Save favorites and recent searches.
- Structured categories and synonyms (e.g., “plumber” ↔ “plumbing”).
- Invite flow: Generate a share link to request vouches from lodge brothers.

## P2 scope (later)

- Requests: “Post a Need” wizard that creates a shareable link and pings relevant categories; optionally email digest to nearby providers.
- Reviews with guidance on decorum; private “request quote” messages.
- Bulk import from Google Business profiles or CSV.

## Key user flows (optimize these)

- I need X near me
  1. Landing: visible search bar + “Use my location.”
  2. Type “plumber,” tap “near me,” get list + map.
  3. Tap result, 1-tap call/email/site; copy/share profile to lodge chat.
- Add my business
  1. Sign in → 4-field form → submit → live.
  2. Prompt to “Add affiliation” + “Request vouches.”
- Vouch/Flag
  1. On any profile, 1-tap vouch with confirmation.
  2. Report with simple reasons, auto-hide on threshold.
- Share to group chat
  - Result and profile pages have “Share” (deep link + prefilled text for WhatsApp/GroupMe/iMessage): “Looking for a plumber? Try [Business] on PHORM: {link}”

## Data model (Firestore)

- users
  - uid, displayName, email, roles[], jurisdictions[], lodges[], verificationStatus
- businesses
  - ownerUid
  - name, slug
  - categories[], tags[]
  - shortDescription, fullDescription
  - address (city, state, country), coordinates (lat, lng), geohash, serviceRadiusKm
  - website, phone, email, socials{}
  - affiliation: {jurisdiction, lodge, orgType, yearRaised?}
  - status: active | hidden | flagged
  - vouchCount, flagCount
  - createdAt, updatedAt
- vouches
  - businessId, voterUid, createdAt
- flags
  - businessId, reporterUid, reason, createdAt

### Search + geo stack (practical + fast)

- Full-text + facets: Use Algolia (Firebase Extension “Search with Algolia”) for name, tags, categories, and location facets.
- Geo: Store coordinates + geohash (geofire/geofirestore). Algolia also supports geo queries—prefer that for unified search.
- Synonyms: Configure in Algolia for common terms (attorney/lawyer; HVAC/ac; barber/haircut).

### Security rules (essentials)

- Owners can write only to their own business docs. Everyone can read active listings. Vouches/flags write protected to signed-in only.
- Example (illustrative snippet):

```
match /businesses/{id} {
  allow read: if resource.data.status == "active" || hasRole(request.auth, "admin");
  allow create: if request.auth != null && request.resource.data.ownerUid == request.auth.uid;
  allow update, delete: if request.auth != null && resource.data.ownerUid == request.auth.uid;
}
match /vouches/{id} {
  allow create: if request.auth != null;
}
match /flags/{id} {
  allow create: if request.auth != null;
}
```

## UI: minimal components to ship fast

- Landing
  - Hero line + search bar + “Use my location”
  - Top categories (chips)
  - CTAs: “Add A Business,” “Find Near Me”
- Search results
  - Filters rail (category, distance, affiliation)
  - List + map toggle
- Business detail
  - Primary contact buttons
  - Affiliation badge + vouch/flag
  - Share button
- Add business
  - 4-field fast form, progressive disclosure for advanced fields
- Account
  - My Businesses, My Vouches, Settings

### Moderation approach (low overhead)

- Soft publish by default for speed.
- Auto-hide: flagCount ≥ N → status = hidden; moderator notified.
- Abuse protection: rate-limit vouches/flags per user per day; dedupe vouches by (businessId, voterUid).

### Analytics (measure usefulness)

- Time-to-first-result, contact button clicks, conversion rate per category.
- % of searches with no result → drive outreach to recruit businesses in those gaps.
- Add-Business completion rate and drop-off step.
- Vouch rate and flags per 1,000 views.

#### Rollout plan (1–2 weeks MVP)

- Day 1–2: Data model, Firestore rules, Algolia integration, location + geohash.
- Day 3–4: Landing + search with filters + list view.
- Day 5: Map toggle + business detail + share links.
- Day 6: Auth + 4-field Add Business + image/logo upload.
- Day 7: Vouch + Flag + auto-hide, basic admin page (table + approve/unhide).
- Day 8: Polish mobile UX, 404/empty-states, terms/privacy.
- Day 9: Analytics events, category synonyms.
- Day 10: Lighthouse pass, error handling, soft launch with selected lodges.
- Day 11–14: Fixes from feedback, add “claim business,” favorites (optional).

#### What to do with today’s CTAs

- “Add A Business!” → Link to the 4-field fast form; success screen encourages “Get 3 vouches to earn ‘Community Verified’.”
- “Find My Location” → Permission modal, then immediate results sorted by distance, with a visible category filter.

#### Why this prioritization works (simple + detailed)

- Simple: It replaces “ask the chat and wait” with instant, location-aware search and a one-tap contact flow.
- Detailed: It bootstraps supply fast (tiny add form), increases trust without heavy verification (community vouches), and preserves quality (flagging + auto-hide). Search remains snappy via Algolia + geo indexing.
