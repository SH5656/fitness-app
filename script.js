/* ======================
     GLOBAL CONFIG & STATE
======================*/
const CONFIG = {
    habitsCount: 8,
    defaults: {
        songs: [
            { name: "Pump Up 🔥", url: "https://www.bensound.com/bensound-music/bensound-epic.mp3" },
            { name: "Beast Mode ⚡", url: "https://www.bensound.com/bensound-music/bensound-actionable.mp3" },
            { name: "Focus Boost 🎧", url: "https://www.bensound.com/bensound-music/bensound-funkyelement.mp3" }
        ]
    },
    quotes: [
        "The only bad workout is the one that didn't happen.",
        "Success is the sum of small efforts repeated day in and day out.",
        "Don't stop when you're tired. Stop when you're done.",
        "Your body can stand almost anything. It's your mind you have to convince.",
        "The pain you feel today will be the strength you feel tomorrow.",
        "Believe in yourself and all that you are.",
        "Push yourself because no one else is going to do it for you.",
        "Great things never come from comfort zones."
    ],
    achievements: [
        { id: 'first_day', name: 'First Step', desc: 'Complete your first day', icon: '🎯' },
        { id: 'week_warrior', name: 'Week Warrior', desc: '7 day streak', icon: '⚡' },
        { id: 'perfect_day', name: 'Perfect Day', desc: '100% completion', icon: '💯' },
        { id: 'habit_master', name: 'Habit Master', desc: '30 day streak', icon: '👑' },
        { id: 'consistency_king', name: 'Consistency King', desc: '50 habits completed', icon: '🔥' },
        { id: 'century_club', name: 'Century Club', desc: '100 habits completed', icon: '💪' }
    ]
};

let state = {
    currentWeekOffset: 0,
    today: new Date(),
    currentTheme: 'dark',
    user: {
        name: "User",
        email: "",
        pic: "",
        water: 0,
        weight: 0,
        goal: 80,
        alarm: "",
        joinDate: null
    },
    weeklyChart: null,
    trackingActive: false,
    lastStepTime: 0,
    motionThreshold: 12 // Sensitivity threshold for step detection
};
state.today.setHours(0, 0, 0, 0);

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'dark';
state.currentTheme = savedTheme;
document.body.className = savedTheme;

/* ======================
      DATA PERSISTENCE
======================*/
const DB = {
    get: (key) => localStorage.getItem(key),
    set: (key, val) => localStorage.setItem(key, val),
    getJson: (key) => JSON.parse(localStorage.getItem(key) || "null"),
    setJson: (key, val) => localStorage.setItem(key, JSON.stringify(val))
};

/* ======================
      LOGIN SYSTEM
======================*/
function checkLogin() {
    const user = DB.getJson('user');
    if (user && user.email) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        state.user = user;
        initializeApp();
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const name = document.getElementById('loginName').value.trim();

    if (!email || !name) {
        alert('Please enter both email and name');
        return;
    }

    if (!email.includes('@')) {
        alert('Please enter a valid email');
        return;
    }

    state.user.email = email;
    state.user.name = name;
    state.user.joinDate = new Date().toISOString();
    DB.setJson('user', state.user);

    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    initializeApp();
}

function logout() {
    if (confirm('Are you sure you want to logout? Your data will be preserved.')) {
        location.reload();
    }
}

/* ======================
     NAVIGATION (SPA)
======================*/
function navigateTo(viewId) {
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));

    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navBtn = document.querySelector(`.nav-item[data-target="${viewId}"]`);
    if (navBtn) navBtn.classList.add('active');

    if (viewId === 'home') loadHomeData();
    if (viewId === 'habits') renderHabitTable();
    if (viewId === 'analytics') loadAnalytics();
    if (viewId === 'profile') loadProfileView();
}

