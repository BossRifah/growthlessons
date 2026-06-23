---
title: "FAQ Schema: What It Is, Best Practices & Implementation (2026 Guide)"
slug: faq-schema-guide
excerpt: "FAQ schema survived Google's 2026 deprecation. Learn what it is, 10 best practices, and how to implement it for AI search, voice, and SEO."
coverUrl: /covers/faq-schema.svg
---

### FAQ schema is structured data that tells search engines and AI tools exactly which questions your page answers and what those answers are. Google retired the visual FAQ rich result on May 7, 2026, but it never stopped reading the code. This is a complete 2026 guide: what changed, why FAQ schema still matters for AI search, 10 best practices, and step-by-step implementation for WordPress, Shopify, and Webflow.

On May 7, 2026, Google removed FAQ rich results from search. Within hours, the "add FAQ schema for easy SEO wins" advice in roughly 168,000 blog posts went stale, and half the SEO community declared FAQ schema dead.

Here is the part most of those takes missed. **FAQ schema** is a type of **structured data** that labels your questions and answers in a format machines can read. Google stopped *displaying* the visual dropdown. It did not stop *reading* the code. And with a growing share of **AI Overviews** recommending competitors instead of your brand, making sure AI tools can correctly read and cite your content is no longer optional. So is FAQ schema dead? No. The rich result is dead. The schema is alive, and its purpose has shifted.

## What is FAQ schema?

**FAQ schema** (also called FAQ structured data) is a piece of code you add to your page that explicitly labels your questions and answers in a machine-readable format. It uses the **Schema.org** vocabulary, specifically the **FAQPage** type, and is usually written in **JSON-LD**.

Here is the simplest way to think about it. A human sees a bold question and an answer below it, and understands the relationship. Search engines and AI tools do not see your page the way humans do, they read code. Without FAQ schema, a machine sees a block of text and has to guess which parts are questions and which are answers. FAQ schema removes the guessing: it says "this is a question, this is the answer, they go together."

In practice, a FAQ schema block is a single `<script type="application/ld+json">` tag in your page's `<head>`. Its structure is straightforward:

- `"@context"` is set to `https://schema.org`.
- `"@type"` is set to `FAQPage`.
- `"mainEntity"` is an array of question objects. Each object has `"@type": "Question"`, a `"name"` field holding the exact question, and an `"acceptedAnswer"` containing `"@type": "Answer"` and a `"text"` field with the exact answer.

It does not change how the page looks to visitors. It only changes how machines understand it.

### FAQPage vs QAPage: which one should you use?

Use **FAQPage** when your site provides one authoritative answer to each question that you wrote yourself, with no user-generated content. That covers product FAQs, help center articles, service pages, and blog FAQs. Use **QAPage** when multiple users can submit answers to a question, like a forum or a Q&A platform. For most businesses, FAQPage is the correct choice, because you are the authority providing definitive answers.

## The May 2026 deprecation: what actually changed

Google did not ban FAQ schema or make it useless. It removed one display feature. Here is the timeline so you know exactly what happened.

- **May 2019:** Google launches FAQ rich results. Valid FAQ schema could earn expandable Q&A dropdowns that took up 3 to 4 times the space of a normal listing.
- **August 2023:** Google restricts FAQ rich results to well-known government and health sites. Most sites lost eligibility overnight (announced by John Mueller on the Google Search Central blog).
- **May 7, 2026:** Google ends FAQ rich results entirely, for all sites. The dropdown is gone for everyone.
- **June 2026:** Google removes FAQ reports from Search Console.
- **August 2026:** Google removes FAQ data from the Search Console API.

**Why did Google kill it?** The feature was abused. Marketers crammed keyword-stuffed questions into FAQ sections, added the markup to pages that had no real FAQs, and used the expanded listings to dominate screen space. As SEO expert Lily Ray noted, the flood of templated "add FAQ schema for AI visibility" advice produced roughly 168,000 near-identical articles. When a structured-data feature gets abused at scale, Google removes the visual reward while keeping the underlying markup functional.

