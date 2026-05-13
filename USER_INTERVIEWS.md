# User Interviews & Feedback

## Overview
This document tracks user interviews conducted with our target audience (Founders, CTOs, and Fractional CFOs). It highlights their pain points with SaaS spend and how they reacted to the AI Spend Audit tool.

---

## Interview 1: Seed Stage CTO
**Name:** [Placeholder - E.g., Sarah J.]
**Role:** CTO
**Company Stage:** Seed (12 employees)

### Direct Quotes
> *"We just buy GitHub Copilot for everyone, even the PMs, because it's easier than managing seats. I never realized we were burning $1,200 a year on unused licenses."*

> *"The AI summary is great, but what I really want is an alert when my OpenAI API usage spikes over the weekend."*

### Surprising Insights
- Startups don't care about saving $50/month. They care about saving $5,000/year. The framing of "Annual Savings" in the UI is highly effective.
- Most founders forget which tier of ChatGPT they are subscribed to and end up paying for individual Plus accounts instead of a consolidated Team account.

### Product Changes Inspired by Feedback
- Emphasized "Annual Savings" in large typography on the Results Page.
- Added a specific recommendation rule for consolidating ChatGPT Plus into ChatGPT Team.

---

## Interview 2: Fractional CFO
**Name:** [Placeholder - E.g., David M.]
**Role:** Fractional CFO
**Company Stage:** Consults for Series A/B startups

### Direct Quotes
> *"I spend hours going through Brex statements trying to figure out what 'OpenAI' and 'Anthropic' charges actually map to. An audit link I can send to the technical founders would save me 3 hours a week."*

### Surprising Insights
- CFOs are a great distribution channel. If we make the report shareable via a public URL, CFOs will use it to force founders to review their tech stack.

### Product Changes Inspired by Feedback
- Built the `results/[id]` shareable URL feature specifically so non-technical financial stakeholders can view the audit results without needing to log in.

---

## Interview Questions Framework
When conducting future interviews, use the following structure:
1. **Context:** "How many AI tools is your team currently using? How do you track the spend?"
2. **Current Solution:** "When was the last time you reviewed your SaaS licenses? How did you do it?"
3. **The Audit:** "Please try running your stack through this audit tool. Talk out loud as you do it."
4. **Value:** "If we could implement these savings for you tomorrow, what would you be willing to pay?"
