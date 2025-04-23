// Import modules
import { FCFS } from './algorithms/fcfs.js';
import { SJF } from './algorithms/sjf.js';
import { RoundRobin } from './algorithms/roundRobin.js';
import { Priority } from './algorithms/priority.js';
import { EnergyEfficient } from './algorithms/energyEfficient.js';
// Import visualization modules
import { renderGanttChart } from './visualization/ganttChart.js';
import { renderMetricsTable } from './visualization/metricsTable.js';
import { renderEnergyChart } from './visualization/energyChart.js';
import { renderComparisonChart } from './visualization/comparisonChart.js';

// DOM Elements
const themeToggle = document.querySelector('.theme-toggle');
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('section');
const processForm = document.getElementById('process-form');
const processTable = document.getElementById('process-table');
const algorithmRadios = document.querySelectorAll('input[name="algorithm"]');
const timeQuantumContainer = document.getElementById('time-quantum-container');
const priorityContainer = document.getElementById('priority-container');
const priorityHeader = document.querySelector('.priority-header');
const runSimulationBtn = document.getElementById('run-simulation');
const runAllBtn = document.getElementById('run-all-btn');
const randomBtn = document.getElementById('random-btn');
const importBtn = document.getElementById('import-btn');
const exportBtn = document.getElementById('export-btn');
const clearBtn = document.getElementById('clear-btn');
const ganttChartContainer = document.getElementById('gantt-chart');
const metricsTableContainer = document.getElementById('metrics-table');
const energyChartCanvas = document.getElementById('energy-chart');
const comparisonChartCanvas = document.getElementById('comparison-chart');
const startSimulationBtn = document.getElementById('start-simulation-btn');

// Process data
let processes = [];
let simulationResults = {};
let energyChart = null;
let comparisonChart = null;

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeToggle.innerHTML = document.body.classList.contains('dark-mode') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
});

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        
        // Update active link
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        link.classList.add('active');
        
        // Show target section
        sections.forEach(section => {
            section.classList.remove('active-section');
            if (section.id === targetId) {
                section.classList.add('active-section');
            }
        });
    });
});

// Start Simulation button in hero section
startSimulationBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const simulationSection = document.getElementById('simulation');
    
    // Update active link
    navLinks.forEach(navLink => navLink.classList.remove('active'));
    document.querySelector('nav a[href="#simulation"]').classList.add('active');
    
    // Show simulation section
    sections.forEach(section => section.classList.remove('active-section'));
    simulationSection.classList.add('active-section');
});

// Algorithm selection
algorithmRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        // Show/hide time quantum for Round Robin
        timeQuantumContainer.style.display = 
            radio.value === 'rr' ? 'block' : 'none';
        
        // Show/hide priority for Priority Scheduling
        priorityContainer.style.display = 
            radio.value === 'priority' ? 'block' : 'none';
        
        // Show/hide priority column in table
        priorityHeader.style.display = 
            radio.value === 'priority' ? 'table-cell' : 'none';
        
        document.querySelectorAll('.priority-cell').forEach(cell => {
            cell.style.display = radio.value === 'priority' ? 'table-cell' : 'none';
        });
    });
});

// Process Form Submission
processForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const processId = document.getElementById('process-id').value.trim();
    const arrivalTime = parseInt(document.getElementById('arrival-time').value);
    const burstTime = parseInt(document.getElementById('burst-time').value);
    const priority = parseInt(document.getElementById('priority').value);
    
    if (!processId || isNaN(arrivalTime) || isNaN(burstTime) || burstTime <= 0) {
        alert('Please enter valid process details.');
        return;
    }
    
    // Check if process ID already exists
    if (processes.some(p => p.id === processId)) {
        alert('Process ID already exists. Please use a unique ID.');
        return;
    }
    
    // Add process to array
    const process = {
        id: processId,
        arrivalTime: arrivalTime,
        burstTime: burstTime,
        priority: isNaN(priority) ? 1 : priority
    };
    
    processes.push(process);
    
    // Add process to table
    addProcessToTable(process);
    
    // Reset form
    processForm.reset();
    document.getElementById('process-id').focus();
});