**What died vs what survived.** What died is the FAQ rich result, the expandable dropdown under your listing. It is not coming back. What survived is the **FAQPage** schema type itself. Google's documentation, updated May 7, 2026, confirms unused structured data does not cause problems for search, so you do not need to remove it and it will not hurt rankings. More importantly, AI search engines still parse FAQ schema. When **ChatGPT**, **Perplexity**, or **Google Gemini** scan a page, they look for structured data to understand what it contains. That signal is arguably more valuable now than the rich result ever was.

## Is FAQ schema still relevant in 2026?

Yes, keep FAQ schema on pages with genuine, well-written FAQ content. The rich result is gone, but the schema still earns real value through AI search, voice assistants, and clearer page semantics. Here is both sides, then my recommendation.

**The case for keeping it.** AI search engines still read it, and FAQ schema is one of the cleanest signals you can give an AI model about what your page answers (Frase.io, 2025; Charle Agency, 2026). Voice assistants like Siri, Alexa, and Google Assistant pull from structured data, and FAQ schema's short, self-contained answers match what voice search needs. It improves semantic clarity, so Google does not have to guess that your page contains care information or pricing details. It can still earn **People Also Ask** placements. And Google has confirmed there is no downside to keeping it.

**The case against.** There is no SERP feature anymore, so if the rich result was your only reason, that reason is gone. Maintenance has a cost, and generic placeholder FAQs are just dead weight. SEO analyst Glenn Gabe noted that Google's actions suggest FAQ markup is not heavily weighted as an AI signal, so it alone will not guarantee citations.

**My recommendation.** Keep FAQ schema on pages with genuine, well-written FAQ content, and remove it from pages where FAQs were clearly added just to chase the rich result. The cost of keeping well-maintained schema is near zero, and the upside (better AI citability, voice appearances, clearer semantics) is real even if it is harder to measure. As Alev Digital put it after the deprecation: "The rich result is dead. The schema type is not. Substance survives. Tactics don't."

This shift is part of a bigger move from ranking to being cited by answer engines. If you are thinking about AI discoverability more broadly, two companion guides go deeper: one on giving AI crawlers a clean map of your site with an [llms.txt file](/blog/what-is-llms-txt-aeo-llm-visibility), and one on [top of funnel marketing](/blog/top-of-funnel-marketing-guide), where structured, answer-first content does most of the work.

## 10 FAQ schema best practices

1. **Only mark up real, visible FAQs.** Every question and answer in your schema must also be visible on the page. Schema that is not shown to users is cloaking, which violates Google's guidelines and erodes AI trust. Before publishing, read the page and confirm every Q&A in the code appears on it.
2. **Match schema text to on-page content exactly.** The text in your JSON-LD should be identical to what users see. Do not stuff extra keywords into the schema. "How long does shipping take?" on the page must be "How long does shipping take?" in the code, not "How long does fast affordable shipping take for online orders?"
3. **Use high-intent questions from real user data.** The best FAQs use questions people actually ask: pricing, process, comparison, objection-handling, and support questions. Generic questions like "Why are we the best?" add no search value.
4. **Keep answers concise, 40 to 60 words is ideal.** AI models and voice assistants prefer short, direct answers, and research from Frase.io found the 40 to 60 word range is ideal for both AI extraction and voice search. Lead with the direct answer in the first sentence, add one or two sentences of context, then stop.
5. **Don't duplicate the same FAQ across dozens of pages.** Repeating an identical FAQ section on 50 pages dilutes the signal. Map each FAQ to the single most relevant page, so your shipping FAQ lives on your shipping or product pages, not on every blog post.
6. **No promotional content or CTAs in answers.** Google's guidelines say FAQ schema is not for advertising or sales messaging. "Sign up now and get 50% off with code FAQ50" is a pitch disguised as an FAQ. Answer the question informatively and point to your pricing page if needed.
7. **Source questions from real data, not guesswork.** Pull questions from **People Also Ask** boxes, Google Search Console queries containing question words, Reddit and Quora threads, support tickets, sales calls, and tools like AnswerThePublic and the Semrush Questions tab.
8. **Use FAQPage for your answers, QAPage for community answers.** If your site gives the definitive answer, use FAQPage. If users submit multiple answers, use QAPage. Using the wrong type confuses search engines about your content.
9. **Layer FAQ schema with other schema types.** Combine it with Organization schema for your brand entity, LocalBusiness schema for physical locations, Product schema on product pages, and Article schema on blog posts. Use HowTo schema, not FAQPage, for step-by-step content. Layering gives machines a richer, more credible picture of the page.
10. **Update FAQ content regularly.** FAQs are not set-and-forget. If your schema references last year's pricing or a deprecated feature, it hurts your credibility with users and AI models. Schedule a quarterly audit against current Search Console data, support tickets, and PAA queries.

