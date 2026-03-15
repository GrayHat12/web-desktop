const DockManager = {
    container: document.getElementById('dock-container'),

    peek() {
        this.show();
        this.hideTimeout = setTimeout(() => this.hide(), 2500);
    },

    hide() {
        if (!this.container.matches(':hover')) {
            this.container.classList.remove('visible');
        }
    },

    show() {
        this.container.classList.add('visible');
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
    },

    registerApp(win, title, url, appId) {
        const dockId = `dock-${appId}`;
        let icon = document.getElementById(dockId);

        if (!icon) {

            let iconUrl = new URL("https://www.google.com/s2/favicons");
            iconUrl.searchParams.append("sz", "64");
            iconUrl.searchParams.append("url", url);
            iconUrl.searchParams.append("domain", (new URL(url)).hostname);

            icon = document.createElement('div');
            icon.id = dockId;
            icon.title = title;
            icon.className = "dock-app-icon group flex-col items-center relative w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all hover:-translate-y-2 active:scale-90 border border-white/5";
            icon.innerHTML = `
              <img src = "${iconUrl}" class="w-11 h-11 object-contain pointer-events-none" style = "filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));" >
                    <div class="active-dot absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full opacity-100"></div>
            `;

            // Hover Effects for Title
            // icon.onmouseenter = () => {
            //     // this.tooltip.textContent = title;
            //     // this.tooltip.style.opacity = "1";
            //     // Position tooltip above this icon
            //     // const rect = icon.getBoundingClientRect();
            //     // const containerRect = this.container.getBoundingClientRect();
            //     // this.tooltip.style.left = (rect.left - containerRect.left + rect.width / 2) + "px";
            // };
            // icon.onmouseleave = () => this.tooltip.style.opacity = "0";

            // Toggle Minimize/Restore Logic
            icon.onclick = () => {
                if (win.style.display === "none" || win.style.opacity === "0") {
                    this.restore(win);
                } else {
                    // If it's open but not focused, bring to front. If focused, minimize.
                    if (parseInt(win.style.zIndex) < highestZ) {
                        win.style.zIndex = ++highestZ;
                    } else {
                        this.minimize(win);
                    }
                }
            };

            this.container.appendChild(icon);

            // Inside DockManager.registerApp, after icon is created:
            icon.oncontextmenu = (e) => {
                const isMinimized = win.style.display === "none";
                const isMaximized = win.classList.contains('is-maximized');

                const items = [
                    {
                        label: isMinimized ? 'Restore' : 'Minimize',
                        action: () => isMinimized ? this.restore(win) : this.minimize(win)
                    },
                    {
                        label: isMaximized ? 'Unmaximize' : 'Maximize',
                        action: () => win.querySelector('.max-btn').click()
                    },
                    'separator',
                    {
                        label: 'Close',
                        action: () => win.querySelector('.close-btn').click()
                    }
                ];
                ContextMenu.show(e, items);
            };
        }
        this.peek();
        return icon;
    },

    minimize(win) {
        win.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
        win.style.transform = "scale(0.3) translateY(1000px)";
        win.style.opacity = "0";
        setTimeout(() => { win.style.display = "none"; }, 400);
    },

    restore(win) {
        win.style.display = "flex";
        setTimeout(() => {
            win.style.zIndex = ++highestZ;
            win.style.transform = "scale(1) translateY(0)";
            win.style.opacity = "1";
        }, 10);
    },

    removeApp(appId) {
        const dockId = `dock-${appId}`;
        const icon = document.getElementById(dockId);
        if (icon) icon.remove();
        this.peek();
    }
};

let dockLeaveTimeout;

document.addEventListener('mousemove', (e) => {
    const windowHeight = window.innerHeight;
    const mouseY = e.clientY;

    const isNearBottom = (windowHeight - mouseY) < 80;

    if (isNearBottom || DockManager.container.matches(':hover')) {
        clearTimeout(dockLeaveTimeout);
        DockManager.show();
    } else {
        clearTimeout(dockLeaveTimeout);
        dockLeaveTimeout = setTimeout(() => {
            DockManager.hide();
        }, 200);
    }
});