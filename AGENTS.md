<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Sterling Logs - Project Guidelines & Rules

## Core Principles & Workflow
- **Component-by-Component Execution**: Build feature-by-feature and component-by-component. Keep each piece modular, tested, and self-contained.
- **Task Focus**: Maintain intense focus on the active task at hand. Do not jump ahead or introduce unrelated changes.
- **Terminal Discipline**: **Do NOT run anything on the terminal unless it is absolutely necessary.** Prioritize direct code inspection and edits over running shell commands.

## Tech Stack
- **Styling & Design**:
  - **Sass / SCSS**: SCSS modules and global stylesheets.
  - **SCSS Animations**: Custom keyframes, smooth transitions, and dynamic visual interactions.
  - **AOS (Animate On Scroll)**: Coordinated scroll-triggered reveals and view animations.
- **Icons**:
  - **Lucide Icons** (`lucide-react`)
  - **React Icons** (`react-icons`)
- **Database & Data Layer**:
  - **Prisma ORM**
  - **Neon DB** (Serverless PostgreSQL)
- **Authentication**:
  - **Better Auth**
