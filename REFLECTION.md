# Project Reflection

## The Journey
Building the AI Spend Audit was a rigorous exercise in full-stack feature development within a strict Next.js 15 App Router architecture. Over the course of three "days" (phases), the project evolved from a basic UI into a production-ready lead capture engine.

## Key Learnings
1. **Zustand vs Context**: Relying on Zustand for client-side state (`useAuditStore`) proved highly effective for the multi-step form flow. It prevented unnecessary re-renders across the application compared to a traditional React Context setup.
2. **Next.js 15 Routing Patterns**: Implementing dynamic public routes (`/results/[id]`) highlighted the importance of handling static generation vs dynamic rendering. Dealing with Supabase environment variables during the build process was a stark reminder of how Next.js attempts to prerender everything by default.
3. **UX for Form Conversions**: Moving the email capture to *after* the value was delivered (showing the total savings first) rather than gating the entire tool behind an email wall aligns with modern product-led growth (PLG) strategies. Users are much more likely to hand over their email once they see concrete "$X,XXX saved".

## What I Would Do Differently
If I had another week, I would:
- **Implement Server Actions**: Instead of standard API routes for email sending and database saving, I'd migrate those into Next.js Server Actions to reduce boilerplate and type-sharing complexity.
- **Add Auth**: The current app relies on public IDs for sharing. A robust dashboard for users to return and see historical audits would require full authentication via Supabase Auth.
- **Enhance the Audit Engine**: The rule engine is currently a local TypeScript function. Moving the engine to a database-driven model would allow updating pricing and rules without redeploying the code.

## Conclusion
The application successfully meets its goal: providing startups a fast, beautiful way to analyze their AI stack while generating high-intent leads for Credex. The codebase remains clean, strictly typed, and thoroughly documented.
