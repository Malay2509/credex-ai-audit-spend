# DEVLOG

## Day 1 — 2026-05-11

**Hours worked:** 4

**What I did:**
- Finalized project idea and application scope after finishing 8th semester exams
- Researched the assignment requirements and planned the MVP architecture
- Initialized Next.js 15 project with TypeScript and TailwindCSS
- Set up base folder structure and started building the landing page
- Explored audit logic ideas for AI tool pricing optimization

**What I learned:**
- The assignment focuses more on shipping a real product and documenting decisions than solving algorithmic problems
- Next.js App Router provides a clean structure for scalable SaaS-style applications

**Blockers / what I'm stuck on:**
- Need to structure the audit recommendation engine cleanly so rules remain maintainable
- Still deciding the best UI layout for the audit results dashboard

**Plan for tomorrow:**
- Complete the audit form
- Implement recommendation logic
- Build the results dashboard
- Start improving UI polish and responsiveness

## Day 2 — 2026-05-12

**Hours worked:** 6

**What I did:**
- Expanded the audit engine with structured recommendation rules for multiple AI tools and pricing tiers
- Added financially-defensible savings calculations for monthly and yearly optimization estimates
- Improved the multi-tool audit form with validation, dynamic entries, and persistent localStorage state
- Built a more polished audit results dashboard with recommendation cards, savings summaries, and visual improvements
- Integrated AI-generated personalized summaries using a secure Next.js API route and environment variables
- Implemented graceful fallback handling for AI summary failures and timeout cases
- Added automated testing using Vitest and wrote tests covering audit logic, savings calculations, and edge cases
- Configured GitHub Actions CI to automatically run linting, tests, and production builds on push
- Created supporting documentation files including PRICING_DATA.md, TESTS.md, and PROMPTS.md

**What I learned:**
- Rule-based financial logic is significantly more reliable than AI-generated calculations for pricing audits
- Separating API routes from frontend state management keeps sensitive keys secure and simplifies architecture
- Writing automated tests early helps catch incorrect savings logic and calculation edge cases quickly

**Blockers / what I'm stuck on:**
- Need to finalize the best structure for storing and sharing public audit reports
- Still refining responsive dashboard spacing and mobile UI polish
- Need to integrate backend storage and transactional email flows cleanly

**Plan for tomorrow:**
- Integrate Supabase for lead capture and audit storage
- Build shareable public audit result URLs
- Add transactional email confirmations using Resend
- Improve Open Graph metadata and deployment readiness
- Begin final documentation and user interview summaries