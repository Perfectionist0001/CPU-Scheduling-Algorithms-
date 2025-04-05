// Web Worker for CPU-intensive calculations
self.onmessage = function(e) {
    const { algorithm, processes, timeQuantum } = e.data;
    
    // Import the appropriate algorithm module
    importScripts(
        'algorithms/fcfs.js',
        'algorithms/sjf.js',
        'algorithms/roundRobin.js',
        'algorithms/priority.js',
        'algorithms/energyEfficient.js'
    );
    
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
        default:
            result = { error: 'Invalid algorithm' };
    }
    
    // Send the result back to the main thread
    self.postMessage(result);
};