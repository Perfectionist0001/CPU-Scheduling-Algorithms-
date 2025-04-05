// Comparison Chart Visualization
export function renderComparisonChart(simulationResults, containerId) {
    const canvas = document.getElementById(containerId);
    
    // Get algorithms with results
    const algorithms = Object.keys(simulationResults).filter(key => simulationResults[key] !== null);
    
    if (algorithms.length <= 1) {
        const ctx = canvas.getContext('2d');
        ctx.font = '16px Arial';
        ctx.fillText('Run multiple algorithms to see comparison', 10, 50);
        return;
    }
    
    // Prepare data for Chart.js
    const labels = algorithms.map(alg => {
        switch(alg) {
            case 'fcfs': return 'FCFS';
            case 'sjf': return 'SJF';
            case 'rr': return 'Round Robin';
            case 'priority': return 'Priority';
            case 'energy': return 'Energy-Efficient';
            default: return alg;
        }
    });
    
    const waitingTimeData = algorithms.map(alg => simulationResults[alg].metrics.avgWaitingTime);
    const turnaroundTimeData = algorithms.map(alg => simulationResults[alg].metrics.avgTurnaroundTime);
    const responseTimeData = algorithms.map(alg => simulationResults[alg].metrics.avgResponseTime);
    const energyData = algorithms.map(alg => simulationResults[alg].energyConsumption.totalEnergy);
    const cpuUtilizationData = algorithms.map(alg => simulationResults[alg].metrics.cpuUtilization);
    
    // Create chart
    if (window.comparisonChart) {
        window.comparisonChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    window.comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Avg. Waiting Time',
                    data: waitingTimeData,
                    backgroundColor: 'rgba(33, 150, 243, 0.7)',
                    borderColor: 'rgba(33, 150, 243, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Avg. Turnaround Time',
                    data: turnaroundTimeData,
                    backgroundColor: 'rgba(76, 175, 80, 0.7)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Avg. Response Time',
                    data: responseTimeData,
                    backgroundColor: 'rgba(255, 152, 0, 0.7)',
                    borderColor: 'rgba(255, 152, 0, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Performance Metrics Comparison',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time Units'
                    }
                }
            },
            animation: {
                duration: 1000
            }
        }
    });
    
    // Create energy comparison chart
    const energyChartContainer = document.createElement('div');
    energyChartContainer.style.marginTop = '30px';
    energyChartContainer.style.height = '250px';
    
    const energyChartTitle = document.createElement('h4');
    energyChartTitle.textContent = 'Energy Consumption Comparison';
    energyChartTitle.style.textAlign = 'center';
    energyChartTitle.style.marginBottom = '10px';
    
    const energyCanvas = document.createElement('canvas');
    energyCanvas.id = 'energy-comparison-chart';
    energyCanvas.style.width = '100%';
    energyCanvas.style.height = '200px';
    
    energyChartContainer.appendChild(energyChartTitle);
    energyChartContainer.appendChild(energyCanvas);
    
    // Insert after main comparison chart
    canvas.parentNode.insertBefore(energyChartContainer, canvas.nextSibling);
    
    // Create energy chart
    const energyCtx = energyCanvas.getContext('2d');
    new Chart(energyCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Energy Consumption',
                    data: energyData,
                    backgroundColor: 'rgba(244, 67, 54, 0.7)',
                    borderColor: 'rgba(244, 67, 54, 1)',
                    borderWidth: 1
                },
                {
                    label: 'CPU Utilization (%)',
                    data: cpuUtilizationData,
                    backgroundColor: 'rgba(156, 39, 176, 0.7)',
                    borderColor: 'rgba(156, 39, 176, 1)',
                    borderWidth: 1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            if (label.includes('Utilization')) {
                                return `${label}: ${context.raw.toFixed(2)}%`;
                            }
                            return `${label}: ${context.raw.toFixed(2)} units`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Energy Units'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'CPU Utilization (%)'
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            animation: {
                duration: 1000
            }
        }
    });
    
    // Add efficiency score table
    const efficiencyTable = document.createElement('table');
    efficiencyTable.style.width = '100%';
    efficiencyTable.style.borderCollapse = 'collapse';
    efficiencyTable.style.marginTop = '30px';
    
    const efficiencyThead = document.createElement('thead');
    const efficiencyHeaderRow = document.createElement('tr');
    
    ['Algorithm', 'Energy Consumption', 'Avg. Waiting Time', 'Efficiency Score'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.padding = '8px';
        th.style.textAlign = 'left';
        th.style.borderBottom = '2px solid #ddd';
        efficiencyHeaderRow.appendChild(th);
    });
    
    efficiencyThead.appendChild(efficiencyHeaderRow);
    efficiencyTable.appendChild(efficiencyThead);
    
    const efficiencyTbody = document.createElement('tbody');
    
    // Calculate efficiency scores (lower is better)
    // Score = (Energy * 0.6) + (Avg Waiting Time * 0.4) - normalized to 0-100 scale
    const maxEnergy = Math.max(...energyData);
    const maxWaitingTime = Math.max(...waitingTimeData);
    
    const efficiencyScores = algorithms.map((alg, i) => {
        const normalizedEnergy = (energyData[i] / maxEnergy) * 100;
        const normalizedWaitingTime = (waitingTimeData[i] / maxWaitingTime) * 100;
        return (normalizedEnergy * 0.6) + (normalizedWaitingTime * 0.4);
    });
    
    // Sort algorithms by efficiency score (ascending)
    const sortedIndices = efficiencyScores
        .map((score, i) => ({ score, index: i }))
        .sort((a, b) => a.score - b.score)
        .map(item => item.index);
    
    sortedIndices.forEach(i => {
        const row = document.createElement('tr');
        
        const algorithmCell = document.createElement('td');
        algorithmCell.textContent = labels[i];
        algorithmCell.style.padding = '8px';
        algorithmCell.style.borderBottom = '1px solid #ddd';
        
        const energyCell = document.createElement('td');
        energyCell.textContent = `${energyData[i].toFixed(2)} units`;
        energyCell.style.padding = '8px';
        energyCell.style.borderBottom = '1px solid #ddd';
        
        const waitingTimeCell = document.createElement('td');
        waitingTimeCell.textContent = `${waitingTimeData[i].toFixed(2)} units`;
        waitingTimeCell.style.padding = '8px';
        waitingTimeCell.style.borderBottom = '1px solid #ddd';
        
        const scoreCell = document.createElement('td');
        scoreCell.textContent = `${(100 - efficiencyScores[i]).toFixed(2)}`;
        scoreCell.style.padding = '8px';
        scoreCell.style.borderBottom = '1px solid #ddd';
        
        row.appendChild(algorithmCell);
        row.appendChild(energyCell);
        row.appendChild(waitingTimeCell);
        row.appendChild(scoreCell);
        
        efficiencyTbody.appendChild(row);
    });
    
    efficiencyTable.appendChild(efficiencyTbody);
    
    // Add efficiency table title
    const efficiencyTitle = document.createElement('h4');
    efficiencyTitle.textContent = 'Algorithm Efficiency Ranking';
    efficiencyTitle.style.textAlign = 'center';
    efficiencyTitle.style.marginTop = '20px';
    
    // Insert efficiency table
    canvas.parentNode.insertBefore(efficiencyTitle, energyChartContainer.nextSibling);
    canvas.parentNode.insertBefore(efficiencyTable, efficiencyTitle.nextSibling);
}