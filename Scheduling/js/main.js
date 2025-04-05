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
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('section');
const themeToggle = document.querySelector('.theme-toggle');
const processForm = document.getElementById('process-form');
const processTable = document.getElementById('process-table').querySelector('tbody');
const algorithmRadios = document.querySelectorAll('input[name="algorithm"]');
const timeQuantumContainer = document.getElementById('time-quantum-container');
const runSimulationBtn = document.getElementById('run-simulation');

// State
let processes = [];
let simulationResults = {
    fcfs: null,
    sjf: null,
    rr: null,
    priority: null,
    energy: null
};

// Create Web Worker
let worker;
try {
    worker = new Worker('./js/worker.js', { type: 'module' });
} catch (e) {
    console.error('Web Workers not supported in this browser or environment:', e);
    // Fallback to direct function calls
    worker = {
        postMessage: function(data) {
            const { algorithm, processes, timeQuantum } = data;
            let result;
            
            switch (algorithm) {
                case 'fcfs':
                    result = FCFS(processes);
                    break;
                case 'sjf':
                    result = SJF(processes);
                    break;
                case 'rr':
                    result = RoundRobin(processes, timeQuantum);
                    break;
                case 'priority':
                    result = Priority(processes);
                    break;
                case 'energy':
                    result = EnergyEfficient(processes);
                    break;
            }
            
            // Simulate async behavior
            setTimeout(() => {
                if (this.onmessage) {
                    this.onmessage({ data: result });
                }
            }, 0);
        },
        onmessage: null
    };
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        
        // Update active link
        navLinks.forEach(link => link.classList.remove('active'));
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

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkMode);
});

// Load theme preference
const loadThemePreference = () => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
};

// Process Form Submission
processForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const processId = document.getElementById('process-id').value;
    const arrivalTime = parseInt(document.getElementById('arrival-time').value);
    const burstTime = parseInt(document.getElementById('burst-time').value);
    const priority = parseInt(document.getElementById('priority').value);
    
    // Validate inputs
    if (!processId || isNaN(arrivalTime) || isNaN(burstTime) || isNaN(priority)) {
        alert('Please fill all fields with valid values');
        return;
    }
    
    // Check for duplicate process ID
    if (processes.some(p => p.id === processId)) {
        alert('Process ID already exists');
        return;
    }
    
    // Add process to the list
    const process = {
        id: processId,
        arrivalTime,
        burstTime,
        priority,
        remainingTime: burstTime
    };
    
    processes.push(process);
    
    // Add to table
    addProcessToTable(process);
    
    // Reset form
    processForm.reset();
    document.getElementById('process-id').focus();
});

// Function to add a process to the table
function addProcessToTable(process) {
    const tableBody = document.querySelector('#process-table tbody');
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td>${process.id}</td>
        <td>${process.arrivalTime}</td>
        <td>${process.burstTime}</td>
        <td class="priority-cell">${process.priority || ''}</td>
        <td>
            <button class="delete-btn" data-id="${process.id}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tableBody.appendChild(newRow);
    
    // Apply current visibility settings to the new row
    if (document.querySelector('input[name="algorithm"]:checked').value !== 'priority') {
        newRow.querySelector('.priority-cell').style.display = 'none';
    }
    
    // Add event listener to delete button
    newRow.querySelector('.delete-btn').addEventListener('click', function() {
        const processId = this.getAttribute('data-id');
        deleteProcess(processId);
        newRow.remove();
    });
}

// Algorithm selection
algorithmRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'rr') {
            timeQuantumContainer.style.display = 'block';
        } else {
            timeQuantumContainer.style.display = 'none';
        }
    });
});

