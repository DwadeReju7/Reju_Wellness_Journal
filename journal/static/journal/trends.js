console.log("trends.js loaded");

// Mood value mapping for consistent ordering
const MOOD_VALUES = {
    'great': 4,
    'good': 3,
    'okay': 2,
    'low': 1
};

const MOOD_COLORS = {
    'great': '#5eb87b',
    'good': '#8ab886',
    'okay': '#d4b896',
    'low': '#c89585'
};

let allEntries = [];
let moodChart = null;
let distributionChart = null;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM ready - fetching mood data");
    
    // Fetch all entries
    fetch("/journal/", { credentials: "same-origin" })
        .then(res => res.json())
        .then(entries => {
            console.log("Entries received:", entries);
            allEntries = entries;
            renderCharts(30); // Default to 30 days
        })
        .catch(err => {
            console.error("Failed to load mood data:", err);
            showError();
        });

    // Date range filter
    document.getElementById('date-range').addEventListener('change', (e) => {
        const days = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
        renderCharts(days);
    });
});

function renderCharts(days) {
    const container = document.getElementById('charts-container');
    
    // Filter entries by date range
    const filteredEntries = filterEntriesByDays(allEntries, days);
    
    if (filteredEntries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No journal entries found for this time period.</p>
                <a href="/today/">Write Your First Entry</a>
            </div>
        `;
        return;
    }

    // Calculate stats
    const stats = calculateStats(filteredEntries);
    
    // Render layout
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${filteredEntries.length}</div>
                <div class="stat-label">Total Entries</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.mostCommon}</div>
                <div class="stat-label">Most Common Mood</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.avgMood}</div>
                <div class="stat-label">Average Mood</div>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-card">
                <h2>Mood Over Time</h2>
                <div class="chart-wrapper">
                    <canvas id="mood-chart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h2>Mood Distribution</h2>
                <div class="chart-wrapper">
                    <canvas id="distribution-chart"></canvas>
                </div>
            </div>
        </div>
    `;

    // Render charts
    renderMoodLineChart(filteredEntries);
    renderDistributionChart(stats.distribution);
}

function filterEntriesByDays(entries, days) {
    if (days === 'all') return entries;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return entries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= cutoffDate;
    });
}

function calculateStats(entries) {
    const distribution = { great: 0, good: 0, okay: 0, low: 0 };
    let totalValue = 0;
    
    entries.forEach(entry => {
        const mood = entry.mood ? entry.mood.toLowerCase() : 'okay';
        distribution[mood] = (distribution[mood] || 0) + 1;
        totalValue += MOOD_VALUES[mood] || 2;
    });
    
    // Find most common mood
    const mostCommon = Object.keys(distribution).reduce((a, b) => 
        distribution[a] > distribution[b] ? a : b
    );
    
    // Calculate average
    const avgValue = totalValue / entries.length;
    const avgMood = avgValue >= 3.5 ? 'Great' : 
                    avgValue >= 2.5 ? 'Good' : 
                    avgValue >= 1.5 ? 'Okay' : 'Low';
    
    return {
        distribution,
        mostCommon: mostCommon.charAt(0).toUpperCase() + mostCommon.slice(1),
        avgMood
    };
}

function renderMoodLineChart(entries) {
    // Destroy existing chart if it exists
    if (moodChart) {
        moodChart.destroy();
    }
    
    // Sort entries by date (oldest first)
    const sorted = [...entries].sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
    );
    
    // Prepare data
    const labels = sorted.map(entry => {
        const date = new Date(entry.created_at);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const data = sorted.map(entry => {
        const mood = entry.mood ? entry.mood.toLowerCase() : 'okay';
        return MOOD_VALUES[mood] || 2;
    });
    
    const colors = sorted.map(entry => {
        const mood = entry.mood ? entry.mood.toLowerCase() : 'okay';
        return MOOD_COLORS[mood] || MOOD_COLORS.okay;
    });
    
    const ctx = document.getElementById('mood-chart').getContext('2d');
    
    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mood',
                data: data,
                borderColor: '#8a9a8e',
                backgroundColor: 'rgba(138, 154, 142, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: colors,
                pointBorderColor: colors,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const moodNames = ['', 'Low', 'Okay', 'Good', 'Great'];
                            return 'Mood: ' + moodNames[context.parsed.y];
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            const labels = ['', 'Low', 'Okay', 'Good', 'Great'];
                            return labels[value] || '';
                        }
                    },
                    grid: {
                        color: '#e8e5dc'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function renderDistributionChart(distribution) {
    // Destroy existing chart if it exists
    if (distributionChart) {
        distributionChart.destroy();
    }
    
    const ctx = document.getElementById('distribution-chart').getContext('2d');
    
    distributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Great', 'Good', 'Okay', 'Low'],
            datasets: [{
                data: [
                    distribution.great || 0,
                    distribution.good || 0,
                    distribution.okay || 0,
                    distribution.low || 0
                ],
                backgroundColor: [
                    MOOD_COLORS.great,
                    MOOD_COLORS.good,
                    MOOD_COLORS.okay,
                    MOOD_COLORS.low
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            family: 'Lato',
                            size: 13
                        }
                    }
                }
            }
        }
    });
}

function showError() {
    document.getElementById('charts-container').innerHTML = `
        <div class="empty-state">
            <p>⚠️ Could not load mood data. Please try refreshing the page.</p>
        </div>
    `;
}