// ========================================
// Mardi Gras 2026 - Throws Tracker App
// Updated: 2026-02-21 21:30
// ========================================
// Data is loaded from data.js which is included before this script.
// Edit data.js to update parade and throws information.

// Global state
let charts = {};
let weightUnit = 'grams'; // Default weight unit: 'grams' or 'pounds'

// Helper function to convert grams to pounds
function gramsToLbs(grams) {
    return grams / 453.592; // 1 pound = 453.592 grams
}

// Helper function to format weight based on current unit
function formatWeight(grams) {
    if (weightUnit === 'pounds') {
        const pounds = gramsToLbs(grams);
        return pounds.toFixed(2) + ' lbs';
    } else {
        return Math.round(grams).toLocaleString() + 'g';
    }
}

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

// Helper function to generate evenly-spaced colors around the color wheel
function generateDistinctColors(count) {
    const colors = [];
    const hueStep = 360 / count; // Divide color wheel evenly
    const saturation = 70; // Keep saturation consistent for vibrancy
    const lightness = 55; // Keep lightness consistent for readability
    
    for (let i = 0; i < count; i++) {
        const hue = Math.round(i * hueStep);
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    
    return colors;
}

// Item-specific colors for Items Distribution chart (deprecated - using dynamic colors now)
const ITEM_COLORS = {
    beads: '#8B5FBF',           // 270° - Purple medium - signature Mardi Gras item
    cups: '#E91E63',            // 330° - Deep pink - festive
    hats: '#FF5722',            // 15° - Deep orange/red - fun and bold
    sunglasses: '#FF9800',      // 36° - Orange - bright
    coconuts: '#FDD835',        // 54° - Yellow - natural
    footballs: '#8BC34A',       // 88° - Light green - sports/field
    frisbees: '#009688',        // 174° - Teal - playful
    'stuffed animals': '#03A9F4', // 199° - Light blue - soft and cute
    doubloons: '#2196F3',       // 207° - Blue - classic
    toys: '#3F51B5',            // 231° - Indigo - playful energy
    flags: '#673AB7',           // 262° - Deep purple - festive
    banners: '#9C27B0',         // 291° - Purple - regal
    'light up items': '#E91E63', // 330° - Magenta - glowing
    masks: '#F44336',           // 4° - Red - mysterious masquerade
    medallions: '#D4AF37'       // 45° - Gold - precious metal
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

// Helper function to calculate relative luminance of a color
function getLuminance(color) {
    // Convert hex or hsl to RGB
    let r, g, b;
    
    if (color.startsWith('#')) {
        // Hex color
        const hex = color.replace('#', '');
        r = parseInt(hex.substr(0, 2), 16) / 255;
        g = parseInt(hex.substr(2, 2), 16) / 255;
        b = parseInt(hex.substr(4, 2), 16) / 255;
    } else if (color.startsWith('hsl')) {
        // HSL color - convert to RGB
        const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (hslMatch) {
            const h = parseInt(hslMatch[1]) / 360;
            const s = parseInt(hslMatch[2]) / 100;
            const l = parseInt(hslMatch[3]) / 100;
            
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        } else {
            return 0.5; // Fallback
        }
    } else if (color.startsWith('rgb')) {
        // RGB color
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            r = parseInt(rgbMatch[1]) / 255;
            g = parseInt(rgbMatch[2]) / 255;
            b = parseInt(rgbMatch[3]) / 255;
        } else {
            return 0.5; // Fallback
        }
    } else {
        return 0.5; // Fallback for unknown formats
    }
    
    // Apply gamma correction
    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
    // Calculate relative luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Helper function to get contrasting text color (black or white)
function getContrastColor(backgroundColor) {
    const luminance = getLuminance(backgroundColor);
    // Use white text for dark backgrounds (luminance < 0.5), black for light backgrounds
    return luminance > 0.5 ? '#2D1B4E' : '#FFFFFF';
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
// Chart.js Plugins
// ========================================

// Plugin to enforce minimum bar length for non-zero values in stacked horizontal bar charts
const minBarLengthPlugin = {
    id: 'minBarLength',
    beforeDatasetsDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        const xScale = scales.x;
        const yScale = scales.y;
        
        // Only apply to horizontal bar charts with stacked data
        if (chart.config.type !== 'bar' || chart.config.options.indexAxis !== 'y') {
            return;
        }
        
        // Minimum visual width in pixels for non-zero values
        const MIN_BAR_WIDTH = 25;
        
        // Iterate through each dataset
        chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            if (!meta.visible) return;
            
            meta.data.forEach((bar, index) => {
                const value = dataset.data[index];
                
                // Only apply to non-zero values
                if (value <= 0) return;
                
                // Calculate the actual bar width
                const barWidth = bar.width;
                
                // If bar is too small, artificially extend it
                if (barWidth < MIN_BAR_WIDTH && barWidth > 0) {
                    bar.width = MIN_BAR_WIDTH;
                }
            });
        });
    }
};

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
    
    // Weight unit selector
    const weightUnitSelector = document.getElementById('weightUnit');
    if (weightUnitSelector) {
        weightUnitSelector.addEventListener('change', (e) => {
            weightUnit = e.target.value;
            // Re-render all weight-related displays
            renderStatistics();
            updateBeadCharts();
            renderParadeBeadCharts();
            renderTables();
        });
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
    document.getElementById('totalBeadsWeight').textContent = formatWeight(stats.totalBeadsWeight);
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
        weightDetailsEl.textContent = formatWeight(maxWeight);
    }
}

