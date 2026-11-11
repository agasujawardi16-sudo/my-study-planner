const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const studyEvents = {
  2: ["Matematika", "C++ Dasar"],
  3: ["Dasar Pemrograman", "C++ & Shell"],
  4: ["Sistem Operasi", "Linux & Terminal"],
  5: ["Review materi", "Cek tugas"]
};

const today = new Date();
document.getElementById("todayLabel").textContent =
  today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Minggu menjadi awal minggu
  return d;
}

function renderCalendar() {
  const start = startOfWeek(today);
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  document.getElementById("weekLabel").textContent =
    `${start.toLocaleDateString("id-ID", {day:"numeric",month:"short"})} – ${end.toLocaleDateString("id-ID",{day:"numeric",month:"short"})}`;

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const day = date.getDay();
    const card = document.createElement("div");
    card.className = "calendar-day" + (date.toDateString() === today.toDateString() ? " today" : "");
    const events = [];
    if (day === 2) events.push(["Kuliah", "class"]);
    if (day === 3) events.push(["Kuliah", "class"]);
    if (day === 4) events.push(["Kuliah", "class"]);
    if (day === 5) events.push(["Kuliah", "class"]);
    if (studyEvents[day]) studyEvents[day].forEach(e => events.push([e, "study"]));
    if ([0, 1, 6].includes(day)) events.push(["Libur", "off"]);

    card.innerHTML = `<div class="day-name">${DAYS[day]}</div><div class="date">${date.getDate()}</div>`;
    events.forEach(([label, type]) => {
      const event = document.createElement("div");
      event.className = `event ${type}`;
      event.textContent = label;
      card.appendChild(event);
    });
    calendar.appendChild(card);
  }
}
renderCalendar();

// Checklist disimpan di localStorage agar tetap ada setelah halaman ditutup.
const STORAGE_KEY = "myStudyPlannerTasks";
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const taskList = document.getElementById("taskList");

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Tandai tugas selesai");
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
    });
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;
    const del = document.createElement("button");
    del.className = "delete-btn";
    del.type = "button";
    del.textContent = "×";
    del.setAttribute("aria-label", "Hapus tugas");
    del.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
    });
    li.append(checkbox, span, del);
    taskList.appendChild(li);
  });
  const completed = tasks.filter(t => t.done).length;
  document.getElementById("completedCount").textContent = `${completed}/${tasks.length}`;
  document.getElementById("taskProgress").textContent = `${completed} dari ${tasks.length} tugas selesai`;
}

document.getElementById("taskForm").addEventListener("submit", event => {
  event.preventDefault();
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  input.value = "";
  saveTasks();
});
renderTasks();

// Notifikasi browser hanya dapat muncul setelah pengguna memberi izin.
// Halaman harus tetap terbuka agar pemeriksaan waktu berjalan.
const notificationBtn = document.getElementById("notificationBtn");
const reminderStatus = document.getElementById("reminderStatus");

notificationBtn.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    reminderStatus.textContent = "Browser ini tidak mendukung notifikasi.";
    return;
  }
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    reminderStatus.textContent = "Izin notifikasi diberikan. Pengingat aktif saat halaman terbuka.";
    notificationBtn.textContent = "Notifikasi aktif";
  } else {
    reminderStatus.textContent = "Izin notifikasi belum diberikan.";
  }
});

function checkStudyReminder() {
  const now = new Date();
  const day = now.getDay(); // 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat
  const isStudyDay = day >= 2 && day <= 5;
  const isReminderTime = now.getHours() === 19 && now.getMinutes() === 30;
  const todayKey = `studyReminder-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  if (isStudyDay && isReminderTime && !sessionStorage.getItem(todayKey)) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Waktunya belajar! 📚", {
        body: "Mulai belajar pukul 19.30. Fokus pada materi hari ini dan jauhkan distraksi.",
        icon: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4da.png"
      });
    } else {
      alert("Waktunya belajar! 📚 Mulai sesi belajar malam kamu.");
    }
    sessionStorage.setItem(todayKey, "sent");
  }
}
checkStudyReminder();
setInterval(checkStudyReminder, 30 * 1000);
