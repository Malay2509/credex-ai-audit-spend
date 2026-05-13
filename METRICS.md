# Product Metrics & Instrumentation

## North Star Metric
**Total Verified Savings Found ($)**
*Why:* If this number goes up, it means we are auditing more companies and finding larger inefficiencies. If we deliver value first, capturing leads and converting them becomes effortless.

## Input Metrics
1. **Top of Funnel:** Unique Landing Page Visitors.
2. **Activation:** Audit Completion Rate (Audits Completed / Audits Started). Target: >70%.
3. **Engagement:** Lead Capture Rate (Emails Submitted / Audits Completed). Target: >15%.
4. **Virality:** Share Link Clicks (Views on public report URLs).

## Instrumentation Strategy
We use lightweight analytics (Vercel Analytics + PostHog) to track key events without compromising user privacy.

### Events Tracked:
- `audit_started`: Fired when user clicks "Start Audit".
- `tool_added`: Fired when a user adds a tool (helps us see which tools are most common).
- `audit_completed`: Fired when results are generated. Includes property `savings_found`.
- `lead_captured`: Fired on successful email submission.
- `report_shared`: Fired when someone views a public `results/[id]` URL.

## Pivot Threshold
If the **Audit Completion Rate** drops below 40%, the form is too long or confusing, and we need to simplify the inputs.
If the **Lead Capture Rate** drops below 5%, the savings being presented are not compelling enough, or the UI doesn't build enough trust. We will need to either enrich the AI summary or target larger startups.
