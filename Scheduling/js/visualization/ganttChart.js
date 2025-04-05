// Gantt Chart Visualization
/**
 * Renders a Gantt chart with animations
 * @param {Array} ganttData - Array of process execution data
 * @param {string} elementId - ID of the container element
 */
export function renderGanttChart(ganttData, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    if (!ganttData || ganttData.length === 0) {
        container.innerHTML = '<p>No data available</p>';
        return;
    }
    
    // Normalize data format
    let processData = normalizeGanttData(ganttData);
    
    // Find the total time span
    const endTime = Math.max(...processData.map(item => item.endTime || 0));
    
    // Create a timeline representation
    const timeline = createTimeline(processData);
    
    // Get unique process IDs (excluding Idle)
    const processIds = [...new Set(timeline
        .filter(item => item.processId !== 'Idle')
        .map(item => item.processId))];
    
    // Create the main container with a futuristic design
    const ganttContainer = document.createElement('div');
    ganttContainer.className = 'gantt-container';
    
    // Add the execution status display
    const executionStatus = document.createElement('div');
    executionStatus.className = 'execution-status';
    executionStatus.innerHTML = `
        <div class="current-process">
            <div class="process-icon">
                <svg viewBox="0 0 24 24" class="process-icon-svg">
                    <circle cx="12" cy="12" r="10" class="process-icon-circle"></circle>
                    <path d="M12 6V12L16 14" class="process-icon-hand"></path>
                </svg>
            </div>
            <div class="process-info">
                <div id="current-process-id">Process 0</div>
                <div class="progress-bar">
                    <div id="process-progress" class="progress-fill"></div>
                </div>
                <div class="time-info">Time: <span id="current-time">0.0</span> / ${endTime}</div>
            </div>
        </div>
    `;
    
    // Create the Gantt chart visualization
    const ganttVisualization = document.createElement('div');
    ganttVisualization.className = 'gantt-visualization';
    
    // Add process bars to the timeline
    timeline.forEach((item) => {
        const duration = item.endTime - item.startTime;
        if (duration <= 0) return;
        
        const bar = document.createElement('div');
        const colorIndex = item.processId === 'Idle' ? -1 : processIds.indexOf(item.processId);
        
        bar.className = `gantt-bar ${item.processId === 'Idle' ? 'idle-time' : `process-color-${colorIndex % 10}`}`;
        bar.style.left = `${(item.startTime / endTime) * 100}%`;
        bar.style.width = `${(duration / endTime) * 100}%`;
        
        // Add process label
        const label = document.createElement('span');
        label.className = 'process-label';
        label.textContent = item.processId;
        bar.appendChild(label);
        
        // Store data for animation
        bar.dataset.processId = item.processId;
        bar.dataset.startTime = item.startTime;
        bar.dataset.endTime = item.endTime;
        
        ganttVisualization.appendChild(bar);
    });
    
    // Create time scale
    const timeScale = document.createElement('div');
    timeScale.className = 'time-scale';
    
    // Add time markers
    const markerCount = Math.min(10, endTime);
    for (let i = 0; i <= markerCount; i++) {
        const time = Math.round((i / markerCount) * endTime);
        const marker = document.createElement('div');
        marker.className = 'time-marker';
        marker.textContent = time;
        marker.style.left = `${(time / endTime) * 100}%`;
        timeScale.appendChild(marker);
    }
    
    // Add playback controls
    const playbackControls = document.createElement('div');
    playbackControls.className = 'playback-controls';
    playbackControls.innerHTML = `
        <button id="play-pause-btn" class="control-btn">
            <svg viewBox="0 0 24 24" class="control-icon">
                <polygon points="5,3 19,12 5,21" class="play-icon"></polygon>
                <g class="pause-icon" style="display:none">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </g>
            </svg>
        </button>
        <div class="timeline-control">
            <div class="timeline-track">
                <div id="timeline-progress" class="timeline-progress"></div>
            </div>
        </div>
        <div class="speed-control">
            <span>Speed: </span>
            <select id="speed-selector">
                <option value="0.5">0.5x</option>
                <option value="1" selected>1x</option>
                <option value="2">2x</option>
                <option value="4">4x</option>
            </select>
        </div>
    `;
    
    // Assemble the components
    ganttContainer.appendChild(executionStatus);
    ganttContainer.appendChild(ganttVisualization);
    ganttContainer.appendChild(timeScale);
    ganttContainer.appendChild(playbackControls);
    
    // Add to the main container
    container.appendChild(ganttContainer);
    
    // Initialize the animation
    initializeAnimation(timeline, endTime, processIds);
}