// Add process to table
function addProcessToTable(process) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${process.id}</td>
        <td>${process.arrivalTime}</td>
        <td>${process.burstTime}</td>
        <td class="priority-cell" style="display: ${document.querySelector('input[name="algorithm"]:checked').value === 'priority' ? 'table-cell' : 'none'}">${process.priority}</td>
        <td>
            <button class="btn danger-btn delete-btn" data-id="${process.id}">Delete</button>
        </td>
    `;
    
    processTable.querySelector('tbody').appendChild(row);
    
    // Add event listener to delete button
    row.querySelector('.delete-btn').addEventListener('click', () => {
        processes = processes.filter(p => p.id !== process.id);
        row.remove();
    });
}

// Run Simulation
runSimulationBtn.addEventListener('click', () => {
    if (processes.length === 0) {
        alert('Please add at least one process.');
        return;
    }
    
    const algorithm = document.querySelector('input[name="algorithm"]:checked').value;
    const timeQuantum = parseInt(document.getElementById('time-quantum').value);
    
    if (algorithm === 'rr' && (isNaN(timeQuantum) || timeQuantum <= 0)) {
        alert('Please enter a valid time quantum.');
        return;
    }
    
    // Run the selected algorithm
    runAlgorithm(algorithm, timeQuantum);
    
    // Show results section
    navLinks.forEach(navLink => navLink.classList.remove('active'));
    document.querySelector('nav a[href="#results"]').classList.add('active');
    
    sections.forEach(section => section.classList.remove('active-section'));
    document.getElementById('results').classList.add('active-section');
});

// Run All Algorithms for Comparison
runAllBtn.addEventListener('click', () => {
    if (processes.length === 0) {
        alert('Please add at least one process.');
        return;
    }
    
    const timeQuantum = parseInt(document.getElementById('time-quantum').value);
    
    if (isNaN(timeQuantum) || timeQuantum <= 0) {
        alert('Please enter a valid time quantum for Round Robin.');
        return;
    }
    
    // Run all algorithms
    simulationResults = {};
    simulationResults.fcfs = runFCFS([...processes]);
    simulationResults.sjf = runSJF([...processes]);
    simulationResults.rr = runRR([...processes], timeQuantum);
    simulationResults.priority = runPriority([...processes]);
    simulationResults.energy = runEnergyEfficient([...processes]);
    
    // Display comparison chart
    displayComparisonChart();
    
    // Show results section
    navLinks.forEach(navLink => navLink.classList.remove('active'));
    document.querySelector('nav a[href="#results"]').classList.add('active');
    
    sections.forEach(section => section.classList.remove('active-section'));
    document.getElementById('results').classList.add('active-section');
});

// Generate Random Processes
randomBtn.addEventListener('click', () => {
    // Clear existing processes
    processes = [];
    processTable.querySelector('tbody').innerHTML = '';
    
    // Generate 5 random processes
    const numProcesses = 5;
    for (let i = 1; i <= numProcesses; i++) {
        const process = {
            id: `P${i}`,
            arrivalTime: Math.floor(Math.random() * 10),
            burstTime: Math.floor(Math.random() * 10) + 1,
            priority: Math.floor(Math.random() * 5) + 1
        };
        
        processes.push(process);
        addProcessToTable(process);
    }
});

// Import Processes
importBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedProcesses = JSON.parse(event.target.result);
                
                // Clear existing processes
                processes = [];
                processTable.querySelector('tbody').innerHTML = '';
                
                // Add imported processes
                importedProcesses.forEach(process => {
                    processes.push(process);
                    addProcessToTable(process);
                });
                
                alert('Processes imported successfully.');
            } catch (error) {
                alert('Error importing processes. Please check the file format.');
                console.error(error);
            }
        };
        
        reader.readAsText(file);
    });
    
    input.click();
});

// Export Processes
exportBtn.addEventListener('click', () => {
    if (processes.length === 0) {
        alert('No processes to export.');
        return;
    }
    
    const dataStr = JSON.stringify(processes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'processes.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});

// Clear All Processes
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all processes?')) {
        processes = [];
        processTable.querySelector('tbody').innerHTML = '';
    }
});

// Algorithm Implementations
function runAlgorithm(algorithm, timeQuantum) {
    let result;
    
    switch (algorithm) {
        case 'fcfs':
            result = runFCFS([...processes]);
            break;
        case 'sjf':
            result = runSJF([...processes]);
            break;
        case 'rr':
            result = runRR([...processes], timeQuantum);
            break;
        case 'priority':
            result = runPriority([...processes]);
            break;
        case 'energy':
            result = runEnergyEfficient([...processes]);
            break;
        default:
            result = runFCFS([...processes]);
    }
    
    // Display results
    displayGanttChart(result.gantt);
    displayMetrics(result);
    displayEnergyChart(result);
    
    // Store result
    simulationResults[algorithm] = result;
}

// FCFS Algorithm
function runFCFS(processes) {
    // Sort processes by arrival time
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    let gantt = [];
    let completionTimes = {};
    let waitingTimes = {};
    let turnaroundTimes = {};
    let energyConsumption = 0;
    
    processes.forEach(process => {
        // Update current time if there's a gap
        if (process.arrivalTime > currentTime) {
            gantt.push({
                id: 'Idle',
                start: currentTime,
                end: process.arrivalTime,
                powerState: 'Idle'
            });
            currentTime = process.arrivalTime;
        }
        
        // Execute process
        gantt.push({
            id: process.id,
            start: currentTime,
            end: currentTime + process.burstTime,
            powerState: 'High'
        });
        
        // Update times
        completionTimes[process.id] = currentTime + process.burstTime;
        turnaroundTimes[process.id] = completionTimes[process.id] - process.arrivalTime;
        waitingTimes[process.id] = turnaroundTimes[process.id] - process.burstTime;
        
        // Update energy consumption (high power state)
        energyConsumption += process.burstTime * 100;
        
        // Update current time
        currentTime += process.burstTime;
    });
    
    // Calculate averages
    const avgWaitingTime = Object.values(waitingTimes).reduce((sum, time) => sum + time, 0) / processes.length;
    const avgTurnaroundTime = Object.values(turnaroundTimes).reduce((sum, time) => sum + time, 0) / processes.length;
    const throughput = processes.length / currentTime;
    
    return {
        algorithm: 'First Come First Serve (FCFS)',
        gantt,
        completionTimes,
        waitingTimes,
        turnaroundTimes,
        avgWaitingTime,
        avgTurnaroundTime,
        throughput,
        energyConsumption
    };
}

// SJF Algorithm (Non-preemptive)
function runSJF(processes) {
    // Sort processes by arrival time initially
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    let gantt = [];
    let completionTimes = {};
    let waitingTimes = {};
    let turnaroundTimes = {};
    let energyConsumption = 0;
    let remainingProcesses = [...processes];
    
    while (remainingProcesses.length > 0) {
        // Find ready processes
        const readyProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
        
        if (readyProcesses.length === 0) {
            // No process is ready, advance time to next arrival
            const nextArrival = Math.min(...remainingProcesses.map(p => p.arrivalTime));
            gantt.push({
                id: 'Idle',
                start: currentTime,
                end: nextArrival,
                powerState: 'Idle'
            });
            currentTime = nextArrival;
            continue;
        }
        
        // Find shortest job
        const shortestJob = readyProcesses.reduce((min, p) => 
            p.burstTime < min.burstTime ? p : min, readyProcesses[0]);
        
        // Execute process
        gantt.push({
            id: shortestJob.id,
            start: currentTime,
            end: currentTime + shortestJob.burstTime,
            powerState: 'High'
        });
        
        // Update times
        completionTimes[shortestJob.id] = currentTime + shortestJob.burstTime;
        turnaroundTimes[shortestJob.id] = completionTimes[shortestJob.id] - shortestJob.arrivalTime;
        waitingTimes[shortestJob.id] = turnaroundTimes[shortestJob.id] - shortestJob.burstTime;
        
        // Update energy consumption (high power state)
        energyConsumption += shortestJob.burstTime * 100;
        
        // Update current time
        currentTime += shortestJob.burstTime;
        
        // Remove processed job
        remainingProcesses = remainingProcesses.filter(p => p.id !== shortestJob.id);
    }
    
    // Calculate averages
    const avgWaitingTime = Object.values(waitingTimes).reduce((sum, time) => sum + time, 0) / processes.length;
    const avgTurnaroundTime = Object.values(turnaroundTimes).reduce((sum, time) => sum + time, 0) / processes.length;
    const throughput = processes.length / currentTime;
    
    return {
        algorithm: 'Shortest Job First (SJF)',
        gantt,
        completionTimes,
        waitingTimes,
        turnaroundTimes,
        avgWaitingTime,
        avgTurnaroundTime,
        throughput,
        energyConsumption
    };
}

// Round Robin Algorithm
function runRR(processes, timeQuantum) {
    // Sort processes by arrival time
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    let gantt = [];
    let completionTimes = {};
    let waitingTimes = {};
    let turnaroundTimes = {};
    let energyConsumption = 0;
    
    // Create a queue of processes with remaining burst time
    let queue = [];
    let remainingProcesses = processes.map(p => ({
        ...p,
        remainingTime: p.burstTime
    }));
    
    while (remainingProcesses.length > 0 || queue.length > 0) {
        // Add newly arrived processes to the queue
        const newArrivals = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
        queue.push(...newArrivals);
        remainingProcesses = remainingProcesses.filter(p => p.arrivalTime > currentTime);
        
        if (queue.length === 0) {
            // No process in queue, advance time to next arrival
            if (remainingProcesses.length > 0) {
                const nextArrival = Math.min(...remainingProcesses.map(p => p.arrivalTime));
                gantt.push({
                    id: 'Idle',
                    start: currentTime,
                    end: nextArrival,
                    powerState: 'Idle'
                });
                currentTime = nextArrival;
            }
            continue;
        }
        
        // Get the next process from queue
        const currentProcess = queue.shift();
        
        // Calculate execution time for this quantum
        const executionTime = Math.min(timeQuantum, currentProcess.remainingTime);
        
        // Execute process for the quantum or remaining time
        gantt.push({
            id: currentProcess.id,
            start: currentTime,
            end: currentTime + executionTime,
            powerState: 'High'
        });
        
        // Update energy consumption (high power state)
        energyConsumption += executionTime * 100;
        
        // Update remaining time
        currentProcess.remainingTime -= executionTime;
        
        // Update current time
        currentTime += executionTime;
        
        // Check if process is completed
        if (currentProcess.remainingTime > 0) {
            // Add newly arrived processes before re-adding current process
            const newArrivals = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
            queue.push(...newArrivals);
            remainingProcesses = remainingProcesses.filter(p => p.arrivalTime > currentTime);
            
            // Re-add process to queue
            queue.push(currentProcess);
        } else {
            // Process is completed
            completionTimes[currentProcess.id] = currentTime;
            turnaroundTimes[currentProcess.id] = completionTimes[currentProcess.id] - currentProcess.arrivalTime;
            waitingTimes[currentProcess.id] = turnaroundTimes[currentProcess.id] - currentProcess.burstTime;
        }
    }
    
    // Calculate averages
    const avgWaitingTime = Object.values(waitingTimes).reduce((sum, time) => sum + time, 0) / processes.length;
    const avgTurnaroundTime = Object.values(turnaroundTimes).reduce((sum, time) => sum + time, 0) / processes.length;
    const throughput = processes.length / currentTime;
    
    return {
        algorithm: `Round Robin (RR, Time Quantum: ${timeQuantum})`,
        gantt,
        completionTimes,
        waitingTimes,
        turnaroundTimes,
        avgWaitingTime,
        avgTurnaroundTime,
        throughput,
        energyConsumption
    };
}

// Priority Scheduling (Non-preemptive)
function runPriority(processes) {
    // Sort processes by arrival time initially
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    let gantt = [];
    let completionTimes = {};
    let waitingTimes = {};
    let turnaroundTimes = {};
    let energyConsumption = 0;
    let remainingProcesses = [...processes];
    
    while (remainingProcesses.length > 0) {
        // Find ready processes
        const readyProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
        
        if (readyProcesses.length === 0) {
            // No process is ready, advance time to next arrival
            const nextArrival = Math.min(...remainingProcesses.map(p => p.arrivalTime));
            gantt.push({
                id: 'Idle',
                start: currentTime,
                end: nextArrival,
                powerState: 'Idle'
            });
            currentTime = nextArrival;
            continue;
        }
        
        // Find highest priority job (lower number = higher priority)
        const highestPriorityJob = readyProcesses.reduce((min, p) => 
            p.priority < min.priority ? p : min, readyProcesses[0]);
        
        // Execute process
        gantt.push({
            id: highestPriorityJob.id,
            start: currentTime,
            end: currentTime + highestPriorityJob.burstTime,
            powerState: 'High'
        });
        
        // Update times
        completionTimes[highestPriorityJob.id] = currentTime + highestPriorityJob.burstTime;
        turnaroundTimes[highestPriorityJob.id] = completionTimes[highestPriorityJob.id] - highestPriorityJob.arrivalTime;
        waitingTimes[highestPriorityJob.id] = turnaroundTimes[highestPriorityJob.id] - highestPriorityJob.burstTime;
        
        // Update energy consumption (high power state)
        energyConsumption += highestPriorityJob.burstTime * 100;
        
        // Update current time
        currentTime += highestPriorityJob.burstTime;
        
        // Remove processed job
        remainingProcesses = remainingProcesses.filter(p => p.id !== highestPriorityJob.id);
    }
    
    // Calculate averages
    const avgWaitingTime = Object.values(waitingTimes).reduce((sum, time) => sum + time, 0) / processes.length;
    const avgTurnaroundTime = Object.values(turnaroundTimes).reduce((sum, time) => sum + time, 0) / processes.length;
    const throughput = processes.length / currentTime;
    
    return {
        algorithm: 'Priority Scheduling',
        gantt,
        completionTimes,
        waitingTimes,
        turnaroundTimes,
        avgWaitingTime,
        avgTurnaroundTime,
        throughput,
        energyConsumption
    };
}

// Energy-Efficient Scheduling
function runEnergyEfficient(processes) {
    // Sort processes by arrival time initially
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    let gantt = [];
    let completionTimes = {};
    let waitingTimes = {};
    let turnaroundTimes = {};
    let energyConsumption = 0;
    let remainingProcesses = [...processes];
    
    // Assign power states based on burst time
    // Shorter processes get higher power states for responsiveness
    // Longer processes get lower power states for energy efficiency
    remainingProcesses.forEach(process => {
        if (process.burstTime <= 3) {
            process.powerState = 'High';
            process.powerFactor = 1.0; // No slowdown
        } else if (process.burstTime <= 7) {
            process.powerState = 'Medium';
            process.powerFactor = 1.2; // 20% slowdown
        } else {
            process.powerState = 'Low';
            process.powerFactor = 1.5; // 50% slowdown
        }
    });
    
    while (remainingProcesses.length > 0) {
        // Find ready processes
        const readyProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
        
        if (readyProcesses.length === 0) {
            // No process is ready, advance time to next arrival
            const nextArrival = Math.min(...remainingProcesses.map(p => p.arrivalTime));
            gantt.push({
                id: 'Idle',
                start: currentTime,
                end: nextArrival,
                powerState: 'Idle'
            });
            currentTime = nextArrival;
            continue;
        }
        
        // Sort ready processes by shortest job first
        readyProcesses.sort((a, b) => a.burstTime - b.burstTime);
        
        // Get next process
        const nextProcess = readyProcesses[0];
        
        // Calculate actual execution time based on power state
        const actualBurstTime = Math.ceil(nextProcess.burstTime * nextProcess.powerFactor);
        
        // Execute process
        gantt.push({
            id: nextProcess.id,
            start: currentTime,
            end: currentTime + actualBurstTime,
            powerState: nextProcess.powerState
        });
        
        // Update times
        completionTimes[nextProcess.id] = currentTime + actualBurstTime;
        turnaroundTimes[nextProcess.id] = completionTimes[nextProcess.id] - nextProcess.arrivalTime;
        waitingTimes[nextProcess.id] = turnaroundTimes[nextProcess.id] - nextProcess.burstTime;
        
        // Update energy consumption based on power state
        let powerConsumption;
        switch (nextProcess.powerState) {
            case 'High':
                powerConsumption = 100; // 100% power
                break;
            case 'Medium':
                powerConsumption = 70; // 70% power
                break;
            case 'Low':
                powerConsumption = 40; // 40% power
                break;
            default:
                powerConsumption = 100;
        }
        
        energyConsumption += actualBurstTime * powerConsumption;
        
        // Update current time
        currentTime += actualBurstTime;
        
        // Remove processed job
        remainingProcesses = remainingProcesses.filter(p => p.id !== nextProcess.id);
    }
    
    // Calculate averages
    const avgWaitingTime = Object.values(waitingTimes).reduce((sum, time) => sum + time, 0) / processes.length;
    const avgTurnaroundTime = Object.values(turnaroundTimes).reduce((sum, time) => sum + time, 0) / processes.length;
    const throughput = processes.length / currentTime;
    
    return {
        algorithm: 'Energy-Efficient Scheduling',
        gantt,
        completionTimes,
        waitingTimes,
        turnaroundTimes,
        avgWaitingTime,
        avgTurnaroundTime,
        throughput,
        energyConsumption
    };
}

// Display Gantt Chart
function displayGanttChart(ganttData) {
    if (!ganttData || ganttData.length === 0) return;
    
    // Clear previous chart
    ganttChartContainer.innerHTML = '';
    
    // Create gantt chart
    const ganttChart = document.createElement('div');
    ganttChart.className = 'gantt-chart';
    
    // Calculate total time and scale
    const totalTime = ganttData[ganttData.length - 1].end;
    const timeScale = 100 / totalTime; // percentage of width
    
    // Create timeline
    const timeline = document.createElement('div');
    timeline.className = 'timeline';
    
    for (let i = 0; i <= totalTime; i += Math.ceil(totalTime / 20)) {
        const timeMarker = document.createElement('span');
        timeMarker.className = 'time-marker';
        timeMarker.style.left = `${i * timeScale}%`;
        timeMarker.textContent = i;
        timeline.appendChild(timeMarker);
    }
    
    ganttChart.appendChild(timeline);
    
    // Create gantt bars
    ganttData.forEach(item => {
        const ganttBar = document.createElement('div');
        ganttBar.className = 'gantt-bar';
        ganttBar.style.left = `${item.start * timeScale}%`;
        ganttBar.style.width = `${(item.end - item.start) * timeScale}%`;
        
        // Set color based on power state
        if (item.id === 'Idle') {
            ganttBar.style.backgroundColor = '#ccc';
        } else {
            switch (item.powerState) {
                case 'High':
                    ganttBar.style.backgroundColor = '#e74c3c';
                    break;
                case 'Medium':
                    ganttBar.style.backgroundColor = '#f39c12';
                    break;
                case 'Low':
                    ganttBar.style.backgroundColor = '#2ecc71';
                    break;
                case 'Idle':
                    ganttBar.style.backgroundColor = '#ccc';
                    break;
                default:
                    ganttBar.style.backgroundColor = '#3498db';
            }
        }
        
        const label = document.createElement('span');
        label.className = 'gantt-label';
        label.textContent = item.id;
        
        const timeLabel = document.createElement('span');
        timeLabel.className = 'time-label';
        timeLabel.textContent = `${item.start}-${item.end}`;
        
        ganttBar.appendChild(label);
        ganttBar.appendChild(timeLabel);
        ganttChart.appendChild(ganttBar);
    });
    
    ganttChartContainer.appendChild(ganttChart);
    
    // Add CSS for gantt chart
    const style = document.createElement('style');
    style.textContent = `
        .gantt-chart {
            position: relative;
            height: 300px;
            margin-top: 30px;
            overflow-x: auto;
        }
        
        .timeline {
            position: relative;
            height: 20px;
            border-bottom: 1px solid #ddd;
            margin-bottom: 10px;
        }
        
        .time-marker {
            position: absolute;
            transform: translateX(-50%);
            font-size: 12px;
            color: #777;
        }
        
        .gantt-bar {
            position: relative;
            height: 30px;
            margin-bottom: 5px;
            border-radius: 3px;
            overflow: hidden;
        }
        
        .gantt-label {
            position: absolute;
            left: 5px;
            top: 5px;
            color: white;
            font-weight: bold;
            text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        }
        
        .time-label {
            position: absolute;
            right: 5px;
            top: 5px;
            color: white;
            font-size: 12px;
            text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        }
    `;
    
    document.head.appendChild(style);
}

// Display Metrics
function displayMetrics(result) {
    if (!result) return;
    
    // Clear previous metrics
    metricsTableContainer.innerHTML = '';
    
    // Create metrics table
    const table = document.createElement('table');
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    ['Process', 'Arrival Time', 'Burst Time', 'Completion Time', 'Turnaround Time', 'Waiting Time'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    processes.forEach(process => {
        const row = document.createElement('tr');
        
        const processCell = document.createElement('td');
        processCell.textContent = process.id;
        row.appendChild(processCell);
        
        const arrivalCell = document.createElement('td');
        arrivalCell.textContent = process.arrivalTime;
        row.appendChild(arrivalCell);
        
        const burstCell = document.createElement('td');
        burstCell.textContent = process.burstTime;
        row.appendChild(burstCell);
        
        const completionCell = document.createElement('td');
        completionCell.textContent = result.completionTimes[process.id];
        row.appendChild(completionCell);
        
        const turnaroundCell = document.createElement('td');
        turnaroundCell.textContent = result.turnaroundTimes[process.id];
        row.appendChild(turnaroundCell);
        
        const waitingCell = document.createElement('td');
        waitingCell.textContent = result.waitingTimes[process.id];
        row.appendChild(waitingCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    // Create summary
    const summary = document.createElement('div');
    summary.className = 'metrics-summary';
    
    summary.innerHTML = `
        <h4>Summary</h4>
        <p><strong>Algorithm:</strong> ${result.algorithm}</p>
        <p><strong>Average Waiting Time:</strong> ${result.avgWaitingTime.toFixed(2)}</p>
        <p><strong>Average Turnaround Time:</strong> ${result.avgTurnaroundTime.toFixed(2)}</p>
        <p><strong>Throughput:</strong> ${result.throughput.toFixed(4)} processes/time unit</p>
        <p><strong>Energy Consumption:</strong> ${result.energyConsumption.toFixed(2)} energy units</p>
    `;
    
    metricsTableContainer.appendChild(table);
    metricsTableContainer.appendChild(summary);
}

// Display Energy Chart
function displayEnergyChart(result) {
    if (!result) return;
    
    // Clear previous chart
    if (energyChart) {
        energyChart.destroy();
    }
    
    // Calculate energy consumption by power state
    const energyByState = {
        High: 0,
        Medium: 0,
        Low: 0,
        Idle: 0
    };
    
    result.gantt.forEach(item => {
        const duration = item.end - item.start;
        
        switch (item.powerState) {
            case 'High':
                energyByState.High += duration * 100;
                break;
            case 'Medium':
                energyByState.Medium += duration * 70;
                break;
            case 'Low':
                energyByState.Low += duration * 40;
                break;
            case 'Idle':
                energyByState.Idle += duration * 10;
                break;
        }
    });
    
    // Create chart
    energyChart = new Chart(energyChartCanvas, {
        type: 'pie',
        data: {
            labels: ['High Power', 'Medium Power', 'Low Power', 'Idle'],
            datasets: [{
                data: [
                    energyByState.High,
                    energyByState.Medium,
                    energyByState.Low,
                    energyByState.Idle
                ],
                backgroundColor: [
                    '#e74c3c',
                    '#f39c12',
                    '#2ecc71',
                    '#95a5a6'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Energy Consumption by Power State',
                    color: document.body.classList.contains('dark-mode') ? '#f5f7fa' : '#333'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#f5f7fa' : '#333'
                    }
                }
            }
        }
    });
}

// Display Comparison Chart
function displayComparisonChart() {
    if (Object.keys(simulationResults).length === 0) return;
    
    // Clear previous chart
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    // Prepare data
    const algorithms = Object.keys(simulationResults).map(key => {
        switch (key) {
            case 'fcfs': return 'FCFS';
            case 'sjf': return 'SJF';
            case 'rr': return 'RR';
            case 'priority': return 'Priority';
            case 'energy': return 'Energy-Efficient';
            default: return key;
        }
    });
    
    const waitingTimes = Object.values(simulationResults).map(result => result.avgWaitingTime);
    const turnaroundTimes = Object.values(simulationResults).map(result => result.avgTurnaroundTime);
    const energyConsumptions = Object.values(simulationResults).map(result => result.energyConsumption / 100); // Scale down for better visualization
    
    // Create chart
    comparisonChart = new Chart(comparisonChartCanvas, {
        type: 'bar',
        data: {
            labels: algorithms,
            datasets: [
                {
                    label: 'Avg. Waiting Time',
                    data: waitingTimes,
                    backgroundColor: '#3498db'
                },
                {
                    label: 'Avg. Turnaround Time',
                    data: turnaroundTimes,
                    backgroundColor: '#2ecc71'
                },
                {
                    label: 'Energy Consumption (scaled)',
                    data: energyConsumptions,
                    backgroundColor: '#e74c3c'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#f5f7fa' : '#333'
                    },
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#f5f7fa' : '#333'
                    },
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Algorithm Comparison',
                    color: document.body.classList.contains('dark-mode') ? '#f5f7fa' : '#333'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#f5f7fa' : '#333'
                    }
                }
            }
        }
    });
}

// Create a placeholder SVG for the CPU scheduling illustration
function createPlaceholderSVG() {
    const svgDir = 'assets';
    const svgPath = `${svgDir}/cpu-scheduling.svg`;
    
    // Check if directory exists, if not create it
    try {
        const dirExists = new XMLHttpRequest();
        dirExists.open('HEAD', svgDir, false);
        dirExists.send();
        
        if (dirExists.status === 404) {
            console.warn(`Directory ${svgDir} not found. SVG might not display correctly.`);
        }
    } catch (e) {
        console.warn(`Error checking directory ${svgDir}: ${e.message}`);
    }
    
    // Create a simple SVG for CPU scheduling
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
        <style>
            .cpu { fill: #4a6fa5; }
            .process { stroke-width: 2; }
            .p1 { fill: #e74c3c; }
            .p2 { fill: #f39c12; }
            .p3 { fill: #2ecc71; }
            .p4 { fill: #3498db; }
            .arrow { fill: none; stroke: #333; stroke-width: 3; }
            .text { font-family: Arial; font-size: 24px; fill: #333; }
            .small-text { font-family: Arial; font-size: 18px; fill: #333; }
            
            @media (prefers-color-scheme: dark) {
                .arrow { stroke: #f5f7fa; }
                .text, .small-text { fill: #f5f7fa; }
            }
        </style>
        
        <!-- CPU -->
        <rect x="350" y="250" width="100" height="100" rx="10" class="cpu" />
        <text x="400" y="300" text-anchor="middle" class="text">CPU</text>
        
        <!-- Processes -->
        <rect x="100" y="150" width="80" height="80" rx="5" class="process p1" />
        <text x="140" y="190" text-anchor="middle" class="small-text">P1</text>
        
        <rect x="100" y="250" width="80" height="80" rx="5" class="process p2" />
        <text x="140" y="290" text-anchor="middle" class="small-text">P2</text>
        
        <rect x="100" y="350" width="80" height="80" rx="5" class="process p3" />
        <text x="140" y="390" text-anchor="middle" class="small-text">P3</text>
        
        <rect x="620" y="250" width="80" height="80" rx="5" class="process p4" />
        <text x="660" y="290" text-anchor="middle" class="small-text">P4</text>
        
        <!-- Arrows -->
        <path d="M190,190 H270 Q290,190 290,210 V270 Q290,290 310,290 H340" class="arrow" marker-end="url(#arrowhead)" />
        <path d="M190,290 H340" class="arrow" marker-end="url(#arrowhead)" />
        <path d="M190,390 H270 Q290,390 290,370 V310 Q290,290 310,290 H340" class="arrow" marker-end="url(#arrowhead)" />
        <path d="M460,290 H610" class="arrow" marker-end="url(#arrowhead)" />
        
        <!-- Arrow markers -->
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
        </defs>
        
        <!-- Labels -->
        <text x="140" y="100" text-anchor="middle" class="text">Ready Queue</text>
        <text x="660" y="200" text-anchor="middle" class="text">Completed</text>
        <text x="400" y="450" text-anchor="middle" class="text">CPU Scheduling</text>
    </svg>
    `;
    
    // Try to save the SVG file
    try {
        // For browser environment, we can't directly save to file system
        // This is just a placeholder for the actual SVG file
        console.log(`SVG content generated. In a server environment, this would be saved to ${svgPath}`);
        
        // For demonstration, we'll update any existing img elements
        const imgElements = document.querySelectorAll(`img[src="${svgPath}"]`);
        imgElements.forEach(img => {
            img.src = `data:image/svg+xml;base64,${btoa(svgContent)}`;
        });
    } catch (e) {
        console.error(`Error creating SVG: ${e.message}`);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set initial theme icon
    themeToggle.innerHTML = document.body.classList.contains('dark-mode') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    
    // Hide priority column initially
    priorityHeader.style.display = 'none';
    
    // Create placeholder SVG
    createPlaceholderSVG();
});