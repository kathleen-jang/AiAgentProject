let timeLeft = 25 * 60;
let timerId = null;
let isWorkSession = true;
let isPaused = true;

// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const sessionLabel = document.getElementById('session-label');
const statusEmoji = document.getElementById('status-emoji');
const progressRing = document.getElementById('progress-ring');
const body = document.getElementById('body');
const focusBtn = document.getElementById('focus-mode-btn');
const breakBtn = document.getElementById('break-mode-btn');
const chartContainer = document.getElementById('chart-container');

// Progress Ring Setup
const CIRCUMFERENCE = 2 * Math.PI * 120;
progressRing.style.strokeDasharray = CIRCUMFERENCE;

// Stats Logic
let weeklyStats = JSON.parse(localStorage.getItem('kodariStats')) || [0, 0, 0, 0, 0, 0, 0];

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const totalTime = isWorkSession ? 25 * 60 : 5 * 60;
    const offset = CIRCUMFERENCE - (timeLeft / totalTime) * CIRCUMFERENCE;
    progressRing.style.strokeDashoffset = offset;
}

function startTimer() {
    isPaused = false;
    startPauseBtn.textContent = '일시정지';
    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerId);
            if (isWorkSession) recordSession(25);
            switchSession();
        }
    }, 1000);
}

function pauseTimer() {
    isPaused = true;
    startPauseBtn.textContent = '다시 시작!';
    clearInterval(timerId);
}

function recordSession(minutes) {
    const today = new Date().getDay(); // 0 (Sun) to 6 (Sat)
    // Convert to 0 (Mon) to 6 (Sun) for our chart
    const index = today === 0 ? 6 : today - 1;
    weeklyStats[index] += minutes;
    localStorage.setItem('kodariStats', JSON.stringify(weeklyStats));
    renderChart();
}

function renderChart() {
    const maxVal = Math.max(...weeklyStats, 60); // Min 60m for scale
    const bars = chartContainer.querySelectorAll('.group > div');
    const labels = chartContainer.querySelectorAll('.group span');
    
    weeklyStats.forEach((val, i) => {
        const height = (val / maxVal) * 100;
        const bar = bars[i];
        bar.style.height = `${height}%`;
        if (val > 0) {
            bar.classList.add('bg-pink-500');
            bar.classList.remove('bg-slate-800');
        }
        
        // Update tooltip/text
        const tooltip = bar.querySelector('span');
        tooltip.textContent = `${val}m`;
    });
}

function switchSession() {
    isWorkSession = !isWorkSession;
    timeLeft = isWorkSession ? 25 * 60 : 5 * 60;
    
    if (isWorkSession) {
        sessionLabel.textContent = '집중 시간!';
        statusEmoji.textContent = '🔥';
        body.classList.remove('break-mode');
        updateModeButtons(true);
    } else {
        sessionLabel.textContent = '달콤한 휴식~';
        statusEmoji.textContent = '☕';
        body.classList.add('break-mode');
        updateModeButtons(false);
    }
    
    updateDisplay();
    alert(isWorkSession ? '집중 시간이 시작되었습니다! 🚀' : '고생하셨습니다! 휴식 시간이에요! ☕');
}

function updateModeButtons(isFocus) {
    if (isFocus) {
        focusBtn.classList.add('bg-pink-500/20', 'text-pink-300', 'border-pink-500/50');
        focusBtn.classList.remove('bg-slate-800', 'text-slate-400', 'border-transparent');
        breakBtn.classList.remove('bg-pink-500/20', 'text-pink-300', 'border-pink-500/50');
        breakBtn.classList.add('bg-slate-800', 'text-slate-400', 'border-transparent');
    } else {
        breakBtn.classList.add('bg-pink-500/20', 'text-pink-300', 'border-pink-500/50');
        breakBtn.classList.remove('bg-slate-800', 'text-slate-400', 'border-transparent');
        focusBtn.classList.remove('bg-pink-500/20', 'text-pink-300', 'border-pink-500/50');
        focusBtn.classList.add('bg-slate-800', 'text-slate-400', 'border-transparent');
    }
}

// Event Listeners
startPauseBtn.addEventListener('click', () => isPaused ? startTimer() : pauseTimer());
resetBtn.addEventListener('click', () => {
    pauseTimer();
    timeLeft = isWorkSession ? 25 * 60 : 5 * 60;
    startPauseBtn.textContent = '시작!';
    updateDisplay();
});

focusBtn.addEventListener('click', () => {
    if (!isWorkSession) {
        isWorkSession = true;
        timeLeft = 25 * 60;
        pauseTimer();
        sessionLabel.textContent = '집중 시간!';
        statusEmoji.textContent = '🔥';
        body.classList.remove('break-mode');
        updateModeButtons(true);
        updateDisplay();
        startPauseBtn.textContent = '시작!';
    }
});

breakBtn.addEventListener('click', () => {
    if (isWorkSession) {
        isWorkSession = false;
        timeLeft = 5 * 60;
        pauseTimer();
        sessionLabel.textContent = '달콤한 휴식~';
        statusEmoji.textContent = '☕';
        body.classList.add('break-mode');
        updateModeButtons(false);
        updateDisplay();
        startPauseBtn.textContent = '시작!';
    }
});

// Initial Load
updateDisplay();
renderChart();

// For demonstration: Add some fake data if empty
if (weeklyStats.every(v => v === 0)) {
    weeklyStats = [45, 120, 75, 90, 30, 0, 0];
    localStorage.setItem('kodariStats', JSON.stringify(weeklyStats));
    renderChart();
}
