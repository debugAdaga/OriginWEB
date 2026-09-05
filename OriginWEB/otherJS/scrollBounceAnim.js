const scrollBounceStates = new WeakMap();

/* ======================================================
   CORE FACTORY – dùng chung
====================================================== */
function createScrollCore({viewport, content, script = null, keepPosition = false, useRAF = false}) {
    // ---------------- Config ----------------
    const friction = 0.005;
    const maxVelocity = 50;
    const springK = 0.1;
    const springDamping = 0.5;
    const overscrollResistance = 0.5;
    const wheelBoost = 0.005;
    // ----------------------------------------

    let viewH = viewport.clientHeight;
    let contentH = 0;
    let minY = 0;
    let maxY = 0;

    let y = keepPosition ? viewport._scrollY ?? 0 : 0;
    let vy = 0;
    let dragging = false;
    let lastPosY = 0;
    let lastTime = 0;

    let intervalId = null;
    let raf = null;
    let animating = false;

    let startX = 0;
    let startY = 0;
    let lockDirection = null;

    /* ---------- helpers ---------- */
    const now = () => performance.now();
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    function layout() {
        viewH = viewport.clientHeight;
        contentH = content.scrollHeight;
        maxY = Math.min(0, viewH - contentH);
        if (y < maxY) y = maxY;
        if (y > minY) y = minY;
    }

    function render() {
        if (Math.abs(y) < 0.01) y = 0;
        content.style.transform = `translateY(${y}px)`;
        if (keepPosition) viewport._scrollY = y;
        if (script) script(y);
    }

    function stopAnimation() {
        animating = false;
        if (intervalId) clearInterval(intervalId);
        if (raf) cancelAnimationFrame(raf);
        intervalId = raf = null;
    }

    /* ---------- animation ---------- */
    function physicsStep(dt) {
        if (y <= minY && y >= maxY) {
            const sign = Math.sign(vy);
            const vMag = Math.max(0, Math.abs(vy) - friction * dt);
            vy = sign * vMag;
            y += vy * dt;

            if (y > minY) {
                const d = y - minY;
                vy += (-springK * d - springDamping * vy) * dt;
            } else if (y < maxY) {
                const d = y - maxY;
                vy += (-springK * d - springDamping * vy) * dt;
            }
        } else {
            const target = y > minY ? minY : maxY;
            y += (target - y) * 0.07;
            vy = 0;
        }
    }

    function startAnimation() {
        if (useRAF) {
            if (raf) return;
            let tPrev = now();

            const step = () => {
                const t = now();
                let dt = t - tPrev;
                if (dt > 32) dt = 32;
                tPrev = t;

                if (!dragging) physicsStep(dt);
                render();

                if (!dragging && Math.abs(vy) < 0.02 && y <= minY && y >= maxY) {
                    vy = 0;
                    stopAnimation();
                    return;
                }
                raf = requestAnimationFrame(step);
            };
            raf = requestAnimationFrame(step);
        } else {
            if (animating) return;
            animating = true;
            let tPrev = now();

            intervalId = setInterval(() => {
                const t = now();
                let dt = t - tPrev;
                if (dt > 32) dt = 32;
                tPrev = t;

                if (!dragging) physicsStep(dt);
                render();

                if (!dragging && Math.abs(vy) < 0.02 && y <= minY && y >= maxY) {
                    vy = 0;
                    stopAnimation();
                }
            }, 10);
        }
    }

    /* ---------- pointer ---------- */
    function onPointerDown(py) {
        dragging = true;
        stopAnimation();
        lastPosY = py;
        lastTime = now();
        vy = 0;
    }

    function onPointerMove(py) {
        if (!dragging) return;
        const t = now();
        const dt = Math.max(1, t - lastTime);
        const dy = py - lastPosY;

        const beyondTop = y >= minY && dy > 0;
        const beyondBottom = y <= maxY && dy < 0;
        y += dy * (beyondTop || beyondBottom ? overscrollResistance : 1);

        vy = vy * 0.8 + (dy / dt) * 0.2;
        lastPosY = py;
        lastTime = t;
        render();
    }

    function onPointerUp() {
        if (!dragging) return;
        dragging = false;
        vy = clamp(vy, -maxVelocity, maxVelocity);
        startAnimation();
    }

    /* ---------- events ---------- */
    function onTouchStart(e) {
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        lockDirection = null;
        onPointerDown(t.clientY);
    }

    function onTouchMove(e) {
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (!lockDirection) lockDirection = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";

        if (lockDirection === "horizontal") {
            onPointerUp();
            return;
        }

        e.preventDefault();
        onPointerMove(t.clientY);
        e.stopPropagation();
    }

    function onTouchEnd() {
        if (lockDirection === "vertical") onPointerUp();
        lockDirection = null;
    }

    function onMouseDown(e) {
        onPointerDown(e.clientY);
        const move = (ev) => onPointerMove(ev.clientY);
        const up = () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
            onPointerUp();
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
        e.stopPropagation();
    }

    function onWheel(e) {
        e.preventDefault();
        vy += -e.deltaY * wheelBoost;
        if (!dragging) startAnimation();
        e.stopPropagation();
    }

    /* ---------- init ---------- */
    function relayout() {
        layout();
        render();
    }

    window.addEventListener("resize", relayout);
    viewport.addEventListener("touchstart", onTouchStart, {passive: false});
    viewport.addEventListener("touchmove", onTouchMove, {passive: false});
    viewport.addEventListener("touchend", onTouchEnd);
    viewport.addEventListener("mousedown", onMouseDown);
    viewport.addEventListener("wheel", onWheel, {passive: false});

    layout();
    render();

    return {
        stopAnimation,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        onMouseDown,
        onWheel,
        relayout,
        content,
    };
}

/* ======================================================
   PUBLIC API – GIỮ NGUYÊN TÊN
====================================================== */

function addScroll(viewport, content) {
    if (scrollBounceStates.has(viewport)) return;
    scrollBounceStates.set(viewport, createScrollCore({viewport, content}));
}

function addScrollScript(viewport, content, script = () => {}) {
    if (scrollBounceStates.has(viewport)) return;
    scrollBounceStates.set(viewport, createScrollCore({viewport, content, script}));
}

function addScrollScriptWithoutReset(viewport, content, script = () => {}) {
    if (scrollBounceStates.has(viewport)) return;
    scrollBounceStates.set(
        viewport,
        createScrollCore({
            viewport,
            content,
            script,
            keepPosition: true,
            useRAF: true,
        })
    );
}

function removeScroll(viewport, transform = "") {
    const state = scrollBounceStates.get(viewport);
    if (!state) return;

    const {stopAnimation, onTouchStart, onTouchMove, onTouchEnd, onMouseDown, onWheel, relayout, content} = state;

    stopAnimation();

    viewport.removeEventListener("touchstart", onTouchStart);
    viewport.removeEventListener("touchmove", onTouchMove);
    viewport.removeEventListener("touchend", onTouchEnd);
    viewport.removeEventListener("mousedown", onMouseDown);
    viewport.removeEventListener("wheel", onWheel);
    window.removeEventListener("resize", relayout);

    content.style.transform = transform;
    scrollBounceStates.delete(viewport);
}
