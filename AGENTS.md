# Agent Guidelines for Alice, Calvin & Wendy Website

## Project Overview

This is a static website hosted on GitHub Pages featuring interactive Mardi Gras throws tracking visualizations. The codebase is **pure HTML/CSS/JavaScript** with no build process, bundlers, or package managers.

## Technology Stack

- **Frontend**: Pure JavaScript (ES6+), HTML5, CSS3
- **Charts**: Chart.js 4.4.1 (via CDN)
- **Data Labels**: chartjs-plugin-datalabels 2.2.0 (via CDN)
- **Hosting**: GitHub Pages
- **No Build Tools**: Direct browser execution, no transpilation

## Running the Application

### Local Development
```bash
# Simply open the HTML file in a browser
open mardi-gras-2026/index.html

# OR use Python's HTTP server if needed
cd mardi-gras-2026
python -m http.server 8000
# Visit: http://localhost:8000
```

### Testing
**No automated tests** - this is a simple static visualization site. Manual testing workflow:
1. Open `index.html` in browser
2. Check visualizations render correctly
3. Test responsive behavior at different screen widths (480px, 768px breakpoints)
4. Verify chart interactions (hover, legend clicks)
5. Check mobile view winner cards don't clip

### Building/Deploying
**No build step required** - commit and push to `main` branch, GitHub Pages auto-deploys.

## Code Style Guidelines

### File Organization
```
mardi-gras-2026/
├── index.html          # Main HTML structure
├── styles.css          # All CSS (CSS variables at top)
├── data.js             # Embedded data (edit this for data updates)
├── app.js              # All JavaScript logic
├── data.json           # Reference schema (not loaded by default)
└── logos/              # Krewe logos
```

### JavaScript Conventions

**Variable Declarations:**
- Use `const` for immutable values (constants, configuration objects)
- Use `let` for mutable values (loop counters, reassignable variables)
- Never use `var`

**Naming:**
- Constants in UPPER_SNAKE_CASE: `BEAD_COLORS`, `CHART_COLORS`
- Functions in camelCase: `renderBeadCountChart()`, `getUnaffiliatedWinners()`
- DOM element IDs in camelCase: `beadCountChart`, `paradeWinnerGenerous`
- CSS classes in kebab-case: `.chart-container`, `.winner-card`

**Comments:**
- Section headers with ASCII art boxes:
  ```javascript
  // ========================================
  // Section Name
  // ========================================
  ```
- Function-level comments for complex logic
- Inline comments for non-obvious code

**Function Structure:**
- Data aggregation functions return objects: `getBeadData()`, `getUnaffiliatedWinners()`
- Rendering functions have no return value, side-effects only: `renderBeadCountChart()`
- Helper functions are pure when possible: `generateColorPattern()`, `getBorderColor()`

**Chart Rendering Pattern:**
```javascript
function renderChartName() {
    const ctx = document.getElementById('chartId');
    if (!ctx) return; // Guard clause for missing element
    
    const data = getDataFunction(); // Get data
    
    if (charts.chartName) charts.chartName.destroy(); // Cleanup
    
    const baseOptions = { /* Chart.js config */ };
    
    charts.chartName = new Chart(ctx, {
        type: 'bar', // or 'doughnut', 'pie', etc.
        data: { /* ... */ },
        options: mergeChartOptions(baseOptions), // Mobile optimization
        plugins: [ChartDataLabels] // If using data labels
    });
}
```

### CSS Conventions

**CSS Variables:**
- All colors, spacing, and reusable values in `:root`
- Naming pattern: `--category-variant` (e.g., `--purple-dark`, `--spacing-lg`)

**Responsive Design:**
- Mobile-first breakpoints: `480px` (mobile), `768px` (tablet)
- Use `@media (max-width: 480px)` for mobile overrides
- Chart containers: `min-width: 500px` for horizontal scroll on mobile

**Class Naming:**
- BEM-inspired: `.chart-container`, `.winner-card`, `.parade-winners`
- Utility classes: `.chart-full-width`, `.chart-medium`
- Grid classes: `.beads-grid`, `.parade-beads-grid`, `.unaffiliated-grid`

### Data Structure Conventions

**Bead Data Schema:**
```javascript
"beads": {
    "colorName": {
        "paradeKeyName": {
            "medallion": { "weight": 0, "count": 0 },
            "regular": { "weight": 0, "count": 0 }
        },
        "unaffiliated": {
            "small": { "weight": 0, "count": 0 },
            "medium": { "weight": 0, "count": 0 },
            "large": { "weight": 0, "count": 0 },
            "nonSphere": { "weight": 0, "count": 0 },
            "other": {
                "medallion": { "weight": 0, "count": 0 },
                "special": { "weight": 0, "count": 0 }
            }
        }
    }
}
```

**Parade Data:**
- Each parade has: `name`, `shortName`, `keyName`, `date`, `time`, `logo`
- `keyName` is used for data lookups (e.g., "druids", "bacchus")
- `shortName` is used for chart labels

## Common Patterns

### Adding a New Chart
1. Add HTML `<canvas id="newChartId">` in appropriate section
2. Create `getNewChartData()` aggregation function
3. Create `renderNewChart()` rendering function
4. Call `renderNewChart()` in `renderAllVisualizations()`
5. Add to responsive CSS if needed

### Adding Winner Cards
1. Add HTML with IDs: `winnerId`, `winnerIdDetails`
2. Create data function returning `{ winner: { name, count } }`
3. Create `renderWinners()` to populate DOM elements
4. Call in appropriate rendering flow

### Mobile Optimization
- Use `isMobileView()` to detect mobile screens
- Use `mergeChartOptions(baseOptions)` to apply mobile overrides
- Reduce padding, font sizes, legend box sizes for mobile
- Use `indexAxis: 'y'` for horizontal charts on mobile

## Error Handling

**DOM Element Guards:**
```javascript
const ctx = document.getElementById('chartId');
if (!ctx) return; // Always guard against missing elements
```

**Data Validation:**
- Use optional chaining: `colorData[parade]?.medallion?.count || 0`
- Provide fallback values: `BEAD_COLORS[color] || '#999'`
- Filter zero values before rendering charts

**Console Logging:**
- Use `console.log()` for initialization steps
- Use `console.error()` for caught errors with stack traces

## Git Workflow

**Commit Messages:**
- Imperative mood: "add feature" not "added feature"
- Detailed bullets with `-` for multi-line commits
- Reference what changed and why

**Branch:**
- Main development on `2026` branch
- Production deploys from `main` branch

## Important Notes

- **No TypeScript** - Pure JavaScript, no type checking
- **No Linting** - Follow patterns in existing code
- **No Testing Framework** - Manual browser testing only
- **CSS-in-JS**: None, all styles in `styles.css`
- **State Management**: Global `charts` object, no framework
- **Chart Library**: Chart.js only, accessed via CDN
- **Mobile First**: Test at 480px width regularly
- **Winner Cards**: Use `:has()` selector for conditional container sizing
- **Color Borders**: Light colors (white, silver) get dark borders via `getBorderColor()`

## Common Tasks

**Update Data:** Edit `data.js` directly, no rebuild needed
**Add Visualization:** Follow chart rendering pattern above
**Fix Mobile Layout:** Check responsive breakpoints and container heights
**Add Winners:** Follow winner card pattern with data aggregation + rendering

---

*This codebase prioritizes simplicity and clarity over abstraction. Keep it vanilla!*
