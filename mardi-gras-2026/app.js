// ========================================
// Mardi Gras 2026 - Throws Tracker App
// ========================================
// Data is loaded from data.js which is included before this script.
// Edit data.js to update parade and throws information.

// Global state
let charts = {};

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

// Helper function to get border color for bars (darker for light colors)
function getBorderColor(backgroundColor) {
    // For white, silver, and other light colors, use dark gray border
    const lightColors = ['#F5F5F5', '#C0C0C0', '#E0F7FA', '#FFD700', '#FDB927'];
    if (lightColors.includes(backgroundColor)) {
        return '#333333';
    }
    // For all other colors, use the same color but darker
    return backgroundColor;
}

// Helper function to detect mobile screens
function isMobileView() {
    return window.innerWidth <= 480;
}

// Helper function to get mobile-optimized chart configuration
function getMobileChartOptions() {
    if (!isMobileView()) return {};
    
    return {
        layout: {
            padding: {
                left: 5,
                right: 5,
                top: 15,
                bottom: 5
            }
        },
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 11
                    },
                    padding: 8
                }
            },
            title: {
                font: {
                    size: 14
                }
            },
            datalabels: {
                font: {
                    size: 10
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: 11
                    },
                    padding: 3
                },
                title: {
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                ticks: {
                    font: {
                        size: 11
                    },
                    padding: 3
                },
                title: {
                    font: {
                        size: 11
                    }
                }
            }
        }
    };
}

// Helper function to merge chart options with mobile optimizations
function mergeChartOptions(baseOptions) {
    if (!isMobileView()) return baseOptions;
    
    const mobileOptions = getMobileChartOptions();
    
    // Deep merge function
    function deepMerge(target, source) {
        const output = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                output[key] = deepMerge(target[key] || {}, source[key]);
            } else {
                output[key] = source[key];
            }
        }
        return output;
    }
    
    return deepMerge(baseOptions, mobileOptions);
}

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Starting initialization...');
        initializeUI();
        console.log('UI initialized');
        renderAllVisualizations();
        console.log('Visualizations rendered');
        hideLoading();
        console.log('Initialization complete');
    } catch (error) {
        console.error('Error initializing app:', error);
        console.error('Error stack:', error.stack);
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
    setupEventListeners();
}

