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

function createHabitCard(habit) {
  const habitCard = document.createElement("div");
  habitCard.className = "habitCard";
  habitCard.setAttribute('data-habit-id', habit.id);

  const habitHeader = document.createElement("div");
  habitHeader.className = "habitHeader";

  const name = document.createElement("p");
  name.className = "habitName";
  name.textContent = habit.name;

  const total = document.createElement("p");
  total.className = "habitTotal";
  total.id = `habit_${habit.id}_total`;

  // Calculate completed days count
  let completedDays = 0;
  for (let i = 1; i <= daysInMonth; i++) {
    const dayKey = `${currentYear}-${currentMonth + 1}-${i}`;
    if (habit.completedDays[dayKey] === true) {
      completedDays++;
    }
  }
  total.textContent = `${completedDays}/${daysInMonth}`;

  habitHeader.appendChild(name);
  habitHeader.appendChild(total);

  const calendar = document.createElement("div");
  calendar.className = "calendarContent";

  // Create calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  let dayCount = 1;
  
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
  habitCard.appendChild(calendar);
  habitCard.appendChild(buttonContainer);

  document.getElementById("habitContainer").appendChild(habitCard);
}

function toggleDay(habitId, dayNumber) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  const dayKey = `${currentYear}-${currentMonth + 1}-${dayNumber}`;
  const dayElement = document.getElementById(`habit_${habitId}_day_${dayNumber}`);
  const totalElement = document.getElementById(`habit_${habitId}_total`);

  if (habit.completedDays[dayKey] === true) {
    // Mark as incomplete
    habit.completedDays[dayKey] = false;
    dayElement.classList.remove("completed");
  } else {
    // Mark as complete
    habit.completedDays[dayKey] = true;
    dayElement.classList.add("completed");
  }

  // Update total count
  let completedCount = 0;
  for (let i = 1; i <= daysInMonth; i++) {
    const key = `${currentYear}-${currentMonth + 1}-${i}`;
    if (habit.completedDays[key] === true) {
      completedCount++;
    }
  }

  totalElement.textContent = `${completedCount}/${daysInMonth}`;

  // Save to localStorage
  localStorage.setItem('habits', JSON.stringify(habits));

  // Check if habit is completed
  if (completedCount === daysInMonth) {
    setTimeout(() => {
      alert(`🎉 Congratulations! You've completed your habit "${habit.name}" for the entire month!`);
    }, 100);
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

  // Update total
  const totalElement = document.getElementById(`habit_${habitId}_total`);
  if (totalElement) {
    totalElement.textContent = `0/${daysInMonth}`;
  }

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
    habitCard.remove();
  }
}

// Load existing habits on page load
function loadHabits() {
  habits.forEach(habit => {
    createHabitCard(habit);
  });
}

// Initialize the app
loadHabits();