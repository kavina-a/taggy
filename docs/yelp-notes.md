# Yelp crawl notes (2026-09-24, 1440px, logged out)

## Global
- Header on home: transparent over hero, white text. Row1: logo | search (what + where + red square btn) | Yelp for Business ▾ | Write a Review | Start a Project | Log In (outlined pill) | Sign Up (red pill). Row2 category nav.
- Header on inner pages: white bg, dark text, bottom border; Log In = light-gray filled pill (#EBEBEB-ish), Sign Up red pill. On scroll the category row hides and header compacts (sticky).
- Search "what" placeholder rotates ("Romantic dinner spots with outdoor seating", "Best brunch spots with a view"); × clear button when typed. Location input placeholder "address, neighborhood, city, state or zip".
- Mega-menus (hover, 3 cols w/ line icons, red underline on active tab, "Explore a City" link at bottom):
  - Restaurants: Takeout, Delivery, Hot & Trendy, New Restaurants, Breakfast & Brunch, Lunch, Dinner, Coffee & Cafes, Pizza, Chinese, Mexican, Bakeries, Italian, Food Trucks, Sports Bars & Pubs
  - Home & Garden: Contractors & Handymen, Plumbers, Electricians, Heating & Air Conditioning, Appliances and Repair, Roofing, Locksmiths, Painters, Landscaping, Nurseries & Gardening, Florists, Tree Services, Home Cleaning, Furniture Stores, Movers
  - Auto Services: Auto Repair, Body Shops, Oil Change, Tires, Towing, Car Wash, Auto Detailing, Parking, Car Dealers, Junkyards
  - Health & Beauty: Dentists, Doctors, Chiropractors, Optometrists, Dermatologists, Podiatrists, Massage, Hair Salons, Nail Salons, Barbers, Spas, Physical Therapy
  - Travel & Activities: Things to Do, Kids Activities & Camps, Venues & Events, Churches, Shopping Malls, Bookstores, Mini Golf, Bowling, Hotels, Taxis, Bike Rentals, Campgrounds, Beaches, Swimming Pools, Bars & Nightlife
  - More: Dry Cleaning, Laundromats, Thrift Stores, Tailors & Alterations, Apartments, Junk Removal, Gyms, Yoga & Pilates, Pet Groomers, Banks & Credit Unions, Real Estate Agents, Parking
- Yelp for Business ▾ (click dropdown w/ icons): Add a Business, Claim your business for free, Log in to Business Account, divider, Explore Yelp for Business
- Cookie consent (OneTrust): "Allow all" / "Cookies Details", Manage Consent Preferences modal
- Footer (all pages): About / Discover / Yelp for Business / RepairPal / Languages ▾ + Cities (Explore a City ▾); copyright line.

## 1. Home /
(see earlier) hero carousel 3 slides w/ vertical progress bars + pause; Recent Activity masonry; Categories 4x2 + More; Explore searches in popular cities (city chips, Top/Trending/Seasonal lists w/ Show more); Recently reviewed businesses; footer.

## 2. Search results /search?find_desc=Restaurants&find_loc=...
- Breadcrumb "Restaurants"; H1 "Top 10 Best Restaurants Near San Francisco, California (Updated 2026)"; Sort: Recommended ▾ (i)
- Filter pill row (sticky on scroll): [≡ All] [Price ▾] Open Now, Reservations, Offers Online Waitlist, Offers Delivery, Offers Takeout
- "All" opens Filters panel: Price ($..$$$$ segmented), Suggested (Open Now w/ current time, Reservations, Waitlist, Delivery, Takeout, Good for Dinner), Dietary Restrictions (Halal/Vegan/Vegetarian/Kosher), Category (6 + See all), Features (Outdoor Seating, Good for Lunch, Kids, Groups, Dogs Allowed, Full Bar + See all), Distance radios (Bird's-eye View, Driving 5mi, Biking 2mi, Walking 1mi, Within 4 blocks)
- "Sponsored Results" block (3) at top and mid-list; organic list numbered 1-10
- Result row: 245px square photo carousel w/ < > arrows | H3 "1. Name" (Poppins ~22px bold) | star boxes + "4.3 (1k reviews)" | pin icon Neighborhood • $$ • Closed(red) until 11:00 AM tomorrow | feature highlights w/ colored icons ("Outdoor seating • Locally owned & operated (i)") | "Waitlist opens at 11:00 am" | speech-bubble icon + quoted review snippet + "more" | category pill chips (outlined, rounded) | red CTA right ("Order", "View Website") | divider
- Right column: sticky map (~35% width) with numbered red pins, "Redo search as map moves" checkbox, expand ⤢, +/- zoom
- Variant layout (seen behind biz modal): LEFT filter sidebar always visible (Filters, $ $$ $$$ $$$$ segmented, Suggested checkboxes, Category pill chips + See all, Features checkboxes + See all, Distance radios) | results | map

## 3. Search, home services /search?find_desc=Plumbers
- Breadcrumb "Home Services > Plumbers"; title "... (Updated 2026)"; filter pills: All, Yelp Guaranteed (badge icon), Open Now, Fast-responding, Request a Quote, Virtual Consultations
- Result cards are BORDERED boxes (not plain rows): name, category chips, "Serving Oakland and the Surrounding Area" (right-aligned), "Yelp Guaranteed" red badge, ✓ service checklist (Drain installation, Drain repair…), description + more, "You can request a quote from this business", "↗ 30 locals recently requested a quote", red "Get pricing & availability" btn with chat icon; badges like "Verified License"
- RIGHT sidebar (instead of map): card "Free quotes from local professionals" — "Tell us about your project…", What do you need? (Select job type ▾), When do you need it? (Select date(s) ▾), Enter ZIP code, red "Get started"
- Below: Ask locals Q&A, Can't find the business?, Related Searches, More Plumbing in SF, Trending Searches; "Help us improve." feedback

## 4. Business page (restaurant) /biz/dragon-beaux-san-francisco
- Opens as a LARGE MODAL over search results: top bar "← Back to Search" | yelp logo centered | ✕ close. (Direct load also shows it this way.) Title tag: "NAME - Updated September 2026 - 10540 Photos & 2645 Reviews - address - Category - Restaurant Reviews - Phone Number - Yelp"
- Photo header ~430px: horizontal strip of photos, < > arrows, dark gradient; overlaid white: H1 name (Poppins ~56px bold), 5 star boxes + "4.0 (2.6k reviews)", ✓ Claimed (blue) • $$ • Dim Sum, Hot Pot; "Closed 11:00 AM - 2:45 PM, 5:00 PM - 8:45 PM" + outlined "See hours" pill + "ⓘ Updated 3 weeks ago"; "See all 11k photos" pill bottom-right
- Action row: red "☆ Write a review", gray pills "📷 Add photos/videos", "Share", "Save", "+ Follow"
- "Do you recommend this business?" Yes / No / Maybe pills
- Sections (left col ~2/3): Updates From This Business (horizontal cards w/ image, title, excerpt, read more) → Menu: Popular Dishes carousel (square photo, dish name, "373 Photos • 261 Reviews"), "View full menu >", "Website menu" → What's the vibe? (Inside / Outside / All photos tiles w/ counts + chips Casual, Moderate noise, Good for kids, Good for groups) → People also searched for (chips) → Location & Hours (static Google map + address link + neighborhood + "Get directions" btn | hours table Mon–Sun, today row w/ red "Closed now"; "Suggest an edit") → Amenities and More (icon grid 2 cols: Health Score Pass, Takes reservations, Offers delivery, Offers take-out; "33 More Attributes" pill) → About the Business (owner text, Read more) → Ask the Community (Ask a question btn; Q:/A: items, "1 person found this helpful", "See 4 more answers") → Recommended Reviews → Collections Including X (cards w/ count, title, By user) → Best of / People found X by searching for… / Browse Nearby / Trending Searches / Other Places Nearby / Related Searches (link lists) → People Also Viewed (biz cards w/ rating, $$, categories)
- Recommended Reviews detail: blue info banner "Your trust is our priority… Learn more about reviews." (dismiss ✕); your-review card (avatar placeholder, Username, Location, 0/0/0 stats | empty 5 star boxes "Select your rating", "Start your review of Dragon Beaux"); Overall rating block (big stars + "2645 reviews") + 5→1 star horizontal bars in rating colors; controls: "Yelp Sort ▾", "English (2637) ▾", "Filter by rating ▾", Search reviews input w/ icon; each review: 48px avatar, Name, City, "8 Hot Pot reviews" badge, ••• menu; stars + date; "3 photos • 1 check-in"; full text; photo row 3 thumbs; reaction circle buttons Helpful/Thanks/Love this/Oh no with counts; pagination 1..9 "1 of 264"; "116 other reviews that are not currently recommended"
- RIGHT sticky sidebar: Make a reservation card (date ▾, time ▾, party size ▾, outlined "Find a Table"); red "Order takeout or delivery ↗"; "Takeout available" card + red "Order now"; info card rows w/ right icons: website link ↗, phone ☎, "Get Directions" + address ◇, "Message the business" 💬; outlined "✎ Suggest an edit"
- Below list: pagination "Next Page"; "Ask San Francisco locals" Q&A (post question input, threads w/ username, Elite 26 badge, time, "View N replies"); "Can't find the business?"; Related Searches; Trending Searches; Seasonal Searches; More Nearby; Browse "Restaurants" near Landmarks; Popular Brands; Search restaurants in popular locations (Nearby cities / Neighborhoods / Streets / Campuses); FAQ accordion.

## 5. Business page (home service) /biz/handyman-heroes-san-francisco-4
- Same modal shell. NO photo header: white header with round business LOGO (100px) left of H1 name (dark), stars + "4.7 (403 reviews)", ✓ Claimed • categories, Closed 8:00 AM - 4:30 PM + "See hours"
- Sections: Updates From This Business (bordered promo card "$149 WATER HEATER SAFETY CHECK…") → Portfolio from the Business (Sponsored; project cards w/ "2 Photos", "More Projects") → Photos & videos (See all 103) → Most mentioned services (cards: "Door Installation 13 Photos 12 Reviews") → Services Offered ("Verified by Business" badge, list + "See 19 More") → About the Business (Business owner information: owner avatar, "Larry S. Business Owner", text) → Location & Hours ("Serving San Francisco Area") → Amenities (ASL proficient, Accepts credit cards, Zelle, Venmo, "4 More Attributes") → Ask the Community → People also searched for → Recommended Reviews → Collections → Browse Nearby → Service Offerings in SF → Related Cost Guides (link list) → People Also Viewed
- RIGHT sticky sidebar = "Get pricing & availability" quote card: Response time 10 minutes | Response rate 100% (green), "What type of service do you need?" radio list (Handyman / Electricians / Plumbing), red "Get pricing & availability", "561 locals recently requested a quote", shield "Covered by Yelp Guaranteed" + text + Learn more; then "Schedule an Appointment!" card
- Search page behind shows service-specific left filters: Featured chips (Open Now, Fast-responding, Request a Quote, Virtual Consultations), Features (Hot and New, Accepts Apple Pay, Dogs Allowed, Appointment Only), Distance

## 6. Photos /biz_photos/{slug} (opens as modal over biz page)
- White modal, "Close ✕" black chip top-right outside. H1 "Photos and videos for Dragon Beaux"; right: "⊕ Add photos" pill + "Search photos" input w/ icon
- Tabs w/ counts (red underline active): All (10605) | Food (9220) | Inside (373) | Menu (286) | Drink (167) | Outside (147) | Videos (65)
- 5-col square grid (~163px), gray skeleton placeholders w/ camera icon while loading
- Photo lightbox (?select=id): black left pane w/ image + "← Back to photos" chip, share + flag icons top-right of image, › next arrow; right white panel: "Photos for Dragon Beaux", "1 of 10605", caption, "Dragon Beaux on Jul 9, 2015" (uploader link), 👍 "41 likes"
- /menu/{slug} redirects to biz page (menu lives in "Popular Dishes" + "View full menu")

## 7. User profile /user_details?userid=… (login-gated for logged-out users)
- Shows skeleton behind a "Sign in to Yelp" modal ("You must log in to view another user's profile page.")
- Layout: LEFT column card: red banner top, big round avatar overlapping, name (Poppins 28), stats skeleton, "Add friend" pill, 3 icon buttons Compliment / Message / Follow; nav list: Profile overview, Reviews, Photos and videos, Ask the community, Collections, Recognitions, Compliments, Friends, Following, Events
- MAIN: Impact (Review reactions, Stats, Compliments cards) → Review distribution (Ratings bars, Top categories, View more) → More about me (Location, Yelping since, View more) → Reviews list
- Login modal: burst logo, "Sign in to Yelp", subtitle, ToS/Privacy text, "Continue with Google", "Continue with Apple" (outlined full-width pills), "or", Email, Password, red "Log in", "Login via email link", "New to Yelp? Sign up"

## 8. Write a Review landing /writeareview
- MINIMAL header: logo + Log In + Sign Up only (no search, no category nav)
- Hero: H1 "Find a business to review" + "Review anything from your favorite patio spot to your local flower shop." + combined search (Search for a business | San Francisco, CA | red btn); illustration right (person with giant pencil + star banner)
- "Visited one of these places recently?" 2-col grid of horizontal cards (photo left ~120px, name, ✕ dismiss, "Do you recommend this business?" Yes/No/Maybe pills OR 5 empty star boxes). Hovering stars fills them in rating color + tooltip label (1 Not good, 2 Could've been better, 3 OK, 4 Good, 5 Great)

## 9. Write a Review form /writeareview/biz/{id}?rating=4
- Minimal header. Center column ~340px: biz thumb + name + "Union Square, San Francisco"; divider; "How would you rate your experience?" + 5 large star boxes + label ("Good"); "Tell us about your experience"; "A few things to consider in your review" + gray topic chips Food / Service / Ambiance; big textarea "Start your review…"; helper "Reviews need to be at least 85 characters."; autosave "Saved"; red pill "Post Review"
- RIGHT collapsible drawer (› toggle): "Recent reviews" of this biz (avatar, name, 3 mini stats, stars, date, text, Read more)

## 10. Log in /login
- Minimal header (logo only). 2 columns: form ~300px left (red "Log in to Yelp" title, ToS text, Continue with Google, Continue with Apple, OR divider, Email, Password, red "Log In", "Login via email link", "New to Yelp? Sign up") | round storefront illustration right (red carpet)

## 11. Sign up /signup
- Same layout: red "Sign Up for Yelp", "Connect with great local businesses", ToS, Google, Apple, OR, First Name | Last Name (2-col), Email, Password, ZIP Code, red "Sign Up", "Already on Yelp? Log in"

## 12. Start a Project /projects ("Yelp Projects Workspace")
- Standard header. H "Project Ideas" + red pill "✦ Get help with Yelp Assistant" (AI chat) top-right
- "Hire a local pro today": row of 7 icon shortcuts separated by thin vertical dividers (Movers, Home cleaning, Plumbers, Appliance repair, Electricians, Auto detailing, More)
- Themed carousels with ‹ › buttons: "Make your home your happier place" (numbered cards 1–5 with big white number over photo, title, gray pill "Find kitchen pros"), "Create a backyard retreat" (… "Find deck pros", "Find fire pit pros"), etc.

## 13. Explore a City /locations
- LEGACY header style (older: square red "Sign Up", white bordered "Log In", nav only Restaurants/Home Services/Auto Services/More)
- Red H "More Places to Yelp", 4-col list grouped by state code (AZ, CA, CO, NV, NY, OH, OR, PA, RI, SC, TN…), blue links. Title "Browse 157 cities on Yelp"

## 14. City home /sf
- Same as homepage (hero carousel etc.) but sections: Recent Activity → Categories → Top Searches in SF → Trending → Seasonal (4-col link lists + Show more ▾) → "Explore Neighborhoods around San Francisco" (Castro, Inner Sunset, Inner Richmond, Pacific Heights, Outer Sunset, Noe Valley, Hayes Valley, The Haight, Union Square, Financial District, Mission, Japantown + Show more) → "Recently reviewed businesses around SF"
- Hero slides: "Leave it to the pros"/Handyman, "Say farewell to dead branches"/Tree services, "Tell pests to bug off"; slide tabs have aria "Select slide N"

## 15. Category browse /c/sf/restaurants → redirects to /search (same template). Map now rendered: Google map right ~40%, numbered red teardrop pins for 1–10, teal star pins for sponsored, dark tooltip "Expand the map to get a better look at the businesses near you." ✕, "Search as map moves", expand ⤢. Sponsored card can include a deal inset box ("Doritos Hot Honey Chicken Nachos… Read more" + thumbnail)

## 16. Collections /collections
- H1 "Collections" (Poppins ~48), tabs Discover | My Collections | Following Collections (red underline), red pill "Create a Collection"
- "Collection in San Francisco, CA" + location input w/ search btn
- Carousels: Featured, Good for Brunch, Coffee & Tea, Desserts — card = mosaic (1 large + 3 small photos) with bookmark + count "50" overlay, title bold, 2-line description, "By Yelp"

## 17. Collection detail /collection/{id}/{slug}
- SPLIT layout: left ~50% (photo mosaic header 1 big + 4 small w/ "🔖 50"; breadcrumb Discover > name; "989 Followers" · "Last Updated 9/19/2026"; H1; description; curator avatar + name + mini stats; red "Follow Collection" btn; Embed Collection, Report Collection; "50 Places" + Sort by Recently Added; list items: name, stars + (N reviews), $ categories, city, optional quote "Sean m. says: …") | right ~50% full-height map w/ red Yelp-burst pins

## 18. Talk /talk (LEGACY design)
- Left sidebar: "Yelp San Francisco", Search Talk input + red square search btn, red "New Conversation" btn; "Talk" category list w/ last-activity time (All Conversations, Local Questions & Answers, Events, Food, Shopping & Products, Travel, Relationships & Dating, Humor & Offbeat, Entertainment & Pop Culture, Sports, News & Politics, Family & Parenting, Yelper Shout-Outs, Site Questions & Updates, Other); active item has red left border + gray bg
- City switcher top-right (New York, San Jose, LA, Chicago, Palo Alto, Oakland, ▸ More Cities)
- Thread rows: 60px avatar | blue title + "by Name" | category · "N replies" right | excerpt | "time by Name"

## 19. Talk thread /topic/{slug}
- Red title, "in Category"; "Email me about updates", "Report conversation as inappropriate"; posts: avatar + name (blue) + city + 👥 friends + ★ reviews counts | message text | date | flag icon; "This Yelper's account has been closed." rows; Reply btn

## 20. Events /events (LEGACY)
- "Yelp San Francisco" + city links; "Official Yelp Event" red header + red "Create an Event"; featured event card (image | title, date, venue, excerpt, category, "111 interested"); right "Browse Events" list with blue icons (Festivals & Fairs, Food & Drink, Nightlife, Music, Performing Arts, Official Yelp Events, Visual Arts, View All)
- "Popular Events" + "See Events For: Today | Tomorrow | This Weekend | This Week | Next Week | Jump to Date »" + image cards; Upcoming Events; Official Yelp Events; Recently Added; Event Updates; Jump to Date calendar

## 21. Event detail /events/{city}-{slug}
- H1 title + category links; card: image | venue (link, stars, reviews, address, phone), From/To dates + "Add to Calendar ▾", Free | map; What/Why text; right: "Are you interested?" + red RSVP; "Who Wants In? 110 responses" avatars; Discuss This Event; Submitted by; Nearby businesses; Other events this week

## 22. Cost guides /costs
- Hero: H1 "Find cost estimates of hundreds of services" (Poppins ~48) + text + illustration of 3 workers
- "Popular cost guides" 4-col bordered cards (name bold + → arrow, "Cost guide" label); "How are Yelp's cost estimates calculated?"; "Popular cost guides in popular cities"; "All cost guides" grouped: Home Services, Local Services, Automotive, Event Planning & Services, Pets, Professional Services, Financial Services, Hotels and Travel, Shopping

## 23. Cost guide detail /costs/movers
- Gray hero band: H1 "How much do movers cost?", "Based on 3,361,582 real quotes…", PRICE RANGE BAR: green gradient bar with ▼ markers at low $95 / TYPICAL $128 (dark tooltip chip) / high $199; zip input + red "Get custom quotes"; disclaimer
- Breadcrumb "How Much Does It Cost? > Movers Cost"; author "Written by Jam Brown"; article H2s (Why do I need…, What do movers do?, How much does it cost…, Pricing factors, cost saving strategies, How are estimates calculated, How does hiring work); "Movers businesses near you" cards

## Footer / corporate pages
24. /about — hero photo w/ overlay H1 "Yelp connects people with great local businesses." + 4 link cards (Careers, Newsroom, Investor Relations, Trust & Safety) each with 1-line description
25. /careers/home → www.yelp.careers (separate site): H1 mission, "You're in good company", remote workplace, values (Be tenacious., Play well with others., Be unboring., Protect the source., Authenticity.), Explore jobs in your country, Life at Yelp
26. /press → yelp-press.com Newsroom: own header (logo + "Newsroom", About Us | News | Reports ▾ | Company ▾ | Press Releases), split hero (image | featured headline + date + Read more), "Latest news" + Category filter, Get in touch, Media Assets
27. Investor Relations → yelp-ir.com: header w/ Overview, Financials, Events & Presentations, News, Governance, Impact, Investor Resources; hero photo + stock ticker card (NYSE: YELP $17.73, red change); Quarterly Results, Recent News, Email Alerts
28. Trust & Safety → trust.yelp.com: own nav (Recommendation software, Consumer Alerts ▾, Content moderation, Business insights ▾, Fostering Competition, Trust & Safety Report); hero "Earning your trust. Always." white card over gray illustrated town + red storefront shield icon; sections Reputation matters, Authenticity & reliability, Fighting misinformation, Data you want to know
29. /guidelines Content Guidelines — standard header; LEFT sidebar "About Yelp" nav (About Us, Management, Board of Directors, Advertiser FAQ, Sales Force Policy, Careers, Press, Investor Relations, Content Guidelines [active gray bg], Support); main H1 (Poppins 48) + "General Guidelines" bullet list with bold lead-ins (Relevance, Inappropriate content, Conflicts of interest, Privacy, Promotional content, Post your own content…) + Additional Guidelines
30. Accessibility Statement → yelp-support.com article (support layout below)
31. Terms of Service (/static?p=tos = also "Ad Choices" link) → terms.yelp.com: RED top bar with white logo + Home | Job Openings | Who We Are; gray bg, white centered doc card, H1 + ToC list
32. Privacy Policy → terms.yelp.com/privacy: same legal layout, "Last Updated…", numbered Table of Contents (13 items)
33. Your Privacy Choices → support article (Yelp Does Not Sell Your Personal Information, Managing Sensitive PI, Opting-Out of Targeted Advertising)
34. /collections, /talk, /events, /costs — see above
35. Yelp Blog → blog.yelp.com: minimal nav News | Businesses | Community | Life at Yelp | Yelp.com | Yelp for Business; big featured post; Recommended topics; Latest in News / Community / Life at Yelp rows
36. Support → yelp-support.com: "yelp✱ Support Center" header; LEFT nav list (Yelp For Consumers, Reviews & Photos, Updating Business Information, Yelp for Business, Advertising on Yelp, Claiming your Business Page, Yelp Guest Manager, Recommended Reviews, Yelp Elite Squad, Legal Questions, Searching Yelp, Yelp for Developers, Terms of Service); main "How can we help?" + search input + red Search btn; 6 popular question links (3 cols); 2 illustrated cards (Yelp For Consumers / Yelp for Business). Article: breadcrumb + H1 + body
37. /yelpmobile → /mobile: QR code in red rounded frame, H "Heading out? Bring Yelp with you. Scan the QR code to get started", feature list w/ icons (View menu, Write & read reviews, Order take out, Browse nearby, Add & view photos, Waitlist), App Store + Google Play badges, 2 phone mockups
38. /developers — own header "yelp✱ for developers" + Log In/Sign Up; gray hero w/ illustration + "yelp developers" + share icons (Facebook, X, LinkedIn); 3-col product links (Yelp Places API, Open Source, Engineering, Knowledge, Transactions, Advertising); Engineering News
39. /rss — LEGACY simple page: H "RSS and Atom Feeds", bullets, red "Your Yelp feeds", "Log in to see more feeds!"
40. /elite (→ /elite/other) — red brand page: 4-photo strip, big "YES! YELP ELITE SQUAD" logo, "Say YES! to Yelp Elite Squad"; sections Perks, How to join, New badge, Past events, Elite stories, We've got your back!

## Yelp for Business pages
41. business.yelp.com — own header ("yelp for business": Products ▾ | Solutions ▾ | Resources ▾ | Log in | red "Verify my free listing" | search); pink stat strip (74+ million people visit Yelp each month | 82% of users hire or buy…); hero "It's free to be on Yelp" w/ business-name search box between B&W+red illustrations; sections Claim your free page, Yelp Ads, Yelp Host, CTA, Download our app. Products menu: Yelp Business Page, Yelp Ads, Upgrade Package, Request a Quote, Leads API, Partner Hub/APIs, Yelp Host (New), Guest Manager, Places/Insights/AI API, Yelp Audiences
42. biz.yelp.com/login — "Welcome back", Email address, Password, Forgot password?, red Continue, or, Google, Apple, "Don't have an account? Claim your business on Yelp"; phone number top-right
43. /products/yelp-ads — hero "Drive more leads. Advertise your business on Yelp." + red Get started + phone mockup of sponsored card; benefits list, "Customize your ad", ad goal, target audience
44. /restaurants — teal announcement bar (Yelp Host), full-bleed food photo hero w/ white card "Fill your tables and keep them full" + email step form (1/3) + red Next; Restaurant solutions, Why Yelp for Restaurants
45. Yelp Guest Manager product page — "List your tables everywhere…", features, pricing
46. /resources — "Business Resources", "Select your business type" 4 circular icons (Small business, Restaurant, Large business or brand, Advertising agency), resource library
47. /partners — agency program page
48. Places API (/data/products/places-api) — plans Premium/Enhanced/Base, pricing calculator, FAQ
49. Insights API page — same template
50. AI API page — "Spark a conversation", natural language search, pricing, FAQ
51. Business Support → biz.yelp.com/support-center: "How can we help your business?", Popular articles, Browse by topic (Account Management, Yelp Business Page, Advertising, Reviews, Billing & Payments, Reporting an Issue)
52. Add a Business / Claim → biz.yelp.com/claim: SPLIT wizard — left: H "Hello! Let's start with your business name!" + typeahead input (dropdown option w/ store+ icon "Name — Add business with this name") | right: illustration + stat card "An average of 2.4 million people visit Yelp each day". Step 2 /claim/provide-email: "← Back", "Now, let's add your business email", Email input + helper "It won't be shared publicly…", red Continue; RIGHT side shows LIVE PREVIEW wireframe of the business page being built (name, empty stars, Write a Review/Add Photo/Share/Save, About the Business, Get Directions). (Stopped here — next steps need a real email.)

## RepairPal (Yelp-owned, separate brand, Cloudflare check first)
53. repairpal.com home — "Quality Car Repair. Fair Price Guarantee." ZIP + vehicle make + → ; nav Find Repair Location, Get an Estimate, Check for Recalls, Your Car ▾, Car Research ▾, For Business ▾
54. /auto-repair-near-me — "AUTO REPAIR NEAR ME", RepairPal Certified Shops
55. /estimator — "Get a free car repair estimate.", FAQs, National Average Repair Estimates, by Make and Model
56. /recalls — "Check and Fix Safety Recalls for FREE", VIN check, Where is my VIN?, Recalls by Make
57. /symptoms — Troubleshooting quizzes, failing auto parts
58. /problems — "Car Problems and Complaints": Make/Model/Year selects + Submit, cards Get Your Car Fixed / Report a Problem, search box, right sidebar link groups

## Extra Yelp consumer templates & states
59. /not_recommended_reviews/{slug} — breadcrumb; gray info box: YouTube video "Why Does Yelp Recommend Reviews?" | explanatory text + Learn more; note "not factored into overall star rating"; H "116 reviews for Dragon Beaux that are not currently recommended"; plain review list
60. /questions/{biz} Ask the Community — breadcrumb; gray biz summary card (photo, name 40px, stars, Claimed, $$, cats, hours | red "+ Ask a question", outlined "See 10,605 photos and videos"); "Ask the community" + Sort by Popular ▾; question cards (bordered, ••• menu, "Asked by X", "No answers yet. Answer this question" or answer preview incl. "Yelp Assistant" AI answers, "See question details"); right card "Can you answer these questions?" w/ Answer pills
61. /questions/{id}/{slug} question detail — breadcrumb 3 levels; card w/ mini biz + H1 question + asked by; "Connect with Dragon Beaux" card + Call btn; "1 Answer" + Sort; answer card "Answered by Yelp Assistant" (red sparkle), Business features, Helpful / Not Helpful, "AI summaries may include mistakes"; "Help out with an answer!" + Post an answer; photos strip; right "Other questions for Dragon Beaux"
62. Unknown location state (/search with unsupported location, e.g. "Colombo 10290", also where /nearme/* lands) — H "Sorry, but we didn't understand the location you entered." + "Did you mean one of these previous locations?" + "Or choose:" 4-col city list. (Yelp does NOT cover Sri Lanka.)
63. 404 page — minimal header (logo, compact search "tacos, cheap dinner, Max's" / "address, neighborhood…", Yelp for Business, Contact us); H "We're sorry. We can't find the page you're looking for." + "Please try a new search."; big illustration (deep-sea diver + treasure chest); slim footer (Discover / About lists)
64. Share modal (biz) — "Share business" ✕; "Share on Facebook" (blue pill) + "Share on Twitter" (black pill); copy-link field w/ icon; OR; Your Name, Your Email, To (Email addresses), Add a note (optional) textarea; red "Share"
65. Save modal (logged out) — burst logo, "Save Dragon Beaux for later", "Keep track of your favorites on Yelp", ToS text, Continue with Google, Continue with email, "Already on Yelp? Log in"
66. See hours → scrolls modal to #location-and-hours (no separate modal)
67. Amenities expand ("33 More Attributes" → inline expand to 2-col list; available = ✓/icon dark text, unavailable = ✕ gray text; "Show Less")
68. Yelp for Business dropdown (click): Add a Business → biz.yelp.com/claim, Claim your business for free, Log in to Business Account, Explore Yelp for Business
69. Search Sort dropdown: Recommended (active: teal text on light-teal bg) / Highest Rated / Most Reviewed; (i) info icon explains ranking. Price dropdown: checkbox list $, $$, $$$, $$$$ + teal "Save" link
70. Narrow window (500px) check of home: yelp.com desktop does NOT reflow; header overflows horizontally (Yelp serves phones a separate mobile site/app). So for the clone, build real responsive layouts yourself; don't copy Yelp's desktop behaviour at small widths.
