// ========================================
// Mardi Gras 2026 - Throws Tracker App
// ========================================
// Data is loaded from data.js which is included before this script.
// Edit data.js to update parade and throws information.

// Global state
let charts = {};
let currentFilters = {
    parade: 'all',
    beadColor: 'all'
};

// Bead color mapping for visualization
const BEAD_COLORS = {
    purple: '#8B5FBF',
    green: '#3CB371',
    gold: '#FDB927',
    red: '#DC143C',
    blue: '#4169E1',
    pink: '#FF69B4',
    white: '#F5F5F5',
    orange: '#FF8C00',
    black: '#2F4F4F',
    silver: '#C0C0C0',
    glass: '#E0F7FA',
    lightup: '#FFD700',
    medallion: '#DAA520',
    special: '#9C27B0'
};

// Mardi Gras theme colors for charts
const CHART_COLORS = {
    purple: '#5E2C89',
    green: '#00873D',
    gold: '#D4AF37'
};

// Helper function to generate repeating purple, green, gold pattern
function generateColorPattern(count) {
    const pattern = [CHART_COLORS.purple, CHART_COLORS.green, CHART_COLORS.gold];
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(pattern[i % 3]);
    }
    return colors;
}

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeUI();
        renderAllVisualizations();
        hideLoading();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize. Please refresh the page.');
    }
});

// ========================================
// Helper Functions
// ========================================

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display = 'block';
}

function showError(message) {
    document.getElementById('loading').innerHTML = `
        <div style="text-align: center; color: #DC143C;">
            <h2>⚠️ Error</h2>
            <p>${message}</p>
            <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">
                Retry
            </button>
        </div>
    `;
}

// ========================================
// UI Initialization
// ========================================

function initializeUI() {
    renderParadeGrid();
    renderStatistics();
    setupFilters();
    setupEventListeners();
}

function renderParadeGrid() {
    const grid = document.getElementById('paradeGrid');
    grid.innerHTML = mardiGrasData.parades.map(parade => `
        <div class="parade-card" data-parade="${parade.shortName}">
            <img src="${parade.logo}" alt="${parade.name}" class="parade-logo" 
                 onerror="this.style.display='none'">
            <div class="parade-name">${parade.name}</div>
            <div class="parade-date">${parade.date}</div>
            <div class="parade-time">${parade.time}</div>
        </div>
    `).join('');
}

function setupFilters() {
    // Populate parade filter
    const paradeFilter = document.getElementById('paradeFilter');
    mardiGrasData.parades.forEach(parade => {
        const option = document.createElement('option');
        option.value = parade.shortName;
        option.textContent = parade.name;
        paradeFilter.appendChild(option);
    });

    // Populate bead color filter
    const colorFilter = document.getElementById('beadColorFilter');
    Object.keys(mardiGrasData.beads).forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = color.charAt(0).toUpperCase() + color.slice(1);
        colorFilter.appendChild(option);
    });
}

function setupEventListeners() {
    // Parade filter
    document.getElementById('paradeFilter').addEventListener('change', (e) => {
        currentFilters.parade = e.target.value;
        handleFilterChange();
    });

    // Bead color filter
    document.getElementById('beadColorFilter').addEventListener('change', (e) => {
        currentFilters.beadColor = e.target.value;
        updateBeadCharts();
    });

    // Parade card click
    document.getElementById('paradeGrid').addEventListener('click', (e) => {
        const card = e.target.closest('.parade-card');
        if (card) {
            const parade = card.dataset.parade;
            document.getElementById('paradeFilter').value = parade;
            currentFilters.parade = parade;
            handleFilterChange();
        }
    });

    // Table sorting
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => sortTable(header));
    });
}

function handleFilterChange() {
    renderStatistics();
    renderAllVisualizations();
    
    // Show/hide comparison section
    const comparisonSection = document.getElementById('comparisonSection');
    if (currentFilters.parade === 'all') {
        comparisonSection.style.display = 'block';
    } else {
        comparisonSection.style.display = 'none';
    }
}

// ========================================
// Statistics Calculation
// ========================================

