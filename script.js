// ==== DATE CONFIG & GLOBAL STATE ==== //
const date = new Date();
let currentMonth = date.getMonth();
let currentYear = date.getFullYear();
const currentDate = date.getDate();

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const daysInMonthList = [31,28,31,30,31,30,31,31,30,31,30,31];

// Load or initialize data
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let achievements = JSON.parse(localStorage.getItem('achievements')) || {};

const titleEl = document.getElementById("title");
const habitContainer = document.getElementById("habitContainer");
const addBtn = document.getElementById("addHabitBtn");

// === HELPER FUNCTIONS === //
function getDaysInMonth() {
  let dim = daysInMonthList[currentMonth];
  if (currentMonth === 1 && ((currentYear % 4 === 0 && currentYear % 100 !== 0) || (currentYear % 400 === 0))) {
    dim = 29;
  }
  return dim;
}

function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

// === MONTH NAVIGATION === //
function createMonthNav() {
  const nav = document.createElement("div");
  nav.className = "month-navigation";
  nav.innerHTML = `
    <button class="nav-btn" id="prevMonth">&larr;</button>
    
    <button class="nav-btn" id="nextMonth">&rarr;</button>
  `;
  const container = document.querySelector(".container");
  container.insertBefore(nav, container.firstChild);
  document.getElementById("prevMonth").onclick = () => changeMonth(-1);
  document.getElementById("nextMonth").onclick = () => changeMonth(1);
}

function changeMonth(offset) {
  currentMonth += offset;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  rebuildUI();
}

// === ADD HABIT === //
// === OPEN CUSTOM MODAL === //
function promptNewHabit() {
  document.getElementById("habitModal").style.display = "flex";
}

// === HANDLE MODAL SUBMIT === //
document.getElementById("saveModalBtn").onclick = () => {
  const name = document.getElementById("habitNameInput").value.trim();
  const category = document.getElementById("habitCategoryInput").value;


  if (!name) return;

  const exists = habits.find(h => h.name === name && h.year === currentYear && h.month === currentMonth);
  if (exists) return showToast("⚠️ Habit already exists this month!");

  const newHabit = {
    id: Date.now(),
    name,
    category,
    year: currentYear,
    month: currentMonth,
    completedDays: {}
  };

  habits.push(newHabit);
  saveHabits();
  rebuildUI();
  closeHabitModal();
};

document.getElementById("cancelModalBtn").onclick = closeHabitModal;

function closeHabitModal() {
  document.getElementById("habitModal").style.display = "none";
  document.getElementById("habitNameInput").value = "";
  document.getElementById("habitCategoryInput").value = "";
}

// === CUSTOM TOAST FOR ACHIEVEMENTS === //
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// === EXPORT FUNCTION === //
function exportJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(habits));
  const el = document.createElement("a");
  el.href = dataStr;
  el.download = `habits_${currentYear}_${currentMonth + 1}_${currentYear}.json`;
  el.click();
}

// === ACHIEVEMENTS === //
const ACHIEVEMENTS = {
  fullMonth: {
    check: s => s.completedCount === getDaysInMonth(),
    message: "🎉 You completed the MONTH!"
  },
  oneWeek: {
    check: s => s.currentStreak >= 7,
    message: "🔥 7‑day streak achieved!"
  }
};

function updateAchievement(habitId, stats) {
  Object.entries(ACHIEVEMENTS).forEach(([key, val]) => {
    const achKey = `${habitId}_${key}`;
    if (val.check(stats) && !achievements[achKey]) {
      achievements[achKey] = true;
      localStorage.setItem('achievements', JSON.stringify(achievements));
      showToast(val.message);
    }
  });
}

// === UPDATE STATS === //
function calculateStats(habit) {
  const dim = getDaysInMonth();
  let completedCount = 0, currentStreak = 0;
  const todayDate = new Date(currentYear, currentMonth, currentDate);

  for (let day = 1; day <= dim; day++) {
    if (habit.completedDays[`${currentYear}-${currentMonth + 1}-${day}`]) {
      completedCount++;
    }
  }

  let dt = new Date(currentYear, currentMonth, currentDate);
  while (dt.getMonth() === currentMonth && dt.getFullYear() === currentYear) {
    const key = `${currentYear}-${currentMonth + 1}-${dt.getDate()}`;
    if (!habit.completedDays[key]) break;
    currentStreak++;
    dt.setDate(dt.getDate() - 1);
  }

  const stats = { completedCount, currentStreak };
  updateAchievement(habit.id, stats);
  return stats;
}

