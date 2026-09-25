# MASTER PROMPT: Rebuild LankaReview (localhost:3001) as a faithful Yelp.com clone for Sri Lanka

> Paste this whole file into your coding agent. It comes from a live page-by-page crawl of yelp.com (66 pages plus 15 menus, modals and page states, at 1440px, logged out, 24 Sep 2026) and a crawl of the current LankaReview app. Work through it **in phase order** (§12). Don't skip the design system in §1: everything else depends on it.

---

## 0. Context and ground rules

- **Stack today:** Next.js (App Router, Turbopack dev), Tailwind, shadcn-style components, Leaflet/OpenStreetMap on the business page, phone-OTP login ("Log in or sign up · We'll text you a code").
- **Keep:** the LankaReview name, Colombo/Sri Lanka data, the English / සිංහල / தமிழ் switcher, Noto Sans Sinhala/Tamil font fallbacks, phone-OTP auth, Leaflet maps (style them to look like Yelp's), and LKR pricing ($ → Rs tiers are fine to show as `$`–`$$$$` like Yelp).
- **Don't copy:** Yelp's name, wordmark, red "burst" logo, illustrations, or photos. Make an original logo mark and original or stock images. Match **layout, spacing, type scale, color logic, components and flows**, not brand assets.
- **Localize every US concept:** city = Colombo / Kandy / Galle…, neighborhoods = Colombo 01–15, Kollupitiya, Bambalapitiya, Nugegoda, Rajagiriya…, ZIP → postal code, "Yelp Elite" → "LankaReview Elite", "Yelp Guaranteed" → "LankaReview Guaranteed", "Yelp Assistant" → "LankaReview Assistant".

### What exists in the clone today (crawled)

| Route | Status |
|---|---|
| `/` | Exists. Looks nothing like Yelp (details in §4.1) |
| `/search` | Exists. Wrong layout; the map column is empty |
| `/business/[slug]` | Exists. Wrong layout; photos are black boxes and raw slugs are showing |
| `/login` | Exists (phone OTP). Wrong layout |
| `/saved` | Exists. Redirects to `/login` when logged out (OK) |
| All ~60 other Yelp page types | **Missing.** I probed 62 likely routes (/signup, /profile, /writeareview, /collections, /events, /talk, /costs, /about, /terms, /privacy, /business/[slug]/photos, /questions, /claim, /dashboard, …) and **every one returns 404** |

---

## 1. Design system (build first, then use it everywhere)

### 1.1 Tokens (`globals.css` + `tailwind.config`)

```
--brand:            #D71616   (hover #B80F0F, active #9E0E0E)   [measured from Yelp Sign Up btn rgb(215,22,22)]   primary buttons, search button, active tab underline, Sign Up
--brand-light:      #FFE9E9                                     subtle red fills
--text:             #2D2E2F   all body and headings (never pure black)
--text-muted:       #6E7072   meta, timestamps, helper text
--text-subtle:      #898A8B
--link:             #007692   [measured rgb(0,118,146)]   (hover underline; weight 600 for "Read more", "Show more", "See all")
--link-legacy:      #0073BB   (only on the legacy-style pages in §4.9)
--border:           #EBEBEB   card borders, dividers
--border-strong:    #C8C9CA   inputs, outlined pills, empty stars
--bg-gray:          #F7F7F7   footer, gray bands, info boxes
--bg-chip-active:   #E6F4F7 with border #007692   (selected city chip, active sort option)
--open:             #008055   ("Open", response rate)
--closed:           #D71616   ("Closed")
--info-blue:        #E1F0FF bg + #1570EF left border   (trust banner on reviews)
--rating-5:#FB433C  --rating-4:#FF643D  --rating-3:#FF8742  --rating-2:#FFAD48  --rating-1:#FFCC4B  --rating-0:#C8C9CA
```

### 1.2 Typography

- **Headings, names, nav, buttons:** Poppins 600/700 (`next/font/google`).
- **Body:** Open Sans 400/600. Keep the Noto Sans Sinhala/Tamil fallbacks after it.
- **Scale:**
  - Hero H1: 48/56, 700
  - Business H1 (over the photo): 48–56, 800
  - Page H1: 32–48
  - Section H2: 28, 700 (centered on the homepage, left-aligned elsewhere)
  - Search results H1: 28
  - Result/business name H3: 20–22, 700
  - Card title: 16, 700
  - Body: 16/24
  - Meta: 14
  - Small: 12

### 1.3 Layout

- Content container: `max-width: 1144px; padding: 0 24px; margin: 0 auto`.
- Business page and search page are wider: max 1440, with a left column plus a sticky right column.
- Header height: 130px with the category row, ~76px compact.

### 1.4 Radius and elevation

- 4px: cards, tiles, inputs.
- 8px: modals and large cards.
- **Pill (999px):** Log In / Sign Up, filter chips, category chips, action buttons (Share/Save/Follow), Yes/No/Maybe, CTA chips.
- Shadows: cards have none (1px border only). Dropdowns and menus: `0 4px 16px rgba(0,0,0,.12)`. Modals: `0 8px 32px rgba(0,0,0,.2)` over a `rgba(0,0,0,.5)` backdrop.

### 1.5 Icons

Use one outline icon set (Lucide is fine) at 24px, stroke 1.5. Category icons are **two-tone** (red + gray line illustration, 48px). Give each category its own icon; no reuse.

---

## 2. Global components (build as a shared library before building pages)

### 2.1 `<Header variant="transparent" | "white" | "minimal" | "legacy">`

- **Row 1 (76px):**
  - Logo (left).
  - `<SearchBar>` (~660×48): a "what" input, a 1px vertical divider, a "where" input (default "Colombo"), then a square red button with a white magnifier. Only the outer corners are rounded (4px), with a soft shadow.
    - The "what" placeholder **rotates** every ~4s: "Kottu near me", "AC repair today", "Romantic dinner with a sea view", "Best hoppers in Colombo".
    - A × clear button appears once there's text.
    - The "where" placeholder is "address, neighborhood, city or postal code".
    - **Autocomplete dropdown:** matching categories, businesses and recent searches.
  - Right side: `LankaReview for Business ▾` (click dropdown), `Write a Review`, `Start a Project`, **Log In** pill, **Sign Up** red pill.
- **Row 2 (54px):** category mega-nav, 6 items with ▾. **Hover** opens a white panel (radius 8, shadow) with 3 columns of icon + label links, a red 3px underline under the active tab, and "Explore a City" at the bottom. Localized contents:
  - **Restaurants:** Takeout, Delivery, Hot & New, New Restaurants, Breakfast & Brunch (Hoppers/String hoppers), Lunch (Rice & Curry), Dinner, Cafes, Kottu, Chinese, Indian, Bakeries, Seafood, Street Food, Pubs & Bars
  - **Home & Garden:** Contractors & Handymen, Plumbers, Electricians, AC Repair & Service, Appliance Repair, Roofing, Locksmiths, Painters, Landscaping, Nurseries & Gardening, Florists, Tree Services, Home Cleaning, Furniture Stores, Movers
  - **Auto Services:** Auto Repair, Three-Wheeler Repair, Body Shops, Oil Change, Tyres, Towing, Car Wash, Auto Detailing, Parking, Car Dealers, Spare Parts
  - **Health & Beauty:** Dentists, Doctors, Channelling Centres, Eye Care, Dermatologists, Ayurveda, Massage, Hair Salons, Nail Salons, Barbers, Spas, Physiotherapy
  - **Travel & Activities:** Things to Do, Kids Activities, Venues & Events, Temples & Churches, Shopping Malls, Bookshops, Hotels, Guesthouses, Taxis & Tuk-tuks, Bike Rentals, Camping, Beaches, Swimming Pools, Bars & Nightlife
  - **More:** Dry Cleaning, Laundromats, Thrift Stores, Tailors & Alterations, Apartments, Tuition & Classes, Gyms, Yoga & Pilates, Pet Groomers, Banks, Real Estate Agents, Wedding Services
- **LankaReview for Business ▾** (click): Add a Business, Claim your business for free, Log in to Business Account, a divider, then Explore LankaReview for Business. Each item has a line icon.
- **Variants:**
  - `transparent`: homepage and city pages. Sits over the hero with white text; Log In is an outlined white pill.
  - `white`: all inner pages. 1px bottom border; Log In is a light-gray filled pill `#EBEBEB`. **Sticky:** on scroll, row 2 collapses and the header compacts.
  - `minimal`: write-a-review, login, signup. Logo + Log In + Sign Up only.
  - `legacy`: talk, events, rss, locations. Older style: square red "Sign Up", white bordered "Log In", nav only Restaurants / Home Services / Auto Services / More.
- The current clone's language `<select>` renders **blank on `/search`**. Move the language switcher into the header's right side (and the footer) and always show the active language.

### 2.2 `<Footer>` (every page except minimal/404)

- `--bg-gray` background, 64px top padding.
- 5 columns: Poppins 16/700 headings, Open Sans 14 links in `--text`, 12px row gap.
  - **About:** About LankaReview, Careers, Press, Investor Relations, Trust & Safety, Content Guidelines, Accessibility Statement, Terms of Service, Privacy Policy, Ad Choices, Your Privacy Choices
  - **Discover:** Project Cost Guides, Collections, Talk, Events, Blog, Support, Mobile app, Developers, RSS
  - **LankaReview for Business:** For Business, Business Owner Login, Claim your Business Page, Advertise, For Restaurant Owners, Guest Manager, Business Resources, Business Support, Agencies
  - **(4th column):** Yelp shows RepairPal here. Replace it with **"Popular in Sri Lanka"**: Auto Repair Near Me, Tuk-tuk Repair, AC Repair Costs, Wedding Vendors, Tuition
  - **Languages:** English ▾ (teal link, opens a list with සිංහල / தமிழ்). **Cities:** Explore a City ▾ (opens a city list)
- Then a divider and a 12px muted copyright line: "Copyright © 2026 LankaReview. LankaReview and related marks are trademarks of …"
- **Missing entirely in the clone today.**

### 2.3 `<StarRating size="sm|md|lg|xl" value={4.5} interactive? />`

- 5 **rounded-square boxes** (sm 16, md 20, lg 24, xl 36px), 2px gap, each with a white ★.
- **All filled boxes use the color of the overall rating tier** (4.0 → `--rating-4`). Support half boxes: left half colored, right half gray. Empty boxes are `--rating-0`.
- Label next to it: "**4.3** (1.8k reviews)". Format counts as 1k / 1.8k.
- `aria-label="4.3 star rating"`.
- **Interactive mode** (write a review, "Select your rating"): hovering fills boxes up to the pointer in that tier's color and shows a dark tooltip: 1 "Not good", 2 "Could've been better", 3 "OK", 4 "Good", 5 "Great".
- The clone currently shows plain text "★ 4.7 (3)", and on most cards nothing at all.

### 2.4 `<OpenStatus>`

- Plain text, not a pill: **"Closed"** in red 700 or **"Open"** in green 700, followed by " until 11:00 AM tomorrow" or " 11:00 AM - 2:45 PM, 5:00 PM - 8:45 PM" in `--text`.
- Replace the clone's green/gray pill badges everywhere.

### 2.5 Buttons and chips

- **Primary:** red, white Poppins 14/600, 36–44px tall, 4px radius (**pill** in the header, hero CTA, "Post Review" and sidebar CTAs).
- **Secondary:** white, 1px `--border-strong`, pill.
- **Gray pill:** `#EBEBEB` bg (Add photos/videos, Share, Save, Follow).
- **Filter chip:** white, 1px border, pill, 13px. Active = dark border + light-gray bg.
- **Category chip on cards:** outlined pill, 12px.
- **Tag chip:** gray `#F0F0F0`, 4px radius, 12px (Food / Service / Ambiance).

### 2.6 Modals

- A shared `<Modal>` component: 8px radius, ✕ in the top-right, backdrop click and Esc close it, focus trap.
- **Login-wall modal:** burst mark, "Sign in to LankaReview", a context line ("You must log in to view another user's profile page." / "Save X for later — Keep track of your favorites"), a ToS/Privacy line, "Continue with Google" and "Continue with Apple" (outlined full-width pills), an "or" divider, the phone/OTP field (our auth), a red "Log in" button, and "New to LankaReview? Sign up".
- **Show it whenever a logged-out user clicks** Save, Follow, Message, Compliment, Ask a question, Answer, Helpful/Thanks/Love this/Oh no, or opens a profile.

### 2.7 Other shared components

- **`<SectionLinkList>`** (used on ~10 pages): an H2/H3 plus a **4-column** plain link list (14px `--text`, 8px row gap), first 3 rows visible, then a teal **"Show more ▾"** toggle.
- **`<Breadcrumb>`:** 12px muted links with `›` separators.
- **`<CookieBanner>`:** privacy-first. "We use cookies…" with **Allow all** / **Accept only essential** / Manage preferences. The preferences modal has two toggles (Functional & analytics, Targeting) and "Save preferences".
- **Skeletons:** gray `#F0F0F0` blocks with a centered camera icon for images. **Never black.** The clone shows black boxes today.

---

## 3. Data layer (without this, no page can look like Yelp)

1. **Fix images.** 8 of 19 homepage images have `naturalWidth = 0`, and most photos on business/search pages render **black**. They're `_next/image?url=https://picsum.photos/...`. Pick one of these:
   - Add `picsum.photos` and `fastly.picsum.photos` to `images.remotePatterns`, **or**, better,
   - Seed **category-appropriate** local images in `/public/seed/{category}/*.jpg`.

   Right now a gym shows a coffee cup and an events company shows a brick wall.
2. **Delete test fixtures from the DB and UI:** "Owner Edit Cafe mu3dnpmg", "Owner Edit Cafe mu3dndqo", the Q&A "Do they take walk-ins on Sundays mu3cekl1?" / "…booking mu3cem4a". Add `is_test` and filter it out.
3. **Seed realistic content.** 150+ businesses across all categories and Colombo neighborhoods. For each business:
   - 5–60 reviews: ratings skewed 3–5, dates over 3 years, 80–400 words, some with 1–3 photos, reaction counts.
   - 5–40 photos tagged `food|inside|outside|menu|drink|video`.
   - Weekly hours, including split hours (11:00–14:45, 17:00–20:45).
   - Price tier, 2–3 categories, 6–40 amenities (true/false), "Popular dishes" for restaurants, "Services offered" for services.
   - Owner "About the Business", 0–4 "Updates From This Business" posts, 0–5 Q&A with answers.
   - `claimed`, `guaranteed`, `response_time`, `response_rate`, lat/lng.
4. **Users:** 60+ with avatar, name "Firstname L.", city, counts (friends, reviews, photos), `elite_year`, and "Yelping since".
5. **Human labels everywhere.** The business page currently shows raw slugs `home-services` and `appliance-repair` as chips. Map each slug to its label, per language.
6. **Metadata (`generateMetadata`):**
   - Business: `"{NAME} - Updated {Month YYYY} - {n} Photos & {n} Reviews - {address} - {Category} - LankaReview"`
   - Search: `"TOP 10 BEST {Query} in {City} - ({YYYY} Guide) - LankaReview"`
   - Home: `"LankaReview - Restaurants, Salons, Repairs & More in Colombo"`
   - Today the business page `<title>` is literally "localhost".
7. **New tables:** `activity_feed`, `collections` (+ `collection_items`, `followers`), `questions` / `answers`, `review_reactions`, `events` (+ `rsvps`), `talk_topics` / `talk_posts`, `cost_guides`, `quote_requests`, `business_updates`, `bookmarks`, `follows`, `compliments`, `messages`.

---

## 4. Page-by-page spec (Yelp page → LankaReview route)

Legend: 🟥 missing (build new) · 🟧 exists but must be rebuilt · P0/P1/P2 = priority (see §12)

### 4.1 Home `/` 🟧 P0

The clone today has a thin header, "Find great local businesses in Colombo" with 2 inputs, 3 clipped carousels (Trending / Top Rated with 1 card / New Businesses), a gray 20-tile category grid with repeated icons, **and no footer**. Replace it with:

1. **Hero carousel** (full-bleed, **~600px**), under the transparent header:
   - 3 slides with a crossfade every ~6s, dark gradient overlay.
   - Each slide has a white Poppins **48/700** headline, left-aligned about 230px from the top, then a **red pill CTA** (magnifier icon + term) that links to `/search?find_desc=…`.
   - Slides: "Leave it to the pros" → Handyman; "Say farewell to dead branches" → Tree services; "Tell pests to bug off" → Pest control. Localize these, e.g. "Beat the heat" → AC Repair.
   - Bottom-left caption: **business name (bold)** + "Photo from the business owner".
   - **Left vertical progress rail:** 3 stacked 6px-wide rounded bars (~80px tall). The active one fills white over time. Put a ⏸/▶ button under them. Each bar is a "Select slide N" button.
2. **Recent Activity:** centered H2, **3-column masonry** of cards (1px border, 4px radius, no shadow). Each card:
   - Header: 32px avatar, "**Pete M.** added 4 photos / wrote a review / checked in", "1 minute ago" (12 muted), divider.
   - Business name, `<StarRating sm>` + count, "$$ • Sushi Bars, Japanese".
   - Body by type: a 2-up photo grid with a 👍 under each photo and "Show all 4 photos" / one large photo / review excerpt (4 lines) + "Read more".
   - Review footer: 4 circular reaction buttons (💡 Helpful, 🙌 Thanks, ❤ Love this, 😮 Oh no).
   - 9 cards, then a "Show more activity" outlined button.
3. **Categories:** centered H2. A **4×2 grid of 256×182 tiles** (1px border, 4px radius), each a centered 48px two-tone icon over a 14px label. Hover gives a shadow. Tiles: Restaurants, Shopping, Nightlife, Active Life, Beauty & Spas, Automotive, Home Services, **More** (••• expands to all).
4. **Explore searches in popular cities:** left H2 + muted subtitle "Discover what people are searching for in each city".
   - **City chips** (pill; selected = teal fill + border): Colombo, Kandy, Galle, Negombo, Jaffna, Nuwara Eliya, Ella, Trincomalee, Matara, Kurunegala, Anuradhapura, Batticaloa.
   - For the selected city: three `<SectionLinkList>`: **Top Searches in X**, **Trending Searches in X**, **Seasonal Searches in X** (e.g. "Avurudu sweets", "Vesak dansal").
5. **Recently reviewed businesses:** a `<SectionLinkList>` of business names.
6. **Footer.**

### 4.2 City home `/[city]` (e.g. `/colombo`, `/kandy`) 🟥 P1

Same template as Home, with the location prefilled. The section order becomes: Hero → Recent Activity → Categories → Top / Trending / Seasonal Searches in {City} → **Explore Neighborhoods around {City}** (a `<SectionLinkList>`: Colombo 01 Fort, Kollupitiya, Bambalapitiya, Wellawatte, Cinnamon Gardens, Borella, Rajagiriya, Nugegoda, Dehiwala, Mount Lavinia, Battaramulla, Kotte) → Recently reviewed businesses around {City}.

### 4.3 Explore a City `/locations` 🟥 P2 (legacy header)

A red H3 "More Places to LankaReview", then a 4-column list grouped by **province** (Western, Central, Southern, Northern, Eastern, North Western, North Central, Uva, Sabaragamuwa), with blue city links under each. Title: "Browse {n} cities on LankaReview".

### 4.4 Search results `/search?find_desc=&find_loc=` 🟧 P0

The clone today has a gray filters panel, a 2-column card grid, an empty gray map box, no title, and "23 results". Rebuild it:

- **Layout:** results column ~62% + **sticky map** ~38%, full viewport height, right side. Variant: at ≥1440px, also show a **left filter sidebar** (~220px).
- **Top of the results column:**
  - Breadcrumb ("Restaurants" or "Home Services › Plumbers").
  - H1 **"Top 10 Best {Query} Near {City}, Sri Lanka (Updated 2026)"**.
  - Right-aligned "Sort: **Recommended** ▾ ⓘ". The dropdown has Recommended (active: teal on light-teal) / Highest Rated / Most Reviewed.
- **Filter chip row** (sticks under the header on scroll): `[⚙ All] [Price ▾] Open Now, Reservations, Offers Online Waitlist, Offers Delivery, Offers Takeout`.
  - Price ▾ is a checkbox list ($, $$, $$$, $$$$) with a teal "Save".
  - **All** opens a Filters panel: Price segmented; Suggested (Open Now with the current time, Reservations, Waitlist, Delivery, Takeout, Good for Dinner); Dietary (Halal, Vegan, Vegetarian); Category (6 chips + See all); Features (Outdoor Seating, Good for Lunch, Good for Kids, Good for Groups, Dogs Allowed, Full Bar + See all); Distance radios (Bird's-eye View, Driving 8 km, Biking 3 km, Walking 1.5 km, Within 4 blocks); Clear / Apply.
  - For **service categories** the chips become: All, **LankaReview Guaranteed** (shield icon), Open Now, Fast-responding, Request a Quote, Virtual Consultations.
- **"Sponsored Results ⓘ"** blocks: 2–3 at the top and 1 mid-list, same row design. Can include a **deal inset** (bordered box: deal title, text, "Read more", thumbnail).
- **Organic rows 1–10** (horizontal, 1px divider between rows):
  - **Left:** a 245×245 photo **carousel** (‹ › arrows on hover), 4px radius.
  - **Right:**
    - H3 "**1. Name**" (Poppins 22/700).
    - `<StarRating md>` + "4.3 (1.8k reviews)".
    - 📍 Neighborhood • $$ • **Closed** until 11:00 AM tomorrow.
    - Highlight line with colored icons ("Outdoor seating • Locally owned & operated ⓘ", "Waitlist opens at 11:00 am", "43 years in business").
    - 💬 quoted snippet with the query term **bolded** + "more".
    - Outlined category chips.
    - Red pill CTA on the right ("↗ Order", "↗ View Website", "Reserve", "Get pricing & availability").
- **Service-business result variant** (bordered card instead of a row):
  - Name + category chips; "Serving {area} and the Surrounding Area" right-aligned.
  - 🛡 **Guaranteed** red badge; "Verified License"; ✓ checklist of 3 services.
  - Description + more.
  - "You can request a quote from this business" / "↗ 30 locals recently requested a quote".
  - Red "💬 Get pricing & availability".
- **Map:**
  - Leaflet with a light basemap (CARTO Positron). **Numbered red teardrop pins** 1–10 match the list; teal ★ pins are sponsored.
  - Hovering a row highlights its pin and vice versa.
  - A "Search as map moves" checkbox, ⤢ expand, +/−, and a first-visit dark tooltip "Expand the map to get a better look at the businesses near you." ✕.
  - **Service searches:** replace the map with a sticky **"Free quotes from local professionals"** card: "Tell us about your project…", What do you need? (select job type), When do you need it? (select dates), postal code input, red "Get started". This opens the quote wizard (§4.20).
- **Below the list, in order:**
  1. Pagination: `‹ 1 2 3 … 24 ›` + "Next Page".
  2. **"Ask {City} locals"**: "Username" + "Post your question" input; threads show avatar, name, **Elite 26** badge, time, question, top reply, "View N replies".
  3. "Can't find the business?" + Add a business link.
  4. Related Searches in {City} (`<SectionLinkList>`).
  5. Trending Searches.
  6. Seasonal Searches.
  7. More Nearby.
  8. Browse "{q}" near Landmarks (Galle Face, Viharamahadevi Park, One Galle Face, Majestic City…).
  9. Popular Brands.
  10. Search {q} in popular locations: Nearby cities / Neighborhoods / Streets (Galle Rd, Duplication Rd, Baseline Rd) / Campuses (University of Colombo, SLIIT, APIIT).
  11. **FAQ accordion.**
  12. "Help us improve." feedback link.
- **States:**
  - **Unknown location:** "Sorry, but we didn't understand the location you entered." + "Did you mean one of these previous locations?" + an "Or choose:" 4-column city list.
  - **No results:** a friendly empty state with suggestions and "Add a business".
- `/c/{city}/{category}` and `/nearme/{category}` **redirect** to `/search`.

### 4.5 Business page `/business/[slug]` 🟧 P0

The clone today is a narrow single column: "Directory › Home Services" breadcrumb, H1, slug chips, a plain About, an OSM map, an orange "Get Directions" button, a collapsed "Hours" shown twice, black photo boxes each overlaid with "Report photo", and Q&A with test data. Rebuild it as Yelp's page.

**Shell:** Yelp opens the business page as a **large modal over the search results** (top bar: "← Back to Search" | centered logo | ✕), with the search page and map visible behind it. **Implement it as a Next.js intercepting route** `(.)business/[slug]` so it's a modal from `/search` and a full page on direct load. Left content column ~62% | **sticky right sidebar** ~33%.

**A) Restaurant / venue header:**
- ~430px **horizontal photo strip** (3–4 photos side by side, ‹ › arrows) with a bottom dark gradient.
- Overlaid white text:
  - H1 name (48–56/800).
  - `<StarRating lg>` + "4.0 (2.6k reviews)".
  - "**✓ Claimed**" (blue check) • $$ • "Dim Sum, Hot Pot" + a teal "Edit" link.
  - `<OpenStatus>` + an outlined white **"See hours"** pill (scrolls to #location-and-hours) + "ⓘ Updated 3 weeks ago".
  - Bottom-right: **"See all 11k photos"** pill.

**B) Service business header** (no photo strip): white background, a 100px **round logo**, then name, stars, Claimed • categories, OpenStatus + See hours.

**Under the header:**
- **Action row:** red "☆ Write a review", gray pills "📷 Add photos/videos", "↗ Share", "🔖 Save", "+ Follow".
- A divider, then "**Do you recommend this business?**" with Yes / No / Maybe outlined pills.

**Left-column sections, in order.** Each section: H2 Poppins 20–24, content, 1px divider, 32px spacing.
1. **Updates From This Business:** horizontal cards (image, bold title, 2-line excerpt, "read more").
2. **Menu → Popular Dishes** (restaurants): carousel of square dish photos with the name and "373 Photos • 261 Reviews". "View full menu ›" and "Website menu" pills. **Service businesses** get instead: **Portfolio from the Business** (Sponsored; project cards "TV Wall Mounts · 2 Photos"; "More Projects") → **Photos & videos** (See all N) → **Most mentioned services** (cards "Door Installation · 13 Photos 12 Reviews") → **Services Offered** ("Verified by Business" badge, list + "See 19 More").
3. **What's the vibe?** Tiles Inside / Outside / All photos with counts, plus chips (Casual, Moderate noise, Good for kids, Good for groups).
4. **People also searched for:** chips.
5. **Location & Hours** (`id="location-and-hours"`, with "✎ Suggest an edit" on the right):
   - Left: static map (≈290×150, rounded, red pin), address as a teal link, postal code, neighborhood, "Serving {area}" for services, and a "Get directions" gray pill.
   - Right: **hours table** Mon–Sun with split hours on two lines. **Today's row** gets a red "Closed now" / green "Open now".
6. **Amenities and More:** a 2-column icon grid. The first 4 are shown (e.g. "**Health Score** Pass – Powered by …", Takes reservations, Offers delivery, Offers take-out) with an "**{n} More Attributes**" pill that expands **inline** to the full list. Available = icon + dark text; unavailable = ✕ + gray text; ends with "Show Less".
7. **About the Business:** "Business owner information" (avatar, "Larry S. · Business Owner"), text clamped to 4 lines, "Read more".
8. **Ask the Community:** "Ask a question" button; Q:/A: pairs with answer author, time and "1 person found this helpful"; "See 4 more answers"; a link to `/questions/[slug]`.
9. **Recommended Reviews** (§4.6).
10. **Collections Including {Name}:** cards (count, title, "By {user}").
11. `<SectionLinkList>` group: Best of {City} / People found X by searching for… / Browse Nearby / Trending Searches / Other Places Nearby / Related Searches / (services) Service Offerings in {City}, **Related Cost Guides**.
12. **People Also Viewed:** business cards (photo, name, stars + count, $$, categories).

**Right sticky sidebar cards** (1px border, 8px radius, 16px gap):
- **Restaurants:**
  - "**Make a reservation**" with a date ▾, time ▾ and 👥 party size ▾, and a teal-outlined "Find a Table".
  - A red "Order takeout or delivery ↗".
  - A "Takeout available" card with a red "Order now".
- **Services:**
  - "**Get pricing & availability**": Response time **10 minutes** | Response rate **100%** (green); "What type of service do you need?" radio list; red CTA; "561 locals recently requested a quote"; 🛡 "Covered by LankaReview Guaranteed" + text + Learn more.
  - Then a "Schedule an Appointment!" card.
- **All businesses:** an info card with icon-right rows: website ↗, phone ☎, "**Get Directions**" + address ◇, "**Message the business**" 💬, then an outlined "✎ Suggest an edit".

**Modals from this page:**
- **Share:** "Share business" ✕; "Share on Facebook" (blue pill) + "Share on X" (black pill); a copy-link field; OR; Your Name, Your Email, To, "Add a note (optional)"; red "Share". Add **WhatsApp** for Sri Lanka.
- **Save** (logged out): the login-wall modal (§2.6).
- Remove the "Report photo" overlay text from every photo. Move it to a ••• menu / flag icon in the lightbox.

### 4.6 Recommended Reviews (component inside 4.5) 🟥 P0

- A blue info banner: "**Your trust is our priority**, so businesses can't pay to alter or remove their reviews. Learn more about reviews." ✕.
- **Your-review card:** avatar placeholder, "Username", "Location", 3 mini stats | an interactive empty `<StarRating>` "Select your rating" + teal "Start your review of {Name}". It links to the write form with the rating preselected.
- **Overall rating:** a big `<StarRating lg>` + "2645 reviews". To the right, **5 horizontal bars** (5→1 stars) filled in the rating tier colors and proportional to the counts.
- **Controls row:** "LankaReview Sort ▾" (Newest / Oldest / Highest / Lowest / Elites), "English (2637) ▾" (language filter: English / Sinhala / Tamil), "Filter by rating ▾", and a "Search reviews" input with an icon.
- **Each review:**
  - 48px avatar, **Name** (link), city, a small badge ("8 Hot Pot reviews" or "Elite 26"), ••• menu.
  - `<StarRating sm>` + date.
  - "📷 3 photos • ✓ 1 check-in".
  - Full text, with "Read more" when long.
  - Photo row of 3 × 175px thumbs.
  - **Reaction buttons** (40px circles): 💡 Helpful, 🙌 Thanks, ❤ Love this, 😮 Oh no, with counts.
  - "See all photos from {user} for {biz}".
- Pagination "‹ 1 2 3 … 9 ›" + "**1 of 264**".
- Footer link: "**116 other reviews that are not currently recommended**" → `/not_recommended_reviews/[slug]`.

### 4.7 Photos `/business/[slug]/photos` (modal over the business page) 🟥 P0

- White modal with a black "Close ✕" chip top-right.
- H1 "Photos and videos for {Name}". Right side: "⊕ Add photos" pill + a "Search photos" input.
- **Tabs with counts** (red underline): All (10605) | Food (9220) | Inside (373) | Menu (286) | Drink (167) | Outside (147) | Videos (65).
- A **5-column square grid** (~163px, 8px gap) with gray skeletons while loading. Infinite scroll.
- **Lightbox** `?select={photoId}`:
  - Left: a black pane with the image, a "← Back to photos" chip, share + 🏳 flag icons, ‹ › arrows, keyboard ←/→.
  - Right white panel (~330px): "Photos for {Name}", "1 of 10605", caption, "{uploader} on Jul 9, 2015", 👍 "41 likes".

### 4.8 Ask the Community `/questions/[slug]` and `/questions/[id]/[slug]` 🟥 P1

- **List page:**
  - Breadcrumb.
  - Gray business summary card: photo, name 40px, stars, Claimed, $$, categories, hours | red "+ Ask a question", outlined "See N photos and videos".
  - "Ask the community" + "Sort by Popular ▾".
  - Bordered question cards: ••• menu, "Asked by X", then either "No answers yet. **Answer this question**" or a top answer with "See question details".
  - Right card: "**Can you answer these questions?**" with an Answer pill on each.
- **Detail page:**
  - 3-level breadcrumb.
  - Card: mini business + **H1 question** + "Asked by X · 7 months ago".
  - "**Connect with {Name}**" card + Call button.
  - "1 Answer" + Sort.
  - Answer cards, including an optional "✦ **Answered by LankaReview Assistant**" (AI) with a "Business features" chip, Helpful / Not Helpful, and the note "AI summaries may include mistakes".
  - "Help out with an answer! … Post an answer".
  - Photos strip.
  - Right card: "Other questions for {Name}".

### 4.9 Not recommended reviews `/not_recommended_reviews/[slug]` 🟥 P2

- Breadcrumb.
- A gray info box: embedded explainer video (or illustration) | text about the recommendation software + "Learn more".
- The note "The reviews below are not factored into the business's overall star rating."
- H2 "{n} reviews for {Name} that are not currently recommended", then a simple review list.

### 4.10 Write a Review, landing `/writeareview` 🟥 P0 (minimal header)

- Hero: H1 "**Find a business to review**" + "Review anything from your favorite kottu spot to your local tailor." + combined search (Search for a business | Colombo | red btn). Original illustration on the right.
- "**Visited one of these places recently?**": a 2-column grid of horizontal cards (photo ~120px left, name, ✕ dismiss). Each card shows either "Do you recommend this business?" Yes/No/Maybe pills or 5 **interactive empty star boxes** with hover tooltips.

### 4.11 Write a Review, form `/writeareview/biz/[id]?rating=4` 🟥 P0 (minimal header)

- Center column ~340px:
  - Business thumbnail + **name** + "Union Place, Colombo 02", then a divider.
  - "**How would you rate your experience?**" + an interactive `<StarRating xl>` + a label ("Good").
  - "**Tell us about your experience**", then "A few things to consider in your review" + gray tag chips **Food / Service / Ambiance** (these change per category: e.g. Quality / Price / Timeliness for services).
  - A large textarea "Start your review…" and the helper "Reviews need to be at least 85 characters."
  - A live **autosave** indicator "Saved" (localStorage draft + server draft).
  - "Attach photos" dropzone.
  - Red pill "**Post Review**".
- Right **collapsible drawer** (› toggle): "Recent reviews" for this business (avatar, name, 3 mini stats, stars, date, text, Read more).
- Show a "Leave site?" confirm when there are unsaved changes.

### 4.12 Log in `/login` 🟧 P0 and Sign up `/signup` 🟥 P0 (minimal header)

- Two columns, centered: a ~300px form on the left | a round original illustration on the right.
- **Log in:** red H "Log in to LankaReview"; ToS/Privacy line; Continue with Google; Continue with Apple; "OR"; **phone number (+94) → Send code → 6-digit OTP boxes**; red "Log In"; "Login via email link"; "New to LankaReview? Sign up".
- **Sign up:** red H "Sign Up for LankaReview", "Connect with great local businesses", Google, Apple, OR, First Name | Last Name (2 columns), Phone (OTP), Email (optional), **Postal Code**, red "Sign Up", "Already on LankaReview? Log in".
- Today the clone's `/login` is a bare card with an **orange** "Send code" button, and "Add a business" in the header links to `/login`. Point it to `/claim` instead.

### 4.13 User profile `/user_details?userid=` → `/user/[id]` 🟥 P1

- Logged out: render the page skeleton **behind the login-wall modal** ("You must log in to view another user's profile page.").
- **Left column card:**
  - A red banner strip at the top with a large round avatar overlapping it.
  - Name (Poppins 28).
  - Stats (friends / reviews / photos).
  - "Add friend" pill; 3 icon buttons: 🏅 Compliment, 💬 Message, 👤+ Follow.
  - Nav list: Profile overview, Reviews, Photos and videos, Ask the community, Collections, Recognitions, Compliments, Friends, Following, Events.
- **Main column:**
  - **Impact:** cards for Review reactions, Stats, Compliments.
  - **Review distribution:** Ratings bars + "View more", Top categories.
  - **More about me:** Location, "LankaReview-ing since", "View more".
  - **Reviews** list.
- Also build the logged-in own-profile versions of: Bookmarks (`/saved` exists; restyle it), Friends, Messages, Notifications, Settings.

### 4.14 Start a Project `/projects` 🟥 P1

- "**Project Ideas**" + a red pill "✦ Get help with LankaReview Assistant" (opens an AI chat drawer that turns a described job into a quote request).
- "**Hire a local pro today**": 7 icon shortcuts separated by thin vertical dividers (Movers, Home cleaning, Plumbers, AC repair, Electricians, Auto detailing, More).
- **Themed carousels** with ‹ › buttons:
  - "Make your home your happier place": cards with a **big white number 1–5** over the photo, a bold title ("Upgrade the heart of your home"), and a gray pill "Find kitchen pros".
  - "Create a backyard retreat" ("Find deck pros", "Find fire pit pros").
  - Add "Get ready for monsoon" (roofing, gutters, waterproofing).

### 4.15 Collections `/collections` and `/collection/[id]/[slug]` 🟥 P1

- **Index:**
  - H1 "Collections" (Poppins 48).
  - Tabs **Discover | My Collections | Following Collections** (red underline).
  - Red pill "Create a Collection".
  - "Collection in **Colombo**" + a location input with a search button.
  - Carousels (Featured, Good for Brunch, Coffee & Tea, Desserts). Each card is a mosaic (1 large + 3 small photos) with a "🔖 50" count overlay, bold title, 2-line description, "By LankaReview".
- **Detail:** a **split screen**.
  - Left 50%:
    - Photo mosaic header (1 big + 4 small, "🔖 50").
    - Breadcrumb "Discover › {title}".
    - "989 Followers · Last Updated 9/19/2026".
    - H1 + description.
    - Curator avatar + name + mini stats.
    - Red "Follow Collection", then "Embed Collection" and "Report Collection".
    - "50 Places" + "Sort by Recently Added ▾".
    - List items: name, stars + (N reviews), $ categories, city, optional quote ("Sean m. says: …").
  - Right 50%: a **full-height map** with branded pins.

### 4.16 Talk `/talk` and `/topic/[slug]` 🟥 P2 (legacy header style)

- **Index:**
  - Left sidebar: "LankaReview Colombo", a "Search Talk" input + red square search button, a red "New Conversation" button, then the **Talk** category list, each with a last-activity time. The active item gets a red left border + gray bg. Categories: All Conversations, Local Questions & Answers, Events, Food, Shopping & Products, Travel, Relationships & Dating, Humor & Offbeat, Entertainment & Pop Culture, Sports, News & Politics, Family & Parenting, Shout-Outs, Site Questions & Updates, Other.
  - Top-right city switcher.
  - Thread rows: 60px avatar | **blue title** + "by Name" | "Category · N replies" right-aligned | excerpt | "time by Name".
- **Thread:**
  - Red H1 title, "in {Category}", "✉ Email me about updates", "🏳 Report conversation as inappropriate".
  - Posts: avatar + blue name + city + 👥 friends / ★ reviews counts | message | date | flag icon.
  - "This user's account has been closed." rows; a Reply box.
- Add **moderation**. Yelp's live Talk is full of spam (exam dumps, fake reviews), so ship rate limits and a report queue on day one.

### 4.17 Events `/events` and `/events/[slug]` 🟥 P2 (legacy style)

- **Index:**
  - "LankaReview Colombo" + city links.
  - Red H "**Official LankaReview Event**" + red "Create an Event".
  - Featured event card: image | title, 📅 date and time, 📍 venue, excerpt, category, "111 interested".
  - Right "**Browse Events**" list with blue icons: Festivals & Fairs, Food & Drink, Nightlife, Music, Performing Arts, Official Events, Visual Arts, View All.
  - "Popular Events" + "See Events For: Today | Tomorrow | This Weekend | This Week | Next Week | Jump to Date »" + image cards.
  - Then Upcoming, Official, Recently Added, Event Updates, and a Jump to Date calendar.
- **Detail:**
  - H1 + category links.
  - Card: image | venue (link, stars, reviews, address, phone), From/To + "Add to Calendar ▾", price ("Free") | map.
  - "What/Why:" text.
  - Right column: "Are you interested?" + a red **RSVP**; "Who Wants In? 110 responses" avatars.
  - Then Discuss This Event, Submitted by, Nearby businesses, Other events this week.

### 4.18 Cost guides `/costs` and `/costs/[service]` 🟥 P1

- **Index:**
  - Hero H1 "**Find cost estimates of hundreds of services**" + text + an illustration of 3 workers.
  - "Popular cost guides": a 4-column grid of bordered cards (bold name + →, "Cost guide").
  - "How are cost estimates calculated?"
  - "Popular cost guides in popular cities".
  - "All cost guides" grouped: Home Services, Local Services, Automotive, Event Planning, Pets, Professional Services, Financial Services, Hotels & Travel, Shopping.
- **Detail:**
  - Gray hero band: H1 "**How much do movers cost?**", "Based on {n} real quotes from businesses in Sri Lanka."
  - **Price range bar:** a full-width green gradient bar with ▼ markers at **low Rs 9,500 / TYPICAL Rs 12,800** (dark tooltip chip) **/ high Rs 19,900**.
  - Postal code input + red "Get custom quotes"; a disclaimer.
  - Breadcrumb "How Much Does It Cost? › Movers Cost"; "Written by {author}".
  - Article H2s: Why do I need…, What do they do?, How much does it cost…, Pricing factors, Cost saving strategies, How are estimates calculated, How does hiring work.
  - "{Service} businesses near you" cards.

### 4.19 Elite `/elite` 🟥 P2

A red brand page: a 4-photo strip; a big "YES! ELITE SQUAD" style logo block (original design); "Say YES! to LankaReview Elite Squad"; sections Perks, How to join, New badge, Past events, Elite stories, We've got your back.

### 4.20 Quote request wizard `/quote` (from "Get pricing & availability", "Get started", "Get custom quotes") 🟥 P1

A multi-step modal:
1. Service type.
2. Job details (chips + text).
3. When (dates).
4. Location (postal code).
5. Photos (optional).
6. Contact (phone OTP).
7. Pick up to 5 matching pros.
8. Confirmation.

Businesses receive leads in their dashboard (§4.22).

### 4.21 LankaReview for Business site `/business-owners/*` 🟥 P1

- **Own header:** "logo **for business**", Products ▾ | Solutions ▾ | Resources ▾ | Log in | red "**Verify my free listing**" | 🔍.
- **Landing `/business-owners`:**
  - A pink stat strip ("X people visit LankaReview each month | 82% of users hire or buy…").
  - Hero "**It's free to be on LankaReview**" with a business-name search box between illustrations.
  - Sections: Claim your free page, Ads, AI phone host, CTA, Download our app.
- **`/business-owners/ads`:** "Drive more leads. Advertise your business on LankaReview." + red Get started + a phone mockup of a sponsored card; benefits; "Customize your ad"; ad goal; target audience.
- **`/business-owners/restaurants`:** a teal announcement bar; a full-bleed food photo hero with a white card "Fill your tables and keep them full" + an email step form (1/3) + red Next.
- **`/business-owners/guest-manager`**, **`/resources`** ("Select your business type": 4 circular icons Small business / Restaurant / Large business / Agency, then a resource library), **`/partners`**, **`/api`** (Places API plans Premium / Enhanced / Base + pricing calculator + FAQ).
- **Business login `/business-owners/login`:** "Welcome back", Email address, Password, Forgot password?, red Continue, or, Google, Apple, "Don't have an account? Claim your business"; a support phone number top-right.
- **Business Help Center `/business-owners/support`:** "How can we help your business?", Popular articles, Browse by topic (Account Management, Business Page, Advertising, Reviews, Billing & Payments, Reporting an Issue).

### 4.22 Add / Claim a business `/claim` → `/claim/provide-email` → … 🟥 P0

- A **split wizard**: left form ~50%, right illustration or preview.
- **Step 1:** "**Hello! Let's start with your business name!**" + "Search or add your business name." + a typeahead input. The dropdown lists matching businesses (to claim) plus the last option "🏪+ **{typed name}** · Add business with this name". Right side: illustration + stat card "An average of X people visit LankaReview each day".
- **Step 2:** "← Back", "**Now, let's add your business email**", Email input + helper "It won't be shared publicly or displayed on your page.", red Continue. **The right side becomes a LIVE PREVIEW wireframe of the business page** as it's being built (name, empty stars, Write a Review / Add Photo / Share / Save, About the Business, Get Directions).
- **Steps 3+:** phone OTP → address + map pin → categories → hours → photos → done → **owner dashboard**. The dashboard covers: page editor, respond to reviews, updates posts, leads inbox, stats.

### 4.23 Informational and corporate pages 🟥 P2 (simple static pages, but build them in Yelp's layout)

1. **`/about`:** a full-width photo hero with the overlay H1 "LankaReview connects people with great local businesses." + 4 link cards (Careers, Newsroom, Investor Relations, Trust & Safety), each with a 1-line description.
2. **`/guidelines`:** standard header. A **left sidebar** "About LankaReview" nav (About Us, Management, Advertiser FAQ, Careers, Press, Content Guidelines [active gray], Support). Main: H1 (Poppins 48), "General Guidelines", and a bullet list with bold lead-ins (Relevance, Inappropriate content, Conflicts of interest, Privacy, Promotional content, Post your own content), then Additional Guidelines.
3. **`/terms`, `/privacy`:** a **red top bar** with a white logo + Home | Job Openings | Who We Are; gray background; a centered white document card with H1, "Last Updated…", and a numbered Table of Contents that anchor-links to sections. "Ad Choices" links to the ToS anchor.
4. **`/support` Help Center:**
   - Header "logo Support Center".
   - **Left nav list**: For Consumers, Reviews & Photos, Updating Business Information, For Business, Advertising, Claiming your Business Page, Guest Manager, Recommended Reviews, Elite Squad, Legal Questions, Searching, Developers, Terms of Service.
   - Main: "**How can we help?**" + a search input + red Search; 6 popular question links in 3 columns; 2 illustrated cards (For Consumers / For Business).
   - Article template `/support/article/[slug]`: breadcrumb + H1 + body. Use it for the **Accessibility Statement** and **Your Privacy Choices** (sections: We do not sell your personal information, Managing sensitive personal information, Opting out of targeted advertising).
5. **`/trust`:** own subnav (Recommendation software, Consumer Alerts ▾, Content moderation, Business insights ▾, Trust & Safety Report). Hero "**Earning your trust. Always.**" as a white card over a gray illustrated town, with a red storefront + shield icon. Sections: Reputation matters, Authenticity & reliability, Fighting misinformation, Data you want to know.
6. **`/mobile`:** a QR code in a red rounded frame; "Heading out? Bring LankaReview with you. Scan the QR code to get started"; a 2×3 feature list with icons (View menu, Write & read reviews, Order takeout, Browse nearby, Add & view photos, Waitlist); App Store + Google Play badges; 2 phone mockups.
7. **`/developers`:** header "logo **for developers**"; a gray hero with an illustration + share icons (Facebook, X, LinkedIn); a 3-column product link grid (Places API, Open Source, Engineering, Knowledge, Transactions, Advertising); Engineering News.
8. **`/rss`:** legacy simple page: H "RSS and Atom Feeds", bullets, red "Your feeds", "Log in to see more feeds!". Actually generate `/rss/reviews/[city].xml`.
9. **`/blog`** (can be external or MDX): minimal nav (News | Businesses | Community | Life at LankaReview | LankaReview.lk | For Business); a big featured post; Recommended topics; "Latest in …" rows.
10. **Careers / Press / Investor Relations:** on Yelp these are separate sites (yelp.careers, yelp-press.com, yelp-ir.com). For LankaReview, make **simple single pages** (`/careers`: mission, values, open roles; `/press`: featured news + latest list + media assets) and **omit Investor Relations** unless you actually need it.
11. **404 (`app/not-found.tsx`):**
    - A **minimal header** (logo, compact search "kottu, cheap dinner, Ministry of Crab" / "address, neighborhood…", For Business, Contact us).
    - Left text: H "We're sorry. We can't find the page you're looking for." + "Please try a new **search**." (link).
    - Right: a large original illustration.
    - A slim footer (Discover / About lists).

### 4.24 Deliberately not cloned

**RepairPal** (repairpal.com: home, auto-repair-near-me, estimator, recalls, symptoms, problems) is a separate Yelp-owned car-repair brand. I crawled all 6 pages, but don't clone it. Replace its footer column with "Popular in Sri Lanka" (§2.2). If you want the idea later, the useful pattern is a **repair cost estimator by make/model + certified shops**, which suits Sri Lanka's three-wheeler and car market.

---

## 5. Interactions and micro-behaviours (all observed on Yelp)

1. Header mega-menus open on **hover** (150ms delay) and close on mouse-leave. The business dropdown opens on **click**.
2. The "what" placeholder **rotates**. The × clear appears once there's text. Autocomplete shows categories, businesses and recent searches.
3. The header compacts on scroll (category row hides). The filter chip row sticks under it on search.
4. The hero carousel auto-advances with a progress fill, is **pausable**, and each bar is clickable.
5. Result photo carousels show ‹ › on hover. Hovering a row highlights its map pin and vice versa.
6. The business page is a modal over search (intercepting route). "← Back to Search" restores scroll position.
7. "See hours" smooth-scrolls to `#location-and-hours`. "N More Attributes" expands inline.
8. Star hover shows color fill + tooltip labels. Clicking a star on `/writeareview` navigates to the form with `?rating=N`.
9. Review drafts autosave ("Saved"). Warn with "Leave site?" on navigation.
10. Every logged-out social action opens the **login-wall modal** instead of failing.
11. Cookie banner on the first visit.
12. Ratings everywhere use the **tier color of the overall score**, not a fixed yellow.

---

## 6. Responsive rules (Yelp desktop doesn't reflow, so you must design this yourself)

yelp.com's desktop site overflowed horizontally at 500px; Yelp serves phones a separate mobile site and app. Build real responsive layouts:

- **< 768px:**
  - Header: logo + 🔍 (opens a full-screen search sheet with both inputs) + ☰ (drawer with the categories, For Business, Write a Review, Log In / Sign Up, language).
  - Hero: 420px tall, 32px headline.
  - Recent Activity: 1 column. Categories: 2×4.
  - Search: list only, with a floating "Map" toggle; filters in a bottom sheet.
  - Business page: full page, not a modal. The sidebar cards move under the header as a horizontal action bar (Call, Directions, Website, Save), and "Make a reservation" / "Get pricing" becomes a sticky bottom CTA.
- **768–1199px:** 2-column where Yelp uses 3; the map on search is 40%.
- **≥ 1200px:** exactly as specified above.

---

## 7. Accessibility and SEO

- `aria-label` on every star rating; visible focus rings; modals trap focus and restore it on close; icon buttons get labels.
- Lighthouse Accessibility ≥ 90 on the homepage, search and business pages.
- JSON-LD `LocalBusiness` + `AggregateRating` + `Review` on business pages; `BreadcrumbList` on search and questions pages.
- `sitemap.xml` and `robots.txt` (both **404 today**).
- `hreflang` for en / si / ta.

---

## 8. Remove or replace in the current clone

- The orange primary color, and the Inter/Geist-only typography.
- The "Trending Near You / Top Rated this month / New Businesses" carousels. They're clipped at the container edge, have no arrows, and "Top Rated" holds 1 card.
- The flat 20-tile gray category grid with duplicate icons (utensils ×3, sparkles ×3, wrench ×3).
- Green/gray "Open now"/"Closed" pills.
- Slug chips (`home-services`).
- Duplicate "Hours" labels and the collapsed hours.
- "Report photo" text overlays, and black image fallbacks.
- "Add a business" → `/login`. It should go to `/claim`.
- Test data strings (`mu3…`).
- The page `<title>` "localhost".
- The Next.js dev "N" badge must not ship in production.

---

## 9. Suggested route map (App Router)

```
app/
  page.tsx                          (home)
  [city]/page.tsx                   (city home)
  locations/page.tsx
  search/page.tsx
  business/[slug]/page.tsx
  business/[slug]/photos/page.tsx   (+ ?select=)
  (.)business/[slug]/page.tsx       (intercepted modal from /search)
  questions/[slug]/page.tsx
  questions/[id]/[qslug]/page.tsx
  not_recommended_reviews/[slug]/page.tsx
  writeareview/page.tsx
  writeareview/biz/[id]/page.tsx
  login/page.tsx   signup/page.tsx
  user/[id]/page.tsx   saved/page.tsx   messages/ notifications/ settings/
  projects/page.tsx   quote/(wizard)
  collections/page.tsx   collection/[id]/[slug]/page.tsx
  talk/page.tsx   topic/[slug]/page.tsx
  events/page.tsx   events/[slug]/page.tsx
  costs/page.tsx   costs/[service]/page.tsx
  elite/page.tsx
  claim/page.tsx   claim/provide-email/page.tsx   claim/[...step]/
  business-owners/(landing, ads, restaurants, guest-manager, resources, partners, api, login, support, dashboard/*)
  about/ guidelines/ terms/ privacy/ support/ support/article/[slug]/ trust/ mobile/ developers/ rss/ blog/ careers/ press/
  not-found.tsx   sitemap.ts   robots.ts
```

---

## 10. Shared data shown on cards (exact formats)

- Review count: `1.8k reviews`, `2.6k reviews`, `(1 review)`.
- Price: `$`–`$$$$` (tooltip gives the LKR range).
- Time: "1 minute ago", "13 minutes ago", "4 days ago", "1 week ago", "7 months ago", "1 year ago". Absolute dates: "Sep 19, 2026".
- Hours: "Closed until 11:00 AM tomorrow", "Open until 2:00 AM", "Closed 11:00 AM - 2:45 PM, 5:00 PM - 8:45 PM".
- Photos: "See all 11k photos", "373 Photos • 261 Reviews".

---

## 11. Definition of done

- [ ] At 1440px, the homepage, a search page and a business page, side by side with yelp.com, match in structure, section order, fonts, colors, spacing, header behaviour and footer.
- [ ] Every route in §9 renders (no 404s except the intentional one), with realistic seeded data.
- [ ] 0 images with `naturalWidth = 0`; no black image boxes anywhere.
- [ ] Every business shows square star boxes in tier colors + review counts; review breakdown bars work.
- [ ] No slugs, test strings or "localhost" titles visible.
- [ ] The search map renders numbered pins synced with the list; service searches show the quote card.
- [ ] The business page opens as a modal from search and as a full page directly; the sticky sidebar works; the Share / Save / login-wall modals work.
- [ ] The write-a-review flow works end to end (landing → stars → form → autosave → post).
- [ ] The add/claim wizard shows a live preview; the owner dashboard exists.
- [ ] Mobile (390px) has no horizontal scroll, and the drawer, search sheet and map toggle work.
- [ ] Lighthouse Accessibility ≥ 90; JSON-LD valid; sitemap and robots present.

---

## 12. Build order

- **Phase 1 (P0, core Yelp experience):** §1 design system → §2 shared components → §3 data fixes and seed → Home (4.1) → Search (4.4) → Business page + reviews + photos (4.5–4.7) → Write a Review (4.10–4.11) → Login/Signup (4.12) → Add/Claim (4.22) → 404 + footer pages linked from the footer (stubs are OK).
- **Phase 2 (P1):** city pages, questions, user profile + saved/messages, projects + quote wizard, collections, cost guides, the for-business site + owner dashboard.
- **Phase 3 (P2):** talk, events, elite, locations, not-recommended reviews, corporate, legal and support pages, blog/careers/press.

Commit after each page and show me a side-by-side screenshot versus yelp.com before moving on.