## How to implement FAQ schema, step by step

**Method 1: Manual JSON-LD (works on any site).** Write the JSON-LD yourself and place it in the page's `<head>`. Each question is a separate object inside the `mainEntity` array, with the exact question in `name` and the exact answer in the `text` field of `acceptedAnswer`. You can include simple HTML like `<b>` or `<a>` inside the answer text. Watch your punctuation: a single missing comma breaks the entire schema. As a sample question, "What is top-of-funnel marketing?" would map to a short answer that links readers to your fuller [top of funnel guide](/blog/top-of-funnel-marketing-guide).

**Method 2: WordPress.** The easiest route is an SEO plugin. **Yoast SEO** offers an FAQ block in the Gutenberg editor that generates valid JSON-LD automatically. **Rank Math** and **All in One SEO** have schema generators where you pick FAQ and enter your Q&A. If you avoid plugins, a dedicated Gutenberg FAQ block outputs both the visible section and the schema together, or you can paste manual JSON-LD into a Custom HTML block.

**Method 3: Shopify.** Shopify does not generate FAQ schema, so add it yourself. The most scalable approach is a theme-level Liquid snippet (for example `faq-schema.liquid`) that reads FAQ questions and answers from metafields and outputs the JSON-LD. Apps like JSON Schema App or Nabu Schema Pro automate it, and for small stores you can hardcode JSON-LD in a page template.

**Method 4: Webflow.** Webflow does not generate FAQ schema for its components, so use custom JSON-LD. For static pages, build the FAQ visually, then paste JSON-LD into Page Settings under Custom Code inside `<head>`. For blogs, create a CMS collection of FAQs with Question and Answer fields, reference them from each post, display them with a collection list, and output JSON-LD dynamically with an Embed element so it scales across hundreds of pages.

## Industry-specific FAQ examples

FAQ schema is not one-size-fits-all. Mark up the questions that match your audience's real concerns.

- **E-commerce:** focus on shipping, returns, sizing, materials, compatibility, and care. Example: "What is your return policy?" with a concise answer covering the window, condition, and refund timing.
- **SaaS and B2B:** focus on pricing, integrations, security, onboarding, and contracts. Example: "Does your platform integrate with Salesforce?" with a one-line yes plus setup detail.
- **Financial services:** focus on fees, eligibility, compliance, and security. These FAQs carry extra **E-E-A-T** weight because the information affects real decisions, so be precise and transparent, as in "Are there any hidden fees?"
- **Local businesses:** focus on hours, location, parking, services, and booking. Example: "Do I need an appointment or can I walk in?" And layer **LocalBusiness** schema to strengthen local presence.

## How to validate and test your FAQ schema

Test before you publish, because a missing comma or bracket can break the whole block.

1. **View the page source.** Open the published page, view source, and search for `application/ld+json` to confirm the code is present.
2. **Run validation tools.** Use the Schema Markup Validator at `validator.schema.org` as your primary tool, since it checks against the Schema.org spec and keeps working after the deprecation. Google's Rich Results Test is removing FAQ support in June 2026.
3. **Check common errors:** missing commas between question objects (the number-one mistake), curly or smart quotes instead of straight quotes, hidden FAQs that are in the schema but not visible, wording mismatches between code and page, and using FAQ schema for how-to content (use HowTo instead).

