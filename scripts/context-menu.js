const ContextMenu = {
    el: document.getElementById('context-menu'),

    show(e, items) {
        e.preventDefault();
        this.el.innerHTML = '';

        items.forEach(item => {
            if (item === 'separator') {
                const sep = document.createElement('div');
                sep.className = "h-[1px] bg-white/10 my-1 mx-2";
                this.el.appendChild(sep);
                return;
            }

            const div = document.createElement('div');
            div.className = "px-3 py-2 hover:bg-blue-600 flex items-center justify-between cursor-default transition-colors mx-1 rounded-md";
            div.innerHTML = `<span>${item.label}</span> <span class="opacity-40 text-[10px]">${item.hint || ''}</span>`;
            div.onclick = () => {
                item.action();
                this.hide();
            };
            this.el.appendChild(div);
        });

        this.el.classList.remove('hidden');

        // Positioning logic (keep inside viewport)
        let x = e.clientX;
        let y = e.clientY;
        if (x + this.el.offsetWidth > window.innerWidth) x -= this.el.offsetWidth;
        if (y + this.el.offsetHeight > window.innerHeight) y -= this.el.offsetHeight;

        this.el.style.left = `${x}px`;
        this.el.style.top = `${y}px`;
    },

    hide() {
        this.el.classList.add('hidden');
    }
};

// Hide menu on any click outside
document.addEventListener('click', () => ContextMenu.hide());
document.addEventListener('scroll', () => ContextMenu.hide());