/* ======================
        HOME VIEW
======================*/
function loadHomeData() {
    const user = DB.getJson('user') || state.user;
    document.getElementById('welcomeMsg').innerText = `Welcome back, ${user.name.split(' ')[0]}!`;
    document.getElementById('homeWater').innerText = (DB.get('water') || 0) + 'L';
    document.getElementById('homeSteps').innerText = (DB.get('steps') || 0);
    document.getElementById('homeCalories').innerText = (DB.get('calories') || 0) + ' kcal';
    document.getElementById('homeWeight').innerText = (DB.get('weight') || 0) + 'kg';
    document.getElementById('homeStreak').innerText = DB.get('streak') || 0;

    const picUrl = user.pic || 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
    document.getElementById('headerProfilePic').src = picUrl;

    updateCurrentDate();
    updateMotivationalQuote();
    renderHomeHabits();
    updateAchievements();
}

function updateCurrentDate() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const now = new Date();
    document.getElementById('currentDayName').innerText = days[now.getDay()];
    document.getElementById('currentDate').innerText = now.getDate();
    document.getElementById('currentMonthYear').innerText = `${months[now.getMonth()]} ${now.getFullYear()}`;
}

function updateMotivationalQuote() {
    const quote = CONFIG.quotes[Math.floor(Math.random() * CONFIG.quotes.length)];
    document.getElementById('motivationalQuote').innerText = quote;
}

function renderHomeHabits() {
    const list = document.getElementById('homeHabitList');
    list.innerHTML = '';

    const habitNames = DB.getJson('habitNames') || [];
    const dateKey = getDayKey(state.today);

    let html = '';
    for (let i = 0; i < CONFIG.habitsCount; i++) {
        const hName = habitNames[i] || `Habit ${i + 1}`;
        const key = `${dateKey}_${i}`;
        const isDone = DB.get(key) === "1";

        html += `
      <div class="habit-item ${isDone ? 'completed' : ''}">
        <label class="habit-checkbox">
          <input type="checkbox" ${isDone ? 'checked' : ''} onclick="toggleHabit('${key}', this)">
          <span class="checkmark"></span>
          <span class="habit-name">${hName}</span>
        </label>
      </div>
    `;
    }
    list.innerHTML = html;
}

function quickAddWater() {
    let current = parseFloat(DB.get('water') || 0);
    current = (current + 0.25).toFixed(2);
    DB.set('water', current);
    loadHomeData();
}

function quickAddSteps() {
    let val = prompt("Enter steps to add (e.g. 1000) or total steps count:", "");
    if (val === null) return;

    let current = parseInt(DB.get('steps') || 0);
    let newVal = parseInt(val);

    if (isNaN(newVal)) return alert("Please enter a valid number");

    // If user enters a very large number, assume it's total, otherwise increment
    if (newVal > 100) {
        if (confirm(`Do you want to ET total steps to ${newVal}? (If no, we will ADD ${newVal} to your current ${current})`)) {
            DB.set('steps', newVal);
        } else {
            DB.set('steps', current + newVal);
        }
    } else {
        DB.set('steps', current + newVal);
    }
    loadHomeData();
}

function quickAddCalories() {
    let val = prompt("Enter calories burned (kcal) to add:", "100");
    if (val === null) return;

    let current = parseInt(DB.get('calories') || 0);
    let newVal = parseInt(val);

    if (isNaN(newVal)) return alert("Please enter a valid number");

    DB.set('calories', current + newVal);
    loadHomeData();
}

/* ======================
      ACHIEVEMENTS
======================*/
function updateAchievements() {
    const list = document.getElementById('achievementsList');
    if (!list) return;

    const unlockedAchievements = DB.getJson('achievements') || [];
    const streak = parseInt(DB.get('streak') || 0);
    const totalHabits = getTotalHabitsCompleted();

    // Check achievements
    const achievements = [];

    if (totalHabits >= 1 && !unlockedAchievements.includes('first_day')) {
        unlockedAchievements.push('first_day');
    }
    if (streak >= 7 && !unlockedAchievements.includes('week_warrior')) {
        unlockedAchievements.push('week_warrior');
    }
    if (streak >= 30 && !unlockedAchievements.includes('habit_master')) {
        unlockedAchievements.push('habit_master');
    }
    if (totalHabits >= 50 && !unlockedAchievements.includes('consistency_king')) {
        unlockedAchievements.push('consistency_king');
    }
    if (totalHabits >= 100 && !unlockedAchievements.includes('century_club')) {
        unlockedAchievements.push('century_club');
    }

    DB.setJson('achievements', unlockedAchievements);

    let html = '';
    CONFIG.achievements.forEach(ach => {
        const unlocked = unlockedAchievements.includes(ach.id);
        html += `
      <div class="achievement-badge ${unlocked ? 'unlocked' : 'locked'}">
        <span class="achievement-icon">${ach.icon}</span>
        <div class="achievement-info">
          <h4>${ach.name}</h4>
          <p>${ach.desc}</p>
        </div>
      </div>
    `;
    });

    list.innerHTML = html || '<p class="empty-state">Complete habits to unlock achievements!</p>';
}

