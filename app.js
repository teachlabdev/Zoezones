// Main Application Logic

let currentZone = null;
let currentStrategy = null;
let shownStrategyIds = []; // Track strategies shown in this session

// DOM Elements
const zoneSelection = document.getElementById('zone-selection');
const strategyDisplay = document.getElementById('strategy-display');
const successMessage = document.getElementById('success-message');

const strategyTitle = document.getElementById('strategy-title');
const strategyDescription = document.getElementById('strategy-description');
const strategySteps = document.getElementById('strategy-steps');

const tryStrategyBtn = document.getElementById('try-strategy');
const differentStrategyBtn = document.getElementById('different-strategy');
const finishCheckInBtn = document.getElementById('finish-checkin');
const newCheckInBtn = document.getElementById('new-checkin');

// Zone Button Click Handlers
document.querySelectorAll('.zone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentZone = btn.dataset.zone;
        shownStrategyIds = []; // Reset for new zone selection
        showStrategy();
    });
});

// Show a strategy for the current zone
function showStrategy() {
    // Get strategy from brain (excluding already shown ones)
    currentStrategy = brain.getStrategyForZone(currentZone, shownStrategyIds);
    
    // Track that we showed this strategy
    brain.recordShown(currentStrategy.id);
    shownStrategyIds.push(currentStrategy.id);
    
    // Display the strategy
    strategyTitle.textContent = currentStrategy.title;
    strategyDescription.textContent = currentStrategy.description;
    
    // Build steps list
    strategySteps.innerHTML = '';
    currentStrategy.steps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'strategy-step';
        stepDiv.innerHTML = `<strong>Step ${index + 1}:</strong> ${step}`;
        strategySteps.appendChild(stepDiv);
    });
    
    // Show strategy display, hide zone selection
    zoneSelection.classList.add('hidden');
    strategyDisplay.classList.remove('hidden');
    
    // Color the finish button based on zone
    finishCheckInBtn.style.background = getZoneColor(currentZone);
}

// "I'll try this" button
tryStrategyBtn.addEventListener('click', () => {
    brain.recordSelected(currentStrategy.id);
    finishCheckIn();
});

// "Show me something else" button
differentStrategyBtn.addEventListener('click', () => {
    brain.recordSkipped(currentStrategy.id);
    
    // Check if we've shown all strategies for this zone
    const zoneStrategyCount = STRATEGIES[currentZone].length;
    if (shownStrategyIds.length >= zoneStrategyCount) {
        // All strategies shown, just finish
        finishCheckIn();
    } else {
        // Show another strategy
        showStrategy();
    }
});

// "All done" button
finishCheckInBtn.addEventListener('click', () => {
    // Don't record as selected if they just want to finish
    finishCheckIn();
});

// Finish check-in and show success
function finishCheckIn() {
    brain.recordCheckIn();
    
    strategyDisplay.classList.add('hidden');
    successMessage.classList.remove('hidden');
}

// "Start New Check-In" button
newCheckInBtn.addEventListener('click', () => {
    resetToStart();
});

// Reset to initial state
function resetToStart() {
    currentZone = null;
    currentStrategy = null;
    shownStrategyIds = [];
    
    successMessage.classList.add('hidden');
    strategyDisplay.classList.add('hidden');
    zoneSelection.classList.remove('hidden');
}

// Helper function to get zone color
function getZoneColor(zone) {
    const colors = {
        'blue': '#5B9BD5',
        'green': '#70AD47',
        'yellow': '#FFC000',
        'red': '#E74C3C'
    };
    return colors[zone] || '#70AD47';
}

// Optional: Console command for teacher to view stats
window.showStats = function() {
    const stats = brain.getStats();
    console.log('=== Zoe Zones Statistics ===');
    console.log(`Total Check-Ins: ${stats.totalCheckIns}`);
    console.log('\nStrategy Performance:');
    
    Object.keys(STRATEGIES).forEach(zone => {
        console.log(`\n${zone.toUpperCase()} ZONE:`);
        STRATEGIES[zone].forEach(strategy => {
            const s = stats.strategyStats[strategy.id];
            console.log(`  ${strategy.title}:`);
            console.log(`    Shown: ${s.shown} | Selected: ${s.selected} | Skipped: ${s.skipped}`);
            console.log(`    Success Rate: ${s.shown > 0 ? Math.round((s.selected / (s.selected + s.skipped)) * 100) : 0}%`);
        });
    });
    
    console.log(`\nLast Updated: ${stats.lastUpdated}`);
};

// Optional: Console command for teacher to reset data
window.resetBrain = function() {
    if (confirm('This will erase all learning data. Are you sure?')) {
        brain.reset();
        console.log('Brain data reset successfully!');
        resetToStart();
    }
};

console.log('Zoe Zones loaded! Teacher commands: showStats() or resetBrain()');