function renderParadeGrid() {
    const grid = document.getElementById('paradeGrid');
    grid.innerHTML = mardiGrasData.parades.map(parade => `
        <div class="parade-card" data-parade="${parade.keyName}">
            <img src="${parade.logo}" alt="${parade.name}" class="parade-logo" 
                 onerror="this.style.display='none'">
            <div class="parade-name">${parade.name}</div>
            <div class="parade-date">${parade.date}</div>
            <div class="parade-time">${parade.time}</div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Table sorting
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => sortTable(header));
    });
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

    const parades = ['unaffiliated', ...mardiGrasData.parades.map(p => p.keyName)];

    // Calculate beads
    Object.values(mardiGrasData.beads).forEach(colorData => {
        parades.forEach(parade => {
            if (colorData[parade]) {
                const paradeData = colorData[parade];
                
                if (parade === 'unaffiliated') {
                    // Handle unaffiliated size-based structure
                    ['small', 'medium', 'large', 'nonSphere'].forEach(size => {
                        if (paradeData[size]) {
                            stats.totalBeadsCount += paradeData[size].count || 0;
                            stats.totalBeadsWeight += paradeData[size].weight || 0;
                        }
                    });
                    if (paradeData.other) {
                        if (paradeData.other.medallion) {
                            stats.totalBeadsCount += paradeData.other.medallion.count || 0;
                            stats.totalBeadsWeight += paradeData.other.medallion.weight || 0;
                        }
                        if (paradeData.other.special) {
                            stats.totalBeadsCount += paradeData.other.special.count || 0;
                            stats.totalBeadsWeight += paradeData.other.special.weight || 0;
                        }
                    }
                } else {
                    // Handle parade beads (medallion/regular structure)
                    if (paradeData.medallion) {
                        stats.totalBeadsCount += paradeData.medallion.count || 0;
                        stats.totalBeadsWeight += paradeData.medallion.weight || 0;
                    }
                    if (paradeData.regular) {
                        stats.totalBeadsCount += paradeData.regular.count || 0;
                        stats.totalBeadsWeight += paradeData.regular.weight || 0;
                    }
                }
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
    stats.totalSpecials = Object.values(mardiGrasData.throws.specials.items)
        .reduce((sum, item) => sum + (item.count || 0), 0);

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
    
    // Render winners
    renderWinners();
}

function renderWinners() {
    const beadData = getBeadData();
    
    // Find winner by count
    let maxCount = 0;
    let countWinner = '';
    
    Object.entries(beadData).forEach(([color, data]) => {
        if (data.count > maxCount) {
            maxCount = data.count;
            countWinner = color;
        }
    });
    
    // Find winner by weight
    let maxWeight = 0;
    let weightWinner = '';
    
    Object.entries(beadData).forEach(([color, data]) => {
        if (data.weight > maxWeight) {
            maxWeight = data.weight;
            weightWinner = color;
        }
    });
    
    // Display winners
    const countWinnerEl = document.getElementById('winnerCount');
    const countDetailsEl = document.getElementById('winnerCountDetails');
    const weightWinnerEl = document.getElementById('winnerWeight');
    const weightDetailsEl = document.getElementById('winnerWeightDetails');
    
    if (countWinnerEl && countWinner) {
        countWinnerEl.textContent = countWinner.charAt(0).toUpperCase() + countWinner.slice(1);
        countDetailsEl.textContent = `${maxCount.toLocaleString()} beads`;
    }
    
    if (weightWinnerEl && weightWinner) {
        weightWinnerEl.textContent = weightWinner.charAt(0).toUpperCase() + weightWinner.slice(1);
        weightDetailsEl.textContent = `${maxWeight.toLocaleString()}g`;
    }
}

// ========================================
// Data Aggregation for Charts
// ========================================

function getBeadData() {
    const parades = ['unaffiliated', ...mardiGrasData.parades.map(p => p.keyName)];
    const colors = Object.keys(mardiGrasData.beads);

    const data = {};
    
    colors.forEach(color => {
        data[color] = { 
            count: 0, 
            weight: 0, 
            medallion: { count: 0, weight: 0 }, 
            regular: { count: 0, weight: 0 },
            unaffiliatedSizes: { small: 0, medium: 0, large: 0, nonSphere: 0, other: 0 }
        };
        
        parades.forEach(parade => {
            if (mardiGrasData.beads[color] && mardiGrasData.beads[color][parade]) {
                const paradeData = mardiGrasData.beads[color][parade];
                
                if (parade === 'unaffiliated') {
                    // Handle unaffiliated's size-based structure
                    if (paradeData.small) {
                        data[color].regular.count += paradeData.small.count || 0;
                        data[color].regular.weight += paradeData.small.weight || 0;
                        data[color].unaffiliatedSizes.small += paradeData.small.count || 0;
                    }
                    if (paradeData.medium) {
                        data[color].regular.count += paradeData.medium.count || 0;
                        data[color].regular.weight += paradeData.medium.weight || 0;
                        data[color].unaffiliatedSizes.medium += paradeData.medium.count || 0;
                    }
                    if (paradeData.large) {
                        data[color].regular.count += paradeData.large.count || 0;
                        data[color].regular.weight += paradeData.large.weight || 0;
                        data[color].unaffiliatedSizes.large += paradeData.large.count || 0;
                    }
                    if (paradeData.nonSphere) {
                        data[color].regular.count += paradeData.nonSphere.count || 0;
                        data[color].regular.weight += paradeData.nonSphere.weight || 0;
                        data[color].unaffiliatedSizes.nonSphere += paradeData.nonSphere.count || 0;
                    }
                    if (paradeData.other) {
                        if (paradeData.other.medallion) {
                            data[color].medallion.count += paradeData.other.medallion.count || 0;
                            data[color].medallion.weight += paradeData.other.medallion.weight || 0;
                        }
                        if (paradeData.other.special) {
                            data[color].regular.count += paradeData.other.special.count || 0;
                            data[color].regular.weight += paradeData.other.special.weight || 0;
                            data[color].unaffiliatedSizes.other += paradeData.other.special.count || 0;
                        }
                    }
                } else {
                    // Handle parade beads (medallion/regular structure)
                    if (paradeData.medallion) {
                        data[color].medallion.count += paradeData.medallion.count || 0;
                        data[color].medallion.weight += paradeData.medallion.weight || 0;
                    }
                    if (paradeData.regular) {
                        data[color].regular.count += paradeData.regular.count || 0;
                        data[color].regular.weight += paradeData.regular.weight || 0;
                    }
                }
            }
        });
        
        // Calculate totals (medallion + regular)
        data[color].count = data[color].medallion.count + data[color].regular.count;
        data[color].weight = data[color].medallion.weight + data[color].regular.weight;
    });

    return data;
}

// New function to get bead data with type breakdown by parade
function getBeadDataByType() {
    const parades = ['unaffiliated', ...mardiGrasData.parades.map(p => p.keyName)];

    const paradeLabels = parades.map(p => {
        if (p === 'unaffiliated') return 'Unaffiliated';
        const parade = mardiGrasData.parades.find(pr => pr.keyName === p);
        return parade ? parade.shortName : p;
    });

    const medallionData = parades.map(parade => {
        let total = 0;
        Object.values(mardiGrasData.beads).forEach(colorData => {
            if (colorData[parade]) {
                if (parade === 'unaffiliated') {
                    // For unaffiliated, only count other.medallion as medallion
                    if (colorData[parade].other && colorData[parade].other.medallion) {
                        total += colorData[parade].other.medallion.count || 0;
                    }
                } else {
                    // For parades, count medallion beads
                    if (colorData[parade].medallion) {
                        total += colorData[parade].medallion.count || 0;
                    }
                }
            }
        });
        return total;
    });

    const regularData = parades.map(parade => {
        let total = 0;
        Object.values(mardiGrasData.beads).forEach(colorData => {
            if (colorData[parade]) {
                if (parade === 'unaffiliated') {
                    // For unaffiliated, aggregate all sizes + other.special into regular
                    ['small', 'medium', 'large', 'nonSphere'].forEach(size => {
                        if (colorData[parade][size]) {
                            total += colorData[parade][size].count || 0;
                        }
                    });
                    if (colorData[parade].other && colorData[parade].other.special) {
                        total += colorData[parade].other.special.count || 0;
                    }
                } else {
                    // For parades, count regular beads
                    if (colorData[parade].regular) {
                        total += colorData[parade].regular.count || 0;
                    }
                }
            }
        });
        return total;
    });

    return { paradeLabels, medallionData, regularData };
}

// New function to get unaffiliated bead size breakdown
function getUnaffiliatedSizeData() {
    const sizeData = {
        small: 0,
        medium: 0,
        large: 0,
        nonSphere: 0,
        medallion: 0,
        special: 0
    };
    
    Object.values(mardiGrasData.beads).forEach(colorData => {
        if (colorData.unaffiliated) {
            ['small', 'medium', 'large', 'nonSphere'].forEach(size => {
                if (colorData.unaffiliated[size]) {
                    sizeData[size] += colorData.unaffiliated[size].count || 0;
                }
            });
            if (colorData.unaffiliated.other) {
                if (colorData.unaffiliated.other.medallion) {
                    sizeData.medallion += colorData.unaffiliated.other.medallion.count || 0;
                }
                if (colorData.unaffiliated.other.special) {
                    sizeData.special += colorData.unaffiliated.other.special.count || 0;
                }
            }
        }
    });
    
    return sizeData;
}

function getItemsData() {
    const parades = ['unaffiliated', ...mardiGrasData.parades.map(p => p.keyName)];

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
    const data = {};
    mardiGrasData.parades.forEach(parade => {
        data[parade.shortName] = mardiGrasData.doubloons[parade.keyName]?.count || 0;
    });
    return data;
}

function getParadeComparisonData() {
    const itemsData = {};
    const weightData = {};

    mardiGrasData.parades.forEach(parade => {
        const paradeShortName = parade.shortName;
        const paradeKey = parade.keyName;

        // Calculate total items
        let totalItems = 0;
        Object.values(mardiGrasData.throws.items).forEach(itemData => {
            totalItems += itemData[paradeKey]?.count || 0;
        });
        totalItems += mardiGrasData.throws.stuffedAnimals.parade[paradeKey]?.count || 0;
        itemsData[paradeShortName] = totalItems;

        // Calculate total bead weight (medallion + regular)
        let totalWeight = 0;
        Object.values(mardiGrasData.beads).forEach(colorData => {
            if (colorData[paradeKey]) {
                totalWeight += (colorData[paradeKey].medallion?.weight || 0) + (colorData[paradeKey].regular?.weight || 0);
            }
        });
        weightData[paradeShortName] = totalWeight;
    });

    return { itemsData, weightData };
}

// New functions for Beads by Parade analysis
function getBeadCountByParade() {
    const data = {};
    
    mardiGrasData.parades.forEach(parade => {
        const paradeShortName = parade.shortName;
        const paradeKey = parade.keyName;
        
        let totalCount = 0;
        Object.values(mardiGrasData.beads).forEach(colorData => {
            if (colorData[paradeKey]) {
                totalCount += (colorData[paradeKey].medallion?.count || 0) + (colorData[paradeKey].regular?.count || 0);
            }
        });
        data[paradeShortName] = totalCount;
    });
    
    return data;
}

function getBeadWeightByParade() {
    const data = {};
    
    mardiGrasData.parades.forEach(parade => {
        const paradeShortName = parade.shortName;
        const paradeKey = parade.keyName;
        
        let totalWeight = 0;
        Object.values(mardiGrasData.beads).forEach(colorData => {
            if (colorData[paradeKey]) {
                totalWeight += (colorData[paradeKey].medallion?.weight || 0) + (colorData[paradeKey].regular?.weight || 0);
            }
        });
        data[paradeShortName] = totalWeight;
    });
    
    return data;
}

function getColorDistributionByParade() {
    const data = {};
    
    mardiGrasData.parades.forEach(parade => {
        const paradeShortName = parade.shortName;
        const paradeKey = parade.keyName;
        
        data[paradeShortName] = {};
        
        Object.keys(mardiGrasData.beads).forEach(color => {
            const colorData = mardiGrasData.beads[color];
            if (colorData[paradeKey]) {
                const count = (colorData[paradeKey].medallion?.count || 0) + (colorData[paradeKey].regular?.count || 0);
                if (count > 0) {
                    data[paradeShortName][color] = count;
                }
            }
        });
    });
    
    return data;
}

function getMedallionCountByParade() {
    const data = {};
    
    mardiGrasData.parades.forEach(parade => {
        const paradeShortName = parade.shortName;
        const paradeKey = parade.keyName;
        
        let medallionCount = 0;
        Object.values(mardiGrasData.beads).forEach(colorData => {
            if (colorData[paradeKey] && colorData[paradeKey].medallion) {
                medallionCount += colorData[paradeKey].medallion.count || 0;
            }
        });
        data[paradeShortName] = medallionCount;
    });
    
    return data;
}

function getColorVarietyByParade() {
    const data = {};
    
    mardiGrasData.parades.forEach(parade => {
        const paradeShortName = parade.shortName;
        const paradeKey = parade.keyName;
        
        let colorCount = 0;
        Object.values(mardiGrasData.beads).forEach(colorData => {
            if (colorData[paradeKey]) {
                const count = (colorData[paradeKey].medallion?.count || 0) + (colorData[paradeKey].regular?.count || 0);
                if (count > 0) {
                    colorCount++;
                }
            }
        });
        data[paradeShortName] = colorCount;
    });
    
    return data;
}

function getParadeWinners() {
    const countData = getBeadCountByParade();
    const weightData = getBeadWeightByParade();
    const colorVarietyData = getColorVarietyByParade();
    const medallionData = getMedallionCountByParade();
    
    // Find winners
    let mostGenerous = { name: '', count: 0 };
    let heaviest = { name: '', weight: 0 };
    let mostColorful = { name: '', colorCount: 0 };
    let medallionKing = { name: '', count: 0 };
    
    Object.entries(countData).forEach(([parade, count]) => {
        if (count > mostGenerous.count) {
            mostGenerous = { name: parade, count };
        }
    });
    
    Object.entries(weightData).forEach(([parade, weight]) => {
        if (weight > heaviest.weight) {
            heaviest = { name: parade, weight };
        }
    });
    
    Object.entries(colorVarietyData).forEach(([parade, colorCount]) => {
        if (colorCount > mostColorful.colorCount) {
            mostColorful = { name: parade, colorCount };
        }
    });
    
    Object.entries(medallionData).forEach(([parade, count]) => {
        if (count > medallionKing.count) {
            medallionKing = { name: parade, count };
        }
    });
    
    return { mostGenerous, heaviest, mostColorful, medallionKing };
}

// ========================================
// Chart Rendering
// ========================================

function renderAllVisualizations() {
    // Beads by Color Analysis
    updateBeadCharts();
    
    // Beads by Parade Analysis  
    renderParadeBeadCharts();
    
    // Unaffiliated breakdown
    renderUnaffiliatedSizeChart();
    
    // Other sections
    renderItemsChart();
    renderStuffedAnimalsChart();
    renderSpecialsChart();
    
    // Tables
    renderTables();
}

function renderParadeBeadCharts() {
    // Charts moved from other sections
    renderBeadTypesByParadeChart();
    renderMedallionVsRegularByParadeChart();
    
    // New parade-focused charts
    renderBeadCountByParadeChart();
    renderBeadWeightByParadeChart();
    renderColorDistributionByParadeChart();
    renderDoubloonsChart();
    
    // Parade winners
    renderParadeWinners();
}

function updateBeadCharts() {
    const beadData = getBeadData();
    
    renderBeadCountChart(beadData);
    renderBeadWeightChart(beadData);
    renderBeadPercentageChart(beadData);
    renderMedallionVsRegularByColorChart(); // Moved to color section
}

function renderBeadCountChart(beadData) {
    const ctx = document.getElementById('beadCountChart');
    const labels = Object.keys(beadData);
    const data = labels.map(color => beadData[color].count);
    const colors = labels.map(color => BEAD_COLORS[color] || '#999');

    if (charts.beadCount) charts.beadCount.destroy();
    
    const baseOptions = {
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
    };
    
    charts.beadCount = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                label: 'Count',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => getBorderColor(c)),
                borderWidth: 2
            }]
        },
        options: mergeChartOptions(baseOptions),
        plugins: [ChartDataLabels]
    });
}

function renderBeadWeightChart(beadData) {
    const ctx = document.getElementById('beadWeightChart');
    const labels = Object.keys(beadData);
    const data = labels.map(color => beadData[color].weight);
    const colors = labels.map(color => BEAD_COLORS[color] || '#999');

    if (charts.beadWeight) charts.beadWeight.destroy();
    
    const baseOptions = {
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
    };
    
    charts.beadWeight = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                label: 'Weight (g)',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => getBorderColor(c)),
                borderWidth: 2
            }]
        },
        options: mergeChartOptions(baseOptions),
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
    
    const baseOptions = {
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
                position: isMobileView() ? 'bottom' : 'right',
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
    };
    
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
        options: mergeChartOptions(baseOptions),
        plugins: [ChartDataLabels]
    });
}

function renderBeadTypesByParadeChart() {
    const ctx = document.getElementById('beadTypesByParadeChart');
    
    // Get parades to display
    const parades = ['unaffiliated', ...mardiGrasData.parades.map(p => p.keyName)];
    
    const paradeLabels = parades.map(p => {
        if (p === 'unaffiliated') return 'Unaffiliated';
        const parade = mardiGrasData.parades.find(pr => pr.keyName === p);
        return parade ? parade.shortName : p;
    });
    
    // Calculate medallion and regular bead totals for each parade
    const medallionData = parades.map(parade => {
        let total = 0;
        Object.values(mardiGrasData.beads).forEach(colorData => {
            if (colorData[parade] && colorData[parade].medallion) {
                total += colorData[parade].medallion.count || 0;
            }
        });
        return total;
    });
    
    const regularData = parades.map(parade => {
        let total = 0;
        Object.values(mardiGrasData.beads).forEach(colorData => {
            if (colorData[parade] && colorData[parade].regular) {
                total += colorData[parade].regular.count || 0;
            }
        });
        return total;
    });
    
    if (charts.beadTypesByParade) charts.beadTypesByParade.destroy();
    
    const baseOptions = {
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
    };
    
    charts.beadTypesByParade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: paradeLabels,
            datasets: [
                {
                    label: 'Regular Beads',
                    data: regularData,
                    backgroundColor: CHART_COLORS.purple,
                    borderColor: CHART_COLORS.purple,
                    borderWidth: 1
                },
                {
                    label: 'Medallion Beads',
                    data: medallionData,
                    backgroundColor: CHART_COLORS.gold,
                    borderColor: CHART_COLORS.gold,
                    borderWidth: 1
                }
            ]
        },
        options: mergeChartOptions(baseOptions),
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
    
    const baseOptions = {
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
                position: isMobileView() ? 'bottom' : 'right',
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
    };
    
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
        options: mergeChartOptions(baseOptions),
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
    
    const baseOptions = {
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
    };
    
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
        options: mergeChartOptions(baseOptions),
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
    
    const baseOptions = {
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
    };
    
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
        options: mergeChartOptions(baseOptions),
        plugins: [ChartDataLabels]
    });
}

function renderDoubloonsChart() {
    const ctx = document.getElementById('doubloonsChart');
    const doubloonsData = getDoubloonsData();
    const labels = Object.keys(doubloonsData);
    const data = Object.values(doubloonsData);
    const isHorizontal = true; // Always horizontal since we show all parades
    const colors = generateColorPattern(labels.length);

    if (charts.doubloons) charts.doubloons.destroy();
    
    const baseOptions = {
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
    };
    
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
        options: mergeChartOptions(baseOptions),
        plugins: [ChartDataLabels]
    });
}

function renderMedallionVsRegularCharts() {
    // Render medallion vs regular by color
    renderMedallionVsRegularByColorChart();
    
    // Render medallion vs regular by parade  
    renderMedallionVsRegularByParadeChart();
    
    // Render unaffiliated size breakdown
    renderUnaffiliatedSizeChart();
}

function renderMedallionVsRegularByColorChart() {
    const ctx = document.getElementById('medallionVsRegularColorChart');
    if (!ctx) return; // Chart element doesn't exist yet
    
    const beadData = getBeadData();
    const labels = Object.keys(beadData).filter(color => beadData[color].count > 0);
    const medallionCounts = labels.map(color => beadData[color].medallion.count);
    const regularCounts = labels.map(color => beadData[color].regular.count);
    const colors = labels.map(color => BEAD_COLORS[color] || '#999');
    
    if (charts.medallionVsRegularColor) charts.medallionVsRegularColor.destroy();
    
    const baseOptions = {
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
            legend: { 
                display: true,
                position: 'top',
                labels: {
                    padding: 15
                }
            },
            datalabels: {
                color: '#2D1B4E',
                font: {
                    weight: 'bold',
                    size: 11
                },
                formatter: (value) => value > 0 ? value : ''
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.parsed.y}`
                }
            }
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    padding: 5
                }
            },
            y: { 
                stacked: true,
                beginAtZero: true,
                title: { display: true, text: 'Count' },
                ticks: {
                    padding: 5
                }
            }
        }
    };
    
    charts.medallionVsRegularColor = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [
                {
                    label: 'Regular',
                    data: regularCounts,
                    backgroundColor: colors.map(c => c),
                    borderColor: colors.map(c => getBorderColor(c)),
                    borderWidth: 2
                },
                {
                    label: 'Medallion',
                    data: medallionCounts,
                    backgroundColor: colors.map(c => c + 'CC'),
                    borderColor: colors.map(c => getBorderColor(c)),
                    borderWidth: 2,
                    borderDash: [5, 5]
                }
            ]
        },
        options: mergeChartOptions(baseOptions),
        plugins: [ChartDataLabels]
    });
}