function getTotalHabitsCompleted() {
    let total = 0;
    for (let key in localStorage) {
        if (key.includes('_') && localStorage[key] === "1") {
            total++;
        }
    }
    return total;
}

/* ======================
      HABITS VIEW
======================*/
const daysV = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function changeWeek(diff) {
    state.currentWeekOffset += diff;
    renderHabitTable();
}

function getWeekStart(date) {
    const d = new Date(date);
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    return start;
}

function renderHabitTable() {
    const start = new Date(state.today.getTime() + state.currentWeekOffset * 7 * 86400000);
    const weekStart = getWeekStart(start);

    document.getElementById('monthYear').innerText = weekStart.toLocaleString("default", { month: "long", year: "numeric" });
    document.getElementById('weekTitle').innerText = `Week of ${weekStart.getDate()}`;

    const habitNames = DB.getJson('habitNames') || [];
    const headRow = document.getElementById('habitHeadRow');

    let headHtml = `<th>Day</th>`;
    for (let i = 0; i < CONFIG.habitsCount; i++) {
        headHtml += `<th>${habitNames[i] || (i + 1)}</th>`;
    }
    headHtml += `<th>%</th>`;
    headRow.innerHTML = headHtml;

    const body = document.getElementById('chartBody');
    body.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        let d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);

        let dateKey = getDayKey(d);
        let isToday = d.getTime() === state.today.getTime();

        let rowHtml = `<td style="white-space:nowrap">${daysV[d.getDay()]} <small style="display:block;color:#666">${d.getDate()}</small></td>`;
        let checkCount = 0;

        for (let h = 0; h < CONFIG.habitsCount; h++) {
            let key = `${dateKey}_${h}`;
            let done = DB.get(key) === "1";
            if (done) checkCount++;

            rowHtml += `<td>
          <input type="checkbox" ${done ? 'checked' : ''} ${!isToday && d > state.today ? 'disabled' : ''} 
          onclick="toggleHabit('${key}', this)">
        </td>`;
        }

        let pct = Math.round((checkCount / CONFIG.habitsCount) * 100);
        rowHtml += `<td>${pct}%</td>`;

        let tr = document.createElement('tr');
        if (isToday) tr.classList.add('today-row');
        tr.innerHTML = rowHtml;
        body.appendChild(tr);
    }
}

