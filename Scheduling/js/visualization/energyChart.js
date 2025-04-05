// Energy Chart Visualization
export function renderEnergyChart(energyData, containerId) {
    const canvas = document.getElementById(containerId);
    
    if (!energyData) {
        const ctx = canvas.getContext('2d');
        ctx.font = '16px Arial';
        ctx.fillText('No energy data available', 10, 50);
        return;
    }
    
    // Prepare data for Chart.js
    let labels = [];
    let data = [];
    let backgroundColor = [];
    
    // Check if we have power state breakdown
    if (energyData.powerStateConsumption) {
        // For energy-efficient algorithm with power states
        labels = energyData.powerStateConsumption.map(state => state.state);
        data = energyData.powerStateConsumption.map(state => state.energy);
        
        // Add idle state
        labels.push('Idle');
        data.push(energyData.idleEnergy);
        
        // Set colors
        backgroundColor = [
            '#4caf50', // High - Green
            '#2196f3', // Medium - Blue
            '#ff9800', // Low - Orange
            '#cccccc'  // Idle - Gray
        ];
    } else {
        // For standard algorithms
        labels = ['Active', 'Idle'];
        data = [energyData.activeEnergy, energyData.idleEnergy];
        backgroundColor = ['#4caf50', '#cccccc'];
        
        // Add switching energy if available
        if (energyData.switchingEnergy) {
            labels.push('Context Switching');
            data.push(energyData.switchingEnergy);
            backgroundColor.push('#f44336');
        }
    }
    
    // Create chart
    if (window.energyChart) {
        window.energyChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    window.energyChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColor,
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: `Energy Consumption - ${energyData.algorithm}`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} units (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });
    
    // Add total energy text
    const totalDiv = document.createElement('div');
    totalDiv.style.textAlign = 'center';
    totalDiv.style.marginTop = '10px';
    totalDiv.style.fontSize = '16px';
    totalDiv.style.fontWeight = 'bold';
    totalDiv.textContent = `Total Energy: ${energyData.totalEnergy} units`;
    
    // Insert after canvas
    canvas.parentNode.insertBefore(totalDiv, canvas.nextSibling);
}