// brain.js — Per-Student Learning Engine
// Each student (1–27) has their own strategy weight profile in localStorage.
// Class-level stats are computed by aggregating across all students.

const STUDENT_COUNT = 27;

class ZoneBrain {
    constructor() {
        this.loadData();
    }

    // ── Data structure ────────────────────────────────────────────────────
    // {
    //   students: {
    //     "1": { totalCheckIns: 0, strategies: { [id]: { shown, selected, skipped, score } } },
    //     "2": { ... },
    //     ...
    //   },
    //   lastUpdated: ISO string
    // }

    _freshStudentRecord() {
        const record = { totalCheckIns: 0, strategies: {} };
        Object.keys(STRATEGIES).forEach(zone => {
            STRATEGIES[zone].forEach(s => {
                record.strategies[s.id] = { shown: 0, selected: 0, skipped: 0, score: 0 };
            });
        });
        return record;
    }

    _initializeData() {
        this.data = { students: {}, lastUpdated: new Date().toISOString() };
        for (let i = 1; i <= STUDENT_COUNT; i++) {
            this.data.students[String(i)] = this._freshStudentRecord();
        }
        this.saveData();
    }

    loadData() {
        try {
            const saved = localStorage.getItem('zoeZonesData_v2');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.students) {
                    this.data = parsed;
                    this._ensureAllStudents();
                    this._ensureAllStrategies();
                } else {
                    this._initializeData();
                }
            } else {
                this._initializeData();
            }
        } catch (e) {
            console.warn('Zoe Zones: Could not load data, starting fresh.', e);
            this._initializeData();
        }
    }

    saveData() {
        try {
            this.data.lastUpdated = new Date().toISOString();
            localStorage.setItem('zoeZonesData_v2', JSON.stringify(this.data));
        } catch (e) {
            console.warn('Zoe Zones: Could not save data.', e);
        }
    }

    _ensureAllStudents() {
        for (let i = 1; i <= STUDENT_COUNT; i++) {
            if (!this.data.students[String(i)]) {
                this.data.students[String(i)] = this._freshStudentRecord();
            }
        }
    }

    _ensureAllStrategies() {
        Object.keys(this.data.students).forEach(num => {
            const student = this.data.students[num];
            Object.keys(STRATEGIES).forEach(zone => {
                STRATEGIES[zone].forEach(s => {
                    if (!student.strategies[s.id]) {
                        student.strategies[s.id] = { shown: 0, selected: 0, skipped: 0, score: 0 };
                    }
                });
            });
        });
        this.saveData();
    }

    // ── Student context ───────────────────────────────────────────────────

    _student(studentNum) {
        const key = String(studentNum);
        if (!this.data.students[key]) {
            this.data.students[key] = this._freshStudentRecord();
        }
        return this.data.students[key];
    }

    // ── Weight calculation (shared logic) ─────────────────────────────────

    _calcWeight(stat) {
        let weight = 1;
        const interactions = stat.selected + stat.skipped;
        if (stat.shown > 0 && interactions > 0) {
            const successRate = stat.selected / interactions;
            weight = 0.2 + (successRate * 2.8);
        }
        if (stat.shown < 3) weight *= 1.5;
        return weight;
    }

    // ── Strategy selection ────────────────────────────────────────────────

    getStrategyForZone(zone, excludeIds = [], studentNum) {
        const zoneStrategies = STRATEGIES[zone].filter(s => !excludeIds.includes(s.id));

        if (zoneStrategies.length === 0) {
            return this.getStrategyForZone(zone, [], studentNum);
        }

        const studentData = this._student(studentNum);

        const weights = zoneStrategies.map(s => {
            const stat = studentData.strategies[s.id] ||
                         { shown: 0, selected: 0, skipped: 0, score: 0 };
            return this._calcWeight(stat);
        });

        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < zoneStrategies.length; i++) {
            random -= weights[i];
            if (random <= 0) return zoneStrategies[i];
        }

        return zoneStrategies[0];
    }

    // ── Recording ─────────────────────────────────────────────────────────

    recordShown(strategyId, studentNum) {
        const s = this._student(studentNum).strategies[strategyId];
        if (s) { s.shown++; this.saveData(); }
    }

    recordSelected(strategyId, studentNum) {
        const s = this._student(studentNum).strategies[strategyId];
        if (s) {
            s.selected++;
            this._updateScore(s);
            this.saveData();
        }
    }

    recordSkipped(strategyId, studentNum) {
        const s = this._student(studentNum).strategies[strategyId];
        if (s) {
            s.skipped++;
            this._updateScore(s);
            this.saveData();
        }
    }

    recordCheckIn(studentNum) {
        this._student(studentNum).totalCheckIns++;
        this.saveData();
    }

    _updateScore(stat) {
        const total = stat.selected + stat.skipped;
        if (total > 0) {
            const successRate = stat.selected / total;
            const confidence = Math.min(total / 10, 1);
            stat.score = successRate * confidence;
        }
    }

    // ── Stats ─────────────────────────────────────────────────────────────

    // Per-student stats
    getStudentStats(studentNum) {
        const student = this._student(studentNum);
        return {
            studentNum,
            totalCheckIns: student.totalCheckIns,
            strategies: student.strategies
        };
    }

    // Class-wide aggregate
    getClassStats() {
        const aggregate = { totalCheckIns: 0, strategies: {} };

        // Initialize aggregate strategy entries
        Object.keys(STRATEGIES).forEach(zone => {
            STRATEGIES[zone].forEach(s => {
                aggregate.strategies[s.id] = { shown: 0, selected: 0, skipped: 0, score: 0 };
            });
        });

        // Sum across all students
        Object.keys(this.data.students).forEach(num => {
            const student = this.data.students[num];
            aggregate.totalCheckIns += student.totalCheckIns;
            Object.keys(student.strategies).forEach(id => {
                if (aggregate.strategies[id]) {
                    aggregate.strategies[id].shown    += student.strategies[id].shown;
                    aggregate.strategies[id].selected += student.strategies[id].selected;
                    aggregate.strategies[id].skipped  += student.strategies[id].skipped;
                }
            });
        });

        // Recalculate scores on aggregate
        Object.keys(aggregate.strategies).forEach(id => {
            const s = aggregate.strategies[id];
            const total = s.selected + s.skipped;
            if (total > 0) {
                s.score = (s.selected / total) * Math.min(total / 10, 1);
            }
        });

        return aggregate;
    }

    // How many students have checked in at least once
    getActiveStudentCount() {
        return Object.values(this.data.students)
            .filter(s => s.totalCheckIns > 0).length;
    }

    // ── Reset ─────────────────────────────────────────────────────────────

    reset() {
        try { localStorage.removeItem('zoeZonesData_v2'); } catch (e) {}
        this._initializeData();
    }

    resetStudent(studentNum) {
        this.data.students[String(studentNum)] = this._freshStudentRecord();
        this.saveData();
    }

    // ── Demo seed ─────────────────────────────────────────────────────────

    seedDemo() {
        this._initializeData();

        // Seed varied profiles across students — each student has slightly
        // different preferences, reflecting real classroom diversity
        const profiles = {
            // High proprioceptive preference (wall push dominant)
            proprioceptive: [1,3,5,8,11,14,17,20,23],
            // Breathing preference (box/belly breathing dominant)
            breathing:      [2,6,9,12,15,18,21,24,27],
            // Mixed / still learning
            mixed:          [4,7,10,13,16,19,22,25,26]
        };

        Object.keys(this.data.students).forEach(num => {
            const n = parseInt(num);
            let profile = 'mixed';
            if (profiles.proprioceptive.includes(n)) profile = 'proprioceptive';
            if (profiles.breathing.includes(n))      profile = 'breathing';

            const student = this.data.students[num];
            student.totalCheckIns = 2 + Math.floor(Math.random() * 6);

            const seed = (id, selected, skipped) => {
                if (student.strategies[id]) {
                    student.strategies[id].shown    = selected + skipped;
                    student.strategies[id].selected = selected;
                    student.strategies[id].skipped  = skipped;
                    this._updateScore(student.strategies[id]);
                }
            };

            if (profile === 'proprioceptive') {
                seed('yellow-wall-push', 4, 0);
                seed('red-wall-push',    3, 0);
                seed('blue-wall-push',   2, 1);
                seed('yellow-box-breathing', 1, 2);
                seed('red-box-breathing',    1, 1);
            } else if (profile === 'breathing') {
                seed('yellow-box-breathing',  4, 0);
                seed('yellow-belly-breathing',3, 1);
                seed('red-box-breathing',     3, 0);
                seed('yellow-wall-push',      1, 2);
                seed('red-wall-push',         1, 1);
            } else {
                seed('yellow-wall-push',      2, 1);
                seed('yellow-box-breathing',  2, 1);
                seed('red-wall-push',         1, 1);
                seed('yellow-count-ten',      1, 2);
            }
        });

        this.saveData();
        console.log('✅ Demo data seeded across 27 students with varied learning profiles.');
    }
}