function getDayKey(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function toggleHabit(key, el) {
    DB.set(key, el.checked ? "1" : "0");
    if (el.checked) playTick();
    updateStreak();
    renderHabitTable();
    if (document.getElementById('view-home').classList.contains('active')) {
        renderHomeHabits();
        updateAchievements();
    }
}

function updateStreak() {
    let s = 0;
    let d = new Date(state.today);

    while (true) {
        let dayHasActivity = false;
        let kPrefix = getDayKey(d);

        for (let i = 0; i < CONFIG.habitsCount; i++) {
            if (DB.get(`${kPrefix}_${i}`) === "1") {
                dayHasActivity = true;
                break;
            }
        }

        if (!dayHasActivity && d.getTime() !== state.today.getTime()) break;
        if (dayHasActivity) s++;

        d.setDate(d.getDate() - 1);
        if (s > 365) break;
    }

    DB.set('streak', s);
    if (document.getElementById('homeStreak')) {
        document.getElementById('homeStreak').innerText = s;
    }
}

function playTick() {
    const audio = document.getElementById('tickSound');
    audio.currentTime = 0;
    audio.play().catch(e => { });
}

/* ======================
      ANALYTICS VIEW
======================*/
function loadAnalytics() {
    calculateWeeklyStats();
    renderWeeklyChart();
    generateInsights();
}

function calculateWeeklyStats() {
    const weekStart = getWeekStart(state.today);
    let totalChecks = 0;
    let totalPossible = CONFIG.habitsCount * 7;
    let dayScores = {};

    for (let i = 0; i < 7; i++) {
        let d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        let dateKey = getDayKey(d);
        let dayChecks = 0;

        for (let h = 0; h < CONFIG.habitsCount; h++) {
            if (DB.get(`${dateKey}_${h}`) === "1") {
                dayChecks++;
                totalChecks++;
            }
        }

        dayScores[daysV[d.getDay()]] = dayChecks;
    }

    const completion = Math.round((totalChecks / totalPossible) * 100);
    const bestDay = Object.keys(dayScores).reduce((a, b) => dayScores[a] > dayScores[b] ? a : b);

    document.getElementById('weekCompletion').innerText = completion + '%';
    document.getElementById('bestDay').innerText = bestDay;
    document.getElementById('totalChecks').innerText = totalChecks;
}

function renderWeeklyChart() {
    const canvas = document.getElementById('weeklyChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (state.weeklyChart) {
        state.weeklyChart.destroy();
    }

    const weekStart = getWeekStart(state.today);
    const labels = [];
    const data = [];

    for (let i = 0; i < 7; i++) {
        let d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        labels.push(daysV[d.getDay()]);

        let dateKey = getDayKey(d);
        let dayChecks = 0;
        for (let h = 0; h < CONFIG.habitsCount; h++) {
            if (DB.get(`${dateKey}_${h}`) === "1") dayChecks++;
        }
        data.push(Math.round((dayChecks / CONFIG.habitsCount) * 100));
    }

    state.weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion %',
                data: data,
                backgroundColor: 'rgba(6, 182, 212, 0.6)',
                borderColor: 'rgba(6, 182, 212, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function generateInsights() {
    const list = document.getElementById('insightsList');
    if (!list) return;

    const streak = parseInt(DB.get('streak') || 0);
    const totalHabits = getTotalHabitsCompleted();

    let insights = [];

    if (streak >= 7) {
        insights.push('🔥 Amazing! You\'re on a ' + streak + ' day streak!');
    } else if (streak >= 3) {
        insights.push('💪 Great job! Keep the momentum going!');
    } else {
        insights.push('🎯 Start building your streak today!');
    }

    if (totalHabits >= 50) {
        insights.push('🏆 You\'ve completed ' + totalHabits + ' habits! You\'re crushing it!');
    }

    const user = DB.getJson('user');
    if (user && user.joinDate) {
        const joinDate = new Date(user.joinDate);
        const daysActive = Math.floor((state.today - joinDate) / (1000 * 60 * 60 * 24));
        if (daysActive > 0) {
            insights.push('📅 You\'ve been active for ' + daysActive + ' days!');
        }
    }

    let html = insights.map(i => `<div class="insight-item">${i}</div>`).join('');
    list.innerHTML = html || '<p class="empty-state">Complete more habits to see insights!</p>';
}

/* ======================
      TIMER
======================*/
let timerState = {
    sec: 30,
    remaining: 30,
    interval: null,
    isRunning: false
};
const canvas = document.getElementById('circleCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const radius = canvas ? canvas.width / 2 - 10 : 0;

function setTime(s) {
    timerState.sec = s;
    resetTimerFS();
}

function drawTimer(progress) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, -Math.PI / 2, (2 * Math.PI * progress) - Math.PI / 2);
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#06b6d4";
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function updateTimerDisplay() {
    const m = Math.floor(timerState.remaining / 60);
    const s = timerState.remaining % 60;
    document.getElementById('timerDisplay').innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    drawTimer(timerState.remaining / timerState.sec);
}

function startTimerFS() {
    if (timerState.isRunning) return;
    const custom = document.getElementById('customTime').value;
    if (custom && timerState.remaining === timerState.sec && timerState.sec === 30) {
        setTime(parseInt(custom));
        return startTimerFS();
    }

    timerState.isRunning = true;
    document.getElementById('timerState').innerText = "Running...";

    timerState.interval = setInterval(() => {
        timerState.remaining--;
        updateTimerDisplay();
        if (timerState.remaining <= 0) {
            clearInterval(timerState.interval);
            timerState.isRunning = false;
            document.getElementById('timerState').innerText = "Done!";
            new Audio("https://assets.mixkit.co/sfx/preview/mixkit-classic-alarm-995.mp3").play();
            if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
        }
    }, 1000);
}

function pauseTimerFS() {
    clearInterval(timerState.interval);
    timerState.isRunning = false;
    document.getElementById('timerState').innerText = "Paused";
}

function resetTimerFS() {
    pauseTimerFS();
    timerState.remaining = timerState.sec;
    document.getElementById('timerState').innerText = "Ready";
    updateTimerDisplay();
}

/* ======================
      MUSIC PLAYER
======================*/
let musicState = {
    playlist: [],
    currentIdx: 0,
    audio: null
};

function initMusic() {
    musicState.audio = document.getElementById('music');
    if (!musicState.audio) return;

    const custom = DB.getJson('customSongs') || [];
    musicState.playlist = [...CONFIG.defaults.songs, ...custom];
    if (musicState.playlist.length > 0) {
        loadSong(0);
    }
}

function loadSong(idx) {
    if (!musicState.audio) return;
    if (idx < 0) idx = musicState.playlist.length - 1;
    if (idx >= musicState.playlist.length) idx = 0;

    musicState.currentIdx = idx;
    const song = musicState.playlist[idx];

    musicState.audio.src = song.url;
    document.getElementById('songName').innerText = song.name;

    renderPlaylist();
}

function toggleMusic() {
    if (!musicState.audio) return;
    if (musicState.audio.paused) {
        musicState.audio.play();
        document.querySelector('.main-play').innerText = 'pause_circle';
    } else {
        musicState.audio.pause();
        document.querySelector('.main-play').innerText = 'play_circle';
    }
}

function nextSong() {
    loadSong(musicState.currentIdx + 1);
    if (musicState.audio) {
        musicState.audio.play();
        document.querySelector('.main-play').innerText = 'pause_circle';
    }
}

function prevSong() {
    loadSong(musicState.currentIdx - 1);
    if (musicState.audio) {
        musicState.audio.play();
        document.querySelector('.main-play').innerText = 'pause_circle';
    }
}

function changeVolume(v) {
    if (musicState.audio) musicState.audio.volume = v;
}

function renderPlaylist() {
    const list = document.getElementById('songList');
    if (!list) return;
    list.innerHTML = '';
    musicState.playlist.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = `song-item ${i === musicState.currentIdx ? 'active' : ''}`;
        div.innerHTML = `
      <span onclick="playSpecific(${i})" style="cursor:pointer">${s.name}</span>
      ${i >= CONFIG.defaults.songs.length ? `<button class="delete-song-btn" onclick="deleteSong(${i})">🗑</button>` : ''}
    `;
        list.appendChild(div);
    });
}

