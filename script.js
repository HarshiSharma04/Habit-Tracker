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

if (currentMonth === 1 && ((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0)) {
  daysInMonth = 29; // Leap year
}

let completedDays = 0;
const container = document.getElementById("calendarContent");

// Build the calendar
let dayCount = 1;
for (let i = 0; i < 5; i++) {
  const weekRow = document.createElement("div");
  weekRow.className = "weekRow";
  for (let j = 0; j < 7; j++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";

    if (dayCount <= daysInMonth) {
      dayDiv.innerText = dayCount;
      dayDiv.id = `day${dayCount}`;

      const storageKey = `${currentMonth + 1}-${dayCount}-${currentYear}`;
      const storedStatus = localStorage.getItem(storageKey);

      if (storedStatus === "true") {
        dayDiv.classList.add("completed");
        completedDays++;
      }

      dayDiv.addEventListener("click", () => {
        if (dayDiv.classList.contains("completed")) {
          dayDiv.classList.remove("completed");
          localStorage.setItem(storageKey, "false");
          completedDays--;
        } else {
          dayDiv.classList.add("completed");
          localStorage.setItem(storageKey, "true");
          completedDays++;
        }
        document.getElementById("totalDays").innerText = `${completedDays}/${daysInMonth}`;
        if (completedDays === daysInMonth) {
          alert("🎉 Great job! You've tracked your habit for the entire month!");
        }
      });

      dayCount++;
    } else {
      dayDiv.innerText = "";
      dayDiv.style.visibility = "hidden";
    }

    weekRow.appendChild(dayDiv);
  }
  container.appendChild(weekRow);
}

// Update total completed
document.getElementById("totalDays").innerText = `${completedDays}/${daysInMonth}`;

// Habit title editable
document.getElementById("habitTitle").addEventListener("click", () => {
  const newHabit = prompt("Enter your habit:", document.getElementById("habitTitle").innerText);
  if (newHabit !== null && newHabit.trim() !== "") {
    document.getElementById("habitTitle").innerText = newHabit;
  }
});

// Reset button
document.getElementById("resetButton").addEventListener("click", () => {
  for (let i = 1; i <= daysInMonth; i++) {
    const storageKey = `${currentMonth + 1}-${i}-${currentYear}`;
    localStorage.setItem(storageKey, "false");
    const el = document.getElementById(`day${i}`);
    if (el) el.classList.remove("completed");
  }
  completedDays = 0;
  document.getElementById("totalDays").innerText = `${completedDays}/${daysInMonth}`;
});
