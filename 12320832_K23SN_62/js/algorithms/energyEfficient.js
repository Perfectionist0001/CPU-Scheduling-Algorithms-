// Energy-Efficient Scheduling Algorithm
export function EnergyEfficient(processes) {
    // Create a copy of processes to avoid modifying the original array
    const processesCopy = JSON.parse(JSON.stringify(processes));
    
    const n = processesCopy.length;
    const completionTime = new Array(n).fill(0);
    const turnaroundTime = new Array(n).fill(0);
    const waitingTime = new Array(n).fill(0);
    const ganttChart = [];
    
    // Energy efficiency parameters
    const powerStates = [
        { name: 'High', frequency: 1.0, power: 100 },
        { name: 'Medium', frequency: 0.7, power: 60 },
        { name: 'Low', frequency: 0.5, power: 30 }
    ];
    
    // Assign power states based on process characteristics
    processesCopy.forEach(p => {
        // Simple heuristic: longer burst time = lower frequency to save energy
        if (p.burstTime > 7) {
            p.powerState = powerStates[2]; // Low power for long processes
        } else if (p.burstTime > 3) {
            p.powerState = powerStates[1]; // Medium power for medium processes
        } else {
            p.powerState = powerStates[0]; // High power for short processes
        }
        
        // Adjust execution time based on frequency
        p.adjustedBurstTime = Math.ceil(p.burstTime / p.powerState.frequency);
        p.remainingTime = p.adjustedBurstTime;
    });
    
    // Sort processes by arrival time
    processesCopy.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    let completed = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let totalResponseTime = 0;
    let totalEnergyConsumption = 0;
    
    while (completed < n) {
        // Find the process with the best energy-efficiency ratio among the arrived processes
        let bestIndex = -1;
        let bestRatio = Number.MAX_VALUE;
        
        for (let i = 0; i < n; i++) {
            if (processesCopy[i].remainingTime > 0 && processesCopy[i].arrivalTime <= currentTime) {
                // Energy efficiency ratio = (power consumption * adjusted burst time)
                const ratio = processesCopy[i].powerState.power * processesCopy[i].remainingTime;
                if (ratio < bestRatio) {
                    bestRatio = ratio;
                    bestIndex = i;
                }
            }
        }
        
        // If no process is found, advance time
        if (bestIndex === -1) {
            // Find the next arriving process
            let nextArrival = Number.MAX_VALUE;
            for (let i = 0; i < n; i++) {
                if (processesCopy[i].remainingTime > 0 && processesCopy[i].arrivalTime < nextArrival) {
                    nextArrival = processesCopy[i].arrivalTime;
                }
            }
            
            // Add idle time to Gantt chart
            ganttChart.push({
                id: 'Idle',
                start: currentTime,
                end: nextArrival,
                powerState: { name: 'Idle', power: 20 }
            });
            
            totalEnergyConsumption += (nextArrival - currentTime) * 20; // Idle power consumption
            currentTime = nextArrival;
            continue;
        }
        
        // Calculate response time if first time being processed
        if (processesCopy[bestIndex].remainingTime === processesCopy[bestIndex].adjustedBurstTime) {
            const responseTime = currentTime - processesCopy[bestIndex].arrivalTime;
            totalResponseTime += responseTime;
        }
        
        // Execute the process
        ganttChart.push({
            id: processesCopy[bestIndex].id,
            start: currentTime,
            end: currentTime + processesCopy[bestIndex].remainingTime,
            powerState: processesCopy[bestIndex].powerState
        });
        
        // Calculate energy consumption
        totalEnergyConsumption += processesCopy[bestIndex].remainingTime * processesCopy[bestIndex].powerState.power;
        
        currentTime += processesCopy[bestIndex].remainingTime;
        completionTime[bestIndex] = currentTime;
        turnaroundTime[bestIndex] = completionTime[bestIndex] - processesCopy[bestIndex].arrivalTime;
        waitingTime[bestIndex] = turnaroundTime[bestIndex] - processesCopy[bestIndex].burstTime;
        
        totalWaitingTime += waitingTime[bestIndex];
        totalTurnaroundTime += turnaroundTime[bestIndex];
        
        processesCopy[bestIndex].remainingTime = 0;
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
    
    // Energy consumption breakdown
    const powerStateConsumption = powerStates.map(state => {
        const timeInState = ganttChart
            .filter(item => item.id !== 'Idle' && item.powerState.name === state.name)
            .reduce((sum, item) => sum + (item.end - item.start), 0);
        return {
            state: state.name,
            time: timeInState,
            energy: timeInState * state.power
        };
    });
    
    const idleEnergy = totalIdleTime * 20;
    
    return {
        ganttChart,
        metrics: {
            processes: processesCopy.map((p, i) => ({
                id: p.id,
                arrivalTime: p.arrivalTime,
                burstTime: p.burstTime,
                adjustedBurstTime: p.adjustedBurstTime,
                powerState: p.powerState.name,
                completionTime: completionTime[i],
                turnaroundTime: turnaroundTime[i],
                waitingTime: waitingTime[i]
            })),
            avgWaitingTime,
            avgTurnaroundTime,
            avgResponseTime,
            cpuUtilization
        },
        energyConsumption: {
            powerStateConsumption,
            idleEnergy,
            totalEnergy: totalEnergyConsumption,
            algorithm: 'Energy-Efficient'
        }
    };
}