function calculateStatistics() {
    const stats = {
        totalBeadsCount: 0,
        totalBeadsWeight: 0,
        totalDoubloons: 0,
        totalItems: 0,
        totalStuffedAnimals: 0,
        totalSpecials: 0
    };

    const parades = currentFilters.parade === 'all' 
        ? ['generic', ...mardiGrasData.parades.map(p => p.shortName)]
        : [currentFilters.parade];

    // Calculate beads
    Object.values(mardiGrasData.beads).forEach(colorData => {
        parades.forEach(parade => {
            if (colorData[parade]) {
                stats.totalBeadsCount += colorData[parade].count || 0;
                stats.totalBeadsWeight += colorData[parade].weight || 0;
            }
        });
    });

    // Calculate doubloons
    parades.forEach(parade => {
        if (mardiGrasData.doubloons[parade]) {
            stats.totalDoubloons += mardiGrasData.doubloons[parade].count || 0;
        }
    });

    // Calculate items
    Object.values(mardiGrasData.throws.items).forEach(itemData => {
        parades.forEach(parade => {
            if (itemData[parade]) {
                stats.totalItems += itemData[parade].count || 0;
            }
        });
    });

    // Calculate stuffed animals
    parades.forEach(parade => {
        if (mardiGrasData.throws.stuffedAnimals.parade[parade]) {
            stats.totalStuffedAnimals += mardiGrasData.throws.stuffedAnimals.parade[parade].count || 0;
        }
    });

    // Calculate specials
    if (currentFilters.parade === 'all') {
        stats.totalSpecials = Object.values(mardiGrasData.throws.specials.items)
            .reduce((sum, item) => sum + (item.count || 0), 0);
    } else {
        // Only count specials for relevant parades
        const specialParades = mardiGrasData.throws.specials.description.parades;
        if (specialParades[currentFilters.parade]) {
            const specialType = specialParades[currentFilters.parade].toLowerCase();
            Object.entries(mardiGrasData.throws.specials.items).forEach(([key, value]) => {
                if (key.includes(specialType.split('/')[0])) {
                    stats.totalSpecials += value.count || 0;
                }
            });
        }
    }

    return stats;
}

function renderStatistics() {
    const stats = calculateStatistics();
    
    document.getElementById('totalBeadsCount').textContent = stats.totalBeadsCount.toLocaleString();
    document.getElementById('totalBeadsWeight').textContent = stats.totalBeadsWeight.toLocaleString() + 'g';
    document.getElementById('totalDoubloons').textContent = stats.totalDoubloons.toLocaleString();
    document.getElementById('totalItems').textContent = stats.totalItems.toLocaleString();
    document.getElementById('totalStuffedAnimals').textContent = stats.totalStuffedAnimals.toLocaleString();
    document.getElementById('totalSpecials').textContent = stats.totalSpecials.toLocaleString();
}

// ========================================
// Data Aggregation for Charts
// ========================================

function getBeadData() {
    const parades = currentFilters.parade === 'all'
        ? ['generic', ...mardiGrasData.parades.map(p => p.shortName)]
        : [currentFilters.parade];

    const colors = currentFilters.beadColor === 'all'
        ? Object.keys(mardiGrasData.beads)
        : [currentFilters.beadColor];

    const data = {};
    
    colors.forEach(color => {
        data[color] = { count: 0, weight: 0 };
        parades.forEach(parade => {
            if (mardiGrasData.beads[color] && mardiGrasData.beads[color][parade]) {
                data[color].count += mardiGrasData.beads[color][parade].count || 0;
                data[color].weight += mardiGrasData.beads[color][parade].weight || 0;
            }
        });
    });

    return data;
}

function getItemsData() {
    const parades = currentFilters.parade === 'all'
        ? ['generic', ...mardiGrasData.parades.map(p => p.shortName)]
        : [currentFilters.parade];

    const data = {};
    
    Object.keys(mardiGrasData.throws.items).forEach(item => {
        data[item] = 0;
        parades.forEach(parade => {
            if (mardiGrasData.throws.items[item][parade]) {
                data[item] += mardiGrasData.throws.items[item][parade].count || 0;
            }
        });
    });

    return data;
}

function getDoubloonsData() {
    if (currentFilters.parade === 'all') {
        const data = {};
        mardiGrasData.parades.forEach(parade => {
            data[parade.name] = mardiGrasData.doubloons[parade.shortName]?.count || 0;
        });
        return data;
    } else {
        return {
            [mardiGrasData.parades.find(p => p.shortName === currentFilters.parade).name]:
                mardiGrasData.doubloons[currentFilters.parade]?.count || 0
        };
    }
}

