const getAppId = (url) => {
    return 'app-' + url.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

const appRegistry = [
    { url: "https://grayhat12.github.io/sand-sim/", getAppId() { return getAppId(this.url) }, repository: "https://github.com/GrayHat12/sand-sim" },
    { url: "https://grayhat12.github.io/pykachu", getAppId() { return getAppId(this.url) }, repository: "https://github.com/GrayHat12/pykachu" },
    { url: "https://grayhat12.github.io/electoral-bonds/", getAppId() { return getAppId(this.url) }, repository: "https://github.com/GrayHat12/electoral-bonds" },
    { url: "https://grayhat12.github.io/json-ops/", getAppId() { return getAppId(this.url) }, repository: "https://github.com/GrayHat12/json-ops" },
    { url: "https://grayhat12.github.io/Prisoners-Dilemma/", getAppId() { return getAppId(this.url) }, repository: "https://github.com/GrayHat12/Prisoners-Dilemma" },
    { url: "https://grayhat12.github.io/stone-paper-scissor/", getAppId() { return getAppId(this.url) }, repository: "https://github.com/GrayHat12/stone-paper-scissor" },
    { url: "https://sinplay-inc.web.app/", getAppId() { return getAppId(this.url) }, repository: "https://github.com/GrayHat12/spotify-clone" },
    { url: "https://ping-pong-gb.netlify.app/", getAppId() { return getAppId(this.url) }, repository: "https://github.com/GrayHat12/pingpong" },
    { url: "https://grayhat12.github.io/ga-this-time-for-sure/", getAppId() { return getAppId(this.url) }, repository: "https://github.com/GrayHat12/ga-this-time-for-sure" },
    { url: "https://grayhat12.netlify.app/", getAppId() { return getAppId(this.url) }, repository: "https://github.com/GrayHat12/masterPortfolio" }
];

let highestZ = 100;

function openApp(title, url) {
    const appId = getAppId(url);
    const existingWin = document.querySelector(`.window[data-app-id="${appId}"]`);
    if (existingWin) {
        // Bring to front
        existingWin.style.zIndex = ++highestZ;
        // Restore if minimized
        if (existingWin.style.display === "none" || existingWin.style.opacity === "0") {
            DockManager.restore(existingWin);
        }
        // Visual "Feedback" nudge
        existingWin.classList.add('pulse-nudge');
        setTimeout(() => existingWin.classList.remove('pulse-nudge'), 500);
        return;
    }

    const layer = document.getElementById('window-layer');
    const template = document.getElementById('window-template');

    const clone = template.content.cloneNode(true);
    const win = clone.querySelector('.window');
    win.setAttribute('data-app-id', appId);
    layer.appendChild(win);


    let isMaximized = false;
    let prevRect = null;

    const maxBtn = win.querySelector('.max-btn');
    const minBtn = win.querySelector('.min-btn');
    const closeBtn = win.querySelector('.close-btn');
    const header = win.querySelector('.window-header');
    const iframe = win.querySelector('iframe');
    const titleSpan = win.querySelector('.window-title');
    const reloadBtn = win.querySelector('.reload-btn');

    titleSpan.textContent = title;
    iframe.src = url;
    iframe.classList.add('opacity-0', 'transition-opacity', 'duration-500');
    iframe.onload = () => iframe.classList.remove('opacity-0');

    win.style.zIndex = ++highestZ;
    const randomOffset = Math.random() * 50;
    win.style.top = (100 + randomOffset) + "px";
    win.style.left = (100 + randomOffset) + "px";
    win.style.width = "800px";
    win.style.height = "600px";

    const shield = document.createElement('div');
    shield.className = "absolute inset-0 z-20 hidden";
    win.appendChild(shield);

    DockManager.registerApp(win, title, url, appId);

    reloadBtn.onmousedown = (e) => e.stopPropagation();
    reloadBtn.onclick = (e) => {
        e.stopPropagation();

        // Add a cool spin animation to the icon
        const icon = reloadBtn.querySelector('i');
        icon.classList.add('rotate-180');
        setTimeout(() => icon.classList.remove('rotate-180'), 500);

        // Reset the iframe source to trigger a reload securely
        iframe.src = url;
    };

    closeBtn.onmousedown = (e) => e.stopPropagation();
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        DockManager.removeApp(appId);
        win.style.transform = "scale(0.95)";
        win.style.opacity = "0";
        win.style.transition = "all 0.1s ease";
        setTimeout(() => win.remove(), 100);
    };
    maxBtn.onmousedown = (e) => e.stopPropagation();
    maxBtn.onclick = (e) => {
        console.log('clicked maximize')
        e.stopPropagation();
        win.classList.toggle('is-maximized');
        if (!isMaximized) {
            prevRect = win.getBoundingClientRect();
            win.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
            win.style.top = "36px"; // Height of your top nav
            win.style.left = "0px";
            win.style.width = "100vw";
            win.style.height = "calc(100vh - 36px)";
            win.classList.add('rounded-none');
            maxBtn.querySelector('i').classList.replace('fa-expand', 'fa-compress');
        } else {
            win.style.top = prevRect.top + "px";
            win.style.left = prevRect.left + "px";
            win.style.width = prevRect.width + "px";
            win.style.height = prevRect.height + "px";
            win.classList.remove('rounded-none');
            maxBtn.querySelector('i').classList.replace('fa-compress', 'fa-expand');
        }
        isMaximized = !isMaximized;
        // Clean up transition after animation so dragging isn't laggy
        setTimeout(() => { win.style.transition = "none"; }, 300);
    };
    minBtn.onmousedown = (e) => e.stopPropagation();
    minBtn.onclick = (e) => {
        e.stopPropagation();
        DockManager.minimize(win);
    };

    header.onmousedown = (e) => {
        win.style.zIndex = ++highestZ;
        shield.classList.remove('hidden');

        let shiftX = e.clientX - win.getBoundingClientRect().left;
        let shiftY = e.clientY - win.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            win.style.left = pageX - shiftX + 'px';
            win.style.top = pageY - shiftY + 'px';
        }

        const offsetX = -0;
        const offsetY = -0;

        function onMouseMove(event) {
            const TOP_BAR_HEIGHT = 60; // Height of your nav bar
            let newTop = event.clientY - offsetY;
            let newLeft = event.clientX - offsetX;

            // Constrain Top
            if (newTop < TOP_BAR_HEIGHT) newTop = TOP_BAR_HEIGHT;

            // Constrain Bottom (Optional: keep at least some of the header visible)
            if (newTop > window.innerHeight - 40) newTop = window.innerHeight - 40;

            moveAt(newLeft, newTop);
        }

        document.addEventListener('mousemove', onMouseMove);

        document.onmouseup = () => {
            document.removeEventListener('mousemove', onMouseMove);
            shield.classList.add('hidden');
            document.onmouseup = null;
        };
    };

    const resizers = win.querySelectorAll('.resizer');

    resizers.forEach(resizer => {
        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Bring window to front and activate shield
            win.style.zIndex = ++highestZ;
            shield.classList.remove('hidden');

            const rect = win.getBoundingClientRect();
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = rect.width;
            const startHeight = rect.height;
            const startLeft = rect.left;
            const startTop = rect.top;

            // Remove transition for lag-free dragging
            const oldTransition = win.style.transition;
            win.style.transition = 'none';

            function onMouseMove(moveEvent) {
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;

                // if (resizer.classList.contains('resizer-n') || resizer.classList.contains('resizer-nw') || resizer.classList.contains('resizer-ne')) {
                const TOP_BAR_HEIGHT = 40;
                // }

                // Determine which axis/corner is being dragged
                if (resizer.classList.contains('resizer-e') || resizer.classList.contains('resizer-ne') || resizer.classList.contains('resizer-se')) {
                    newWidth = startWidth + (moveEvent.clientX - startX);
                }
                if (resizer.classList.contains('resizer-w') || resizer.classList.contains('resizer-nw') || resizer.classList.contains('resizer-sw')) {
                    newWidth = startWidth - (moveEvent.clientX - startX);
                    newLeft = startLeft + (moveEvent.clientX - startX);
                }
                if (resizer.classList.contains('resizer-s') || resizer.classList.contains('resizer-sw') || resizer.classList.contains('resizer-se')) {
                    newHeight = startHeight + (moveEvent.clientY - startY);
                }
                if (resizer.classList.contains('resizer-n') || resizer.classList.contains('resizer-nw') || resizer.classList.contains('resizer-ne')) {
                    newHeight = startHeight - (moveEvent.clientY - startY);
                    newTop = startTop + (moveEvent.clientY - startY);
                }

                let calculatedTop = startTop + (moveEvent.clientY - startY);
                if (calculatedTop < TOP_BAR_HEIGHT) {
                    // If it hits the top bar, stop moving the top and cap the height
                    newTop = TOP_BAR_HEIGHT;
                    newHeight = startHeight + (startTop - TOP_BAR_HEIGHT);
                } else {
                    newHeight = startHeight - (moveEvent.clientY - startY);
                    newTop = calculatedTop;
                }

                // Enforce minimum limits (matches your tailwind min-w-[400px] min-h-[300px])
                const minWidth = 400;
                const minHeight = 300;

                if (newWidth >= minWidth) {
                    win.style.width = newWidth + 'px';
                    win.style.left = newLeft + 'px';
                }
                if (newHeight >= minHeight) {
                    win.style.height = newHeight + 'px';
                    win.style.top = newTop + 'px';
                }
            }

            function onMouseUp() {
                shield.classList.add('hidden');
                win.style.transition = oldTransition;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });

    win.addEventListener('mousedown', () => {
        win.style.zIndex = ++highestZ;
    });
}

