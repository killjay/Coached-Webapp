// Chart.js Analytics Graph Code
// Required: Include Chart.js library in your HTML
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

// Generate sample data for the last 30 days
const generateData = () => {
    const dates = [];
    const suggestedLines = [];
    const acceptedLines = [];
    
    const today = new Date('2026-02-11');
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Generate realistic-looking data
        const suggested = Math.floor(Math.random() * 40000) + 10000;
        const accepted = Math.floor(suggested * (Math.random() * 0.10 + 0.03));
        
        suggestedLines.push(suggested);
        acceptedLines.push(accepted);
    }
    
    return { dates, suggestedLines, acceptedLines };
};

const data = generateData();

// Get canvas context (assumes canvas element with id="analyticsChart")
const ctx = document.getElementById('analyticsChart').getContext('2d');

// Create the chart
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: data.dates,
        datasets: [
            {
                label: 'Suggested Lines',
                data: data.suggestedLines,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
                pointHoverBorderWidth: 2,
                tension: 0.1,
                fill: false
            },
            {
                label: 'Accepted Lines',
                data: data.acceptedLines,
                borderColor: '#93c5fd',
                backgroundColor: 'rgba(147, 197, 253, 0.05)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#93c5fd',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
                pointHoverBorderWidth: 2,
                pointStyle: 'rect',
                tension: 0.1,
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'white',
                titleColor: '#1f2937',
                bodyColor: '#1f2937',
                borderColor: '#3b82f6',
                borderWidth: 1,
                padding: 12,
                bodySpacing: 6,
                boxPadding: 6,
                usePointStyle: true,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += context.parsed.y.toLocaleString() + ' lines';
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: '#e5e7eb',
                    drawBorder: true,
                    borderColor: '#333333'
                },
                ticks: {
                    color: '#6b7280',
                    font: {
                        size: 11
                    },
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: '#e5e7eb',
                    drawBorder: false
                },
                ticks: {
                    color: '#6b7280',
                    font: {
                        size: 11
                    },
                    callback: function(value) {
                        if (value >= 1000) {
                            return (value / 1000) + 'k';
                        }
                        return value;
                    }
                }
            }
        }
    }
});

// To update the chart with new data:
// chart.data.labels = newDates;
// chart.data.datasets[0].data = newSuggestedData;
// chart.data.datasets[1].data = newAcceptedData;
// chart.update();
