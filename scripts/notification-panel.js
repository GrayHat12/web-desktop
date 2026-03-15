const today = new Date();   // The actual current day
let displayDate = new Date(); // The date currently being viewed in the calendar

function updateLiveClocks() {
    const now = new Date();

    // Top Bar
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    document.getElementById('current-time').textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    // Shade Header (updates only if visible or every second)
    document.getElementById('shade-day-name').textContent = now.toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById('shade-full-date').textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function renderCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    const monthYearLabel = document.getElementById('calendar-month-year');
    const now = new Date(); // Real "today"

    // Clear previous days
    calendarDays.innerHTML = '';

    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();

    // Set Header (e.g., March 2026)
    monthYearLabel.textContent = displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Find first day of month and total days
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    // 1. Add Empty Slots for previous month days
    for (let x = firstDayIndex; x > 0; x--) {
        const div = document.createElement('div');
        div.className = "opacity-0"; // Invisible but takes space
        calendarDays.appendChild(div);
    }

    // 2. Add actual days
    for (let i = 1; i <= lastDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = "w-6 h-6 flex items-center justify-center mx-auto cursor-pointer hover:bg-white/10 rounded-full transition";
        dayDiv.textContent = i;

        // Highlight Today
        if (i === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
            dayDiv.className = "w-6 h-6 flex items-center justify-center mx-auto bg-blue-600 rounded-full font-bold shadow-lg shadow-blue-500/20";
        }

        calendarDays.appendChild(dayDiv);
    }
}

// Navigation Listeners
document.getElementById('prev-month').addEventListener('click', (e) => {
    e.stopPropagation();
    displayDate.setMonth(displayDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', (e) => {
    e.stopPropagation();
    displayDate.setMonth(displayDate.getMonth() + 1);
    renderCalendar();
});

updateLiveClocks();
setInterval(updateLiveClocks, 1000);
renderCalendar();

function updateWeatherTheme() {
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour <= 6;
    const weatherIcon = document.querySelector('.fa-sun'); // Or use an ID

    if (isNight) {
        weatherIcon.classList.replace('fa-sun', 'fa-moon');
        weatherIcon.classList.replace('text-yellow-400', 'text-blue-200');
    }
}

async function updateLocation() {
    try {
        const response = await fetch('https://ip-api.com/json/');
        const data = await response.json();

        if (data.status === 'success') {
            // Update the city name in your weather section
            document.getElementById('weather-city').textContent = data.city;
            document.getElementById('weather-city').classList.remove("hidden");
            console.log(`System Location: ${data.city}, ${data.country}`);

            fetchWeather(data);
            setInterval(() => fetchWeather(data), 1800000);
        }
    } catch (err) {
        console.warn("Could not fetch location:", err);
        document.getElementById('weather-city').classList.add("hidden");
        document.getElementById('weather-temp').classList.add("hidden");
        document.getElementById('weather-city').classList.add("hidden");
    }
}

async function fetchWeather({ city, lat: latitude, lon: longitude }) {
    try {
        document.getElementById('weather-city').textContent = city;

        // Step 2: Get Weather from Open-Meteo using those coordinates
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherRes.json();

        const temp = Math.round(weatherData.current_weather.temperature);
        const code = weatherData.current_weather.weathercode;

        // Step 3: Update UI
        document.getElementById('weather-temp').textContent = `${temp}°`;
        updateWeatherIcon(code);
        document.getElementById('weather-temp').classList.remove("hidden");

    } catch (err) {
        console.error("Weather fetch failed:", err);
        document.getElementById('weather-city').textContent = "Offline";
        document.getElementById('weather-city').classList.remove("hidden");
    }
}

// Mapping WMO Weather Codes to Font Awesome Icons
function updateWeatherIcon(code) {
    const icon = document.getElementById('weather-icon');
    icon.className = "fa-solid text-xl "; // Reset classes

    // WMO Codes: 0 = Clear, 1-3 = Partly Cloudy, 45-48 = Fog, 51-67 = Rain, 71-77 = Snow
    if (code === 0) {
        icon.classList.add('fa-sun', 'text-yellow-400');
    } else if (code <= 3) {
        icon.classList.add('fa-cloud-sun', 'text-gray-300');
    } else if (code >= 51 && code <= 67) {
        icon.classList.add('fa-cloud-showers-heavy', 'text-blue-400');
    } else if (code >= 71 && code <= 77) {
        icon.classList.add('fa-snowflake', 'text-blue-200');
    } else {
        icon.classList.add('fa-cloud', 'text-gray-400');
    }
}

updateLocation();

setInterval(updateWeatherTheme, 20000);

updateWeatherTheme();

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return "just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return date.toLocaleDateString(); // Fallback for very old notifications
}

window.NotificationManager = {
    notifications: [],

    notify({ title, message, icon = 'fa-info-circle', onClick = null, onDismiss = null }) {
        const id = Date.now() + Math.random();
        const timestamp = new Date(); // Capture exact time of creation
        const notification = { id, title, message, icon, onClick, onDismiss, timestamp };

        this.notifications.unshift(notification); // Add to start of array
        this.render();
        return id;
    },

    dismiss(id, silent = false) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            const n = this.notifications[index];
            if (n.onDismiss && !silent) n.onDismiss();
            this.notifications.splice(index, 1);
            this.render();
        }
    },

    clearAll() {
        this.notifications.forEach(n => { if (n.onDismiss) n.onDismiss(); });
        this.notifications = [];
        this.render();
    },

    render() {
        const container = document.getElementById('notification-list');
        // const emptyState = document.getElementById('no-notifications');

        // Clear current UI
        container.querySelectorAll('.notif-item').forEach(el => el.remove());

        if (this.notifications.length === 0) {
            // emptyState.classList.remove('hidden');
            return;
        }
        // emptyState.classList.add('hidden');

        this.notifications.forEach(n => {
            const div = document.createElement('div');
            const timeAgo = getTimeAgo(n.timestamp);
            div.className = "notif-item bg-[#2d2d2d] hover:bg-[#353535] p-4 rounded-[18px] transition-all group relative cursor-pointer active:scale-[0.98] border border-white/5 shadow-lg";

            div.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-5 h-5 bg-white/10 rounded flex items-center justify-center">
                            <i class="fa-solid ${n.icon} text-[10px] text-gray-300"></i>
                        </div>
                        <span class="text-[12px] font-bold text-gray-200">notify-send</span>
                        <span class="text-[11px] text-gray-500 font-medium ml-1">${timeAgo}</span>
                    </div>
                    
                    <button class="dismiss-btn w-6 h-6 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <i class="fa-solid fa-xmark text-[10px] text-gray-300"></i>
                    </button>
                </div>

                <div class="pl-0">
                    <p class="text-[14px] font-semibold text-white leading-tight">${n.title}</p>
                    <p class="text-[13px] text-gray-400 mt-1 leading-normal">${n.message}</p>
                </div>
            `;

            // Handle Click on body
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                if (n.onClick) n.onClick();
                this.dismiss(n.id, true);
            });

            // Handle Dismissal
            div.querySelector('.dismiss-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.dismiss(n.id);
            });

            container.appendChild(div);
        });
    }
};

setInterval(() => {
    const shade = document.getElementById('notification-shade');
    // Only re-render if the shade is actually open to save performance
    if (!shade.classList.contains('hidden')) {
        window.NotificationManager.render();
    }
}, 1000);

// Global shorthand
window.notify = (params) => window.NotificationManager.notify(params);