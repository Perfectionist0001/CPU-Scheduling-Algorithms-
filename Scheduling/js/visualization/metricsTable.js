// Metrics Table Visualization
export function renderMetricsTable(metrics, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (!metrics || !metrics.processes || metrics.processes.length === 0) {
        container.innerHTML = '<p>No data to display</p>';
        return;
    }
    
    // Create process metrics table
    const processTable = document.createElement('table');
    processTable.className = 'metrics-process-table';
    processTable.style.width = '100%';
    processTable.style.borderCollapse = 'collapse';
    processTable.style.marginBottom = '20px';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Process ID', 'Arrival Time', 'Burst Time'];
    
    // Check if priority is available
    if (metrics.processes[0].priority !== undefined) {
        headers.push('Priority');
    }
    
    // Check if power state is available
    if (metrics.processes[0].powerState !== undefined) {
        headers.push('Power State');
    }
    
    headers.push('Completion Time', 'Turnaround Time', 'Waiting Time', 'Response Time');
    
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.padding = '8px';
        th.style.textAlign = 'left';
        th.style.borderBottom = '2px solid #ddd';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    processTable.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    metrics.processes.forEach(process => {
        const row = document.createElement('tr');
        
        // Add cells
        const cells = [
            process.id,
            process.arrivalTime,
            process.burstTime
        ];
        
        // Add priority if available
        if (process.priority !== undefined) {
            cells.push(process.priority);
        }
        
        // Add power state if available
        if (process.powerState !== undefined) {
            cells.push(process.powerState);
        }
        
        cells.push(
            process.completionTime,
            process.turnaroundTime,
            process.waitingTime,
            process.responseTime !== undefined ? process.responseTime : 'N/A'
        );
        
        cells.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            td.style.padding = '8px';
            td.style.borderBottom = '1px solid #ddd';
            row.appendChild(td);
        });
        
        tbody.appendChild(row);
    });
    
    processTable.appendChild(tbody);
    
    // Create summary metrics
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'metrics-summary';
    summaryDiv.style.display = 'grid';
    summaryDiv.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    summaryDiv.style.gap = '15px';
    summaryDiv.style.marginTop = '20px';
    
    const summaryMetrics = [
        { label: 'Average Waiting Time', value: metrics.avgWaitingTime.toFixed(2) },
        { label: 'Average Turnaround Time', value: metrics.avgTurnaroundTime.toFixed(2) },
        { label: 'Average Response Time', value: metrics.avgResponseTime.toFixed(2) },
        { label: 'CPU Utilization', value: `${metrics.cpuUtilization.toFixed(2)}%` }
    ];
    
    // Add context switches if available
    if (metrics.contextSwitches !== undefined) {
        summaryMetrics.push({ label: 'Context Switches', value: metrics.contextSwitches });
    }
    
    summaryMetrics.forEach(metric => {
        const metricCard = document.createElement('div');
        metricCard.className = 'metric-card';
        metricCard.style.padding = '15px';
        metricCard.style.borderRadius = '8px';
        metricCard.style.backgroundColor = 'var(--card-light)';
        metricCard.style.boxShadow = 'var(--shadow-light)';
        
        const label = document.createElement('div');
        label.textContent = metric.label;
        label.style.fontSize = '14px';
        label.style.marginBottom = '5px';
        
        const value = document.createElement('div');
        value.textContent = metric.value;
        value.style.fontSize = '24px';
        value.style.fontWeight = 'bold';
        
        metricCard.appendChild(label);
        metricCard.appendChild(value);
        summaryDiv.appendChild(metricCard);
    });
    
    // Append all elements to container
    container.appendChild(processTable);
    container.appendChild(summaryDiv);
    
    // Add animation
    const rows = processTable.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-10px)';
        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, index * 50);
    });
    
    const cards = summaryDiv.querySelectorAll('.metric-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + index * 50);
    });
}