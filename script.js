// Date and month configuration
const date = new Date();
const currentMonth = date.getMonth();
const currentDate = date.getDate();
const currentYear = date.getFullYear();

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
document.getElementById("title").innerText = months[currentMonth];

const daysInMonthList = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
let daysInMonth = daysInMonthList[currentMonth];

// Leap year check
if (
  currentMonth === 1 &&
  ((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0)
) {
  daysInMonth = 29;
}

// Track habits data
let habits = JSON.parse(localStorage.getItem('habits')) || [];

// Add Habit Button
document.getElementById("addHabitBtn").addEventListener("click", () => {
  const habitName = prompt("Enter the name of your habit:");
  if (habitName && habitName.trim() !== "") {
    const trimmedName = habitName.trim();
    // Check if habit already exists
    const existingHabit = habits.find(h => h.name === trimmedName);
    if (!existingHabit) {
      const newHabit = {
        id: Date.now(),
        name: trimmedName,
        completedDays: {},
        created: new Date().toISOString()
      };
      habits.push(newHabit);
      localStorage.setItem('habits', JSON.stringify(habits));
      createHabitCard(newHabit);
    } else {
      alert("A habit with this name already exists!");
    }
  }
});

// Calculate current streak for a habit
function calculateStreak(habit) {
  let currentStreak = 0;
  let checkDate = new Date(currentYear, currentMonth, currentDate);
  
  // Go backwards from today to find consecutive completed days
  while (checkDate.getDate() >= 1) {
    const dayKey = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
    
    if (habit.completedDays[dayKey] === true) {
      currentStreak++;
    } else {
      break; // Break streak if day is not completed
    }
    
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  return currentStreak;
}

// Update progress bar
function updateProgressBar(habitId, completedCount, totalDays) {
  const progressFill = document.getElementById(`progress_${habitId}`);
  const progressText = document.getElementById(`progress_text_${habitId}`);
  
  if (progressFill && progressText) {
    const percentage = Math.round((completedCount / totalDays) * 100);
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}% Complete`;
  }
}

// Update habit statistics
function updateHabitStats(habitId) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  // Calculate completed days count
  let completedCount = 0;
  for (let i = 1; i <= daysInMonth; i++) {
    const dayKey = `${currentYear}-${currentMonth + 1}-${i}`;
    if (habit.completedDays[dayKey] === true) {
      completedCount++;
    }
  }

  // Calculate current streak
  const currentStreak = calculateStreak(habit);

  // Update UI elements
  const totalElement = document.getElementById(`habit_${habitId}_total`);
  const streakElement = document.getElementById(`streak_${habitId}`);
  
  if (totalElement) {
    totalElement.textContent = `${completedCount}/${daysInMonth}`;
  }
  
  if (streakElement) {
    streakElement.textContent = `${currentStreak} day streak`;
  }

  // Update progress bar
  updateProgressBar(habitId, completedCount, daysInMonth);

  return { completedCount, currentStreak };
}

function createHabitCard(habit) {
  const habitCard = document.createElement("div");
  habitCard.className = "habitCard";
  habitCard.setAttribute('data-habit-id', habit.id);

  const habitHeader = document.createElement("div");
  habitHeader.className = "habitHeader";

  const name = document.createElement("p");
  name.className = "habitName";
  name.textContent = habit.name;

  // Create stats container
  const statsContainer = document.createElement("div");
  statsContainer.className = "habitStats";

  const total = document.createElement("p");
  total.className = "habitTotal";
  total.id = `habit_${habit.id}_total`;

  const streak = document.createElement("p");
  streak.className = "streakCounter";
  streak.id = `streak_${habit.id}`;

  statsContainer.appendChild(total);
  statsContainer.appendChild(streak);

  habitHeader.appendChild(name);
  habitHeader.appendChild(statsContainer);

  // Create progress bar container
  const progressContainer = document.createElement("div");
  progressContainer.className = "progressContainer";

  const progressBar = document.createElement("div");
  progressBar.className = "progressBar";

  const progressFill = document.createElement("div");
  progressFill.className = "progressFill";
  progressFill.id = `progress_${habit.id}`;

  const progressText = document.createElement("p");
  progressText.className = "progressText";
  progressText.id = `progress_text_${habit.id}`;

  progressBar.appendChild(progressFill);
  progressContainer.appendChild(progressBar);
  progressContainer.appendChild(progressText);

  // Create calendar
  const calendar = document.createElement("div");
  calendar.className = "calendarContent";

  // Create calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  
  // Calculate total weeks needed
  const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;
  const totalWeeks = Math.ceil(totalCells / 7);

  for (let week = 0; week < totalWeeks; week++) {
    const weekRow = document.createElement("div");
    weekRow.className = "weekRow";
    
    for (let day = 0; day < 7; day++) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "day";
      
      const cellIndex = week * 7 + day;
      const currentDayNumber = cellIndex - firstDay + 1;
      
      if (cellIndex >= firstDay && currentDayNumber <= daysInMonth) {
        dayDiv.innerText = currentDayNumber;
        dayDiv.id = `habit_${habit.id}_day_${currentDayNumber}`;
        
        // Highlight today's date
        if (currentDayNumber === currentDate) {
          dayDiv.classList.add("today");
        }
        
        // Check if day is completed
        const dayKey = `${currentYear}-${currentMonth + 1}-${currentDayNumber}`;
        if (habit.completedDays[dayKey] === true) {
          dayDiv.classList.add("completed");
        }
        
        // Add click event listener
        dayDiv.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleDay(habit.id, currentDayNumber);
        });
      } else {
        dayDiv.style.visibility = "hidden";
      }
      
      weekRow.appendChild(dayDiv);
    }
    calendar.appendChild(weekRow);
  }

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "buttonContainer";

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset";
  resetBtn.className = "resetBtn";
  resetBtn.addEventListener("click", () => {
    if (confirm(`Are you sure you want to reset all progress for "${habit.name}"?`)) {
      resetHabit(habit.id);
    }
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "deleteBtn";
  deleteBtn.addEventListener("click", () => {
    if (confirm(`Are you sure you want to delete the habit "${habit.name}"?`)) {
      deleteHabit(habit.id);
    }
  });

  buttonContainer.appendChild(resetBtn);
  buttonContainer.appendChild(deleteBtn);

  habitCard.appendChild(habitHeader);
  habitCard.appendChild(progressContainer);
  habitCard.appendChild(calendar);
  habitCard.appendChild(buttonContainer);

  document.getElementById("habitContainer").appendChild(habitCard);

  // Initialize stats
  updateHabitStats(habit.id);
}

function toggleDay(habitId, dayNumber) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  const dayKey = `${currentYear}-${currentMonth + 1}-${dayNumber}`;
  const dayElement = document.getElementById(`habit_${habitId}_day_${dayNumber}`);

  if (habit.completedDays[dayKey] === true) {
    // Mark as incomplete
    habit.completedDays[dayKey] = false;
    dayElement.classList.remove("completed");
  } else {
    // Mark as complete
    habit.completedDays[dayKey] = true;
    dayElement.classList.add("completed");
  }

  // Update statistics
  const stats = updateHabitStats(habitId);

  // Save to localStorage
  localStorage.setItem('habits', JSON.stringify(habits));

  // Check if habit is completed
  if (stats.completedCount === daysInMonth) {
    setTimeout(() => {
      alert(`🎉 Congratulations! You've completed your habit "${habit.name}" for the entire month!`);
    }, 100);
  }

  // Special message for streaks
  if (stats.currentStreak > 0 && stats.currentStreak % 7 === 0) {
    setTimeout(() => {
      alert(`🔥 Amazing! You're on a ${stats.currentStreak}-day streak with "${habit.name}"!`);
    }, 150);
  }
}

