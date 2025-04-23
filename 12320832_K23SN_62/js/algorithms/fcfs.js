// First Come First Serve (FCFS) Algorithm
export function FCFS(processes) {
    // Sort processes by arrival time
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    const n = processes.length;
    const completionTime = new Array(n).fill(0);
    const turnaroundTime = new Array(n).fill(0);
    const waitingTime = new Array(n).fill(0);
    const ganttChart = [];
    
    let currentTime = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let totalResponseTime = 0;
    
    for (let i = 0; i < n; i++) {
        // If there's a gap between processes
        if (currentTime < processes[i].arrivalTime) {
            ganttChart.push({
                id: 'Idle',
                start: currentTime,
                end: processes[i].arrivalTime
            });
            currentTime = processes[i].arrivalTime;
        }
        
        // Calculate times
        const responseTime = currentTime - processes[i].arrivalTime;
        totalResponseTime += responseTime;
        
        // Execute process
        ganttChart.push({
            id: processes[i].id,
            start: currentTime,
            end: currentTime + processes[i].burstTime
        });
        
        currentTime += processes[i].burstTime;
        completionTime[i] = currentTime;
        turnaroundTime[i] = completionTime[i] - processes[i].arrivalTime;
        waitingTime[i] = turnaroundTime[i] - processes[i].burstTime;
        
        totalWaitingTime += waitingTime[i];
        totalTurnaroundTime += turnaroundTime[i];
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
            processes: processes.map((p, i) => ({
                id: p.id,
                arrivalTime: p.arrivalTime,
                burstTime: p.burstTime,
                completionTime: completionTime[i],
                turnaroundTime: turnaroundTime[i],
                waitingTime: waitingTime[i],
                responseTime: currentTime - p.arrivalTime
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
            algorithm: 'FCFS'
        }
    };
}