// Initialize
const brain = new ZoneBrain();

// ── Teacher console commands ──────────────────────────────────────────────────

window.showStats = function(studentNum) {
    if (studentNum) {
        const s = brain.getStudentStats(studentNum);
        console.log(`=== Student ${studentNum} — ${s.totalCheckIns} check-ins ===`);
        Object.keys(STRATEGIES).forEach(zone => {
            console.log(`\n${zone.toUpperCase()}:`);
            STRATEGIES[zone].forEach(strat => {
                const d = s.strategies[strat.id];
                if (!d) return;
                const total = d.selected + d.skipped;
                const rate = total > 0 ? Math.round((d.selected / total) * 100) : '–';
                console.log(`  ${strat.title}: shown ${d.shown} | selected ${d.selected} | skipped ${d.skipped} | success ${rate}%`);
            });
        });
    } else {
        const c = brain.getClassStats();
        console.log(`=== Class Stats — ${c.totalCheckIns} total check-ins | ${brain.getActiveStudentCount()} active students ===`);
        Object.keys(STRATEGIES).forEach(zone => {
            console.log(`\n${zone.toUpperCase()}:`);
            STRATEGIES[zone].forEach(strat => {
                const d = c.strategies[strat.id];
                if (!d) return;
                const total = d.selected + d.skipped;
                const rate = total > 0 ? Math.round((d.selected / total) * 100) : '–';
                console.log(`  ${strat.title}: shown ${d.shown} | selected ${d.selected} | skipped ${d.skipped} | success ${rate}%`);
            });
        });
    }
};

window.resetBrain = function() {
    if (confirm('Erase ALL student data and start fresh?')) {
        brain.reset();
        console.log('Reset complete.');
        location.reload();
    }
};

window.seedDemoData = function() {
    if (confirm('Replace all data with demo data for 27 students?')) {
        brain.seedDemo();
    }
};

console.log('Zoe Zones loaded. Commands: showStats() | showStats(5) | resetBrain() | seedDemoData()');
