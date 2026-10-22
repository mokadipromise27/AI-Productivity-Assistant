<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use shared dashboard tools with route-derived chat thread IDs; each conversation has its own URL to preserve reload and navigation behavior.
- Keep simulation logic browser-safe and separate from UI, with localStorage chat records scoped by thread ID to prevent conversation mixing.
- Compose simulated chat using AI Elements; no server streaming boundary is needed because these responses are generated locally, not by a model.
