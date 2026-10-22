# AI Productivity Assistant

An AI-powered workplace productivity assistant: summarise long emails, pull action items out of raw meeting notes, and turn a messy task dump into a prioritised plan for the day.

Built with [Lovable](https://lovable.dev).

![AI Workplace Assistant](https://img.shields.io/badge/built%20with-Lovable-ff5a5f)

## What it does

| Tool | Input | Output |
| --- | --- | --- |
| **Email Summarizer** | A long email pasted into a textarea | A short bullet summary with tone and sentence count |
| **Meeting Notes** | Raw notes from a meeting | A list of action items you can tick, edit, add or delete |
| **Task Planner** | A brain-dump of everything on your plate | A prioritised task list (High / Medium / Low) you can reorder by dragging |

Everything you see on screen is editable — summaries, action items and tasks can all be rewritten in place. Work is saved to the browser's `localStorage`, so it survives a reload.

## How the "AI" works

There is no API key and no network call. The assistant runs on a small set of local heuristics (keyword scoring and sentence ranking) wrapped in a `setTimeout` of 1.5 seconds to imitate thinking time. It is deliberately simple so the app can be run, forked and studied without any setup or cost.

Swapping in a real model later means replacing the `mockSummary`, `mockActions` and `mockPlan` functions in `src/routes/index.tsx` with a call to a server function.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) components
- [Vite](https://vitejs.dev)
- [Vitest](https://vitest.dev) for tests

## Running it locally

You need Node.js 20+ (or [Bun](https://bun.sh)).

```sh
git clone https://github.com/mokadipromise27/AI-Productivity-Assistant.git
cd AI-Productivity-Assistant
npm install
npm run dev
```

Then open the address Vite prints (usually `http://localhost:8080`).

Other scripts:

```sh
npm run build      # production build
npm run test       # run the test suite
npm run lint       # ESLint
```

## Disclaimer

AI-generated content may be inaccurate. Please verify important information.

## License

MIT — do whatever you like with it.
