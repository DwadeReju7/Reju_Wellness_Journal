console.log("therapist_trends.js loaded");

const MOOD_VALUES = {
    'great': 4,
    'good': 3,
    'okay': 2,
    'low': 1
};

const CLIENT_COLORS = [
    '#FF6B35', // Orange
    '#8B4513', // Brown
    '#5eb87b', // Green
    '#7b8bff', // Purple
    '#ffd166', // Yellow
    '#06d6a0', // Teal
    '#ff6b9d', // Pink
    '#a78bfa', // Lavender
];

let moodChart = null;
let distributionChart = null;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM ready - loading client mood data");
    console.log("Clients data:", clientsData);
    
    if (!clientsData || clientsData.length === 0) {
        showEmptyState();
        return;
    }
    
    renderCharts(clientsData, 30); // Default 30 days
    
    // Date range filter
    document.getElementById('date-range').addEventListener('change', (e) => {
        const days = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
        renderCharts(clientsData, days);
    });
});

function renderCharts(allClientsData, days) {
    const container = document.getElementById('charts-container');
    
    // Filter all entries by date range
    const filteredClientsData = allClientsData.map(client => ({
        ...client,
        entries: filterEntriesByDays(client.entries, days)
    }));
    
    // Check if any client has data
    const hasData = filteredClientsData.some(client => client.entries.length > 0);
    
    if (!hasData) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No journal entries found for this time period.</p>
            </div>
        `;
        return;
    }
    
    // Calculate aggregate stats
    const totalEntries = filteredClientsData.reduce((sum, client) => sum + client.entries.length, 0);
    const avgMood = calculateAverageMood(filteredClientsData);
    
    container.innerHTML = `
        <div class="stats-overview">
            <div class="stat-card">
                <div class="stat-number">${totalEntries}</div>
                <div class="stat-label">Total Entries</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${avgMood}</div>
                <div class="stat-label">Average Mood</div>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-card">
                <h2>Mood Trends by Client</h2>
                <div class="chart-wrapper">
                    <canvas id="mood-chart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h2>Overall Mood Distribution</h2>
                <div class="chart-wrapper">
                    <canvas id="distribution-chart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    renderMultiClientChart(filteredClientsData);
    renderAggregateDistribution(filteredClientsData);
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

function calculateAverageMood(clientsData) {
    let totalValue = 0;
    let totalEntries = 0;
    
    clientsData.forEach(client => {
        client.entries.forEach(entry => {
            const mood = entry.mood ? entry.mood.toLowerCase() : 'okay';
            totalValue += MOOD_VALUES[mood] || 2;
            totalEntries++;
        });
    });
    
    if (totalEntries === 0) return 'N/A';
    
    const avgValue = totalValue / totalEntries;
    return avgValue >= 3.5 ? 'Great' : 
           avgValue >= 2.5 ? 'Good' : 
           avgValue >= 1.5 ? 'Okay' : 'Low';
}

function renderMultiClientChart(clientsData) {
    if (moodChart) {
        moodChart.destroy();
    }
    
    const ctx = document.getElementById('mood-chart').getContext('2d');
    const datasets = [];
    
    clientsData.forEach((client, index) => {
        if (client.entries.length === 0) return;
        
        const sorted = [...client.entries].sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
        );
        
        const labels = sorted.map(entry => {
            const date = new Date(entry.created_at);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const data = sorted.map(entry => {
            const mood = entry.mood ? entry.mood.toLowerCase() : 'okay';
            return MOOD_VALUES[mood] || 2;
        });
        
        const color = CLIENT_COLORS[index % CLIENT_COLORS.length];
        
        datasets.push({
            label: client.name,
            data: data,
            borderColor: color,
            backgroundColor: color + '20',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: color,
            pointBorderColor: color,
            pointRadius: 4,
            pointHoverRadius: 6,
        });
    });
    
    // Find all unique dates across all clients
    const allDates = new Set();
    clientsData.forEach(client => {
        client.entries.forEach(entry => {
            const date = new Date(entry.created_at);
            allDates.add(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        });
    });
    
    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from(allDates).sort(),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            family: 'Lato',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const moodNames = ['', 'Low', 'Okay', 'Good', 'Great'];
                            return context.dataset.label + ': ' + moodNames[context.parsed.y];
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
                        color: '#F5E6D3'
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

function renderAggregateDistribution(clientsData) {
    if (distributionChart) {
        distributionChart.destroy();
    }
    
    const distribution = { great: 0, good: 0, okay: 0, low: 0 };
    
    clientsData.forEach(client => {
        client.entries.forEach(entry => {
            const mood = entry.mood ? entry.mood.toLowerCase() : 'okay';
            distribution[mood] = (distribution[mood] || 0) + 1;
        });
    });
    
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
                    '#5eb87b',
                    '#8ab886',
                    '#d4b896',
                    '#c89585'
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

function showEmptyState() {
    document.getElementById('charts-container').innerHTML = `
        <div class="empty-state">
            <p>No clients assigned yet.</p>
        </div>
    `;
}

function showError() {
    document.getElementById('charts-container').innerHTML = `
        <div class="empty-state">
            <p>⚠️ Could not load client data. Please try refreshing the page.</p>
        </div>
    `;
}