function renderMedallionVsRegularByParadeChart() {
    const ctx = document.getElementById('medallionVsRegularParadeChart');
    if (!ctx) return; // Chart element doesn't exist yet
    
    const { paradeLabels, medallionData, regularData } = getBeadDataByType();
    
    if (charts.medallionVsRegularParade) charts.medallionVsRegularParade.destroy();
    
    const baseOptions = {
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
                    padding: 15
                }
            },
            datalabels: {
                color: '#2D1B4E',
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
                    stepSize: 20
                }
            },
            y: {
                stacked: true,
                ticks: {
                    padding: 10,
                    autoSkip: false,
                    font: {
                        size: 10
                    }
                }
            }
        }
    };
    
    charts.medallionVsRegularParade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: paradeLabels,
            datasets: [
                {
                    label: 'Regular Beads',
                    data: regularData,
                    backgroundColor: CHART_COLORS.purple,
                    borderColor: CHART_COLORS.purple,
                    borderWidth: 2
                },
                {
                    label: 'Medallion Beads',
                    data: medallionData,
                    backgroundColor: CHART_COLORS.gold,
                    borderColor: CHART_COLORS.gold,
                    borderWidth: 2
                }
            ]
        },
        options: mergeChartOptions(baseOptions),
        plugins: [ChartDataLabels]
    });
}