function resetHabit(habitId) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  // Clear all completed days
  for (let i = 1; i <= daysInMonth; i++) {
    const dayKey = `${currentYear}-${currentMonth + 1}-${i}`;
    habit.completedDays[dayKey] = false;
    
    const dayElement = document.getElementById(`habit_${habitId}_day_${i}`);
    if (dayElement) {
      dayElement.classList.remove("completed");
    }
  }

  // Update statistics
  updateHabitStats(habitId);

  // Save to localStorage
  localStorage.setItem('habits', JSON.stringify(habits));
}

function deleteHabit(habitId) {
  // Remove from habits array
  habits = habits.filter(h => h.id !== habitId);
  
  // Remove from localStorage
  localStorage.setItem('habits', JSON.stringify(habits));
  
  // Remove from DOM
  const habitCard = document.querySelector(`[data-habit-id="${habitId}"]`);
  if (habitCard) {
    habitCard.style.transform = 'translateX(-100%)';
    habitCard.style.opacity = '0';
    setTimeout(() => {
      habitCard.remove();
    }, 300);
  }
}

// Load existing habits on page load
function loadHabits() {
  habits.forEach(habit => {
    createHabitCard(habit);
  });
}

// Add smooth entrance animation for new habits
function animateNewHabit() {
  const habitCards = document.querySelectorAll('.habitCard');
  const lastCard = habitCards[habitCards.length - 1];
  if (lastCard) {
    lastCard.style.opacity = '0';
    lastCard.style.transform = 'translateY(50px)';
    setTimeout(() => {
      lastCard.style.transition = 'all 0.5s ease';
      lastCard.style.opacity = '1';
      lastCard.style.transform = 'translateY(0)';
    }, 50);
  }
}

// Override the original createHabitCard call to add animation
const originalAddHabitBtn = document.getElementById("addHabitBtn");
originalAddHabitBtn.addEventListener("click", () => {
  setTimeout(animateNewHabit, 100);
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  loadHabits();
  
  // Add entrance animation to existing habits
  setTimeout(() => {
    const habitCards = document.querySelectorAll('.habitCard');
    habitCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }, 100);
});