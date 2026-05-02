const MODES = {
  focus: { label: 'Focus session', duration: 25 * 60, color: '#7F77DD' },
  short: { label: 'Short break',   duration: 5  * 60, color: '#1D9E75' },
  long:  { label: 'Long break',    duration: 15 * 60, color: '#378ADD' }
};

let mode       = 'focus';
let totalSecs  = MODES.focus.duration;
let remaining  = totalSecs;
let running    = false;
let interval   = null;
let pomos      = 0;
let focusMins  = 0;
let streak     = 0;
let tasks      = [];

const CIRCUMFERENCE = 2 * Math.PI * 96;

// Elements
const ring        = document.getElementById('ring');
const timeDisplay = document.getElementById('timeDisplay');
const phaseLabel  = document.getElementById('phaseLabel');
const startBtn    = document.getElementById('startBtn');
const resetBtn    = document.getElementById('resetBtn');
const skipBtn     = document.getElementById('skipBtn');
const taskInput   = document.getElementById('taskInput');
const addTaskBtn  = document.getElementById('addTaskBtn');
const taskList    = document.getElementById('taskList');
const statPomos   = document.getElementById('statPomos');
const statFocus   = document.getElementById('statFocus');
const statStreak  = document.getElementById('statStreak');

ring.style.strokeDasharray  = CIRCUMFERENCE;
ring.style.strokeDashoffset = 0;

// Mode switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
});

function setMode(m) {
  mode = m;
  clearInterval(interval);
  running = false;
  startBtn.textContent = 'Start';
  totalSecs = MODES[m].duration;
  remaining = totalSecs;
  ring.setAttribute('stroke', MODES[m].color);
  phaseLabel.textContent = MODES[m].label;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === m);
  });
  render();
}

// Timer controls
startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);
skipBtn.addEventListener('click', skipSession);

function toggleTimer() {
  if (running) {
    clearInterval(interval);
    running = false;
    startBtn.textContent = 'Resume';
  } else {
    running = true;
    startBtn.textContent = 'Pause';
    interval = setInterval(tick, 1000);
  }
}

function tick() {
  if (remaining <= 0) {
    clearInterval(interval);
    running = false;
    startBtn.textContent = 'Start';
    if (mode === 'focus') completeSession();
    remaining = 0;
    render();
    return;
  }
  remaining--;
  render();
}

function resetTimer() {
  clearInterval(interval);
  running = false;
  remaining = totalSecs;
  startBtn.textContent = 'Start';
  render();
}

function skipSession() {
  clearInterval(interval);
  running = false;
  if (mode === 'focus') {
    const elapsed = Math.round((totalSecs - remaining) / 60);
    focusMins += elapsed;
    if (elapsed >= 1) { pomos++; streak++; }
  }
  remaining = 0;
  startBtn.textContent = 'Start';
  updateStats();
  render();
}

function completeSession() {
  pomos++;
  focusMins += 25;
  streak++;
  updateStats();
}

function render() {
  const m = String(Math.floor(remaining / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  timeDisplay.textContent = `${m}:${s}`;
  const progress = remaining / totalSecs;
  ring.style.strokeDashoffset = CIRCUMFERENCE * progress;
}

function updateStats() {
  statPomos.textContent  = pomos;
  statFocus.textContent  = focusMins + 'm';
  statStreak.textContent = streak;
}

// Tasks
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  taskInput.value = '';
  renderTasks();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.done = !t.done; renderTasks(); }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach(t => {
    const item = document.createElement('div');
    item.className = 'task-item' + (t.done ? ' done' : '');
    item.innerHTML = `
      <div class="task-check ${t.done ? 'checked' : ''}" data-id="${t.id}">${t.done ? '✓' : ''}</div>
      <span class="task-text">${t.text}</span>
      <span class="task-del" data-del="${t.id}">&times;</span>
    `;
    item.querySelector('.task-check').addEventListener('click', () => toggleTask(t.id));
    item.querySelector('.task-del').addEventListener('click', () => deleteTask(t.id));
    taskList.appendChild(item);
  });
}

// Init
render();