/*
 * Content data for interactive sections.
 *
 * journey: one entry per tab of "The HubSpot Journey" (Section 7), in Figma order.
 *   Copy from the live page dotsquares.com/lp/hubspot-solutions-partner.
 *   stage: panel label ("Stage 01 of 05", or "Foundation layer" for Data Hub
 *   and Breeze AI, which the live page treats as layers rather than stages).
 *   features: [boldLead, regularRest] pairs, rendered on two lines like Figma.
 *   panelIcon: optional dedicated (white) icon for the panel header.
 *   map: which diagram card to highlight ("hub" = the central HubSpot node).
 */
(function (DS) {
  "use strict";

  var IMG = "assets/images/journey/";

  DS.data = DS.data || {};

  DS.data.journey = [
    {
      key: "content",
      label: "Content",
      title: "Content Hub",
      stage: "Stage 01 of 05",
      icon: IMG + "tab-content.svg",
      map: "content",
      desc: "The front door. Everything a stranger sees before they ever speak to you - and the surface every later stage publishes onto.",
      features: [
        ["Website pages, blogs and", "landing pages in one CMS"],
        ["SEO plus AEO tracking", "how visible you are inside AI answers"],
        ["Content Remix turns one asset", "into emails, posts and page drafts"],
        ["Brand Voice keeps every AI", "draft sounding like you"],
        ["Smart content personalises pages", "by segment, no duplicate pages"]
      ],
      handoff: {
        title: "Handoff to Marketing Hub",
        icon: IMG + "card-marketing.svg",
        text: "A visitor fills a form or opens a chat, and lands in Smart CRM as a contact with their full browsing history attached."
      }
    },
    {
      key: "marketing",
      label: "Marketing",
      title: "Marketing Hub",
      stage: "Stage 02 of 05",
      icon: IMG + "tab-marketing.svg",
      panelIcon: IMG + "panel-marketing.svg",
      map: "marketing",
      desc: "Where a contact gets attracted, warmed up and qualified - until they are worth a salesperson's time.",
      features: [
        ["Forms, CTAs, pop-ups", "and live chat to capture demand"],
        ["Email campaigns and", "multi-branch nurture workflows"],
        ["Lead scoring and dynamic", "list segmentation"],
        ["Ads management with real", "attribution back to closed revenue"],
        ["Campaign reporting that", "ties spend to pipeline, not clicks"]
      ],
      handoff: {
        title: "Handoff to Sales Hub",
        icon: IMG + "card-sales.svg",
        text: "The lead crosses your scoring threshold, a workflow rotates them to the right rep, creates the deal, and books the meeting. No spreadsheet, no dropped lead."
      }
    },
    {
      key: "sales",
      label: "Sales",
      title: "Sales Hub",
      stage: "Stage 03 of 05",
      icon: IMG + "tab-sales.svg",
      map: "sales",
      desc: "Where the deal is actually worked - pipeline, follow-up and forecasting, with every touch logged automatically.",
      features: [
        ["Deal pipelines with stage-based", "automation and task creation"],
        ["Sequences, meeting links,", "call recording and email tracking"],
        ["Breeze Intelligence enriches", "the record and flags buyer intent"],
        ["Quote builder pulling live", "product and pricing data"],
        ["Forecasting, quota tracking", "and rep-level activity reporting"]
      ],
      handoff: {
        title: "Handoff to Revenue Hub",
        icon: IMG + "card-revenue.svg",
        text: "Deal hits proposal stage, so the quote goes out for e-signature - and the moment it is signed it becomes an invoice, not an email to accounts."
      }
    },
    {
      key: "revenue",
      label: "Revenue",
      title: "Revenue Hub",
      stage: "Stage 04 of 05",
      icon: IMG + "tab-revenue.svg",
      map: "revenue",
      desc: "Quote to cash, inside the CRM. Formerly Commerce Hub - renamed Revenue Hub in June 2026.",
      features: [
        ["Quotes with e-signature", "and approval steps"],
        ["Invoices and shareable", "payment links"],
        ["Subscriptions and recurring", "billing schedules"],
        ["Automated dunning and", "collections follow-up"],
        ["Revenue reporting sitting", "on the same deal record"]
      ],
      handoff: {
        title: "Handoff to Service Hub",
        icon: IMG + "card-service.svg",
        text: "Payment clears, the deal flips to closed-won, and that single event fires onboarding tasks, the welcome sequence and the customer portal invite."
      }
    },
    {
      key: "service",
      label: "Service",
      title: "Service Hub",
      stage: "Stage 05 of 05",
      icon: IMG + "tab-service.svg",
      map: "service",
      desc: "Onboarding, support and retention - where the revenue you just won either compounds or leaks.",
      features: [
        ["Onboarding checklists and a", "self-serve customer portal"],
        ["Help desk with tickets,", "queues, routing and SLAs"],
        ["Knowledge base plus Breeze", "Customer Agent for tier-one answers"],
        ["CSAT, NPS and", "support-volume reporting"],
        ["Churn and health signals", "surfaced on the company record"]
      ],
      handoff: {
        title: "Loops back to Sales Hub",
        icon: IMG + "card-sales.svg",
        text: "A healthy, high-usage customer is your best pipeline. Service signals push upsell and renewal deals straight back to the rep who owns the account."
      }
    },
    {
      key: "data",
      label: "Data Hub",
      title: "Data Hub",
      stage: "Foundation layer",
      icon: IMG + "tab-data.svg",
      map: "data",
      desc: "Not a stage - the plumbing under all five. Formerly Data Hub. If this layer is messy, every stage above it is guessing.",
      features: [
        ["Two-way sync with the", "tools you already run"],
        ["Deduplication and automated", "data-quality rules"],
        ["Custom-coded workflow", "actions and webhooks"],
        ["Datasets and calculated", "properties for clean reporting"],
        ["Field mapping and governance", "during migrations"]
      ],
      handoff: {
        title: "What it enables",
        icon: IMG + "tab-data.svg",
        text: "One trustworthy record per customer - which is the only reason automation and AI produce something you would actually act on."
      }
    },
    {
      key: "breeze",
      label: "Breeze AI",
      title: "Breeze AI",
      stage: "Foundation layer",
      icon: IMG + "tab-breeze.svg",
      map: "hub",
      desc: "Not a stage either - HubSpot's AI layer woven through every Hub, reading from the same Smart CRM.",
      features: [
        ["Breeze agents for prospecting,", "content and customer support"],
        ["Breeze Intelligence for", "enrichment and buyer intent"],
        ["Copilot available", "inside every Hub"],
        ["Drafting, summarising and", "next-step suggestions in context"],
        ["Only ever as good as the", "data layer beneath it"]
      ],
      handoff: {
        title: "The dependency",
        icon: IMG + "tab-breeze.svg",
        text: "AI agents are the reason the data layer matters. Clean, connected records in - useful agents out. Messy stack in - confident nonsense out."
      }
    }
  ];

  /*
   * migration: categories of "CRM Migration" (Section 8).
   *   Categories, integrations and logo artwork follow the live page
   *   dotsquares.com/lp/hubspot-solutions-partner (logos from its CDN).
   *   logos: any number of integrations, placed clockwise from the top. A set
   *   of six uses the Figma node positions; other counts are spaced evenly.
   *   hub: optional label for the central node (defaults to "HubSpot").
   *   The CRM set keeps Figma's own hand-placed PNG logos.
   */
  var MIG = "assets/images/migration/";

  DS.data.migration = [
    {
      key: "accounting",
      label: "Accounting and Finance Software",
      icon: MIG + "cat-accounting.svg",
      logos: [
        { name: "Sage 50", src: MIG + "logo-sage-50.webp" },
        { name: "Sage 200", src: MIG + "logo-sage-200.webp" },
        { name: "QuickBooks Online", src: MIG + "logo-quickbooks-online.webp" },
        { name: "QuickBooks Payroll", src: MIG + "logo-quickbooks-payroll.webp" },
        { name: "Stripe", src: MIG + "logo-stripe.webp" },
        { name: "PayPal", src: MIG + "logo-paypal.webp" }
      ]
    },
    {
      key: "crm",
      label: "CRM (Customer Relationship Management)",
      icon: MIG + "cat-crm.svg",
      logos: [
        { name: "Convoso", src: MIG + "logo-convoso.png" },
        { name: "Sakari", src: MIG + "logo-sakari.png" },
        { name: "Ringover", src: MIG + "logo-ringover.png" },
        { name: "Aircall", src: MIG + "logo-aircall.png" },
        { name: "PÚCA", src: MIG + "logo-puca.png" },
        { name: "WhatsApp", src: MIG + "logo-whatsapp.png" }
      ]
    },
    {
      key: "erp",
      label: "ERP (Enterprise Resource Planning) and Integration",
      icon: MIG + "cat-erp.svg",
      logos: [
        { name: "Microsoft Dynamics 365", src: MIG + "logo-dynamics-365.webp" },
        { name: "Salesforce", src: MIG + "logo-salesforce.webp" },
        { name: "Zoho CRM", src: MIG + "logo-zoho-crm.webp" },
        { name: "Pipedrive", src: MIG + "logo-pipedrive.webp" },
        { name: "Space & People", src: MIG + "logo-space-and-people.webp" },
        { name: "AudienceView", src: MIG + "logo-audienceview.webp" },
        { name: "Tully", src: MIG + "logo-tully.webp" },
        { name: "SugarCRM", src: MIG + "logo-sugarcrm.webp" },
        { name: "Copper", src: MIG + "logo-copper.webp" },
        { name: "Freshsales", src: MIG + "logo-freshsales.webp" }
      ]
    },
    {
      key: "project",
      label: "Project Management and Collaboration Tools",
      icon: MIG + "cat-project.svg",
      logos: [
        { name: "Enterprise Integration", src: MIG + "logo-enterprise-integration.webp" },
        { name: "Vantage", src: MIG + "logo-vantage.webp" },
        { name: "Odoo", src: MIG + "logo-odoo.webp" }
      ]
    },
    {
      key: "communication",
      label: "Communication Tools",
      icon: MIG + "cat-communication.svg",
      logos: [
        { name: "myenergi", src: MIG + "logo-myenergi.webp" },
        { name: "Snowflake", src: MIG + "logo-snowflake.webp" },
        { name: "D2L", src: MIG + "logo-d2l.webp" },
        { name: "Barbour ABI", src: MIG + "logo-barbour-abi.webp" },
        { name: "Excel / Google Sheets", src: MIG + "logo-excel-google-sheets.webp" }
      ]
    },
    {
      key: "workflow",
      label: "Workflow Automation and Integration Tools",
      icon: MIG + "cat-workflow.svg",
      hub: "HubSpot Workflows",
      logos: [
        { name: "Airtable", src: MIG + "logo-airtable.webp" },
        { name: "monday.com", src: MIG + "logo-monday.webp" },
        { name: "Zendesk", src: MIG + "logo-zendesk.webp" },
        { name: "Asana", src: MIG + "logo-asana.webp" },
        { name: "Mailchimp", src: MIG + "logo-mailchimp.webp" },
        { name: "Microsoft Outlook", src: MIG + "logo-outlook.webp" },
        { name: "Gmail", src: MIG + "logo-gmail.webp" },
        { name: "Microsoft Teams", src: MIG + "logo-microsoft-teams.webp" }
      ]
    },
    {
      key: "other",
      label: "Other",
      icon: MIG + "cat-other.svg",
      logos: [
        { name: "Zapier", src: MIG + "logo-zapier.webp" },
        { name: "Make", src: MIG + "logo-make.webp" },
        { name: "tray.ai", src: MIG + "logo-tray-ai.webp" }
      ]
    }
  ];
})(window.DS);