async function initializeDesktop() {
    const grid = document.getElementById('desktop-grid');

    for (const { url, repository } of appRegistry) {
        // 1. Determine Title & Icon
        let title = "Loading...";
        let iconUrl = new URL("https://www.google.com/s2/favicons");
        iconUrl.searchParams.append("sz", "64");
        iconUrl.searchParams.append("url", url);
        iconUrl.searchParams.append("domain", (new URL(url)).hostname);
        // let iconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${url}`; // Reliable favicon service

        let realTitle = url.split('/').filter(Boolean).pop();

        const iconElement = document.createElement('div');
        iconElement.className = "app-icon flex flex-col items-center gap-2 w-24 p-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer group pointer-events-auto";

        iconElement.innerHTML = `
            <div class="w-16 h-16 bg-[#2d2d2d] rounded-2xl shadow-lg border border-white/5 flex items-center justify-center overflow-hidden group-active:scale-90 transition-transform">
                <img src="${iconUrl.toString()}" 
                    class="w-10 h-10 object-contain" 
                    onerror="this.parentElement.innerHTML='<i class=\'fa-solid fa-rocket text-2xl text-blue-400\'></i>'">
            </div>
            <span class="text-[12px] text-white font-medium text-center line-clamp-2 px-1 drop-shadow-md">
                ${realTitle}
            </span>
        `;

        iconElement.ondblclick = () => openApp(realTitle || title || "App", url);

        grid.appendChild(iconElement);

        // Inside the loop where desktop icons are created
        iconElement.oncontextmenu = (e) => {
            e.stopPropagation();
            ContextMenu.show(e, [
                { label: 'Open', action: () => openApp(realTitle, url) },
                { label: 'Open in New Tab', action: () => window.open(url, '_blank') },
                'separator',
                {
                    label: 'Refresh Metadata',
                    action: async () => {
                        const response = await fetch(url);
                        const text = await response.text();
                        const doc = new DOMParser().parseFromString(text, "text/html");
                        const newTitle = doc.querySelector('title')?.innerText;
                        if (newTitle) iconElement.querySelector('span').textContent = newTitle;
                    }
                },
                {
                    label: 'View Code',
                    action: () => window.open(repository, '_blank')
                }
            ]);
        };

        try {
            const response = await fetch(url);
            const text = await response.text();
            const doc = new DOMParser().parseFromString(text, "text/html");
            const fetchedTitle = doc.querySelector('title')?.innerText;
            if (fetchedTitle) {
                iconElement.querySelector('span').textContent = fetchedTitle;
                iconElement.ondblclick = () => openApp(fetchedTitle, url);
            }
        } catch (e) {
            console.warn(`CORS blocked metadata for ${url}`);
        }
    }
}

// const desktop = document.querySelector('body'); // Or whatever your wallpaper container is
document.body.oncontextmenu = (e) => {
    if (e.target !== document.body && !e.target.classList.contains('grid')) return;

    ContextMenu.show(e, [
        { label: 'Refresh Desktop', action: () => location.reload() },
        // { label: 'Change Wallpaper', action: () => alert('Wallpaper settings coming soon!') },
        'separator',
    ]);
};

initializeDesktop().then(console.log).catch(console.error);