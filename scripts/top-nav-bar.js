// const audioElement = document.createElement('audio');

// document.body.appendChild(audioElement);

const cpuStat = document.getElementById('cpu-stat');
const cpuValue = document.getElementById('cpu-value');

const memStat = document.getElementById('mem-stat');
const memValue = document.getElementById('mem-value');

const tempStat = document.getElementById('temp-stat');
const tempValue = document.getElementById('temp-value');

const shade = document.getElementById('notification-shade');
const trigger = document.getElementById('date-trigger');

let currentTemp = 45;

function updateClock() {
    const now = new Date();

    // Format Date: "Mar 15"
    const dateString = now.toLocaleDateString('en-US', {
        month: "short",
        day: "2-digit"
    });

    // Format Time: "1:59 PM"
    const timeString = now.toLocaleTimeString('en-US', {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

    // Update the DOM
    document.getElementById('current-date').textContent = dateString;
    document.getElementById('current-time').textContent = timeString;
}

function updateWifiUI() {
    const wifiIcon = document.getElementById('wifi-icon');
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (!navigator.onLine) {
        wifiIcon.className = "fa-solid fa-wifi-slash opacity-30"; // Completely offline
        return;
    }

    // Default to full bars if API is not supported
    if (!connection) {
        wifiIcon.className = "fa-solid fa-wifi opacity-80";
        return;
    }

    // Logic based on downlink (Mbps) or effective connection type
    const speed = connection.downlink; // e.g., 5.5 (Mbps)
    const type = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'

    // console.log({ speed, type });

    if (type === '4g' && speed > 5) {
        wifiIcon.className = "fa-solid fa-wifi opacity-80"; // Full signal
    } else if (type === '3g' || speed > 1) {
        // Font Awesome doesn't have a 2-bar wifi icon easily, 
        // but we can simulate "weak" by lowering opacity or using a different icon
        wifiIcon.className = "fa-solid fa-wifi opacity-50";
    } else {
        wifiIcon.className = "fa-solid fa-wifi opacity-20"; // Very weak
    }
}

function getRandomUsage(state) {
    const ranges = {
        'nominal': { min: 2, max: 15 },
        'fair': { min: 16, max: 40 },
        'serious': { min: 41, max: 75 },
        'critical': { min: 76, max: 99 }
    };
    const { min, max } = ranges[state] || ranges['nominal'];
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function updateCPUUI(records) {
    const lastRecord = records[records.length - 1];
    const state = lastRecord.state; // "nominal", "fair", "serious", "critical"

    // 1. Update Color based on Fedora/GNOME palette
    cpuStat.classList.remove('text-white', 'text-yellow-400', 'text-orange-500', 'text-red-500');

    if (state === 'nominal') cpuStat.classList.add('text-white');
    else if (state === 'fair') cpuStat.classList.add('text-yellow-400');
    else if (state === 'serious') cpuStat.classList.add('text-orange-500');
    else if (state === 'critical') cpuStat.classList.add('text-red-500');

    // 2. Update the number
    cpuValue.textContent = getRandomUsage(state) + '%';

    window.currentCpuState = state;
}

function updateMemoryUI() {

    let usagePercent = 42; // Fallback "base" usage

    if (performance && performance.memory) {
        // usedHeapSize is the memory currently in use by the page
        // jsHeapSizeLimit is the total memory the browser will allow the page to use
        const used = performance.memory.usedJSHeapSize;
        const total = performance.memory.jsHeapSizeLimit;

        // We'll calculate a percentage and add a "base" offset (like 30%) 
        // to simulate a full OS memory load
        const pageUsage = (used / total) * 100;
        usagePercent = Math.min(99, Math.floor(30 + pageUsage));
    } else {
        // Random jitter if API is not supported
        usagePercent = 40 + Math.floor(Math.random() * 5);
    }

    // Update Text
    memValue.textContent = usagePercent + '%';

    // Update Color (Fedora style)
    memStat.classList.remove('text-white', 'text-yellow-400', 'text-red-500');
    if (usagePercent > 85) {
        memStat.classList.add('text-red-500');
    } else if (usagePercent > 70) {
        memStat.classList.add('text-yellow-400');
    } else {
        memStat.classList.add('text-white');
    }
}

function updateTempUI(cpuState = 'nominal') {

    // 1. Determine Target Range based on CPU Pressure
    const ranges = {
        'nominal': { min: 38, max: 52 },
        'fair': { min: 53, max: 65 },
        'serious': { min: 66, max: 80 },
        'critical': { min: 81, max: 98 }
    };

    const range = ranges[cpuState];

    // 2. Move currentTemp slowly toward the target range
    // This mimics how physical heat works (it doesn't jump instantly)
    const target = Math.floor(Math.random() * (range.max - range.min + 1) + range.min);

    if (currentTemp < target) currentTemp += 1;
    else if (currentTemp > target) currentTemp -= 1;

    // 3. Update Text
    tempValue.textContent = `${currentTemp}°C`;

    // 4. Color Logic (Fedora/GNOME)
    tempStat.classList.remove('text-white', 'text-orange-500', 'text-red-500');

    if (currentTemp > 80) {
        tempStat.classList.add('text-red-500'); // Overheating
    } else if (currentTemp > 65) {
        tempStat.classList.add('text-orange-500'); // Hot
    } else {
        tempStat.classList.add('text-white'); // Normal
    }
}

function updatePowerUI(cpuState = 'nominal') {
    const powerValue = document.getElementById('power-value');

    // Base wattage for a typical laptop at idle
    let baseWatts = 12.5;
    let multiplier = 1.0;

    // Adjust based on CPU pressure states
    switch (cpuState) {
        case 'nominal': multiplier = 1.2; break;
        case 'fair': multiplier = 2.5; break;
        case 'serious': multiplier = 4.0; break;
        case 'critical': multiplier = 6.5; break;
    }

    // Add a tiny bit of random jitter (0.1 to 0.5) to keep it "live"
    const jitter = Math.random() * 0.5;
    const finalWatts = (baseWatts * multiplier) + jitter;

    // Display with 1 decimal place (e.g., 27.4 W)
    powerValue.textContent = `${finalWatts.toFixed(1)} W`;
}

trigger.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents immediate closing
    // console.log(shade.classList);
    shade.classList.toggle('top-10');

    // Update the full date inside the shade when opened
    const now = new Date();
    document.getElementById('shade-day-name').textContent = now.toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById('shade-full-date').textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
});

// Close shade when clicking on the background (the desktop)
document.addEventListener('click', (e) => {
    if (!shade.contains(e.target) && !trigger.contains(e.target)) {
        shade.classList.remove('top-10');
        shade.classList.add('-top-full');
    }
});

setInterval(updateMemoryUI, 5000);
updateMemoryUI();

setInterval(() => {
    updateTempUI(window.currentCpuState || 'nominal');
}, 5000);
setInterval(() => {
    updatePowerUI(window.currentCpuState || 'nominal');
}, 3000);

updatePowerUI();
updateTempUI();

try {
    if (window.PressureObserver) {
        const observer = new PressureObserver(updateCPUUI);
        observer.observe("cpu", {
            sampleInterval: 5000, // 1000ms
        }).then(console.log).catch(console.error);
        console.log(observer);
    } else {
        console.warn("PressureObserver not supported");
        cpuValue.remove();
        cpuStat.remove();
    }
} catch (error) {
    console.error(error);
}


// Add the listener for live changes
if (navigator.connection) {
    navigator.connection.addEventListener('change', updateWifiUI);
}
window.addEventListener('online', updateWifiUI);
window.addEventListener('offline', updateWifiUI);

updateWifiUI();

setInterval(updateWifiUI, 1000);

// function updateVolumeUI(level) {
//     console.log('got level', level);
//     const volIcon = document.getElementById('volume-icon');

//     // Remove all possible volume classes first
//     volIcon.classList.remove('fa-volume-high', 'fa-volume-low', 'fa-volume-off', 'fa-volume-xmark', 'fa-volume');

//     if (level === 0) {
//         volIcon.classList.add('fa-volume-xmark');
//     } else if (level < 33) {
//         volIcon.classList.add('fa-volume-low');
//     } else if (level < 66) {
//         volIcon.classList.add('fa-volume');
//     } else {
//         volIcon.classList.add('fa-volume-high');
//     }
// }

// audioElement.addEventListener('volumechange', (event) => {
//     updateVolumeUI(event.target.volume * 100);
//     console.log("volume changed", event);
// });

// updateVolumeUI(audioElement.volume * 100);


if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        function updateBatteryUI() {
            // Convert decimal (0.76) to percentage (76%)
            const level = Math.round(battery.level * 100);
            document.getElementById('battery-percent').textContent = level + '%';

            // Optional: Change icon based on charging status
            const bolt = document.getElementById('charging-bolt');
            const icon = document.getElementById('battery-icon');

            if (battery.charging) {
                bolt.classList.remove('hidden');
            } else {
                bolt.classList.add('hidden');
            }

            // Logic to change battery icon based on level
            if (level > 80) icon.className = "fa-solid fa-battery-full rotate-270";
            else if (level > 50) icon.className = "fa-solid fa-battery-three-quarters rotate-270";
            else if (level > 20) icon.className = "fa-solid fa-battery-half rotate-270";
            else icon.className = "fa-solid fa-battery-empty rotate-270 text-red-500";
        }

        // Initial call
        updateBatteryUI();

        // Listen for changes (unplugging, level drops, etc.)
        battery.addEventListener('levelchange', updateBatteryUI);
        battery.addEventListener('chargingchange', updateBatteryUI);
    });
} else {
    // Fallback for unsupported browsers
    document.getElementById('battery-percent').textContent = 'N/A';
}

// Run immediately on load
updateClock();

// Update every second (1000ms)
setInterval(updateClock, 1000);