function playSpecific(i) {
    loadSong(i);
    if (musicState.audio) {
        musicState.audio.play();
        document.querySelector('.main-play').innerText = 'pause_circle';
    }
}

function addCustomSong() {
    const file = document.getElementById('songUpload').files[0];
    if (!file) return;

    const custom = DB.getJson('customSongs') || [];
    custom.push({ name: file.name, url: URL.createObjectURL(file) });
    DB.setJson('customSongs', custom);

    initMusic();
}

function deleteSong(i) {
    const customIdx = i - CONFIG.defaults.songs.length;
    if (customIdx < 0) return;

    const custom = DB.getJson('customSongs');
    custom.splice(customIdx, 1);
    DB.setJson('customSongs', custom);
    initMusic();
}

/* ======================
      PROFILE & SETTINGS
======================*/
function loadProfileView() {
    const user = DB.getJson('user') || state.user;
    document.getElementById('userNameInput').value = user.name;
    document.getElementById('userEmailDisplay').innerText = user.email || '';
    document.getElementById('waterInput').value = DB.get('water') || 0;
    document.getElementById('weightInput').value = DB.get('weight') || 0;
    document.getElementById('goalInput').value = user.goal || 80;
    document.getElementById('profilePicEdit').src = user.pic || 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
    document.getElementById('alarmTime').value = DB.get('alarm') || "";

    // Calculate profile stats
    const joinDate = user.joinDate ? new Date(user.joinDate) : state.today;
    const daysActive = Math.floor((state.today - joinDate) / (1000 * 60 * 60 * 24)) + 1;
    const totalHabits = getTotalHabitsCompleted();
    const bestStreak = parseInt(DB.get('bestStreak') || DB.get('streak') || 0);

    document.getElementById('profileTotalDays').innerText = daysActive;
    document.getElementById('profileTotalHabits').innerText = totalHabits;
    document.getElementById('profileBestStreak').innerText = bestStreak;

    // Update best streak if current is higher
    const currentStreak = parseInt(DB.get('streak') || 0);
    if (currentStreak > bestStreak) {
        DB.set('bestStreak', currentStreak);
        document.getElementById('profileBestStreak').innerText = currentStreak;
    }
}

