# Dotsquares UK HubSpot Landing Page: SEO and Content Brief

Research date: 22 November 2026. All copy is in British English. **Verified** means the fact was checked against the source named next to it. **Recommendation** means it is our judgement.

## 1. Verified facts used in the copy

| Claim on page | Source |
|---|---|
| HubSpot Platinum Solutions Partner | HubSpot Ecosystem profile: ecosystem.hubspot.com/marketplace/solutions/dotsquares |
| Rated 5.0 from 25 reviews | Same profile ("Based on 25 ratings"). The count changes, so re-check it before each campaign. |
| 300+ HubSpot implementations | Same profile ("300+ Successful HubSpot Implementations") |
| 100+ certified HubSpot developers | dotsquares.com/hubspot-consulting-services |
| 4.8 on Clutch | dotsquares.com/hubspot-consulting-services |
| 1,000+ team | dotsquares.com homepage FAQ ("1,000+ technology professionals") |
| ISO 27001, CMMI Level 3, Cyber Essentials Plus | dotsquares.com/hubspot-consulting-services |
| Since 2002 | dotsquares.com footer and HubSpot page |
| Industries | Profile: Business Services, Education, Hospitality, Manufacturing, Technology–Software. Case studies add retail, travel and financial services. |
| Product names | hubspot.com/products lists Agent Hub, Breeze Assistant, Revenue Hub (renamed from Commerce Hub on 16 June 2026) and Data Hub (formerly Operations Hub) |

**Removed because they could not be verified:**
- "Trusted by 2,000+ businesses"
- "25,000+ CEOs and CTOs"
- "ISO 9001"
- "1,200+ team", corrected to 1,000+
- "Breeze Studio", "Breeze Copilot" and "Breeze Intelligence", which HubSpot no longer uses

**Still to verify (left unchanged):**
- The Trustpilot 4.8 and Google 4.6 ratings in the Awards block.
- The "Insights Agent" tile name.
- "100% in-house, no freelancers or subcontractors".
- "15-Minute Growth Discovery Call".
- The video thumbnail. It is an image showing "Clutch 5.0 / Google 4.8", which conflicts with the figures above, and it needs a design update.

## 2. Keyword strategy (recommendation; no search volumes were invented)

- **Primary:** HubSpot partner UK. This is the most common phrasing on competing UK pages.
- **Secondary:**
  - HubSpot Solutions Partner UK
  - HubSpot agency UK
  - HubSpot consultants UK
  - HubSpot CRM implementation
  - HubSpot CRM optimisation
  - HubSpot integration services
  - HubSpot CRM migration
  - HubSpot onboarding
- **Existing users:**
  - HubSpot CRM audit
  - HubSpot workflow automation
  - HubSpot API integration
  - HubSpot custom development
  - HubSpot reporting and dashboards
  - HubSpot technical support
  - HubSpot RevOps consulting
- **New CRM buyers:**
  - CRM implementation services UK
  - HubSpot CRM setup
  - migrate Salesforce to HubSpot
  - Sales Hub implementation
  - Marketing Hub implementation
  - is HubSpot right for my business
- **AI:**
  - HubSpot Breeze AI implementation
  - HubSpot AI agents
  - HubSpot Agent Hub
  - HubSpot AI automation
- **Questions (covered in the FAQ):**
  - what does a HubSpot Solutions Partner do
  - can you migrate from Salesforce to HubSpot
  - is HubSpot good for small businesses
- **Semantic terms:**
  - Smart CRM
  - pipelines
  - lead scoring
  - custom objects
  - data migration
  - two-way sync
  - RevOps
  - user adoption
  - CRM architecture

**Cannibalisation:** this page owns the "UK partner/agency" intent. Point deep service queries (for example "HubSpot Salesforce migration") at dedicated service pages on dotsquares.com rather than at this page.

## 2a. UK + US on one page (implemented)