function getParadeComparisonData() {
    const itemsData = {};
    const weightData = {};

    mardiGrasData.parades.forEach(parade => {
        const paradeName = parade.name;
        const paradeShort = parade.shortName;

        // Calculate total items
        let totalItems = 0;
        Object.values(mardiGrasData.throws.items).forEach(itemData => {
            totalItems += itemData[paradeShort]?.count || 0;
        });
        totalItems += mardiGrasData.throws.stuffedAnimals.parade[paradeShort]?.count || 0;
        itemsData[paradeName] = totalItems;

        // Calculate total bead weight
        let totalWeight = 0;
        Object.values(mardiGrasData.beads).forEach(colorData => {
            totalWeight += colorData[paradeShort]?.weight || 0;
        });
        weightData[paradeName] = totalWeight;
    });

    return { itemsData, weightData };
}

// ========================================
// Chart Rendering
// ========================================

function renderAllVisualizations() {
    updateBeadCharts();
    renderItemsChart();
    renderStuffedAnimalsChart();
    renderSpecialsChart();
    renderDoubloonsChart();
    
    if (currentFilters.parade === 'all') {
        renderParadeComparisonCharts();
    }
    
    renderTables();
}

function updateBeadCharts() {
    const beadData = getBeadData();
    
    renderBeadCountChart(beadData);
    renderBeadWeightChart(beadData);
    renderBeadPercentageChart(beadData);
    renderBeadTypesByParadeChart();
}

