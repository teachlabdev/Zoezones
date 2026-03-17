// The Learning Brain - Tracks which strategies work best for the class

class ZoneBrain {
    constructor() {
        this.loadData();
    }

    // Load existing data from localStorage
    loadData() {
        try {
            const saved = localStorage.getItem('zoneBrainData');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validate that parsed data has the expected structure
                if (parsed && parsed.strategies && typeof parsed.totalCheckIns === 'number') {
                    this.data = parsed;
                    // Ensure any new strategies added since last save are initialized
                    this._ensureAllStrategiesTracked();
                } else {
                    // Data exists but is malformed — reinitialize silently
                    console.warn('Zoe Zones: Stored data was invalid. Starting fresh.');
                    this._initializeData();
                }
            } else {
                this._initializeData();
            }
        } catch (e) {
            // JSON.parse failed or localStorage unavailable — fail gracefully
            console.warn('Zoe Zones: Could not load stored data. Starting fresh.', e);
            this._initializeData();
        }
    }

    // Set up a clean data structure
    _initializeData() {
        this.data = {
            strategies: {},
            totalCheckIns: 0,
            lastUpdated: new Date().toISOString()
        };
        Object.keys(STRATEGIES).forEach(zone => {
            STRATEGIES[zone].forEach(strategy => {
                this.data.strategies[strategy.id] = {
                    shown: 0,
                    selected: 0,
                    skipped: 0,
                    score: 0
                };
            });
        });
        this.saveData();
    }

    // Make sure any strategies not yet in stored data get initialized
    // (handles cases where strategies.js is updated after data was saved)
    _ensureAllStrategiesTracked() {
        let updated = false;
        Object.keys(STRATEGIES).forEach(zone => {
            STRATEGIES[zone].forEach(strategy => {
                if (!this.data.strategies[strategy.id]) {
                    this.data.strategies[strategy.id] = {
                        shown: 0,
                        selected: 0,
                        skipped: 0,
                        score: 0
                    };
                    updated = true;
                }
            });
        });
        if (updated) this.saveData();
    }

    // Save data to localStorage
    saveData() {
        try {
            this.data.lastUpdated = new Date().toISOString();
            localStorage.setItem('zoneBrainData', JSON.stringify(this.data));
        } catch (e) {
            // localStorage full or unavailable — app still works, just won't persist
            console.warn('Zoe Zones: Could not save data.', e);
        }
    }

    // Get a strategy for a specific zone using weighted random selection
    getStrategyForZone(zone, excludeIds = []) {
        const zoneStrategies = STRATEGIES[zone].filter(s => !excludeIds.includes(s.id));

        if (zoneStrategies.length === 0) {
            // All strategies exhausted — start over
            return this.getStrategyForZone(zone, []);
        }

        // Calculate weights based on success scores
        const weights = zoneStrategies.map(strategy => {
            const stats = this.data.strategies[strategy.id];

            let weight = 1;

            if (stats && stats.shown > 0) {
                const totalInteractions = stats.selected + stats.skipped;
                if (totalInteractions > 0) {
                    const successRate = stats.selected / totalInteractions;
                    // Scale: 0.2 (rarely helpful) to 3.0 (very helpful)
                    weight = 0.2 + (successRate * 2.8);
                }
            }

            // Boost newer strategies to ensure they get tried
            if (!stats || stats.shown < 3) {
                weight *= 1.5;
            }

            return weight;
        });

        // Weighted random selection
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < zoneStrategies.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return zoneStrategies[i];
            }
        }

        // Fallback
        return zoneStrategies[0];
    }

    // Record that a strategy was shown
    recordShown(strategyId) {
        if (this.data.strategies[strategyId]) {
            this.data.strategies[strategyId].shown++;
            this.saveData();
        }
    }

    // Record that student selected "I'll try this"
    recordSelected(strategyId) {
        if (this.data.strategies[strategyId]) {
            this.data.strategies[strategyId].selected++;
            this.updateScore(strategyId);
            this.saveData();
        }
    }

    // Record that student asked for a different strategy
    recordSkipped(strategyId) {
        if (this.data.strategies[strategyId]) {
            this.data.strategies[strategyId].skipped++;
            this.updateScore(strategyId);
            this.saveData();
        }
    }

    // Update effectiveness score
    updateScore(strategyId) {
        const stats = this.data.strategies[strategyId];
        if (!stats) return;
        const totalInteractions = stats.selected + stats.skipped;
        if (totalInteractions > 0) {
            const successRate = stats.selected / totalInteractions;
            const confidence = Math.min(totalInteractions / 10, 1);
            stats.score = successRate * confidence;
        }
    }

    // Record a completed check-in
    recordCheckIn() {
        this.data.totalCheckIns++;
        this.saveData();
    }

    // Get statistics
    getStats() {
        return {
            totalCheckIns: this.data.totalCheckIns,
            strategyStats: this.data.strategies,
            lastUpdated: this.data.lastUpdated
        };
    }

    // Reset all data
    reset() {
        try {
            localStorage.removeItem('zoneBrainData');
        } catch (e) {
            console.warn('Zoe Zones: Could not clear stored data.', e);
        }
        this._initializeData();
    }

    // Seed realistic demo data so the adaptive engine looks intelligent during presentations
    // Call from browser console: seedDemoData()
    seedDemo() {
        this._initializeData();

        const seed = {
            // Yellow zone — wall push and box breathing are clear favorites
            'yellow-wall-push':      { shown: 18, selected: 15, skipped: 3 },
            'yellow-box-breathing':  { shown: 16, selected: 13, skipped: 3 },
            'yellow-belly-breathing':{ shown: 14, selected: 9,  skipped: 5 },
            'yellow-squeeze-release':{ shown: 10, selected: 6,  skipped: 4 },
            'yellow-count-ten':      { shown: 8,  selected: 3,  skipped: 5 },
            'yellow-guided-doodle':  { shown: 6,  selected: 2,  skipped: 4 },

            // Red zone — wall push is overwhelmingly preferred
            'red-wall-push':         { shown: 20, selected: 17, skipped: 3 },
            'red-stomp-out':         { shown: 12, selected: 8,  skipped: 4 },
            'red-box-breathing':     { shown: 10, selected: 7,  skipped: 3 },
            'red-take-space':        { shown: 8,  selected: 4,  skipped: 4 },
            'red-talk-someone':      { shown: 6,  selected: 2,  skipped: 4 },

            // Blue zone — movement strategies outperform thinking strategies
            'blue-wall-push':        { shown: 12, selected: 9,  skipped: 3 },
            'blue-chair-pushup':     { shown: 10, selected: 8,  skipped: 2 },
            'blue-movement-break':   { shown: 10, selected: 7,  skipped: 3 },
            'blue-stretch-wake':     { shown: 8,  selected: 5,  skipped: 3 },
            'blue-think-good':       { shown: 8,  selected: 3,  skipped: 5 },

            // Green zone — light usage, students mostly just need a nudge
            'green-stay-ready':      { shown: 6,  selected: 5,  skipped: 1 },
            'green-help-friend':     { shown: 5,  selected: 4,  skipped: 1 },
            'green-set-goal':        { shown: 4,  selected: 3,  skipped: 1 },
        };

        Object.keys(seed).forEach(id => {
            if (this.data.strategies[id]) {
                this.data.strategies[id] = { ...seed[id], score: 0 };
                this.updateScore(id);
            }
        });

        this.data.totalCheckIns = 87;
        this.saveData();
        console.log('✅ Zoe Zones demo data seeded. 87 check-ins loaded. The brain is now showing class preferences.');
    }
}

