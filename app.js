// app.js — Main Application Logic
// Flow: Student Select → Zone Select → Strategy → Success

let currentStudent = null;
let currentZone    = null;
let currentStrategy = null;
let shownStrategyIds = [];

// ── DOM refs ──────────────────────────────────────────────────────────────────

const screenStudentSelect = document.getElementById('student-selection');
const screenZoneSelect    = document.getElementById('zone-selection');
const screenStrategy      = document.getElementById('strategy-display');
const screenSuccess       = document.getElementById('success-message');

const studentGrid         = document.getElementById('student-grid');
const strategyTitle       = document.getElementById('strategy-title');
const strategyDescription = document.getElementById('strategy-description');
const strategySteps       = document.getElementById('strategy-steps');
const zonePip             = document.getElementById('zonePip');

const btnTry              = document.getElementById('try-strategy');
const btnDifferent        = document.getElementById('different-strategy');
const btnDone             = document.getElementById('finish-checkin');
const btnNewCheckin       = document.getElementById('new-checkin');
const btnBack             = document.getElementById('back-to-students');

// ── Screens ───────────────────────────────────────────────────────────────────

function showScreen(screenEl) {
    [screenStudentSelect, screenZoneSelect, screenStrategy, screenSuccess].forEach(s => {
        s.classList.add('hidden');
    });
    screenEl.classList.remove('hidden');
}

// ── Build student grid ────────────────────────────────────────────────────────

function buildStudentGrid() {
    studentGrid.innerHTML = '';
    for (let i = 1; i <= 27; i++) {
        const btn = document.createElement('button');
        btn.className   = 'student-btn';
        btn.textContent = i;
        btn.setAttribute('aria-label', `Student ${i}`);
        btn.addEventListener('click', () => selectStudent(i));
        studentGrid.appendChild(btn);
    }
}

function selectStudent(num) {
    currentStudent = num;
    document.getElementById('selected-student-label').textContent = `Student ${num}`;
    shownStrategyIds = [];
    showScreen(screenZoneSelect);

    // Notify present.js
    document.dispatchEvent(new CustomEvent('zoe:studentSelected', { detail: { studentNum: num } }));
}

// ── Zone selection ────────────────────────────────────────────────────────────

const ZONE_COLORS = {
    blue:   '#4a8fd4',
    green:  '#5ea84a',
    yellow: '#d4a017',
    red:    '#d44a3a'
};

document.querySelectorAll('.zone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentZone = btn.dataset.zone;
        shownStrategyIds = [];

        // Color the pip
        if (zonePip) zonePip.style.background = ZONE_COLORS[currentZone] || '#5ea84a';

        showStrategy();

        document.dispatchEvent(new CustomEvent('zoe:zoneSelected', {
            detail: { zone: currentZone, studentNum: currentStudent }
        }));
    });
});

// ── Strategy display ──────────────────────────────────────────────────────────

function showStrategy() {
    currentStrategy = brain.getStrategyForZone(currentZone, shownStrategyIds, currentStudent);
    brain.recordShown(currentStrategy.id, currentStudent);
    shownStrategyIds.push(currentStrategy.id);

    strategyTitle.textContent       = currentStrategy.title;
    strategyDescription.textContent = currentStrategy.description;

    strategySteps.innerHTML = '';
    currentStrategy.steps.forEach(step => {
        const div = document.createElement('div');
        div.className   = 'strategy-step';
        div.textContent = step;
        strategySteps.appendChild(div);
    });

    // Tint the done button to zone color
    btnDone.style.borderColor = ZONE_COLORS[currentZone] || '';

    showScreen(screenStrategy);

    document.dispatchEvent(new CustomEvent('zoe:strategyShown', {
        detail: { strategyId: currentStrategy.id, studentNum: currentStudent }
    }));
}

// ── Button handlers ───────────────────────────────────────────────────────────

btnTry.addEventListener('click', () => {
    brain.recordSelected(currentStrategy.id, currentStudent);
    finishCheckIn();
});

btnDifferent.addEventListener('click', () => {
    brain.recordSkipped(currentStrategy.id, currentStudent);

    const zoneCount = STRATEGIES[currentZone].length;
    if (shownStrategyIds.length >= zoneCount) {
        finishCheckIn();
    } else {
        showStrategy();
    }
});

btnDone.addEventListener('click', () => {
    finishCheckIn();
});

function finishCheckIn() {
    brain.recordCheckIn(currentStudent);
    showScreen(screenSuccess);

    document.dispatchEvent(new CustomEvent('zoe:checkInComplete', {
        detail: { studentNum: currentStudent }
    }));
}

btnNewCheckin.addEventListener('click', () => {
    currentStudent      = null;
    currentZone         = null;
    currentStrategy     = null;
    shownStrategyIds    = [];
    showScreen(screenStudentSelect);
});

btnBack.addEventListener('click', () => {
    showScreen(screenStudentSelect);
});

// ── Init ──────────────────────────────────────────────────────────────────────

buildStudentGrid();
showScreen(screenStudentSelect);