// Run Simulation
runSimulationBtn.addEventListener('click', () => {
    if (processes.length === 0) {
        alert('Please add at least one process');
        return;
    }
    
    const selectedAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
    const timeQuantum = parseInt(document.getElementById('time-quantum').value);
    
    // Validate time quantum for Round Robin
    if (selectedAlgorithm === 'rr' && (isNaN(timeQuantum) || timeQuantum < 1)) {
        alert('Please enter a valid time quantum');
        return;
    }
    
    // Create deep copy of processes to avoid modifying the original array
    const processesCopy = JSON.parse(JSON.stringify(processes));
    
    // Show loading indicator
    let loadingIndicator = document.getElementById('loading-indicator');
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.innerHTML = '<div class="spinner"></div><p>Processing...</p>';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '0';
        loadingIndicator.style.left = '0';
        loadingIndicator.style.width = '100%';
        loadingIndicator.style.height = '100%';
        loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
        loadingIndicator.style.zIndex = '9999';
        loadingIndicator.style.display = 'flex';
        loadingIndicator.style.justifyContent = 'center';
        loadingIndicator.style.alignItems = 'center';
        loadingIndicator.style.flexDirection = 'column';
        loadingIndicator.style.color = 'white';
        document.body.appendChild(loadingIndicator);
    }
    loadingIndicator.style.display = 'flex';
    
    // Use setTimeout to allow the UI to update before running the algorithm
    setTimeout(() => {
        let result;
        
        // Run the selected algorithm directly
        try {
            switch (selectedAlgorithm) {
                case 'fcfs':
                    result = FCFS(processesCopy);
                    break;
                case 'sjf':
                    result = SJF(processesCopy);
                    break;
                case 'rr':
                    result = RoundRobin(processesCopy, timeQuantum);
                    break;
                case 'priority':
                    result = Priority(processesCopy);
                    break;
                case 'energy':
                    result = EnergyEfficient(processesCopy);
                    break;
                default:
                    throw new Error('Invalid algorithm');
            }
            
            // Store results
            simulationResults[selectedAlgorithm] = result;
            
            // Navigate to results section
            const resultsLink = document.querySelector('a[href="#results"]');
            resultsLink.click();
            
            // Render results
            renderGanttChart(result.ganttChart, 'gantt-chart');
            renderMetricsTable(result.metrics, 'metrics-table');
            renderEnergyChart(result.energyConsumption, 'energy-chart');
            
            // If we have results from multiple algorithms, show comparison
            const hasMultipleResults = Object.values(simulationResults).filter(Boolean).length > 1;
            if (hasMultipleResults) {
                renderComparisonChart(simulationResults, 'comparison-chart');
            }
        } catch (error) {
            console.error('Error running simulation:', error);
            alert('Error running simulation: ' + error.message);
        } finally {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
        }
    }, 100); // Small delay to allow UI update
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    
    // Add sample processes for demonstration
    const sampleProcesses = [
        { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 2, remainingTime: 5 },
        { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, remainingTime: 3 },
        { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 4, remainingTime: 8 },
        { id: 'P4', arrivalTime: 3, burstTime: 2, priority: 3, remainingTime: 2 }
    ];
    
    sampleProcesses.forEach(process => {
        processes.push(process);
        addProcessToTable(process);
    });
    
    // Handle "Start Simulation" button click
    document.getElementById('start-simulation-btn').addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active link
        navLinks.forEach(link => link.classList.remove('active'));
        document.querySelector('a[href="#simulation"]').classList.add('active');
        
        // Show simulation section
        sections.forEach(section => {
            section.classList.remove('active-section');
            if (section.id === 'simulation') {
                section.classList.add('active-section');
            }
        });
    });
    
    // Make algorithm cards expandable on mobile
    if (window.innerWidth <= 768) {
        const algorithmCards = document.querySelectorAll('.algorithm-cards .card');
        algorithmCards.forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('expanded');
            });
        });
    }
});

// Run all algorithms for comparison
document.getElementById('run-all-btn').addEventListener('click', () => {
    if (processes.length === 0) {
        alert('Please add at least one process');
        return;
    }
    
    const timeQuantum = parseInt(document.getElementById('time-quantum').value);
    
    // Validate time quantum
    if (isNaN(timeQuantum) || timeQuantum < 1) {
        alert('Please enter a valid time quantum for Round Robin');
        return;
    }
    
    // Show loading indicator
    let loadingIndicator = document.getElementById('loading-indicator');
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.innerHTML = '<div class="spinner"></div><p>Processing all algorithms...</p>';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '0';
        loadingIndicator.style.left = '0';
        loadingIndicator.style.width = '100%';
        loadingIndicator.style.height = '100%';
        loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
        loadingIndicator.style.zIndex = '9999';
        loadingIndicator.style.display = 'flex';
        loadingIndicator.style.justifyContent = 'center';
        loadingIndicator.style.alignItems = 'center';
        loadingIndicator.style.flexDirection = 'column';
        loadingIndicator.style.color = 'white';
        document.body.appendChild(loadingIndicator);
    }
    loadingIndicator.style.display = 'flex';
    
    // Use setTimeout to allow the UI to update before running the algorithms
    setTimeout(() => {
        try {
            // Create deep copy of processes
            const processesCopy = JSON.parse(JSON.stringify(processes));
            
            // Run all algorithms directly
            simulationResults.fcfs = FCFS(JSON.parse(JSON.stringify(processesCopy)));
            simulationResults.sjf = SJF(JSON.parse(JSON.stringify(processesCopy)));
            simulationResults.rr = RoundRobin(JSON.parse(JSON.stringify(processesCopy)), timeQuantum);
            simulationResults.priority = Priority(JSON.parse(JSON.stringify(processesCopy)));
            simulationResults.energy = EnergyEfficient(JSON.parse(JSON.stringify(processesCopy)));
            
            // Navigate to results section
            const resultsLink = document.querySelector('a[href="#results"]');
            resultsLink.click();
            
            // Render comparison chart
            renderComparisonChart(simulationResults, 'comparison-chart');
            
            // Also render the first algorithm's results
            renderGanttChart(simulationResults.fcfs.ganttChart, 'gantt-chart');
            renderMetricsTable(simulationResults.fcfs.metrics, 'metrics-table');
            renderEnergyChart(simulationResults.fcfs.energyConsumption, 'energy-chart');
        } catch (error) {
            console.error('Error running all algorithms:', error);
            alert('Error running all algorithms: ' + error.message);
        } finally {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
        }
    }, 100); // Small delay to allow UI update
});

