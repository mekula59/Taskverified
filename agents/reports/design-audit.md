# Design Audit

STATUS: DONE_WITH_CONCERNS

Overall auth layout score: 5/10.

A 10/10 here is simple: one card that always fits the stage, one white form stage that stays readable, one green slab that changes dominance without blowing past the container, and the same feeling holds from 13-inch laptop down to mobile.

What already exists:
- The auth logic boundary is clean. `SignInPage.tsx` and `SignUpPage.tsx` just pass content into the shared shell.
- The right file to fix is `auth-ui.tsx`.
- No `DESIGN.md` exists, so this needs to be solved with local layout discipline, not a broader system rewrite.

## Highest-leverage findings

1. The desktop card is sized by hard geometry, not by content, and that is the root of the breakage. In `auth-ui.tsx`, the shell uses `min-h-[740px]`, two absolutely positioned panels, and fixed left/width percentages. On a laptop, the card does not negotiate with the viewport or the form content. It just keeps its theatrical proportions and starts cropping or feeling oversized. This is the main bug.

2. The green slab is too large relative to the container, especially in `signup`. Signup makes the slab `w-[66%]` while the white form stage still claims `w-[46%]`. Yes, they overlap by design, but the overlap is too aggressive for the container size. It reads like two large objects colliding, not one premium state change.

3. The white form stage is not anchored tightly enough at laptop widths. The form stage shifts from `left-[5%] w-[52%]` to `left-[46%] w-[46%]`. That is too much travel for the most important surface. The reference behavior works because the form feels stable and the branded surface feels like the thing doing the dramatic move. Right now both are moving too much.

4. The card carries too much vertical content for a “contained auth” interaction. The green side still includes pills, feature cards, insight cards, and the opposite-mode CTA block in the desktop slab. Good copy, wrong amount. That volume forces the slab to be tall and makes the whole card feel like a landing page section jammed into an auth interaction.

5. Mobile preserves the overlap idea, but the scaling is still too coarse. The mobile slab uses `pb-44` vs `pb-36` and the form stage jumps with `-mt-28` vs `-mt-24`. That keeps the swap visible, but it is still a big blunt shift. Premium mobile auth should feel compressed and precise, not like stacked blocks with a larger negative margin.

6. Transition containment is visually undercut by layout changes that are too structural. The current motion is all on width, left, padding, and overlap. That means the transition is doing real layout violence inside the card. It is obvious, yes, but not controlled. Premium auth wants one dominant motion cue, not four medium-strength ones.

## Ratings by focus area
- Auth card sizing: 4/10
- Overflow/clipping: 4/10
- Panel proportions: 5/10
- Responsive scaling: 5/10
- Transition containment: 6/10
- Green vs white balance: 5/10
- Premium/stable feel: 5/10

## What to change
1. Replace `min-h-[740px]` with a content-led desktop height and a capped stage height.
Reason: the card should fit the viewport first, then express the interaction inside it.

2. Reduce the green slab swing.
Recommended target:
- `signin`: green slab roughly 52-55%, white stage roughly 48-50%
- `signup`: green slab roughly 58-60%, white stage roughly 42-44%
The current 66/46 collision is too much.

3. Keep the white form stage more stable.
Recommended:
- shrink the left-position delta by about half
- let the branded slab carry most of the visual role swap
This is the whole game.

4. Cut green-panel payload on desktop.
Keep:
- eyebrow
- title
- one paragraph
- trust pills
- one compact insight block
Move or remove:
- the 3 feature cards
- the extra bottom CTA block if it duplicates the segmented switch
This is layout correction, not feature removal. The auth card is just trying to do too much.

5. Tighten mobile into a shorter hero cap plus a more stable white card overlap.
The current mode swap is visible, which is good. It just needs to be subtler and shorter.

## Verdict
The interaction idea is now pointed in the right direction. The problem is not concept anymore. It is geometry. The card is too big, the slab is too hungry, and the form stage moves too far. Fix those three things in `auth-ui.tsx`, and this stops feeling broken and starts feeling expensive.
