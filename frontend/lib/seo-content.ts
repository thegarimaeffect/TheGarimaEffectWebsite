/**
 * Single source of truth for all SEO subpage content.
 * Pages under /about, /services, /faq, /case-studies, /blog, /contact
 * read from here. Sitemap and JSON-LD are generated from this data.
 */

export const SITE_URL = "https://thegarimaeffect.com";

// ─────────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────────

export type Service = {
  slug: string;
  title: string;
  short: string;
  intro: string;
  body: string[];
  deliverables: string[];
  idealFor: string[];
  engagement: string;
  keyword: string;
};

export const SERVICES: Service[] = [
  {
    slug: "content-strategy",
    title: "Content Strategy",
    short:
      "A research-led roadmap that turns your founder voice into a system anyone in your team can execute.",
    intro:
      "Most brands post a lot. Few brands say something. Content strategy is the layer underneath every reel, caption and funnel — the voice, the pillars, the cadence, the why.",
    body: [
      "The Garima Effect builds your strategy from the inside out — starting with founder interviews, audience listening and competitor teardowns. The output is a single document your whole content team can run on: voice rules, content pillars, story arcs, weekly cadence and a 12-week editorial calendar.",
      "Unlike generic agency strategy decks, ours are tactical. Every line is something the producer, the editor and the founder can act on tomorrow.",
      "We rebuild the strategy every quarter based on real performance — not vibes. If a pillar isn't earning, it gets cut.",
    ],
    deliverables: [
      "Founder + audience voice audit",
      "3–5 content pillars with example posts",
      "12-week editorial calendar",
      "Hook & caption playbook for your team",
      "Performance benchmarks + KPI tracking",
    ],
    idealFor: [
      "Founders who post but don't see growth",
      "Brands with a creative team that needs direction",
      "D2C teams pre-launch / re-launch",
    ],
    engagement: "One-time sprint (4 weeks) or quarterly retainer",
    keyword: "content strategy consultant India",
  },
  {
    slug: "instagram-growth",
    title: "Instagram Growth",
    short:
      "Reels, hooks, posting cadence and DM funnels engineered for compounding follower → customer flow.",
    intro:
      "Instagram growth isn't about going viral once. It's about a repeatable system — hook formula, posting rhythm, story sequence — that turns reach into followers, followers into DMs, and DMs into buyers.",
    body: [
      "We start with a 90-day growth diagnosis: what's working, what's leaking, what's missing. Then we install a hook architecture, a content cadence (3–5 reels/week typically), and an inbound DM script.",
      "Within 60 days most clients see follower-growth velocity 4–8× their pre-engagement baseline, and DM inquiries become a real channel — not an afterthought.",
      "We measure two numbers obsessively: cost per qualified DM, and saved-post rate (the truest signal of audience fit).",
    ],
    deliverables: [
      "Account audit + 30-day growth plan",
      "Reel hook formulas tuned to your category",
      "Posting cadence + content batching system",
      "DM funnel scripts (cold → discovery → close)",
      "Bi-weekly performance review",
    ],
    idealFor: [
      "Founders under 50k followers ready to scale",
      "D2C beauty, wellness, hospitality brands",
      "Service brands using Instagram as primary channel",
    ],
    engagement: "3-month minimum retainer",
    keyword: "Instagram growth strategist India",
  },
  {
    slug: "brand-storytelling",
    title: "Brand Storytelling",
    short:
      "We find the one sentence about your brand no one else can say — then build every asset around it.",
    intro:
      "If your brand sounds like your competitors, the price war wins. Brand storytelling is the work of finding the irreducible difference between your brand and the next one — and saying it in a voice no one else can copy.",
    body: [
      "Through founder interviews, customer research and a teardown of your category's noise, we surface your brand's actual story: why it exists, who it's for, what it stands against, and the metaphor it lives inside.",
      "Then we translate that story into a voice guide, a manifesto, a website hero section, and the opening 30 seconds of every reel.",
      "When the story is right, you stop competing on price. You start being chosen for what you mean.",
    ],
    deliverables: [
      "Brand story document (origin + manifesto + voice)",
      "Anti-positioning — what you're NOT",
      "Tagline + 3 alternates",
      "Voice rules: 5 do's and 5 don'ts with examples",
      "Story-led website hero + about page copy",
    ],
    idealFor: [
      "Pre-launch D2C brands",
      "Brands that sound like everyone else",
      "Founders pivoting positioning",
    ],
    engagement: "2-week intensive",
    keyword: "brand storytelling agency India",
  },
  {
    slug: "reels-production",
    title: "Reels Production",
    short:
      "From concept to edit direction — scroll-stopping reels that actually convert, not just rack up views.",
    intro:
      "Most agencies make beautiful reels that don't sell. We make reels engineered around three things: a hook in the first 1.2 seconds, a payoff that earns the watch-time, and a CTA that turns curiosity into a DM.",
    body: [
      "We work concept → script → shoot direction → edit notes. We don't replace your videographer — we make them ten times more effective.",
      "Every reel script follows our internal hook library (40+ tested formats) and is benchmarked against your top-performing past content.",
      "Output: 8–12 reels/month, each with measurable hypotheses you can test against.",
    ],
    deliverables: [
      "Monthly reel concept calendar",
      "Frame-by-frame scripts",
      "Shot list + edit direction",
      "Hook A/B testing structure",
      "Performance review every 30 days",
    ],
    idealFor: [
      "Brands with in-house creative they want to focus",
      "Founders who want to be on-camera but need direction",
      "Teams ready to commit 8+ reels/month",
    ],
    engagement: "Monthly retainer",
    keyword: "Instagram reels strategy India",
  },
  {
    slug: "sales-funnel-design",
    title: "Sales Funnel Design",
    short:
      "The bridge between attention and revenue — reels → story → DM → checkout, mapped end-to-end.",
    intro:
      "Reach without a funnel is theatre. We design the path from the first scroll-stop to the moment money moves — and we instrument every step so you know where it leaks.",
    body: [
      "Our funnel model: top-of-funnel (reach reels) → mid-funnel (saves, profile visits, story warm-up) → bottom-funnel (DM script or landing page → checkout). Every stage has a metric, a script and a fallback.",
      "We typically rebuild three things: the bio + link-in-bio page, the story-highlight sequence (the silent salesperson), and the inbound DM flow. Combined, these often double conversion without changing ad spend.",
      "If you sell a service: we add a Calendly-style booking layer. If you sell a product: we add a Shopify product-tag layer.",
    ],
    deliverables: [
      "Funnel map (top → bottom) with metrics per stage",
      "Bio + link-in-bio rebuild",
      "Story-highlight architecture (5–7 highlights)",
      "DM nurture scripts",
      "Conversion tracking setup",
    ],
    idealFor: [
      "D2C brands with traffic but low conversion",
      "Service businesses booking calls via Instagram",
      "Founders running paid ads with weak landing flow",
    ],
    engagement: "4-week build sprint",
    keyword: "Instagram sales funnel D2C India",
  },
  {
    slug: "founder-branding",
    title: "Founder Branding",
    short:
      "Make the founder the most magnetic asset in the company — voice, presence, content rhythm, and discipline.",
    intro:
      "In 2026, the brand behind the brand is the founder. Customers don't trust logos — they trust humans. Founder branding is the discipline of making the person behind the company the most valuable distribution channel they own.",
    body: [
      "We work directly with the founder — voice coaching, on-camera presence, content rhythm, and the difficult work of choosing what NOT to say. We build a content cadence the founder can actually sustain (usually 2 reels + 3 stories + 1 long-form/week).",
      "We treat the founder's account as a separate brand asset from the company account, with its own voice and audience.",
      "Outcome: founder becomes searchable, quotable and bookable. Inbound from podcasts, partnerships and customers compounds.",
    ],
    deliverables: [
      "Personal positioning statement",
      "On-camera coaching (3 sessions)",
      "Weekly content rhythm (sustainable, not viral-chasing)",
      "Founder-account growth playbook",
      "Quarterly review + repositioning",
    ],
    idealFor: [
      "D2C founders who want personal authority",
      "Service founders selling expertise",
      "CEOs of small-team brands (under 20 people)",
    ],
    engagement: "6-month retainer",
    keyword: "founder personal branding India",
  },
];

