# CLAUDE.md

## Project Overview

Tendoo AI Admin Portal

This project is an admin dashboard built with:
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack Router if already present in the codebase

Claude must treat the existing UI as the source of truth unless a Figma/spec file says otherwise.

## Main Goals

- Keep the current UI visually consistent.
- Improve maintainability and component reuse.
- Support Light Mode, Dark Mode, and System theme.
- Use semantic design tokens instead of hard-coded colors.
- Keep code TypeScript-safe and production-ready.

## Project Structure

Expected structure:

```txt
src/
├── components/
│   ├── app/
│   └── ui/
├── hooks/
├── lib/
├── routes/
├── router.tsx
├── routeTree.gen.ts
├── styles.css
└── server.ts
```

## UI Rules

- Use reusable components whenever possible.
- Prefer existing shadcn/ui components before creating new UI components.
- Do not duplicate layout logic.
- Do not hard-code theme colors like `#ffffff`, `#000000`, `text-gray-*`, or `bg-white` for themed surfaces.
- Use semantic classes such as:
  - `bg-background`
  - `text-foreground`
  - `bg-card`
  - `text-card-foreground`
  - `border-border`
  - `text-muted-foreground`
  - `bg-primary`
  - `text-primary-foreground`
- Preserve spacing, typography, and layout from the current UI unless explicitly asked to change.

## Theme Rules

Implement or maintain a theme system with:

- `ThemeProvider`
- `useTheme` hook
- Theme values:
  - `light`
  - `dark`
  - `system`
- Persist selected theme in `localStorage`.
- Apply theme by toggling the `dark` class on the root HTML element.
- Add a theme toggle in the top-right area of the header.
- Prefer icons:
  - Sun for light mode
  - Moon for dark mode
  - Monitor/System icon for system mode if needed

## Component Guidelines

- Components should be functional React components.
- Props must use explicit TypeScript interfaces or types.
- Avoid `any` unless absolutely necessary.
- Keep components focused and small.
- Move shared logic into hooks.
- Move utility logic into `src/lib`.
- Avoid deeply nested JSX when a child component would make the code clearer.

## Routing Rules

- Do not change routes unless the task requires it.
- If TanStack Router is used, follow the existing route pattern.
- Do not manually edit generated route files unless the project requires it.

## Styling Rules

- Use Tailwind CSS utilities.
- Use semantic tokens from `styles.css`.
- Update CSS variables for light/dark themes instead of hard-coding colors in components.
- Keep responsive behavior consistent:
  - Desktop first for admin layout
  - Tablet support
  - Mobile fallback where practical

## Before Editing Code

Claude should always:

1. Read the relevant files first.
2. Identify existing patterns.
3. Create a short implementation plan.
4. Reuse existing components where possible.
5. Make small, safe edits.

## When Implementing Figma/Spec

When a Figma file, screenshot, or spec is provided:

1. Analyze the layout structure.
2. Identify reusable components.
3. Map colors to semantic tokens.
4. Implement responsive behavior.
5. Preserve visual hierarchy.
6. Mock missing data only when necessary and clearly mention it.

## Quality Checklist

Before finishing, run or suggest running:

```bash
npm run build
npm run lint
```

If the project uses Bun:

```bash
bun run build
bun run lint
```

Check manually:

- No TypeScript errors.
- Theme toggle works.
- Theme persists after refresh.
- Light mode is readable.
- Dark mode is readable.
- Sidebar and header still work.
- No layout regressions.

## Common Tasks

### Add Light/Dark Mode

- Check existing theme implementation first.
- Add or update `ThemeProvider`.
- Add a toggle in `TopHeader.tsx`.
- Update `styles.css` semantic tokens.
- Replace hard-coded theme colors in app components.

### Refactor UI

- Do not rewrite the entire app unnecessarily.
- Refactor one component at a time.
- Keep behavior unchanged.
- Remove duplication only when safe.

### Generate New UI From Spec

- First create a component breakdown.
- Then implement layout.
- Then add interactions.
- Then polish theme and responsive behavior.

## Communication Style

When responding:

- Be concise.
- Explain what changed.
- Mention files edited.
- Mention commands to verify.
- Clearly call out assumptions or missing information.
