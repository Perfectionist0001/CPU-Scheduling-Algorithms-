// Priority Scheduling Algorithm - Non-preemptive
export function Priority(processes) {
    // Create a copy of processes to avoid modifying the original array
    const processesCopy = JSON.parse(JSON.stringify(processes));
    
    const n = processesCopy.length;
    const completionTime = new Array(n).fill(0);
    const turnaroundTime = new Array(n).fill(0);
    const waitingTime = new Array(n).fill(0);
    const ganttChart = [];
    
    let currentTime = 0;
    let completed = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let totalResponseTime = 0;
    
    // Mark all processes as not executed
    processesCopy.forEach(p => p.executed = false);
    
    while (completed < n) {
        // Find the process with the highest priority (lower value = higher priority) among the arrived processes
        let highestPriorityIndex = -1;
        let highestPriority = Number.MAX_VALUE;
        
        for (let i = 0; i < n; i++) {
            if (!processesCopy[i].executed && processesCopy[i].arrivalTime <= currentTime && processesCopy[i].priority < highestPriority) {
                highestPriority = processesCopy[i].priority;
                highestPriorityIndex = i;
            }
        }
        
        // If no process is found, advance time
        if (highestPriorityIndex === -1) {
            // Find the next arriving process
            let nextArrival = Number.MAX_VALUE;
            for (let i = 0; i < n; i++) {
                if (!processesCopy[i].executed && processesCopy[i].arrivalTime < nextArrival) {
                    nextArrival = processesCopy[i].arrivalTime;
                }
            }
            
            // Add idle time to Gantt chart
            ganttChart.push({
                id: 'Idle',
                start: currentTime,
                end: nextArrival
            });
            
            currentTime = nextArrival;
            continue;
        }
        
        // Calculate response time
        const responseTime = currentTime - processesCopy[highestPriorityIndex].arrivalTime;
        totalResponseTime += responseTime;
        
        // Execute the process
        ganttChart.push({
            id: processesCopy[highestPriorityIndex].id,
            start: currentTime,
            end: currentTime + processesCopy[highestPriorityIndex].burstTime
        });
        
        currentTime += processesCopy[highestPriorityIndex].burstTime;
        completionTime[highestPriorityIndex] = currentTime;
        turnaroundTime[highestPriorityIndex] = completionTime[highestPriorityIndex] - processesCopy[highestPriorityIndex].arrivalTime;
        waitingTime[highestPriorityIndex] = turnaroundTime[highestPriorityIndex] - processesCopy[highestPriorityIndex].burstTime;
        
        totalWaitingTime += waitingTime[highestPriorityIndex];
        totalTurnaroundTime += turnaroundTime[highestPriorityIndex];
        
        processesCopy[highestPriorityIndex].executed = true;
        completed++;
    }
    
    // Calculate averages
    const avgWaitingTime = totalWaitingTime / n;
    const avgTurnaroundTime = totalTurnaroundTime / n;
    const avgResponseTime = totalResponseTime / n;
    
    // Calculate CPU utilization
    const totalIdleTime = ganttChart
        .filter(item => item.id === 'Idle')
        .reduce((sum, item) => sum + (item.end - item.start), 0);
    const totalTime = currentTime;
    const cpuUtilization = ((totalTime - totalIdleTime) / totalTime) * 100;
    
    // Calculate energy consumption (simplified model)
    // Assuming active CPU consumes 100 units/time and idle consumes 20 units/time
    const activeEnergy = (totalTime - totalIdleTime) * 100;
    const idleEnergy = totalIdleTime * 20;
    const totalEnergy = activeEnergy + idleEnergy;
    
    return {
        ganttChart,
        metrics: {
            processes: processesCopy.map((p, i) => ({
                id: p.id,
                arrivalTime: p.arrivalTime,
                burstTime: p.burstTime,
                priority: p.priority,
                completionTime: completionTime[i],
                turnaroundTime: turnaroundTime[i],
                waitingTime: waitingTime[i],
                responseTime: waitingTime[i]
            })),
            avgWaitingTime,
            avgTurnaroundTime,
            avgResponseTime,
            cpuUtilization
        },
        energyConsumption: {
            activeEnergy,
            idleEnergy,
            totalEnergy,
            algorithm: 'Priority'
        }
    };
}