// ─────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────

export type FAQ = { q: string; a: string };

export const FAQS: FAQ[] = [
  {
    q: "What exactly is The Garima Effect?",
    a: "The Garima Effect is a boutique content strategy and brand storytelling studio founded by Garima Rana in 2020. We help founders and D2C brands turn social-feed noise into a recognizable brand voice, then turn that voice into revenue. We've worked with 60+ brands across beauty, wellness, hospitality, fashion and food.",
  },
  {
    q: "Who does Garima Rana usually work with?",
    a: "Founders of D2C brands and service businesses — especially in beauty, wellness, hospitality, fashion, and food. Most clients are 1–20 person teams where the founder still owns the brand voice. We're not the right fit for large brands looking for a vendor; we're the right fit for founders looking for a partner.",
  },
  {
    q: "What industries do you specialize in?",
    a: "Beauty, wellness, hospitality, fashion, and food. We've shaped the voice, scripts, funnels and feeds of 60+ brands in these verticals. Our strategies are tuned for consumer brands with a founder story at the center.",
  },
  {
    q: "How long does a typical engagement last?",
    a: "It depends on the service. A brand storytelling sprint is 2 weeks. A content strategy build is 4 weeks. Instagram growth and founder branding retainers run a minimum of 3–6 months because compounding takes time. We don't lock anyone in — every engagement renews monthly after the initial term.",
  },
  {
    q: "How does pricing work?",
    a: "Project pricing for sprints (strategy, storytelling, funnel design). Monthly retainers for ongoing work (Instagram growth, reels production, founder branding). We share a rate card and scope after the first call — there are no hidden discovery fees.",
  },
  {
    q: "Do you guarantee a certain number of views or followers?",
    a: "No, and we won't. Anyone guaranteeing follower numbers is either buying them or lying. What we do guarantee is a system: a strategy, a cadence, a measurement loop. Most clients see follower velocity 4–8× their pre-engagement baseline within 60 days, and saved-post rates climb steadily.",
  },
  {
    q: "Do you make the content yourself, or just plan it?",
    a: "Both modes available. We can hand-off the strategy and let your in-house team execute, OR we can plug in as your creative direction layer — scripts, hooks, edit notes — and brief your existing videographer/editor. We rarely shoot footage ourselves; we make your existing creative work harder.",
  },
  {
    q: "What if I already have a marketing team?",
    a: "Great — we work alongside them. Most engagements are split: we own strategy and high-leverage creative direction, your team owns daily execution. We've never replaced a team; we've made many of them 3× more effective.",
  },
  {
    q: "Do you do paid ads?",
    a: "No. We make organic content engines and inbound funnels. If you need paid media management, we'll refer you to specialists we trust. We'd rather be the best at one thing than mediocre at three.",
  },
  {
    q: "What's the onboarding process?",
    a: "Discovery call → scoping doc → contract → kickoff workshop (90 minutes with the founder) → 2-week strategy build → execution starts week 3. You'll meet your strategist (often Garima directly for retainers) by week one.",
  },
  {
    q: "Can you work with international clients?",
    a: "Yes — we work with founders in the US, UK, UAE and Singapore in addition to India. Calls are scheduled in your timezone. Indian rupee or USD invoicing depending on jurisdiction.",
  },
  {
    q: "How do you measure success?",
    a: "Three metrics, every month: 1) saved-post rate (truest audience fit signal), 2) DM inquiries from content, 3) revenue attributed to content channel. Views and follower count are secondary — they're inputs, not outcomes.",
  },
  {
    q: "Do you offer one-off projects or only retainers?",
    a: "Both. Brand storytelling sprints, content strategy builds and funnel rebuilds are all one-off projects (2–4 weeks). Instagram growth and founder branding are retainers. Many clients start with a sprint and continue with a retainer.",
  },
  {
    q: "How do I book a discovery call?",
    a: "Visit thegarimaeffect.com and use the 'Book a Call' button on the right edge of any page. You'll see Garima's live calendar — pick a slot. The call is 30 minutes, free, and no pitch deck required.",
  },
  {
    q: "What makes The Garima Effect different from other content agencies?",
    a: "Three things. First, we sit with the founder — not the marketing team — so the voice stays authentic. Second, we measure saved-post rate and DM volume, not vanity views. Third, our work is bound to revenue: every reel, every funnel, every caption has a measurable hypothesis. We don't ship content we can't defend with numbers.",
  },
  {
    q: "Where is The Garima Effect based?",
    a: "India. We work with brands across India and internationally. Discovery calls and weekly check-ins happen on video; the work is done asynchronously.",
  },
];