function previewProfileImage() {
    const file = document.getElementById('photoInput').files[0];
    if (file) {
        const r = new FileReader();
        r.onload = (e) => {
            const imgSrc = e.target.result;
            document.getElementById('profilePicEdit').src = imgSrc;
            // Auto-save the image
            const user = DB.getJson('user') || state.user;
            user.pic = imgSrc;
            DB.setJson('user', user);
            state.user = user;
            document.getElementById('headerProfilePic').src = imgSrc;
            showSuccessMessage('📸 Profile picture updated!');
        };
        r.readAsDataURL(file);
    }
}

function saveProfileData() {
    const user = DB.getJson('user') || state.user;
    user.name = document.getElementById('userNameInput').value || "User";
    user.goal = parseInt(document.getElementById('goalInput').value) || 80;

    const img = document.getElementById('profilePicEdit');
    if (img.src && !img.src.includes('placeholder') && !img.src.includes('flaticon')) {
        user.pic = img.src;
    }

    DB.setJson('user', user);
    state.user = user; // Update state

    DB.set('water', document.getElementById('waterInput').value);
    DB.set('weight', document.getElementById('weightInput').value);
    DB.set('alarm', document.getElementById('alarmTime').value);

    // Update header immediately
    if (user.pic) {
        document.getElementById('headerProfilePic').src = user.pic;
    }

    // Show success message with animation
    showSuccessMessage('✅ Profile Saved Successfully!');
    loadHomeData();
}

