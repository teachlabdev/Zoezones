// present.js — Presentation Mode Controller
// Handles present toggle, live brain panel, and class/student view switching.

(function () {

    const presentBtn     = document.getElementById('presentBtn');
    const layout         = document.getElementById('layout');
    const brainZones     = document.getElementById('brainZones');
    const brainCountEl   = document.getElementById('brainCount');
    const brainLogEl     = document.getElementById('brainLogText');
    const toggleClass    = document.getElementById('toggleClass');
    const toggleStudent  = document.getElementById('toggleStudent');
    const studentSelect  = document.getElementById('brainStudentSelect');

    let presentMode  = false;
    let currentView  = 'class';
    let viewStudent  = null;

    const ZONE_META = {
        blue:   { label: 'Blue Zone',   color: '#4a8fd4' },
        green:  { label: 'Green Zone',  color: '#5ea84a' },
        yellow: { label: 'Yellow Zone', color: '#d4a017' },
        red:    { label: 'Red Zone',    color: '#d44a3a' },
    };

    // Populate student dropdown
    for (let i = 1; i <= 27; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Student ${i}`;
        studentSelect.appendChild(opt);
    }

    // Present toggle
    presentBtn.addEventListener('click', () => {
        presentMode = !presentMode;
        layout.classList.toggle('present-mode', presentMode);
        presentBtn.classList.toggle('active', presentMode);
        presentBtn.lastChild.textContent = presentMode ? ' Exit Present' : ' Present';
        if (presentMode) renderBrain();
    });

    // Class / Student toggle
    toggleClass.addEventListener('click', () => {
        currentView = 'class';
        toggleClass.classList.add('active');
        toggleStudent.classList.remove('active');
        studentSelect.classList.add('hidden');
        renderBrain();
    });

    toggleStudent.addEventListener('click', () => {
        currentView = 'student';
        toggleStudent.classList.add('active');
        toggleClass.classList.remove('active');
        studentSelect.classList.remove('hidden');
        if (viewStudent) renderBrain();
    });

    studentSelect.addEventListener('change', () => {
        viewStudent = parseInt(studentSelect.value) || null;
        if (viewStudent) renderBrain();
    });

    // Render brain panel
    function renderBrain() {
        if (!presentMode) return;

        let stats;
        if (currentView === 'student' && viewStudent) {
            stats = brain.getStudentStats(viewStudent);
        } else {
            stats = brain.getClassStats();
        }

        brainCountEl.textContent = stats.totalCheckIns;
        brainZones.innerHTML = '';

        Object.keys(ZONE_META).forEach(zone => {
            const meta = ZONE_META[zone];
            const strategies = STRATEGIES[zone];

            const weighted = strategies.map(s => {
                const st = stats.strategies[s.id] || { shown: 0, selected: 0, skipped: 0 };
                let w = 1;
                const interactions = st.selected + st.skipped;
                if (st.shown > 0 && interactions > 0) {
                    w = 0.2 + (st.selected / interactions) * 2.8;
                }
                if (st.shown < 3) w *= 1.5;
                return { s, w: parseFloat(w.toFixed(2)), st };
            }).sort((a, b) => b.w - a.w);

            const maxW = Math.max(...weighted.map(x => x.w), 0.01);

            const block = document.createElement('div');
            block.className = 'brain-zone-block';
            block.innerHTML = `
                <div class="brain-zone-head">
                    <span class="brain-zone-pip" style="background:${meta.color}"></span>
                    <span class="brain-zone-label">${meta.label}</span>
                </div>
            `;

            weighted.forEach(({ s, w }) => {
                const pct = Math.round((w / maxW) * 100);
                const row = document.createElement('div');
                row.className = 'brain-row';
                row.id = `row-${s.id}`;
                row.innerHTML = `
                    <span class="brain-s-name" title="${s.title}">${s.title}</span>
                    <div class="brain-bar-track">
                        <div class="brain-bar-fill" id="bar-${s.id}"
                             style="width:${pct}%;background:${meta.color};opacity:${0.4+(pct/100)*0.6}"></div>
                    </div>
                    <span class="brain-weight" id="wt-${s.id}">${w.toFixed(1)}</span>
                `;
                block.appendChild(row);
            });

            brainZones.appendChild(block);
        });
    }

    function log(msg) {
        if (!presentMode) return;
        brainLogEl.textContent = msg;
    }

    function strategyName(id) {
        for (const z of Object.keys(STRATEGIES)) {
            const m = STRATEGIES[z].find(s => s.id === id);
            if (m) return m.title;
        }
        return id;
    }

    // Listen to app events
    document.addEventListener('zoe:studentSelected', e => {
        const { studentNum } = e.detail;
        log(`★ Student ${studentNum} starting check-in`);
        if (currentView === 'student') {
            viewStudent = studentNum;
            studentSelect.value = studentNum;
            renderBrain();
        }
    });

    document.addEventListener('zoe:zoneSelected', e => {
        const { zone, studentNum } = e.detail;
        log(`→ Student ${studentNum} entered ${ZONE_META[zone]?.label}`);
    });

    document.addEventListener('zoe:strategyShown', e => {
        const { strategyId, studentNum } = e.detail;
        log(`→ Showing "${strategyName(strategyId)}" for Student ${studentNum}`);
        setTimeout(renderBrain, 60);
    });

    document.addEventListener('zoe:checkInComplete', e => {
        const { studentNum } = e.detail;
        log(`✦ Student ${studentNum} check-in complete`);
        renderBrain();
    });

    // Patch brain for live updates
    const _recordSelected = brain.recordSelected.bind(brain);
    brain.recordSelected = function (id, studentNum) {
        _recordSelected(id, studentNum);
        log(`✓ "${strategyName(id)}" selected by Student ${studentNum} — weight rising`);
        setTimeout(renderBrain, 60);
    };

    const _recordSkipped = brain.recordSkipped.bind(brain);
    brain.recordSkipped = function (id, studentNum) {
        _recordSkipped(id, studentNum);
        log(`↩ "${strategyName(id)}" skipped by Student ${studentNum}`);
        setTimeout(renderBrain, 60);
    };

    window.seedDemoData = function () {
        if (confirm('Replace all data with demo data for 27 students?')) {
            brain.seedDemo();
            if (presentMode) {
                renderBrain();
                log('⚡ Demo data loaded — 27 student profiles seeded');
            } else {
                alert('Done! Click Present to see the brain visualization.');
            }
        }
    };

})();