// Initialize the brain
const brain = new ZoneBrain();

// ── Teacher Console Commands ──────────────────────────────────────────────────

window.showStats = function() {
    const stats = brain.getStats();
    console.log('=== Zoe Zones Statistics ===');
    console.log(`Total Check-Ins: ${stats.totalCheckIns}`);
    console.log(`Last Updated: ${stats.lastUpdated}`);
    console.log('\nStrategy Performance:');
    Object.keys(STRATEGIES).forEach(zone => {
        console.log(`\n${zone.toUpperCase()} ZONE:`);
        STRATEGIES[zone].forEach(strategy => {
            const s = stats.strategyStats[strategy.id];
            if (!s) return;
            const total = s.selected + s.skipped;
            const rate = total > 0 ? Math.round((s.selected / total) * 100) : 0;
            console.log(`  ${strategy.title}: shown ${s.shown} | selected ${s.selected} | skipped ${s.skipped} | success ${rate}%`);
        });
    });
};

window.resetBrain = function() {
    if (confirm('This will erase all learning data. Are you sure?')) {
        brain.reset();
        console.log('Brain data reset successfully!');
        location.reload();
    }
};

window.seedDemoData = function() {
    if (confirm('This will replace current data with demo data. Continue?')) {
        brain.seedDemo();
    }
};

console.log('Zoe Zones loaded! Commands: showStats() | resetBrain() | seedDemoData()');
