<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Standards

## UI/UX & Design
- **MANDATORY**: For ANY modification or creation of visual components, pages, or UI elements, you MUST follow the instructions in `.agents/skills/frontend-design/SKILL.md`.
- **Aesthetics**: Avoid generic AI aesthetics. Prioritize distinctive typography, intentional spatial composition, and refined visual details. Every UI change should feel production-grade and premium.
- **Tools**: Use CSS variables for theming and coordinate with the existing design system.

## Authentication & Session Management
- **Better Auth Only**: The project has been fully migrated to Better Auth.
- **PROHIBITED**: NEVER use `devSession` from `@/lib/dev-session`. It is deprecated and insecure.
- **Implementation**: Always use `requireUser()` or `getSession()` from `@/lib/get-session` in Server Components/Actions, and `authClient` in Client Components.
