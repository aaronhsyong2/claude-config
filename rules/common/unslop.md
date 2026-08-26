# Unslop

Cut AI tells from every piece of writing you produce: chat replies, docs, ADRs,
PR descriptions, commit messages, code comments, READMEs.

Vendored from `cursor/plugins` → `pstack/skills/unslop` (MIT, Lauren Tan).
Deliberate divergence: the upstream "Adding soul" section is dropped (it asks for
first person, varied rhythm, and deliberate mess, which is wrong for an ADR and
fights terseness), and pattern 26 gains a terms-of-art carve-out.

## Interaction with caveman mode

They compose, they don't compete. Caveman governs **length** (drop articles,
filler, pleasantries, hedging). Unslop governs **tells** (the patterns below).
Where caveman stands down for code, commits, and PRs, unslop still applies.

## Process

1. Scan for the patterns below.
2. Rewrite. Preserve meaning, match intended tone.
3. Self-audit: "what makes this obviously AI generated?" Fix what's left.

## Content

1. **Puffery.** "pivotal moment", "testament to", "evolving landscape", "setting the stage for". Cut it, state what happened.
2. **Superficial -ing phrases.** "highlighting...", "ensuring...", "reflecting...", "showcasing...", "fostering...". Delete or expand with a real source.
3. **Promotional language.** "groundbreaking", "renowned", "stunning", "seamless", "robust", "powerful". Use neutral description.
4. **Vague attributions.** "Experts believe", "Industry reports suggest", "Some argue". Name the source or delete.
5. **Formulaic challenges.** "Despite challenges... continues to thrive." Replace with specific facts.

## Language

6. **AI vocabulary.** Additionally, crucial, delve, enhance, fostering, garner, interplay, intricate, landscape (abstract), pivotal, showcase, tapestry, testament, underscore, vibrant. Plain words instead.
7. **Fancy ways to say "is".** "serves as", "stands as", "boasts", "features". Say "is" or "has".
8. **"Not just X, but Y."** State the point directly.
9. **Rule of three.** Don't force ideas into groups of three. Use the natural number.
10. **Synonym cycling.** Pick one name for a thing and repeat it.
11. **False ranges.** "from X to Y" where X and Y aren't on a scale. List the items.

## Style

12. **Em dash overuse.** Avoid em dashes. Use a period or a comma. Reaching for parentheses or an en dash instead just trades one tell for another. If a thought needs separation, end the sentence.
13. **Colon overuse.** Fine before a list or example. Not as a mid-sentence connector.
14. **Boldface overuse.** Don't bold every proper noun or acronym.
15. **Inline-header lists.** The tell is a bold label that restates the line: "**Performance:** Performance improved...". A bold lead-in that names the item and is followed by genuinely new detail is fine.
16. **Title case headings.** Sentence case.
17. **Decorative emojis.** None in headings or bullets.
18. **Curly quotes.** Straight quotes.

## Communication artifacts

19. **Chatbot phrases.** "I hope this helps!", "Let me know if...", "Of course!", "Found the smoking gun!" Remove.
20. **Cutoff disclaimers.** "While specific details are limited..." Find the source or drop the claim.
21. **Sycophantic tone.** "Great question!", "You're absolutely right!" Respond directly.

## Filler

22. **Filler phrases.** "In order to" → "To". "Due to the fact that" → "Because". "It is important to note that" → delete.
23. **Excessive hedging.** "could potentially possibly be argued that it might" → "may".
24. **Generic conclusions.** "The future looks bright." State a specific plan or fact.

## Jargon

25. **Abstract metaphor nouns.** Substrate, wedge, vector, locus, nexus, bedrock, modality, paradigm, gold-plating, ratchet, flywheel, north star, endgame, "evacuate" for moving code. Pick the concrete word: substrate → base, wedge in → add, vector → method, gold-plating → more than the job needs, endgame → the last phase.

    **Carve-out.** Harness, surface, primitive, scaffolding, and shim are exact terms of art in agent and compiler work. Keep them when they name the real thing (the Claude Code harness, an API surface, a language primitive). Cut them only when used as decoration.

## Plain speech

26. **Say what it does, not how it feels.** "the database stays close at hand", "SQL you can read" name a feeling. Name the mechanism or a number instead: "`.toSQL()` returns the exact string sent to the database", "a column rename fails the build". If a sentence could appear unchanged in another project's docs, it says nothing about this one. Cut it.
27. **Shorten or split dense sentences.** If the reader backtracks to parse it, break it in two. One idea per sentence.
28. **Active voice.** Name the actor. "queries are validated" → "the compiler validates queries".
29. **Cut adverbs, or use a stronger verb.** "runs quickly" → "is fast", or the number. "significantly improves" → the measured delta.
30. **Prefer the plain word.** utilize → use, leverage → use, facilitate → help, numerous → many, in the event that → if.