function renderBeadCountChart(beadData) {
    const ctx = document.getElementById('beadCountChart');
    const labels = Object.keys(beadData);
    const data = labels.map(color => beadData[color].count);
    const colors = labels.map(color => BEAD_COLORS[color] || '#999');

    if (charts.beadCount) charts.beadCount.destroy();
    
    charts.beadCount = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                label: 'Count',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 30,
                    bottom: 10
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#2D1B4E',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    formatter: (value) => value
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `Count: ${context.parsed.y}`
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Count' },
                    ticks: {
                        padding: 5
                    }
                },
                x: {
                    ticks: {
                        padding: 5
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function renderBeadWeightChart(beadData) {
    const ctx = document.getElementById('beadWeightChart');
    const labels = Object.keys(beadData);
    const data = labels.map(color => beadData[color].weight);
    const colors = labels.map(color => BEAD_COLORS[color] || '#999');

    if (charts.beadWeight) charts.beadWeight.destroy();
    
    charts.beadWeight = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                label: 'Weight (g)',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 30,
                    bottom: 10
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#2D1B4E',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    formatter: (value) => value + 'g'
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `Weight: ${context.parsed.y}g`
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Weight (grams)' },
                    ticks: {
                        padding: 5
                    }
                },
                x: {
                    ticks: {
                        padding: 5
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function renderBeadPercentageChart(beadData) {
    const ctx = document.getElementById('beadPercentageChart');
    const labels = Object.keys(beadData);
    const counts = labels.map(color => beadData[color].count);
    const total = counts.reduce((sum, val) => sum + val, 0);
    const percentages = counts.map(count => ((count / total) * 100).toFixed(1));
    const colors = labels.map(color => BEAD_COLORS[color] || '#999');

    if (charts.beadPercentage) charts.beadPercentage.destroy();
    
    charts.beadPercentage = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                data: counts,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 20,
                    bottom: 20
                }
            },
            plugins: {
                legend: { 
                    position: 'right',
                    labels: {
                        padding: 10,
                        boxWidth: 15
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    formatter: (value, context) => {
                        const percentage = ((value / total) * 100).toFixed(1);
                        return percentage > 3 ? percentage + '%' : ''; // Only show if > 3%
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function renderBeadTypesByParadeChart() {
    const ctx = document.getElementById('beadTypesByParadeChart');
    
    // Get parades to display
    const parades = currentFilters.parade === 'all'
        ? ['generic', ...mardiGrasData.parades.map(p => p.shortName)]
        : [currentFilters.parade];
    
    const paradeLabels = parades.map(p => {
        if (p === 'generic') return 'Generic';
        const parade = mardiGrasData.parades.find(pr => pr.shortName === p);
        return parade ? parade.name : p;
    });
    
    // Calculate colored beads (sum of purple, green, gold, red, blue, pink, white, orange, black, silver)
    const coloredBeadsData = parades.map(parade => {
        let total = 0;
        mardiGrasData.coloredBeads.forEach(color => {
            total += mardiGrasData.beads[color]?.[parade]?.count || 0;
        });
        return total;
    });
    
    // Calculate lightup, medallion, special counts
    const lightupData = parades.map(parade => mardiGrasData.beads.lightup?.[parade]?.count || 0);
    const medallionData = parades.map(parade => mardiGrasData.beads.medallion?.[parade]?.count || 0);
    const specialData = parades.map(parade => mardiGrasData.beads.special?.[parade]?.count || 0);
    
    if (charts.beadTypesByParade) charts.beadTypesByParade.destroy();
    
    charts.beadTypesByParade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: paradeLabels,
            datasets: [
                {
                    label: 'Colored',
                    data: coloredBeadsData,
                    backgroundColor: CHART_COLORS.purple,
                    borderColor: CHART_COLORS.purple,
                    borderWidth: 1
                },
                {
                    label: 'Light-up',
                    data: lightupData,
                    backgroundColor: CHART_COLORS.gold,
                    borderColor: CHART_COLORS.gold,
                    borderWidth: 1
                },
                {
                    label: 'Medallion',
                    data: medallionData,
                    backgroundColor: CHART_COLORS.green,
                    borderColor: CHART_COLORS.green,
                    borderWidth: 1
                },
                {
                    label: 'Special',
                    data: specialData,
                    backgroundColor: '#FF6384',
                    borderColor: '#FF6384',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            layout: {
                padding: {
                    left: 10,
                    right: 50,
                    top: 10,
                    bottom: 10
                }
            },
            plugins: {
                legend: { 
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 15,
                        boxWidth: 15
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 10
                    },
                    formatter: (value) => value > 0 ? value : ''
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.parsed.x}`
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true,
                    title: { display: true, text: 'Count' },
                    ticks: {
                        padding: 5,
                        stepSize: 10,
                        precision: 0
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        padding: 10,
                        autoSkip: false,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function renderItemsChart() {
    const ctx = document.getElementById('itemsChart');
    const itemsData = getItemsData();
    const labels = Object.keys(itemsData);
    const data = Object.values(itemsData);
    const total = data.reduce((sum, val) => sum + val, 0);
    const colors = generateColorPattern(labels.length);

    if (charts.items) charts.items.destroy();
    
    charts.items = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 20,
                    bottom: 20
                }
            },
            plugins: {
                legend: { 
                    position: 'right',
                    labels: {
                        padding: 10,
                        boxWidth: 15
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    formatter: (value) => value
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.parsed}`
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function renderStuffedAnimalsChart() {
    const ctx = document.getElementById('stuffedAnimalsChart');
    const typeData = mardiGrasData.throws.stuffedAnimals.type;
    const labels = Object.keys(typeData);
    const data = labels.map(type => typeData[type].count);
    const colors = generateColorPattern(labels.length);

    if (charts.stuffedAnimals) charts.stuffedAnimals.destroy();
    
    charts.stuffedAnimals = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => l.replace(/([A-Z])/g, ' $1').trim()),
            datasets: [{
                label: 'Count',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 30,
                    bottom: 10
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#2D1B4E',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    formatter: (value) => value
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Count' },
                    ticks: {
                        padding: 5,
                        stepSize: 1,
                        precision: 0
                    }
                },
                x: {
                    ticks: {
                        padding: 5
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function renderSpecialsChart() {
    const ctx = document.getElementById('specialsChart');
    const specialsData = mardiGrasData.throws.specials.items;
    const labels = Object.keys(specialsData);
    const data = labels.map(item => specialsData[item].count);
    
    // Generate color pattern
    const colors = labels.map((_, index) => {
        const colorKeys = Object.keys(CHART_COLORS);
        return CHART_COLORS[colorKeys[index % colorKeys.length]];
    });

    if (charts.specials) charts.specials.destroy();
    
    charts.specials = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                label: 'Count',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            layout: {
                padding: {
                    left: 10,
                    right: 50,
                    top: 10,
                    bottom: 10
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    color: '#2D1B4E',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    formatter: (value) => value
                }
            },
            scales: {
                x: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Count' },
                    ticks: {
                        padding: 5,
                        stepSize: 1,
                        precision: 0
                    }
                },
                y: {
                    ticks: {
                        padding: 10,
                        autoSkip: false
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function renderDoubloonsChart() {
    const ctx = document.getElementById('doubloonsChart');
    const doubloonsData = getDoubloonsData();
    const labels = Object.keys(doubloonsData);
    const data = Object.values(doubloonsData);
    const isHorizontal = currentFilters.parade === 'all';
    const colors = isHorizontal ? generateColorPattern(labels.length) : [CHART_COLORS.gold];

    if (charts.doubloons) charts.doubloons.destroy();
    
    charts.doubloons = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doubloons',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: isHorizontal ? 'y' : 'x',
            layout: {
                padding: {
                    left: 10,
                    right: isHorizontal ? 50 : 10,
                    top: isHorizontal ? 10 : 30,
                    bottom: 10
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: isHorizontal ? 'right' : 'top',
                    color: '#2D1B4E',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    formatter: (value) => value
                }
            },
            scales: {
                [isHorizontal ? 'x' : 'y']: {
                    beginAtZero: true,
                    title: { display: true, text: 'Count' },
                    ticks: {
                        padding: 5,
                        stepSize: 1,
                        precision: 0
                    }
                },
                [isHorizontal ? 'y' : 'x']: {
                    ticks: {
                        padding: 10,
                        autoSkip: false
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function renderParadeComparisonCharts() {
    const { itemsData, weightData } = getParadeComparisonData();
    const paradeCount = Object.keys(itemsData).length;
    const colors = generateColorPattern(paradeCount);
    
    // Total Items Chart
    const itemsCtx = document.getElementById('paradeItemsChart');
    if (charts.paradeItems) charts.paradeItems.destroy();
    
    charts.paradeItems = new Chart(itemsCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(itemsData),
            datasets: [{
                label: 'Total Items',
                data: Object.values(itemsData),
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            layout: {
                padding: {
                    left: 10,
                    right: 50,
                    top: 10,
                    bottom: 10
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    color: '#2D1B4E',
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    formatter: (value) => value
                }
            },
            scales: {
                x: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Count' },
                    ticks: {
                        padding: 5,
                        stepSize: 1,
                        precision: 0
                    }
                },
                y: {
                    ticks: {
                        padding: 10,
                        autoSkip: false,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });

    // Total Weight Chart
    const weightCtx = document.getElementById('paradeWeightChart');
    if (charts.paradeWeight) charts.paradeWeight.destroy();
    
    charts.paradeWeight = new Chart(weightCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(weightData),
            datasets: [{
                label: 'Total Weight',
                data: Object.values(weightData),
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            layout: {
                padding: {
                    left: 10,
                    right: 50,
                    top: 10,
                    bottom: 10
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    color: '#2D1B4E',
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    formatter: (value) => value + 'g'
                }
            },
            scales: {
                x: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Weight (grams)' },
                    ticks: {
                        padding: 5
                    }
                },
                y: {
                    ticks: {
                        padding: 10,
                        autoSkip: false,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// ========================================
// Table Rendering
// ========================================

function renderTables() {
    renderBeadsTable();
    renderThrowsTable();
}

function renderBeadsTable() {
    const tbody = document.querySelector('#beadsTable tbody');
    const beadData = getBeadData();
    
    tbody.innerHTML = Object.entries(beadData)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([color, data]) => `
            <tr>
                <td>
                    <span class="color-indicator" style="background-color: ${BEAD_COLORS[color] || '#999'}"></span>
                    ${color.charAt(0).toUpperCase() + color.slice(1)}
                </td>
                <td>${data.count.toLocaleString()}</td>
                <td>${data.weight.toLocaleString()}</td>
            </tr>
        `).join('');
}

function renderThrowsTable() {
    const tbody = document.querySelector('#throwsTable tbody');
    const itemsData = getItemsData();
    
    tbody.innerHTML = Object.entries(itemsData)
        .sort((a, b) => b[1] - a[1])
        .map(([item, count]) => `
            <tr>
                <td>${item.charAt(0).toUpperCase() + item.slice(1)}</td>
                <td>${count.toLocaleString()}</td>
            </tr>
        `).join('');
}

function sortTable(header) {
    const table = header.closest('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const column = header.dataset.sort;
    const headerIndex = Array.from(header.parentElement.children).indexOf(header);
    
    const isAscending = header.classList.contains('asc');
    
    // Remove sorting classes from all headers
    table.querySelectorAll('th').forEach(th => {
        th.classList.remove('asc', 'desc');
    });
    
    // Sort rows
    rows.sort((a, b) => {
        const aValue = a.children[headerIndex].textContent.trim();
        const bValue = b.children[headerIndex].textContent.trim();
        
        // Check if numeric
        const aNum = parseFloat(aValue.replace(/,/g, ''));
        const bNum = parseFloat(bValue.replace(/,/g, ''));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return isAscending ? bNum - aNum : aNum - bNum;
        } else {
            return isAscending 
                ? bValue.localeCompare(aValue)
                : aValue.localeCompare(bValue);
        }
    });
    
    // Add sorting class
    header.classList.add(isAscending ? 'desc' : 'asc');
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}
