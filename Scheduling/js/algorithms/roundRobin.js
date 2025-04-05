// Round Robin (RR) Algorithm
export function RoundRobin(processes, timeQuantum) {
    // Create a copy of processes to avoid modifying the original array
    const processesCopy = JSON.parse(JSON.stringify(processes));
    
    const n = processesCopy.length;
    const completionTime = new Array(n).fill(0);
    const turnaroundTime = new Array(n).fill(0);
    const waitingTime = new Array(n).fill(0);
    const responseTime = new Array(n).fill(-1); // -1 indicates not yet responded
    const ganttChart = [];
    
    // Sort processes by arrival time
    processesCopy.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    let completed = 0;
    const readyQueue = [];
    let currentIndex = 0;
    
    // Add first process to ready queue
    if (processesCopy.length > 0 && processesCopy[0].arrivalTime <= currentTime) {
        readyQueue.push(0);
        currentIndex = 1;
    }
    
    while (completed < n) {
        // If ready queue is empty, advance time and check for new arrivals
        if (readyQueue.length === 0) {
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
                end: nextArrival
            });
            
            currentTime = nextArrival;
            
            // Add newly arrived processes to ready queue
            while (currentIndex < n && processesCopy[currentIndex].arrivalTime <= currentTime) {
                readyQueue.push(currentIndex);
                currentIndex++;
            }
            
            continue;
        }
        
        // Get the next process from ready queue
        const processIndex = readyQueue.shift();
        
        // Record response time if first time being processed
        if (responseTime[processIndex] === -1) {
            responseTime[processIndex] = currentTime - processesCopy[processIndex].arrivalTime;
        }
        
        // Calculate execution time for this quantum
        const executeTime = Math.min(timeQuantum, processesCopy[processIndex].remainingTime);
        
        // Execute the process
        ganttChart.push({
            id: processesCopy[processIndex].id,
            start: currentTime,
            end: currentTime + executeTime
        });
        
        currentTime += executeTime;
        processesCopy[processIndex].remainingTime -= executeTime;
        
        // Check for new arrivals during this time quantum
        while (currentIndex < n && processesCopy[currentIndex].arrivalTime <= currentTime) {
            readyQueue.push(currentIndex);
            currentIndex++;
        }
        
        // If process is completed
        if (processesCopy[processIndex].remainingTime === 0) {
            completionTime[processIndex] = currentTime;
            turnaroundTime[processIndex] = completionTime[processIndex] - processesCopy[processIndex].arrivalTime;
            waitingTime[processIndex] = turnaroundTime[processIndex] - processesCopy[processIndex].burstTime;
            completed++;
        } else {
            // Put the process back in the ready queue
            readyQueue.push(processIndex);
        }
    }
    
    // Calculate averages
    const totalWaitingTime = waitingTime.reduce((sum, time) => sum + time, 0);
    const totalTurnaroundTime = turnaroundTime.reduce((sum, time) => sum + time, 0);
    const totalResponseTime = responseTime.reduce((sum, time) => sum + time, 0);
    
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
    // Context switching adds 5 units per switch
    const contextSwitches = ganttChart.length - ganttChart.filter(item => item.id === 'Idle').length - 1;
    const activeEnergy = (totalTime - totalIdleTime) * 100;
    const idleEnergy = totalIdleTime * 20;
    const switchingEnergy = contextSwitches * 5;
    const totalEnergy = activeEnergy + idleEnergy + switchingEnergy;
    
    return {
        ganttChart,
        metrics: {
            processes: processesCopy.map((p, i) => ({
                id: p.id,
                arrivalTime: p.arrivalTime,
                burstTime: p.burstTime,
                completionTime: completionTime[i],
                turnaroundTime: turnaroundTime[i],
                waitingTime: waitingTime[i],
                responseTime: responseTime[i]
            })),
            avgWaitingTime,
            avgTurnaroundTime,
            avgResponseTime,
            cpuUtilization,
            contextSwitches
        },
        energyConsumption: {
            activeEnergy,
            idleEnergy,
            switchingEnergy,
            totalEnergy,
            algorithm: 'Round Robin'
        }
    };
}