// Export results
document.getElementById('export-btn').addEventListener('click', () => {
    // Check if we have any results
    const hasResults = Object.values(simulationResults).some(Boolean);
    if (!hasResults) {
        alert('No simulation results to export');
        return;
    }
    
    // Create export data
    const exportData = {
        processes: processes,
        results: simulationResults,
        timestamp: new Date().toISOString()
    };
    
    // Convert to JSON
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Create download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cpu-scheduling-results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Import processes
document.getElementById('import-btn').addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Check if the file has processes
                if (!importedData.processes || !Array.isArray(importedData.processes)) {
                    throw new Error('Invalid file format');
                }
                
                // Clear existing processes
                processes = [];
                processTable.innerHTML = '';
                
                // Add imported processes
                importedData.processes.forEach(process => {
                    processes.push(process);
                    addProcessToTable(process);
                });
                
                alert(`Successfully imported ${processes.length} processes`);
            } catch (error) {
                alert('Error importing file: ' + error.message);
            }
        };
        reader.readAsText(file);
    });
    
    fileInput.click();
});

// Generate random processes
document.getElementById('random-btn').addEventListener('click', () => {
    const count = parseInt(prompt('Enter number of processes to generate (1-10):', '5'));
    
    if (isNaN(count) || count < 1 || count > 10) {
        alert('Please enter a valid number between 1 and 10');
        return;
    }
    
    // Clear existing processes
    processes = [];
    processTable.innerHTML = '';
    
    // Generate random processes
    for (let i = 0; i < count; i++) {
        const process = {
            id: `P${i + 1}`,
            arrivalTime: Math.floor(Math.random() * 10),
            burstTime: Math.floor(Math.random() * 10) + 1, // Ensure burst time is at least 1
            priority: Math.floor(Math.random() * 5) + 1,
            remainingTime: 0
        };
        process.remainingTime = process.burstTime;
        
        processes.push(process);
        addProcessToTable(process);
    }
});

// Function to navigate to a section
function navigateToSection(sectionId) {
    // Update active link
    navLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`a[href="#${sectionId}"]`).classList.add('active');
    
    // Show selected section
    sections.forEach(section => {
        section.classList.remove('active-section');
        if (section.id === sectionId) {
            section.classList.add('active-section');
        }
    });
    
    // Scroll to section
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Update navigation links to use the function
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const sectionId = this.getAttribute('href').substring(1);
        navigateToSection(sectionId);
    });
});

// Function to toggle priority input and column visibility based on selected algorithm
function togglePriorityVisibility() {
    const selectedAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
    const priorityContainer = document.getElementById('priority-container');
    const priorityColumnCells = document.querySelectorAll('.priority-cell');
    const priorityHeader = document.querySelector('th.priority-header');
    
    if (selectedAlgorithm === 'priority') {
        // Show priority input and column for Priority Scheduling
        priorityContainer.style.display = 'block';
        priorityHeader.style.display = 'table-cell';
        priorityColumnCells.forEach(cell => {
            cell.style.display = 'table-cell';
        });
    } else {
        // Hide priority input and column for other algorithms
        priorityContainer.style.display = 'none';
        priorityHeader.style.display = 'none';
        priorityColumnCells.forEach(cell => {
            cell.style.display = 'none';
        });
    }
}

// Add event listeners to algorithm radio buttons
document.querySelectorAll('input[name="algorithm"]').forEach(radio => {
    radio.addEventListener('change', togglePriorityVisibility);
});

// Call the function on page load to set initial state
document.addEventListener('DOMContentLoaded', () => {
    togglePriorityVisibility();
    // ... other initialization code ...
});