/**
 * Normalizes the Gantt data to a consistent format
 */
function normalizeGanttData(ganttData) {
    if (Array.isArray(ganttData) && ganttData[0] && ganttData[0].processId) {
        // Ensure process IDs are in the format "P1", "P2", etc.
        return ganttData.map(item => {
            // If processId is a number (like 0, 1, 2), convert it to "P1", "P2", etc.
            if (!isNaN(item.processId) && typeof item.processId !== 'string') {
                return {
                    ...item,
                    processId: `P${parseInt(item.processId) + 1}`
                };
            }
            // If processId is already in the right format, keep it as is
            return item;
        });
    }
    
    const convertedData = [];
    for (const key in ganttData) {
        if (ganttData.hasOwnProperty(key)) {
            const item = ganttData[key];
            // Format the process ID correctly
            let processId = key;
            if (!isNaN(key) && typeof key !== 'string') {
                processId = `P${parseInt(key) + 1}`;
            } else if (key.match(/^\d+$/)) {
                processId = `P${parseInt(key) + 1}`;
            }
            
            convertedData.push({
                processId: processId,
                startTime: item.start || 0,
                endTime: item.end || item.completion || 0
            });
        }
    }
    return convertedData.sort((a, b) => a.startTime - b.startTime);
}

/**
 * Creates a timeline with idle periods
 */
function createTimeline(processData) {
    const timeline = [];
    let currentTime = 0;
    
    processData.forEach(item => {
        if (item.startTime > currentTime) {
            // Add idle time
            timeline.push({
                processId: 'Idle',
                startTime: currentTime,
                endTime: item.startTime
            });
        }
        
        timeline.push({
            processId: item.processId,
            startTime: item.startTime,
            endTime: item.endTime
        });
        
        currentTime = item.endTime;
    });
    
    return timeline;
}

/**
 * Initializes the animation for the Gantt chart
 */