Before considering a page done, confirm the JSON-LD is in the source, every question is visible, the schema text matches the page exactly, there is no promotional language, the punctuation is correct, and it passes the Schema Markup Validator without errors.

## Measuring FAQ schema impact in 2026

The old metrics (FAQ rich result impressions and CTR) are gone, and the Search Console FAQ reports are being retired. Measure these instead:

- **People Also Ask appearances.** Track whether your FAQ content shows up in PAA boxes using Semrush or Ahrefs.
- **AI citation tracking.** Monitor mentions in **ChatGPT**, **Perplexity**, and **Google Gemini**, and set up a GA4 exploration filtered by a source/medium regex like `(chatgpt|perplexity|claude|copilot|ai|notebook|gemini)`.
- **Organic traffic to FAQ pages.** Well-optimized FAQ pages should rank for question-based queries independent of any rich result.
- **Time on page and engagement.** Sites with structured FAQ content see roughly 1.5x higher time on page, because users find answers faster.
- **Voice search performance.** Harder to track directly, but Search Console impressions for question-phrased queries are a useful proxy.

## When to remove, keep, or update your FAQ schema

The right move depends on the quality of your existing content.

- **Keep it** if your questions come from real user data, your answers are accurate and concise, the schema matches the visible page, and you can maintain it.
- **Update it** if your questions are generic or keyword-stuffed, your answers are outdated or promotional, or the same FAQ is copied across dozens of pages.
- **Remove it** if the schema was added purely for the rich result, the FAQ content is hidden from users, or the maintenance cost outweighs the benefit.

For most sites, updating is the answer: keep the structure, replace generic questions with real ones from your audience data, and tighten answers to be concise and AI-friendly.

## Key takeaways

- FAQ schema is structured data (JSON-LD) that tells machines which questions and answers your page contains.
- Google killed FAQ rich results on May 7, 2026. The visual dropdown is gone, but the **FAQPage** type is still valid and still read by search engines and AI tools.
- It still matters for AI search visibility, voice search, People Also Ask, and semantic understanding.
- Best practices: mark up only real, visible FAQs, match schema to page text exactly, use real user questions, keep answers 40 to 60 words, avoid duplication, and keep answers non-promotional.
- Validate with the Schema Markup Validator, and measure with AI citation tracking, PAA monitoring, and GA4 explorations.

## FAQ

**What is FAQ schema?**
FAQ schema is structured data you add to your page's code to label questions and answers in a machine-readable format. It uses the Schema.org FAQPage type, usually written in JSON-LD, and helps search engines and AI tools understand exactly which questions your page answers.

**Is FAQ schema still relevant in 2026?**
Yes. Google removed the FAQ rich result on May 7, 2026, but the FAQPage type is still valid, and AI engines like ChatGPT, Perplexity, and Google Gemini still parse FAQ structured data for citable answers. It also supports voice search and clearer page understanding.

**How do I make FAQ schema?**
The most common method is writing JSON-LD and placing it in your page's `<head>`. On WordPress, plugins like Yoast or Rank Math generate it automatically. On Shopify, use an app or a Liquid snippet. On Webflow, add JSON-LD in Page Settings under Custom Code.

**Does FAQ schema still work after Google's deprecation?**
The rich result no longer works, but the schema itself does. Google still parses it, AI engines use it for citation decisions, and it supports voice search. It is still worth implementing on pages with genuine FAQ content.

**What is the difference between FAQPage and QAPage?**
FAQPage is for one authoritative answer per question that you wrote yourself. QAPage is for pages where multiple users submit answers, like a forum. For most business websites, FAQPage is the correct choice.

**What are the best practices for FAQ schema?**
Mark up only real, visible FAQs, match the schema text to the page exactly, use questions from real user data, keep answers to 40 to 60 words, avoid promotional language, and do not copy the same FAQ across dozens of pages.