// ─────────────────────────────────────────────────────────────────
// CASE STUDIES (placeholders — edit with real client names later)
// ─────────────────────────────────────────────────────────────────

export type CaseStudy = {
  slug: string;
  brand: string;
  category: string;
  oneLiner: string;
  challenge: string;
  approach: string;
  result: string;
  metrics: { label: string; value: string }[];
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "lumen-skincare",
    brand: "Lumen Skincare",
    category: "D2C Beauty",
    oneLiner:
      "Repositioned a clinical skincare brand around its founder's story — and watched DMs become the biggest revenue channel.",
    challenge:
      "Lumen had a strong product line but generic content. The founder was visible nowhere, and the brand sounded like every other skincare D2C — full of clinical claims, no human voice. Sales had plateaued.",
    approach:
      "We ran a 4-week story sprint with the founder, surfaced the personal story behind the formulation, and rebuilt the content pillars around her on-camera. We installed a hook library tuned for skincare and a DM funnel that captured every product question as a sales opportunity.",
    result:
      "In 90 days, saved-post rate jumped 4×, monthly DM inquiries went from 30 → 600+, and content-attributed revenue overtook paid ads as the top channel.",
    metrics: [
      { label: "Saved-post rate", value: "4× in 90 days" },
      { label: "Monthly DMs", value: "30 → 600+" },
      { label: "Content-attributed revenue", value: "+182%" },
    ],
  },
  {
    slug: "sage-wellness",
    brand: "Sage Wellness Studio",
    category: "Wellness Studio",
    oneLiner:
      "Turned a single-location boutique yoga studio into a booked-out brand with a 6-month waitlist.",
    challenge:
      "Sage had loyal local clients but no national presence. The founder posted occasionally but felt the content was generic. New customer acquisition relied entirely on word-of-mouth.",
    approach:
      "We rebuilt the founder's account around 'the science of stillness' — a single, defensible positioning. Weekly reel cadence with hook formulas tested specifically for wellness audiences. The studio's bookings page got a story-led rebuild.",
    result:
      "Followers grew 3.4× in 6 months. Bookings went from ad-hoc to a 6-month waitlist. The founder was invited onto 4 podcasts and 1 major wellness summit.",
    metrics: [
      { label: "Follower growth", value: "3.4× in 6 months" },
      { label: "Bookings", value: "Open → 6-month waitlist" },
      { label: "Inbound podcast invites", value: "4" },
    ],
  },
  {
    slug: "eos-hospitality",
    brand: "Eos Boutique Hotels",
    category: "Hospitality",
    oneLiner:
      "Built a single Instagram-led booking funnel that out-converted the hotel's existing OTA channels.",
    challenge:
      "Eos had three boutique properties and relied on Booking.com / MakeMyTrip for 80% of bookings — paying heavy commissions. The Instagram account had pretty photos but zero booking conversion.",
    approach:
      "We rebuilt the bio and link-in-bio page as a direct booking funnel, reorganized story highlights as 'the 30-second tour' for each property, and shipped a weekly reel format that featured guest moments instead of room shots. DM scripts were trained on booking questions.",
    result:
      "Direct bookings via Instagram grew from <5% to 38% of total within 5 months — saving an estimated ₹40L/year in OTA commissions and giving the brand back its margin.",
    metrics: [
      { label: "Direct-booking share", value: "5% → 38%" },
      { label: "OTA commission saved (annualized)", value: "~₹40L" },
      { label: "Time-to-first booking from DM", value: "12 min avg" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// BLOG POSTS (seed content — edit / expand later)
// ─────────────────────────────────────────────────────────────────

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  body: string[];
  keyword: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "reels-hooks-that-stop-the-scroll",
    title: "Reels hooks that stop the scroll — the 1.2-second rule",
    date: "2026-05-22",
    excerpt:
      "The first 1.2 seconds decide whether anyone watches the rest. Here are the five hook formats we test against every reel.",
    body: [
      "If you've ever wondered why one reel does 5,000 views and the next one does 500,000 — the answer is almost always the first 1.2 seconds.",
      "Instagram's algorithm decides whether to push your reel based on a thumbnail-stop metric: the percentage of people who land on the reel and don't scroll past in the first second. Crack that, and you're in the running for the explore page. Miss it, and you're invisible.",
      "After scripting 400+ reels for our clients, we maintain an internal hook library of 40+ formats. Here are the five highest-performing ones we test against every reel we ship.",
      "**1. The Counter-Take.** 'Everyone says X. Actually it's Y.' Works because it triggers curiosity AND creates a small mental fight. Best for category-leader brands willing to be opinionated.",
      "**2. The Specific Number.** 'I spent ₹3.4L learning this. Here's the 30-second version.' Specificity beats vagueness every time. The number anchors the brain.",
      "**3. The Pattern Interrupt.** A visual change in the first frame that doesn't match what they expected — pouring, dropping, breaking, flipping. Almost any physical change buys you 1.5 seconds.",
      "**4. The Forbidden.** 'Don't do this with your X.' Negative framing outperforms positive 60% of the time in our tests because it implies hidden danger.",
      "**5. The Confession.** 'I used to think Y. I was wrong.' Vulnerability + reversal. Works best on founder accounts where the personal voice is already established.",
      "Test these the right way: ship one reel with hook A, one with hook B, same body, same caption, same time of day. Compare 24-hour view velocity. The hook that wins becomes a candidate for your house style. Repeat monthly.",
      "Hooks are the cheapest leverage point on Instagram. Most brands script the body first and bolt a hook on at the end. The brands that compound script the hook FIRST and write everything else to earn it.",
    ],
    keyword: "instagram reels hooks examples",
  },
  {
    slug: "why-founder-led-content-wins",
    title: "Why founder-led content outperforms brand content in 2026",
    date: "2026-05-15",
    excerpt:
      "In an AI-saturated feed, the only signal humans still trust is another human. The data on why founders should be the face — and the limits of that strategy.",
    body: [
      "By the end of 2025 something quiet happened: AI-generated content became indistinguishable from human-made content for most categories. Stock-style brand reels, anonymous product montages, voice-over tutorials — all of it can now be generated in minutes. Audiences know it.",
      "The instinctive response in feeds has been to look for proof of humanity. A founder talking on camera, in a real room, about a real thing they actually built — that's the new luxury.",
      "Across our portfolio in the last 12 months, founder-led accounts grew at roughly 2.8× the velocity of their corresponding brand accounts. Save-rate was 3–5× higher on the founder side. Inbound DMs converted at almost double the rate.",
      "The mechanism is simple: when someone follows a brand, they're following a logo and an offer. When someone follows a founder, they're following a worldview. Worldviews compound; offers churn.",
      "That said — founder-led content has three failure modes worth naming.",
      "**First, sustainability.** If your founder can't sustain 2 reels + 3 stories a week, the strategy collapses. Plan for a rhythm the founder will still want to do in month nine.",
      "**Second, perceived narcissism.** Founder-led ≠ founder-only. The reels still need to teach, serve, or entertain. If every post is 'look at me' rather than 'look what I see', the audience leaves.",
      "**Third, exit value.** A brand that's 100% the founder is hard to sell. If you're building toward acquisition, run founder-led content alongside a brand account that can survive the founder leaving the room.",
      "Done right, founder content is the highest-leverage marketing channel a small consumer brand has in 2026. Done wrong, it's a vanity project. The difference is rhythm and intent.",
    ],
    keyword: "founder content strategy",
  },
  {
    slug: "content-engine-for-d2c-brands",
    title: "How to build a content engine your team can actually run",
    date: "2026-05-08",
    excerpt:
      "Most content systems die at the second month. Here's the four-layer engine we install for every D2C brand we work with — and why it survives founders going on vacation.",
    body: [
      "Every founder we meet has tried to build a 'content engine' at least once. Three months in, the calendar's empty, the editor's behind, and someone is asking the founder for a reel idea on a Sunday night.",
      "Why does this happen? Because most teams confuse a content calendar with a content engine. A calendar is just rows on a spreadsheet. An engine is a system that produces output when no one's pushing it.",
      "Here's the four-layer engine we install for every D2C client. Each layer is owned by a different role and runs on a different cadence.",
      "**Layer 1 — Strategy (refreshed quarterly).** Voice, pillars, audience. This is the slow layer. It changes 4 times a year. Owned by the founder + strategist.",
      "**Layer 2 — Concepts (refreshed monthly).** What we'll talk about THIS month. 10–20 concept seeds, ranked by hypothesis. Owned by the strategist + content lead.",
      "**Layer 3 — Production (weekly).** Scripts, shot lists, edits. Concepts from Layer 2 become drafts in Layer 3. Owned by content lead + creative.",
      "**Layer 4 — Distribution (daily).** Posting, comment replies, DM responses. Owned by community manager.",
      "The magic isn't in any one layer. It's in the handoff. Strategy informs Concepts. Concepts feed Production. Production feeds Distribution. When a layer breaks, the layer above it has slack to compensate.",
      "Two rules to keep the engine alive: (a) batch everything — script 4 reels in one sitting, never one at a time, (b) the founder works on Layer 1 + occasional Layer 3 (when they're on camera), never on Layer 4. Founders who answer DMs become bottlenecks. Always.",
      "An engine that runs without the founder is the only kind worth building. Anything else is a job.",
    ],
    keyword: "D2C content marketing strategy",
  },
];