// === CLICK DAILY === //
function toggleDay(habitId, day) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;
  const key = `${currentYear}-${currentMonth + 1}-${day}`;
  habit.completedDays[key] = !habit.completedDays[key];
  saveHabits();
  rebuildUI();
}

// === BUILD HABIT CARDS === //
function createHabitCard(habit) {
  // only for this month
  if (habit.month !== currentMonth || habit.year !== currentYear) return;

  const dim = getDaysInMonth();
  const stats = calculateStats(habit);

  const card = document.createElement("div");
  card.className = "habitCard";
  card.dataset.habitId = habit.id;

  card.innerHTML = `
    <div class="habitHeader">
      <p class="habitName">${habit.name}</p>
      <span class="habit-category">${habit.category}</span>
      <div class="habitStats">
        <p id="total_${habit.id}" class="habitTotal">${stats.completedCount}/${dim}</p>
        <p id="streak_${habit.id}" class="streakCounter">${stats.currentStreak}-day streak</p>
      </div>
    </div>
    <div class="progressContainer">
      <div class="progressBar">
        <div id="fill_${habit.id}" class="progressFill" style="width:${Math.round((stats.completedCount/dim)*100)}%"></div>
      </div>
      <p class="progressText">${Math.round((stats.completedCount/dim)*100)}% Complete</p>
    </div>
    <div class="calendarContent"></div>
    <div class="buttonContainer">
      <button class="resetBtn">Reset</button>
      <button class="deleteBtn">Delete</button>
    </div>
  `;

  // build calendar
  const calEl = card.querySelector(".calendarContent");
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const totalCells = Math.ceil((dim + firstDay) / 7) * 7;

  for (let idx = 0; idx < totalCells; idx++) {
    const dayNum = idx - firstDay + 1;
    const dayEl = document.createElement("div");
    dayEl.className = "day";

    if (dayNum >= 1 && dayNum <= dim) {
      dayEl.textContent = dayNum;
      dayEl.id = `habit_${habit.id}_day_${dayNum}`;

      if (dayNum === currentDate) dayEl.classList.add("today");
      const key = `${currentYear}-${currentMonth + 1}-${dayNum}`;
      if (habit.completedDays[key]) dayEl.classList.add("completed");

      dayEl.onclick = () => toggleDay(habit.id, dayNum);
    }
    else {
      dayEl.style.visibility = "hidden";
    }

    const rowIndex = Math.floor(idx / 7);
    if (!calEl.children[rowIndex]) {
      const row = document.createElement("div");
      row.className = "weekRow";
      calEl.append(row);
    }
    calEl.children[rowIndex].append(dayEl);
  }

  // Reset/Delete handlers
  card.querySelector(".resetBtn").onclick = () => {
    if (confirm(`Reset all days for "${habit.name}"?`)) {
      for (let d = 1; d <= dim; d++) {
        delete habit.completedDays[`${currentYear}-${currentMonth + 1}-${d}`];
      }
      saveHabits();
      rebuildUI();
    }
  };
  card.querySelector(".deleteBtn").onclick = () => {
    if (confirm(`Delete habit "${habit.name}"?`)) {
      habits = habits.filter(h => h.id !== habit.id);
      saveHabits();
      rebuildUI();
    }
  };

  habitContainer.append(card);
}

// === REBUILD UI === //
function rebuildUI() {
  habitContainer.innerHTML = "";
  titleEl.textContent = `${months[currentMonth]} ${currentYear}`;
  habits.forEach(createHabitCard);
}

// === SET UP === //
addBtn.onclick = promptNewHabit;

const expBtn = document.createElement("button");
expBtn.className = "export-btn";
expBtn.textContent = "Export";
document.querySelector(".container").append(expBtn);
expBtn.onclick = exportJSON;

createMonthNav();
rebuildUI();
