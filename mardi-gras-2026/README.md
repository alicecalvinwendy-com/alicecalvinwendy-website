# Mardi Gras 2026 - Interactive Throws Tracker

An interactive data visualization website for tracking Mardi Gras throws across 16 parades in New Orleans.

## Features

### 🎭 Interactive Visualizations
- **Bead Analysis**: Count, weight, and percentage distribution charts for all bead colors
- **Throws Breakdown**: Pie charts for cups, hats, sunglasses, and balls
- **Stuffed Animals**: Bar charts showing types caught
- **Special Items**: Track rare throws (Muses shoes, Alla lamps, Iris sunglasses, Tucks plungers, Orpheus tambourines)
- **Doubloons**: Count by parade
- **Parade Comparison**: See which parades were most generous

### 🎪 Filtering System
- **Global Parade Filter**: View data for all parades or filter to a specific parade
- **Bead Color Filter**: Focus on specific bead colors in the bead charts
- **Interactive Parade Cards**: Click any parade card to filter instantly

### 📊 Data Tables
- Sortable tables with detailed breakdowns
- Color indicators for bead types
- Mobile-responsive design

### 📱 Mobile Responsive
- Fully responsive layout that works on phones, tablets, and desktops
- Touch-friendly interactions
- Optimized chart rendering for small screens

## Technology Stack

- **Pure HTML/CSS/JavaScript** - No build process required
- **Chart.js 4.4.1** - Interactive charts via CDN
- **Embedded Data** - Data is embedded in JavaScript, works without a local server
- **GitHub Pages Compatible** - Static site, fully portable

## File Structure

```
mardi-gras-2026/
├── index.html          # Main HTML structure
├── styles.css          # Mardi Gras themed styles  
├── data.js             # All parade and throws data (EDIT THIS!)
├── app.js              # Application logic and chart rendering
├── data.json           # Optional: JSON format of the data
└── logos/              # Krewe logos (16 parades)
```

## How to Update Data

**Simply edit `data.js`!** This file contains all your parade and throws data in a JavaScript variable.

Open `data.js` and find the `mardiGrasData` constant. Edit the numbers directly:

```javascript
const mardiGrasData = {
    "parades": [...],
    "beads": {
        "purple": {
            "bacchus": {"weight": 687, "count": 36} // ← Edit these numbers
        }
    },
    // ... more data
};
```

The website automatically calculates:
- Total statistics
- Percentages
- Comparisons
- Aggregations

**Alternative**: You can also edit `data.json` if you prefer JSON format, then copy its contents into `data.js` (wrapped in `const mardiGrasData = { ... };`).

## Color Scheme

Authentic Mardi Gras colors:
- **Purple** (#5E2C89) - Justice
- **Green** (#00873D) - Faith  
- **Gold** (#D4AF37) - Power

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Local Development

**Simply open `index.html` in any browser!** No server needed since data is embedded.

If you switch to using `data.json` (fetch mode), you'll need a local server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server
```

Then visit `http://localhost:8000`

## GitHub Pages Deployment

This site is already configured for GitHub Pages. It will work automatically when pushed to the repository.

## Credits

Built with Chart.js for interactive data visualization.
Mardi Gras 2026 - Laissez les bons temps rouler! 🎉
