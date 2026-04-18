# Frontier Strategy

**Findings**

1. The homepage still leaks “hackathon demo” because the proof of reality is too small and too tiled. The seeded topline numbers `3`, `$72`, and `1` make the company look tiny, not fundable, and the four KPI cards plus three example cards bring back the startup-template rhythm you were trying to remove. The strongest copy is there, but the supporting composition still says “demo dataset.”

2. Auth is better, but it still does not fully read as one internal mode switch. The route swap is wrapped in `startViewTransition`, but only the outer card is named for the transition, so the experience is still effectively “page A to page B” rather than a tight component state change. The public header also keeps separate `Sign in` and `Sign up` links plus CTAs, which duplicates the auth card’s own mode controls and weakens the premium contained feel.

3. The worker flow still feels like a dashboard module, not a product-defining workflow. The main surfaces are generic `PageIntro` + `SectionCard` wrappers, then repeated cards/forms with explanatory copy. That makes claiming work and submitting proof feel administratively correct, but not sharp or premium. The trust model is mostly narrated in text instead of being made visually decisive in the task and proof surfaces.

4. The poster review page still spends too much visual energy on dashboard KPIs before the actual trust decision. The three summary cards and generic section framing push the evidence workspace down, so the “core trust checkpoint” arrives after admin chrome instead of immediately owning the screen. The review surface itself is solid, but the page hierarchy still says “ops console” before it says “high-stakes decision.”

5. The payout page has the same hierarchy problem: the consequential release moment is still buried under status cards, wallet metadata, and nested boxes. The copy is strong, but the visual climax is weak. “Sign and release” appears after a lot of admin detail, so ready/released/failed states read as documented states, not defining moments.

**Verdict**

The product is materially stronger than before. Auth is coherent, the homepage message is clear, and review/payout now have a real point of view. But it is not fully “fundable and Frontier-worthy” yet because too much of the app still inherits dashboard scaffolding and demo-scale presentation. The highest-leverage next pass is not new features. It is removing the remaining template hierarchy: fewer KPI rows, fewer generic cards, stronger first-screen ownership of the decision moments, and less visible route/navigation duplication around auth.