function renderUnaffiliatedSizeChart() {
    const ctx = document.getElementById('unaffiliatedSizeChart');
    if (!ctx) return; // Chart element doesn't exist yet
    
    const sizeData = getUnaffiliatedSizeData();
    const labels = ['Small', 'Medium', 'Large', 'Non-Sphere', 'Medallion', 'Special'];
    const data = [
        sizeData.small,
        sizeData.medium,
        sizeData.large,
        sizeData.nonSphere,
        sizeData.medallion,
        sizeData.special
    ];
    
    // Filter out zero values
    const filteredData = [];
    const filteredLabels = [];
    labels.forEach((label, index) => {
        if (data[index] > 0) {
            filteredLabels.push(label);
            filteredData.push(data[index]);
        }
    });
    
    if (filteredData.length === 0) {
        // No unaffiliated beads, hide the chart
        if (charts.unaffiliatedSize) charts.unaffiliatedSize.destroy();
        return;
    }
    
    const colors = generateColorPattern(filteredLabels.length);
    
    if (charts.unaffiliatedSize) charts.unaffiliatedSize.destroy();
    
    const baseOptions = {
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
                position: isMobileView() ? 'bottom' : 'right',
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
                formatter: (value) => value > 0 ? value : ''
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.label}: ${context.parsed}`
                }
            }
        }
    };
    
    charts.unaffiliatedSize = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: filteredLabels,
            datasets: [{
                data: filteredData,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: mergeChartOptions(baseOptions),
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
    
    const itemsBaseOptions = {
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
    };
    
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
        options: mergeChartOptions(itemsBaseOptions),
        plugins: [ChartDataLabels]
    });

    // Total Weight Chart
    const weightCtx = document.getElementById('paradeWeightChart');
    if (charts.paradeWeight) charts.paradeWeight.destroy();
    
    const weightBaseOptions = {
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
    };
    
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
        options: mergeChartOptions(weightBaseOptions),
        plugins: [ChartDataLabels]
    });
}

// ========================================
// Beads by Parade Visualizations
// ========================================

function renderBeadCountByParadeChart() {
    const ctx = document.getElementById('beadCountByParadeChart');
    if (!ctx) return;
    
    const data = getBeadCountByParade();
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([parade]) => parade);
    const values = sorted.map(([, count]) => count);
    const colors = generateColorPattern(labels.length);
    
    if (charts.beadCountByParade) charts.beadCountByParade.destroy();
    
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        layout: {
            padding: { left: 10, right: 60, top: 10, bottom: 10 }
        },
        plugins: {
            legend: { display: false },
            datalabels: {
                anchor: 'end',
                align: 'right',
                color: '#2D1B4E',
                font: { weight: 'bold', size: 11 },
                formatter: (value) => value.toLocaleString()
            }
        },
        scales: {
            x: { 
                beginAtZero: true,
                title: { display: true, text: 'Bead Count' },
                ticks: { padding: 5 }
            },
            y: {
                ticks: { padding: 10, autoSkip: false, font: { size: 11 } }
            }
        }
    };
    
    charts.beadCountByParade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bead Count',
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: mergeChartOptions(baseOptions),
        plugins: [ChartDataLabels]
    });
}

function renderBeadWeightByParadeChart() {
    const ctx = document.getElementById('beadWeightByParadeChart');
    if (!ctx) return;
    
    const data = getBeadWeightByParade();
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([parade]) => parade);
    const values = sorted.map(([, weight]) => weight);
    const colors = generateColorPattern(labels.length);
    
    if (charts.beadWeightByParade) charts.beadWeightByParade.destroy();
    
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        layout: {
            padding: { left: 10, right: 60, top: 10, bottom: 10 }
        },
        plugins: {
            legend: { display: false },
            datalabels: {
                anchor: 'end',
                align: 'right',
                color: '#2D1B4E',
                font: { weight: 'bold', size: 11 },
                formatter: (value) => value.toLocaleString() + 'g'
            }
        },
        scales: {
            x: { 
                beginAtZero: true,
                title: { display: true, text: 'Weight (grams)' },
                ticks: { padding: 5 }
            },
            y: {
                ticks: { padding: 10, autoSkip: false, font: { size: 11 } }
            }
        }
    };
    
    charts.beadWeightByParade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bead Weight',
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: mergeChartOptions(baseOptions),
        plugins: [ChartDataLabels]
    });
}

function renderColorDistributionByParadeChart() {
    const ctx = document.getElementById('colorDistributionByParadeChart');
    if (!ctx) return;
    
    const distributionData = getColorDistributionByParade();
    
    // Sort parades by total count
    const paradesSorted = Object.entries(distributionData)
        .map(([parade, colors]) => ({
            parade,
            total: Object.values(colors).reduce((sum, count) => sum + count, 0),
            colors
        }))
        .sort((a, b) => b.total - a.total);
    
    const paradeLabels = paradesSorted.map(p => p.parade);
    
    // Get all unique colors across all parades
    const allColors = new Set();
    paradesSorted.forEach(p => {
        Object.keys(p.colors).forEach(color => allColors.add(color));
    });
    
    // Create datasets for each color
    const datasets = Array.from(allColors).map(color => {
        const bgColor = BEAD_COLORS[color] || '#999';
        return {
            label: color.charAt(0).toUpperCase() + color.slice(1),
            data: paradesSorted.map(p => p.colors[color] || 0),
            backgroundColor: bgColor,
            borderColor: getBorderColor(bgColor),
            borderWidth: 1
        };
    });
    
    if (charts.colorDistributionByParade) charts.colorDistributionByParade.destroy();
    
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        layout: {
            padding: { left: 10, right: 10, top: 10, bottom: 10 }
        },
        plugins: {
            legend: {
                display: true,
                position: isMobileView() ? 'bottom' : 'right',
                labels: { padding: 8, boxWidth: 12, font: { size: 10 } }
            },
            datalabels: { display: false }
        },
        scales: {
            x: {
                stacked: true,
                beginAtZero: true,
                title: { display: true, text: 'Bead Count' },
                ticks: { padding: 5 }
            },
            y: {
                stacked: true,
                ticks: { padding: 10, autoSkip: false, font: { size: 10 } }
            }
        }
    };
    
    charts.colorDistributionByParade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: paradeLabels,
            datasets: datasets
        },
        options: mergeChartOptions(baseOptions)
    });
}

function renderParadeWinners() {
    const winners = getParadeWinners();
    
    // Most Generous
    const mostGenerousEl = document.getElementById('paradeWinnerGenerous');
    const mostGenerousDetailsEl = document.getElementById('paradeWinnerGenerousDetails');
    if (mostGenerousEl && winners.mostGenerous.name) {
        mostGenerousEl.textContent = winners.mostGenerous.name;
        mostGenerousDetailsEl.textContent = `${winners.mostGenerous.count.toLocaleString()} beads`;
    }
    
    // Heaviest
    const heaviestEl = document.getElementById('paradeWinnerHeaviest');
    const heaviestDetailsEl = document.getElementById('paradeWinnerHeaviestDetails');
    if (heaviestEl && winners.heaviest.name) {
        heaviestEl.textContent = winners.heaviest.name;
        heaviestDetailsEl.textContent = `${winners.heaviest.weight.toLocaleString()}g`;
    }
    
    // Most Colorful
    const colorfulEl = document.getElementById('paradeWinnerColorful');
    const colorfulDetailsEl = document.getElementById('paradeWinnerColorfulDetails');
    if (colorfulEl && winners.mostColorful.name) {
        colorfulEl.textContent = winners.mostColorful.name;
        colorfulDetailsEl.textContent = `${winners.mostColorful.colorCount} colors`;
    }
    
    // Medallion King
    const medallionEl = document.getElementById('paradeWinnerMedallion');
    const medallionDetailsEl = document.getElementById('paradeWinnerMedallionDetails');
    if (medallionEl && winners.medallionKing.name) {
        medallionEl.textContent = winners.medallionKing.name;
        medallionDetailsEl.textContent = `${winners.medallionKing.count.toLocaleString()} medallions`;
    }
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
                <td>${data.medallion.count.toLocaleString()}</td>
                <td>${data.regular.count.toLocaleString()}</td>
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