- **How the region is chosen:** `?region=uk|us` in the URL (use it in each market's Google Ads final URLs), then the visitor's last choice, then their timezone (`America/*` = US), else UK. It is set in `<head>` before first paint, so the wrong version never flashes.
- **What switches:**
  - header phone pill: flag, label, `tel:` link
  - UK/US switch buttons
  - eyebrow, H1 accent ("for Your UK/US Business") and hero pill text and flag
  - the waving flag on the form
  - default phone country code (+44 / +1)
  - "Why UK/US Businesses" heading
  - `<html lang>` (en-GB / en-US)
- **What stays the same for both:** FAQ 3 covers both markets (London and West Sussex, and Bethesda, MD). The JSON-LD lists both offices and phone numbers.
- **Files:** `assets/js/region.js` and `assets/css/region.css`. Copy marked `data-only="uk"` or `data-only="us"` shows only in that region.
- **Known limits:**
  - Copy stays in British English for both markets.
  - The hero photo is London. Add a US image and give the hero `<img>` the attributes `data-src-uk` and `data-src-us` to swap it.
  - With a single URL, Google indexes the UK default. For separate US rankings, use separate /uk/ and /us/ URLs with hreflang.

## 3. On-page SEO (implemented in index.html)

- **Title:** HubSpot Partner UK & US | Platinum Solutions Partner | Dotsquares
- **Meta description:** Platinum HubSpot partner for UK businesses: CRM implementation, optimisation, integrations, migration and AI automation. Rated 5.0 from 25 HubSpot reviews.
- **Open Graph title:** HubSpot Partner UK | Make HubSpot Work Smarter | Dotsquares
- **Open Graph description:** New to HubSpot or already using it? Dotsquares, a HubSpot Platinum Solutions Partner, implements, optimises, integrates and automates HubSpot for UK businesses.
- **H1 (one only):** Make HubSpot Work Smarter for Your UK Business
- **Structured data:** Organization (UK office, phone, sameAs) and FAQPage (the 12 on-page FAQs). No Review or AggregateRating markup was added.

### Heading hierarchy (H2 → H3)

1. Book a HubSpot Consultation (form)
2. Trusted by Growing Businesses and Global Enterprises
3. Our HubSpot Consulting Services → 10 service cards
4. Two Starting Points. One HubSpot Partner. → Looking for the Right CRM? / Already Using HubSpot?
5. Too Many Tools… HubSpot Brings It Together. (why HubSpot)
6. One Platform. One Customer. Every Stage Connected. (Hubs)
7. Moving From Another CRM? (migration)
8. Get Your Team HubSpot Ready (training)
9. Leading Technology Partners & Awards
10. Why UK Businesses Choose Dotsquares → 6 differentiators and Our HubSpot Delivery Approach
11. Don't Just Use AI. Build Your Own AI Workforce. (Agent Hub)
12. What We've Built (case studies)
13. What Our Clients Say
14. Frequently Asked Questions
15. Ready to Get More From HubSpot?

## 4. Hero headline options

1. **Make HubSpot Work Smarter for Your UK Business** (implemented). It speaks to both audiences and matches "HubSpot partner" ad copy.
2. Your UK HubSpot Partner, from First CRM to Full Potential
3. Implement HubSpot Right. Or Make It Work Harder.
4. HubSpot Implementation and Optimisation for UK Businesses
5. One HubSpot Partner for Strategy, Integration and AI

- **Primary CTA:** Book a HubSpot Consultation
- **Audience entry points:** these are links in the hero pill.
  - "Already on HubSpot? Let's optimise it" → #already-using-hubspot
  - "Need a CRM? Let's explore HubSpot" → #choosing-a-crm
- **Trust line:** Rated 5.0 from 25 client reviews on the HubSpot Solutions Directory.

## 5. Recommendations not implemented (need a decision or assets)

- **Canonical URL:** add `<link rel="canonical">` and an `og:url` once the live URL is confirmed. Add an `og:image` of 1200×630.
- **Google Ads:** match each ad group to an anchor.
  - Optimisation or audit ads → #already-using-hubspot
  - CRM or implementation ads → #choosing-a-crm
  - Migration ads → #migration
- **Reviews:** the reviews carousel uses Trustpilot app-development reviews. Swap them for HubSpot-specific reviews from the HubSpot profile, with permission.
- **Internal links:** link to dotsquares.com/hubspot-consulting-services, the HubSpot Ecosystem profile, and the case-study pages once they are published.
- **Image alt text:** the existing alt text is descriptive. Give hero and decorative images empty alt text (already done). Case-study images could use "[Client] HubSpot [service] case study".
- **BreadcrumbList:** not needed on a single campaign landing page. Add it if the page moves under /hubspot/.