function exportData() {
    const data = {
        user: DB.getJson('user'),
        habits: DB.getJson('habitNames'),
        achievements: DB.getJson('achievements'),
        streak: DB.get('streak'),
        water: DB.get('water'),
        weight: DB.get('weight'),
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-fitness-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

/* ======================
      THEME SYSTEM
======================*/
function openThemeSelector() {
    document.getElementById('themeSelectorModal').style.display = 'flex';
    updateThemeChecks();
}

function closeThemeSelector() {
    document.getElementById('themeSelectorModal').style.display = 'none';
}

function selectTheme(theme) {
    state.currentTheme = theme;
    document.body.className = theme;
    localStorage.setItem('theme', theme);
    updateThemeChecks();
}

function updateThemeChecks() {
    document.querySelectorAll('.theme-check').forEach(el => {
        el.style.display = 'none';
    });
    document.getElementById(`check-${state.currentTheme}`).style.display = 'block';
}

/* ======================
      HABIT EDITOR
======================*/
function editHabits() {
    const modal = document.getElementById('habitEditorModal');
    const list = document.getElementById('habitEditorList');
    list.innerHTML = "";

    const names = DB.getJson('habitNames') || [];
    for (let i = 0; i < CONFIG.habitsCount; i++) {
        list.innerHTML += `<div class="habit-edit-item">
         <input id="hEdit${i}" value="${names[i] || "Habit " + (i + 1)}">
      </div>`;
    }
    modal.style.display = 'flex';
}

function saveHabitNames() {
    const arr = [];
    for (let i = 0; i < CONFIG.habitsCount; i++) {
        arr.push(document.getElementById(`hEdit${i}`).value);
    }
    DB.setJson('habitNames', arr);
    closeHabitEditor();
    renderHabitTable();
    if (document.getElementById('view-home').classList.contains('active')) {
        renderHomeHabits();
    }
}

function closeHabitEditor() {
    document.getElementById('habitEditorModal').style.display = 'none';
}

/* ======================
     INITIALIZATION
======================*/
function initializeApp() {
    loadHomeData();
    renderHabitTable();
    initMusic();
    updateTimerDisplay();
    updateStreak();

    const user = DB.getJson('user');
    const defaultPic = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
    if (user && user.pic) {
        document.getElementById('headerProfilePic').src = user.pic;
        document.getElementById('profilePicEdit').src = user.pic;
    } else {
        document.getElementById('headerProfilePic').src = defaultPic;
        if (document.getElementById('profilePicEdit')) {
            document.getElementById('profilePicEdit').src = defaultPic;
        }
    }
}

/* ======================
     UTILITY FUNCTIONS
======================*/
function showSuccessMessage(message) {
    // Remove existing toasts to prevent stacking issues
    document.querySelectorAll('.success-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'success-toast';

    // Modern Glassmorphism Styling
    Object.assign(toast.style, {
        position: 'fixed',
        top: '30px',
        left: '50%',
        transform: 'translateX(-50%) translateY(-20px)',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        zIndex: '9999',
        opacity: '0',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontWeight: '500',
        fontSize: '15px',
        letterSpacing: '0.3px',
        pointerEvents: 'none'
    });

    // Handle Light/Orange Themes
    if (document.body.classList.contains('light') || document.body.classList.contains('orange')) {
        toast.style.background = 'rgba(15, 23, 42, 0.85)';
        toast.style.color = 'white';
        toast.style.border = '1px solid rgba(0, 0, 0, 0.1)';
    }

    toast.innerHTML = `<span style="font-size: 1.2em;">✨</span> ${message}`;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Auto-remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px) scale(0.95)';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

/* ======================
     MOTION TRACKING
======================*/
async function requestTrackingPermission() {
    if (state.trackingActive) {
        stopStepCounter();
        return;
    }

    // Check if DeviceMotionEvent is available
    if (typeof DeviceMotionEvent === 'undefined') {
        alert('Step tracking is not supported on this device/browser.');
        return;
    }

    // Request permission for iOS 13+
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const permissionState = await DeviceMotionEvent.requestPermission();
            if (permissionState === 'granted') {
                startStepCounter();
            } else {
                alert('Permission denied for motion sensors.');
            }
        } catch (error) {
            console.error(error);
            alert('Error requesting sensor permission.');
        }
    } else {
        // Non-iOS devices usually don't need explicit requestPermission
        startStepCounter();
    }
}

function startStepCounter() {
    state.trackingActive = true;
    window.addEventListener('devicemotion', handleMotion);
    updateTrackingUI(true);
    showSuccessMessage('🚀 Step counting activated!');
}

function stopStepCounter() {
    state.trackingActive = false;
    window.removeEventListener('devicemotion', handleMotion);
    updateTrackingUI(false);
    showSuccessMessage('⏹️ Step counting stopped.');
}

function updateTrackingUI(active) {
    const btn = document.getElementById('enableTrackingBtn');
    if (!btn) return;

    if (active) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
}

function handleMotion(event) {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    // Calculate acceleration magnitude
    const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

    // Simple peak detection
    const now = Date.now();
    if (magnitude > state.motionThreshold && (now - state.lastStepTime) > 300) {
        state.lastStepTime = now;
        incrementSteps(1);
    }
}

function incrementSteps(count) {
    let steps = parseInt(DB.get('steps') || 0);
    steps += count;
    DB.set('steps', steps);

    // Calculate calories: ~0.04 kcal per step
    let calories = parseFloat(DB.get('calories') || 0);
    calories += count * 0.04;
    DB.set('calories', Math.round(calories));

    // Update UI if home view is active
    if (document.getElementById('view-home').classList.contains('active')) {
        document.getElementById('homeSteps').innerText = steps;
        document.getElementById('homeCalories').innerText = Math.round(calories) + ' kcal';
    }
}

window.onload = function () {
    checkLogin();
};
