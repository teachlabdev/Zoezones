// present.js — Presentation Mode
// Wires the Present button, renders the brain panel, and hooks into brain events.

(function () {

    const btn        = document.getElementById('presentBtn');
    const layout     = document.getElementById('layout');
    const brainZones = document.getElementById('brainZones');
    const countEl    = document.getElementById('brainCount');
    const logTextEl  = document.getElementById('brainLogText');

    let presentMode = false;

    const ZONE_META = {
        blue:   { label: 'Blue Zone',   color: '#4a8fd4' },
        green:  { label: 'Green Zone',  color: '#5ea84a' },
        yellow: { label: 'Yellow Zone', color: '#d4a017' },
        red:    { label: 'Red Zone',    color: '#d44a3a' },
    };

    // ── Toggle ──────────────────────────────────────────────────────────
    btn.addEventListener('click', () => {
        presentMode = !presentMode;
        layout.classList.toggle('present-mode', presentMode);
        btn.classList.toggle('active', presentMode);
        btn.childNodes[btn.childNodes.length - 1].textContent = presentMode ? ' Exit Present' : ' Present';
        if (presentMode) renderBrain();
    });

    // ── Render full brain panel ─────────────────────────────────────────
    function renderBrain() {
        if (!presentMode) return;
        const stats = brain.getStats();
        countEl.textContent = stats.totalCheckIns;
        brainZones.innerHTML = '';

        Object.keys(ZONE_META).forEach(zone => {
            const meta       = ZONE_META[zone];
            const strategies = STRATEGIES[zone];

            // Mirror weight calculation from brain.js exactly
            const weighted = strategies.map(s => {
                const st = stats.strategyStats[s.id] || { shown: 0, selected: 0, skipped: 0 };
                let w = 1;
                const interactions = st.selected + st.skipped;
                if (st.shown > 0 && interactions > 0) {
                    w = 0.2 + (st.selected / interactions) * 2.8;
                }
                if (st.shown < 3) w *= 1.5;
                return { s, w: parseFloat(w.toFixed(2)) };
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
                row.className  = 'brain-row';
                row.id         = `row-${s.id}`;
                row.innerHTML  = `
                    <span class="brain-s-name" title="${s.title}">${s.title}</span>
                    <div class="brain-bar-track">
                        <div class="brain-bar-fill" id="bar-${s.id}"
                             style="width:${pct}%; background:${meta.color};opacity:${0.45 + (pct/100)*0.55}"></div>
                    </div>
                    <span class="brain-weight" id="wt-${s.id}">${w.toFixed(1)}</span>
                `;
                block.appendChild(row);
            });

            brainZones.appendChild(block);
        });
    }

    // ── Fast-update a single bar after an interaction ───────────────────
    function updateBar(strategyId) {
        if (!presentMode) return;
        const stats = brain.getStats();
        countEl.textContent = stats.totalCheckIns;

        const zone = Object.keys(STRATEGIES).find(z =>
            STRATEGIES[z].some(s => s.id === strategyId)
        );
        if (!zone) return;

        // Recompute all weights for that zone and update bars
        const strategies = STRATEGIES[zone];
        const weighted = strategies.map(s => {
            const st = stats.strategyStats[s.id] || { shown: 0, selected: 0, skipped: 0 };
            let w = 1;
            const interactions = st.selected + st.skipped;
            if (st.shown > 0 && interactions > 0) {
                w = 0.2 + (st.selected / interactions) * 2.8;
            }
            if (st.shown < 3) w *= 1.5;
            return { id: s.id, w: parseFloat(w.toFixed(2)) };
        });

        const maxW = Math.max(...weighted.map(x => x.w), 0.01);
        weighted.forEach(({ id, w }) => {
            const bar = document.getElementById(`bar-${id}`);
            const wt  = document.getElementById(`wt-${id}`);
            if (bar) {
                const pct = Math.round((w / maxW) * 100);
                bar.style.width   = pct + '%';
                bar.style.opacity = 0.45 + (pct / 100) * 0.55;
            }
            if (wt) wt.textContent = w.toFixed(1);
        });
    }

    // ── Log message ─────────────────────────────────────────────────────
    function log(msg) {
        if (!presentMode) return;
        logTextEl.textContent = msg;
    }

    function strategyName(id) {
        for (const z of Object.keys(STRATEGIES)) {
            const match = STRATEGIES[z].find(s => s.id === id);
            if (match) return match.title;
        }
        return id;
    }

    // ── Patch brain methods to fire live updates ─────────────────────────
    const _recordSelected = brain.recordSelected.bind(brain);
    brain.recordSelected = function (id) {
        _recordSelected(id);
        log(`✓ "${strategyName(id)}" selected — weight rising`);
        setTimeout(() => updateBar(id), 60);
    };

    const _recordSkipped = brain.recordSkipped.bind(brain);
    brain.recordSkipped = function (id) {
        _recordSkipped(id);
        log(`↩ "${strategyName(id)}" skipped — showing next option`);
        setTimeout(() => updateBar(id), 60);
    };

    const _recordCheckIn = brain.recordCheckIn.bind(brain);
    brain.recordCheckIn = function () {
        _recordCheckIn();
        if (presentMode) countEl.textContent = brain.getStats().totalCheckIns;
        log('✦ Check-in complete — brain updated');
    };

    const _recordShown = brain.recordShown.bind(brain);
    brain.recordShown = function (id) {
        _recordShown(id);
        log(`→ Surfacing "${strategyName(id)}" based on current weights`);
    };

    // Zone pip color in strategy view
    document.querySelectorAll('.zone-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const zone = btn.dataset.zone;
            const pip  = document.getElementById('zonePip');
            if (pip) pip.style.background = ZONE_META[zone]?.color || '#5ea84a';
            if (presentMode) {
                log(`★ Student entered ${ZONE_META[zone]?.label}`);
                setTimeout(renderBrain, 60);
            }
        });
    });

    // Also patch seedDemoData so it refreshes the panel
    window.seedDemoData = function () {
        if (confirm('Replace current data with demo data?')) {
            brain.seedDemo();
            if (presentMode) {
                renderBrain();
                log('⚡ Demo data loaded — 87 check-ins seeded');
            } else {
                alert('Done! Click Present to see the brain visualization.');
            }
        }
    };

})();
