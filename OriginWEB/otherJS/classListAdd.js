let hideTimeouts_open_close = {};

function addClassAnim(target, mode = "flex", className = "open") {
    const el = typeof target === "string" ? document.getElementById(target) : target;
    if (!el) return;

    const id = el.id;

    if (hideTimeouts_open_close[id]) {
        clearTimeout(hideTimeouts_open_close[id]);
        hideTimeouts_open_close[id] = null;
    }

    el.style.display = mode;

    requestAnimationFrame(() => {
        el.classList.remove("close");
        el.classList.add(className);
    });
}

function removeClassAnim(target, mode = "none", className = "open") {
    const el = typeof target === "string" ? document.getElementById(target) : target;
    if (!el) return;

    const id = el.id;

    el.classList.remove(className);

    hideTimeouts_open_close[id] = setTimeout(() => {
        el.style.display = mode;
        hideTimeouts_open_close[id] = null;
    }, 700 * speed);
}
