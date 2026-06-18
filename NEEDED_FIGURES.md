# Figures to export for the ARTS project page

Drop the final exported images into `site/assets/` using **exactly** these filenames
(overwriting the placeholders). PNG is preferred; if you export SVG, also update the
`<img src="...">` extension in `index.html`. Recommended width: ~1000–1200px, transparent
or white background. The page uses **Inter**, matching the paper figures.

| Filename (in `assets/`)     | Where it appears | What it should show |
|-----------------------------|------------------|---------------------|
| `fig-main.png`              | Hero / Teaser    | The main method figure: the SELECT + EXPAND search step — the scientist inspects prior nodes (code, logs, failures, scores) and reads/writes memory, then expands with diverse hypotheses (paper Figure 1, `mainfig2`). |
| `fig-results.png`          | Results gallery  | Normalized results grid: ARTS vs. leading agents across the 22 MLGym / MLEBench tasks. |
| `fig-ttt.png`              | Results gallery  | Test-time-training chart: a Qwen3-4B scientist matching o3 / Gemini-3 Pro frontier models. |
| `fig-cost.png`             | Results gallery  | Cost-vs-performance scatter showing ARTS reaching the same scores at ~5× lower inference cost. |
| `fig-progression.png`      | Results gallery  | Hourly progression curves: best score over wall-clock time during the search. |
| `fig-tree-vesuvius.png`    | Results gallery  | AIRA-vs-ARTS search-tree visualization for the **Vesuvius** task. |
| `fig-tree-metamaze.png`    | Results gallery  | AIRA-vs-ARTS search-tree visualization for the **MetaMaze** task (recurrent-memory rediscovery). |

## Notes
- All asset paths in `index.html` are **relative** (`assets/...`), so the site works unchanged
  when served at `https://auto-discovery.github.io/arts/`.
- The current files in `assets/` are lightweight labeled placeholders so the page renders before
  the real figures are ready.
- If a figure's aspect ratio differs a lot from the placeholder, the layout still adapts (cards
  size to the image), so no CSS changes are needed.