function initializeAnimation(timeline, totalTime, processIds) {
    // Animation state
    let animationState = {
        currentTime: 0,
        isPlaying: false,
        speed: 1,
        animationId: null
    };
    
    // Get UI elements
    const currentProcessId = document.getElementById('current-process-id');
    const processProgress = document.getElementById('process-progress');
    const currentTimeDisplay = document.getElementById('current-time');
    const timelineProgress = document.getElementById('timeline-progress');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const speedSelector = document.getElementById('speed-selector');
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    // Get all process bars
    const processBars = document.querySelectorAll('.gantt-bar');
    
    // Function to find the current process at a given time
    const getCurrentProcess = (time) => {
        for (const item of timeline) {
            if (time >= item.startTime && time < item.endTime) {
                return item;
            }
        }
        return null;
    };
    
    // Function to update the UI based on current time
    const updateUI = (time) => {
        // Update time display
        currentTimeDisplay.textContent = time.toFixed(1);
        
        // Update timeline progress
        const progress = (time / totalTime) * 100;
        timelineProgress.style.width = `${progress}%`;
        
        // Find current process
        const currentItem = getCurrentProcess(time);
        
        if (currentItem) {
            // Update process display with proper process ID format
            if (currentItem.processId !== 'Idle') {
                // Display process ID as "P1" instead of "Process 0"
                currentProcessId.textContent = `Executing: ${currentItem.processId}`;
                currentProcessId.className = '';
                const colorIndex = processIds.indexOf(currentItem.processId) % 10;
                currentProcessId.classList.add(`process-color-${colorIndex}`);
                document.querySelector('.process-icon-circle').classList.add('active');
                document.querySelector('.process-icon-hand').classList.add('active');
            } else {
                currentProcessId.textContent = `CPU Idle`;
                currentProcessId.className = 'idle-time';
                document.querySelector('.process-icon-circle').classList.remove('active');
                document.querySelector('.process-icon-hand').classList.remove('active');
            }
            
            // Update progress within this process
            const processPercentage = ((time - currentItem.startTime) / (currentItem.endTime - currentItem.startTime)) * 100;
            processProgress.style.width = `${processPercentage}%`;
            
            // Highlight current process bar and add pulsing effect
            processBars.forEach(bar => {
                const barStartTime = parseFloat(bar.dataset.startTime);
                const barEndTime = parseFloat(bar.dataset.endTime);
                
                if (time >= barStartTime && time < barEndTime) {
                    bar.classList.add('active', 'pulse-animation');
                    // Add a "NOW" indicator to the active process
                    if (!bar.querySelector('.now-indicator')) {
                        const nowIndicator = document.createElement('div');
                        nowIndicator.className = 'now-indicator';
                        nowIndicator.textContent = 'EXECUTING';
                        bar.appendChild(nowIndicator);
                    }
                } else {
                    bar.classList.remove('active', 'pulse-animation');
                    const nowIndicator = bar.querySelector('.now-indicator');
                    if (nowIndicator) {
                        bar.removeChild(nowIndicator);
                    }
                }
            });
        } else if (time >= totalTime) {
            // Animation complete
            currentProcessId.textContent = 'Execution Complete';
            currentProcessId.className = 'complete';
            processProgress.style.width = '100%';
            document.querySelector('.process-icon-circle').classList.add('complete');
            document.querySelector('.process-icon-hand').classList.add('complete');
            
            // Stop the animation
            stopAnimation();
        }
    };
    
    // Start animation
    const startAnimation = () => {
        if (animationState.currentTime >= totalTime) {
            animationState.currentTime = 0;
        }
        
        animationState.isPlaying = true;
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        
        // Clear any existing animation
        if (animationState.animationId) {
            cancelAnimationFrame(animationState.animationId);
        }
        
        // Animation frame function
        const animate = (timestamp) => {
            if (!animationState.lastTimestamp) {
                animationState.lastTimestamp = timestamp;
            }
            
            const elapsed = (timestamp - animationState.lastTimestamp) * animationState.speed / 1000;
            animationState.lastTimestamp = timestamp;
            
            if (animationState.isPlaying) {
                animationState.currentTime += elapsed;
                
                // Cap at total time
                if (animationState.currentTime > totalTime) {
                    animationState.currentTime = totalTime;
                }
                
                updateUI(animationState.currentTime);
                
                // Continue animation if not at the end
                if (animationState.currentTime < totalTime) {
                    animationState.animationId = requestAnimationFrame(animate);
                } else {
                    stopAnimation();
                }
            }
        };
        
        animationState.lastTimestamp = null;
        animationState.animationId = requestAnimationFrame(animate);
    };
    
    // Stop animation
    const stopAnimation = () => {
        animationState.isPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        
        if (animationState.animationId) {
            cancelAnimationFrame(animationState.animationId);
            animationState.animationId = null;
        }
    };
    
    // Event listeners
    playPauseBtn.addEventListener('click', () => {
        if (animationState.isPlaying) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });
    
    speedSelector.addEventListener('change', () => {
        animationState.speed = parseFloat(speedSelector.value);
    });
    
    // Timeline track click for seeking
    document.querySelector('.timeline-track').addEventListener('click', (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        animationState.currentTime = clickPosition * totalTime;
        updateUI(animationState.currentTime);
    });
    
    // Initialize UI
    updateUI(0);
}