function renderItemsWinners() {
    const winners = getItemsWinners();
    
    // Display most common item
    const itemWinnerEl = document.getElementById('winnerItemMost');
    const itemDetailsEl = document.getElementById('winnerItemMostDetails');
    
    if (itemWinnerEl && winners.mostCommonItem.name) {
        const itemName = winners.mostCommonItem.name.charAt(0).toUpperCase() + winners.mostCommonItem.name.slice(1);
        itemWinnerEl.textContent = itemName;
        itemDetailsEl.textContent = `${winners.mostCommonItem.count.toLocaleString()} items`;
    }
    
    // Display most common stuffed animal
    const animalWinnerEl = document.getElementById('winnerStuffedAnimal');
    const animalDetailsEl = document.getElementById('winnerStuffedAnimalDetails');
    
    if (animalWinnerEl && winners.mostCommonAnimal.name) {
        const animalName = winners.mostCommonAnimal.name.replace(/([A-Z])/g, ' $1').trim();
        animalWinnerEl.textContent = animalName.charAt(0).toUpperCase() + animalName.slice(1);
        animalDetailsEl.textContent = `${winners.mostCommonAnimal.count.toLocaleString()} caught`;
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

// New function to get color breakdown by unaffiliated subtype
function getUnaffiliatedColorBySubtype() {
    const subtypes = ['small', 'medium', 'large', 'nonSphere', 'medallion', 'special'];
    const data = {};
    
    // Initialize data structure: { subtype: { color: count } }
    subtypes.forEach(subtype => {
        data[subtype] = {};
    });
    
    // Aggregate color counts for each subtype
    Object.keys(mardiGrasData.beads).forEach(color => {
        const colorData = mardiGrasData.beads[color];
        if (colorData.unaffiliated) {
            // Handle size-based subtypes
            ['small', 'medium', 'large', 'nonSphere'].forEach(size => {
                if (colorData.unaffiliated[size] && colorData.unaffiliated[size].count > 0) {
                    data[size][color] = (data[size][color] || 0) + colorData.unaffiliated[size].count;
                }
            });
            
            // Handle other subtypes
            if (colorData.unaffiliated.other) {
                if (colorData.unaffiliated.other.medallion && colorData.unaffiliated.other.medallion.count > 0) {
                    data['medallion'][color] = (data['medallion'][color] || 0) + colorData.unaffiliated.other.medallion.count;
                }
                if (colorData.unaffiliated.other.special && colorData.unaffiliated.other.special.count > 0) {
                    data['special'][color] = (data['special'][color] || 0) + colorData.unaffiliated.other.special.count;
                }
            }
        }
    });
    
    return data;
}

// Get unaffiliated winners data
function getUnaffiliatedWinners() {
    const sizeData = getUnaffiliatedSizeData();
    const colorBySubtype = getUnaffiliatedColorBySubtype();
    
    // Find most common shape
    const shapes = ['small', 'medium', 'large', 'nonSphere', 'medallion', 'special'];
    const shapeLabels = ['Small', 'Medium', 'Large', 'Non-Sphere', 'Medallion', 'Special'];
    let maxShapeCount = 0;
    let winnerShape = '';
    let winnerShapeLabel = '';
    
    shapes.forEach((shape, index) => {
        const count = sizeData[shape] || 0;
        if (count > maxShapeCount) {
            maxShapeCount = count;
            winnerShape = shape;
            winnerShapeLabel = shapeLabels[index];
        }
    });
    
    // Find most colorful shape (shape with most different colors)
    let maxColorCount = 0;
    let mostColorfulShape = '';
    let mostColorfulShapeLabel = '';
    
    shapes.forEach((shape, index) => {
        const colorCount = Object.keys(colorBySubtype[shape] || {}).length;
        if (colorCount > maxColorCount) {
            maxColorCount = colorCount;
            mostColorfulShape = shape;
            mostColorfulShapeLabel = shapeLabels[index];
        }
    });
    
    return {
        mostCommon: { shape: winnerShapeLabel, count: maxShapeCount },
        mostColorful: { shape: mostColorfulShapeLabel, colorCount: maxColorCount }
    };
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

function getItemsWinners() {
    const itemsData = getItemsData();
    
    // Find most common item
    let maxItemCount = 0;
    let mostCommonItem = '';
    
    Object.entries(itemsData).forEach(([item, count]) => {
        if (count > maxItemCount) {
            maxItemCount = count;
            mostCommonItem = item;
        }
    });
    
    // Find most common stuffed animal
    const typeData = mardiGrasData.throws.stuffedAnimals.type;
    let maxAnimalCount = 0;
    let mostCommonAnimal = '';
    
    Object.entries(typeData).forEach(([type, data]) => {
        if (data.count > maxAnimalCount) {
            maxAnimalCount = data.count;
            mostCommonAnimal = type;
        }
    });
    
    return {
        mostCommonItem: { name: mostCommonItem, count: maxItemCount },
        mostCommonAnimal: { name: mostCommonAnimal, count: maxAnimalCount }
    };
}

function getItemsByParadeData() {
    const parades = ['unaffiliated', ...mardiGrasData.parades.map(p => p.keyName)];
    const paradeLabels = parades.map(p => {
        if (p === 'unaffiliated') return 'Unaffiliated';
        const parade = mardiGrasData.parades.find(pr => pr.keyName === p);
        return parade ? parade.shortName : p;
    });
    
    // Get all item types
    const itemTypes = Object.keys(mardiGrasData.throws.items);
    
    // Build dataset for each item type
    const datasets = itemTypes.map(itemType => {
        const data = parades.map(parade => {
            return mardiGrasData.throws.items[itemType][parade]?.count || 0;
        });
        return {
            label: itemType.charAt(0).toUpperCase() + itemType.slice(1),
            data: data
        };
    });
    
    return {
        labels: paradeLabels,
        datasets: datasets,
        itemTypes: itemTypes
    };
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
    renderUnaffiliatedColorBySubtypeChart();
    renderUnaffiliatedWinners();
    
    // Other sections
    renderItemsChart();
    renderItemsWinners();
    renderStuffedAnimalsChart();
    renderItemsByParadeChart();
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
    const dataInGrams = labels.map(color => beadData[color].weight);
    
    // Convert data based on weight unit
    const data = weightUnit === 'pounds' 
        ? dataInGrams.map(g => gramsToLbs(g))
        : dataInGrams;
    
    const colors = labels.map(color => BEAD_COLORS[color] || '#999');
    
    // Determine unit label and formatter
    const unitLabel = weightUnit === 'pounds' ? 'lbs' : 'g';
    const unitText = weightUnit === 'pounds' ? 'Weight (pounds)' : 'Weight (grams)';
    const formatter = weightUnit === 'pounds' 
        ? (value) => value.toFixed(2) + ' lbs'
        : (value) => Math.round(value) + 'g';

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
                formatter: formatter
            },
            tooltip: {
                callbacks: {
                    label: (context) => `Weight: ${formatter(context.parsed.y)}`
                }
            }
        },
        scales: {
            y: { 
                beginAtZero: true, 
                title: { display: true, text: unitText },
                ticks: {
                    padding: 5,
                    callback: function(value) {
                        return weightUnit === 'pounds' ? value.toFixed(2) : Math.round(value);
                    }
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
                label: `Weight (${unitLabel})`,
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
        maintainAspectRatio: true,
        aspectRatio: 1,
        layout: {
            padding: {
                left: 5,
                right: 5,
                top: 5,
                bottom: 5
            }
        },
        plugins: {
            legend: { 
                position: isMobileView() ? 'bottom' : 'right',
                labels: {
                    padding: isMobileView() ? 4 : 8,
                    boxWidth: isMobileView() ? 10 : 12,
                    font: {
                        size: isMobileView() ? 9 : 11
                    }
                }
            },
            datalabels: {
                color: (context) => {
                    const bgColor = context.dataset.backgroundColor[context.dataIndex];
                    return getContrastColor(bgColor);
                },
                font: {
                    weight: 'bold',
                    size: isMobileView() ? 9 : 11
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
    
    // Generate evenly-spaced distinct colors for all items
    const colors = generateDistinctColors(labels.length);

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
                color: (context) => {
                    // Get the background color of the current segment
                    const bgColor = context.dataset.backgroundColor[context.dataIndex];
                    return getContrastColor(bgColor);
                },
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
    
    charts.items = new Chart(ctx, {
        type: 'doughnut',
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
        indexAxis: 'y', // Horizontal bars
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

function renderItemsByParadeChart() {
    const ctx = document.getElementById('itemsByParadeChart');
    if (!ctx) return;
    
    const itemsByParadeData = getItemsByParadeData();
    const { labels, datasets, itemTypes } = itemsByParadeData;
    
    // Generate distinct colors for each item type
    const itemColors = generateDistinctColors(itemTypes.length);
    
    // Map colors to datasets
    const coloredDatasets = datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: itemColors[index],
        borderColor: itemColors[index],
        borderWidth: 1
    }));
    
    if (charts.itemsByParade) charts.itemsByParade.destroy();
    
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Horizontal bars
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
                position: 'top',
                labels: {
                    padding: 10,
                    boxWidth: 15
                }
            },
            datalabels: {
                display: false // Don't show individual values on stacked segments
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.x;
                        return value > 0 ? `${label}: ${value}` : '';
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: true,
                beginAtZero: true,
                title: { display: true, text: 'Item Count' },
                ticks: {
                    padding: 5,
                    stepSize: 5,
                    precision: 0
                }
            },
            y: {
                stacked: true,
                ticks: {
                    padding: 5
                }
            }
        }
    };
    
    charts.itemsByParade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: coloredDatasets
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
                color: (context) => {
                    // For stacked bars, get the color from the dataset's backgroundColor array
                    const bgColor = Array.isArray(context.dataset.backgroundColor)
                        ? context.dataset.backgroundColor[context.dataIndex]
                        : context.dataset.backgroundColor;
                    return getContrastColor(bgColor);
                },
                font: {
                    weight: 'bold',
                    size: 11
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
                    padding: 5
                }
            },
            y: { 
                stacked: true,
                ticks: {
                    padding: 10,
                    autoSkip: false
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
                color: (context) => {
                    const bgColor = context.dataset.backgroundColor;
                    return getContrastColor(bgColor);
                },
                font: {
                    weight: 'bold',
                    size: 10
                },
                formatter: (value) => value > 0 ? value : '',
                anchor: 'center',
                align: 'center'
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
    
    // Generate evenly-spaced distinct colors for all shapes
    const colors = generateDistinctColors(filteredLabels.length);
    
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
                color: (context) => {
                    const bgColor = context.dataset.backgroundColor[context.dataIndex];
                    return getContrastColor(bgColor);
                },
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

function renderUnaffiliatedColorBySubtypeChart() {
    const ctx = document.getElementById('unaffiliatedColorBySubtypeChart');
    if (!ctx) return; // Chart element doesn't exist yet
    
    const colorBySubtype = getUnaffiliatedColorBySubtype();
    const subtypeLabels = ['Small', 'Medium', 'Large', 'Non-Sphere', 'Medallion', 'Special'];
    const subtypeKeys = ['small', 'medium', 'large', 'nonSphere', 'medallion', 'special'];
    
    // Filter out subtypes with no data
    const activeSubtypes = [];
    const activeLabels = [];
    subtypeKeys.forEach((key, index) => {
        if (Object.keys(colorBySubtype[key]).length > 0) {
            activeSubtypes.push(key);
            activeLabels.push(subtypeLabels[index]);
        }
    });
    
    if (activeSubtypes.length === 0) {
        // No unaffiliated beads, hide the chart
        if (charts.unaffiliatedColorBySubtype) charts.unaffiliatedColorBySubtype.destroy();
        return;
    }
    
    // Get all unique colors across all subtypes
    const allColors = new Set();
    activeSubtypes.forEach(subtype => {
        Object.keys(colorBySubtype[subtype]).forEach(color => allColors.add(color));
    });
    
    // Create datasets for each color
    const datasets = Array.from(allColors).map(color => {
        const bgColor = BEAD_COLORS[color] || '#999';
        return {
            label: color.charAt(0).toUpperCase() + color.slice(1),
            data: activeSubtypes.map(subtype => colorBySubtype[subtype][color] || 0),
            backgroundColor: bgColor,
            borderColor: getBorderColor(bgColor),
            borderWidth: 1
        };
    });
    
    if (charts.unaffiliatedColorBySubtype) charts.unaffiliatedColorBySubtype.destroy();
    
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
            datalabels: {
                color: (context) => {
                    const bgColor = context.dataset.backgroundColor;
                    return getContrastColor(bgColor);
                },
                font: {
                    weight: 'bold',
                    size: 10
                },
                formatter: (value) => value > 0 ? value : '',
                anchor: 'center',
                align: 'center'
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
                ticks: { padding: 5 }
            },
            y: {
                stacked: true,
                ticks: { padding: 10, autoSkip: false, font: { size: 11 } }
            }
        }
    };
    
    charts.unaffiliatedColorBySubtype = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: activeLabels,
            datasets: datasets
        },
        options: mergeChartOptions(baseOptions),
        plugins: [ChartDataLabels, minBarLengthPlugin]
    });
}

function renderUnaffiliatedWinners() {
    const winners = getUnaffiliatedWinners();
    
    // Most Common Shape
    const shapeEl = document.getElementById('unaffiliatedWinnerShape');
    const shapeDetailsEl = document.getElementById('unaffiliatedWinnerShapeDetails');
    if (shapeEl && winners.mostCommon.shape) {
        shapeEl.textContent = winners.mostCommon.shape;
        shapeDetailsEl.textContent = `${winners.mostCommon.count.toLocaleString()} beads`;
    }
    
    // Most Colorful Shape
    const colorfulEl = document.getElementById('unaffiliatedWinnerColor');
    const colorfulDetailsEl = document.getElementById('unaffiliatedWinnerColorDetails');
    if (colorfulEl && winners.mostColorful.shape) {
        colorfulEl.textContent = winners.mostColorful.shape;
        colorfulDetailsEl.textContent = `${winners.mostColorful.colorCount} colors`;
    }
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
        options: mergeChartOptions(baseOptions),
        plugins: [ChartDataLabels, minBarLengthPlugin]
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
    
    const dataInGrams = getBeadWeightByParade();
    const sorted = Object.entries(dataInGrams).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([parade]) => parade);
    const valuesInGrams = sorted.map(([, weight]) => weight);
    
    // Convert values based on weight unit
    const values = weightUnit === 'pounds'
        ? valuesInGrams.map(g => gramsToLbs(g))
        : valuesInGrams;
    
    const colors = generateColorPattern(labels.length);
    
    // Determine unit label and formatter
    const unitLabel = weightUnit === 'pounds' ? 'lbs' : 'g';
    const unitText = weightUnit === 'pounds' ? 'Weight (pounds)' : 'Weight (grams)';
    const formatter = weightUnit === 'pounds' 
        ? (value) => value.toFixed(2) + ' lbs'
        : (value) => Math.round(value).toLocaleString() + 'g';
    
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
                formatter: formatter
            }
        },
        scales: {
            x: { 
                beginAtZero: true,
                title: { display: true, text: unitText },
                ticks: { 
                    padding: 5,
                    callback: function(value) {
                        return weightUnit === 'pounds' ? value.toFixed(2) : Math.round(value);
                    }
                }
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
                label: `Bead Weight (${unitLabel})`,
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
            datalabels: {
                color: (context) => {
                    const bgColor = context.dataset.backgroundColor;
                    return getContrastColor(bgColor);
                },
                font: {
                    weight: 'bold',
                    size: 10
                },
                formatter: (value) => value > 0 ? value : '',
                anchor: 'center',
                align: 'center'
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.x;
                        return value > 0 ? `${label}: ${value}` : '';
                    }
                }
            }
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
        options: mergeChartOptions(baseOptions),
        plugins: [ChartDataLabels, minBarLengthPlugin]
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
        heaviestDetailsEl.textContent = formatWeight(winners.heaviest.weight);
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
    updateWeightHeaders();
    renderBeadsTable();
    renderThrowsTable();
}

function updateWeightHeaders() {
    const headerEl = document.getElementById('weightColumnHeader');
    if (headerEl) {
        headerEl.textContent = weightUnit === 'pounds' 
            ? 'Total Weight (lbs)' 
            : 'Total Weight (g)';
    }
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
                <td>${formatWeight(data.weight)}</td>
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
