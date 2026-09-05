const allApp = document.getElementById("allAppIconScreen");
const wallpaperHome = document.getElementById("wallpaperHome");

let timeOutClosingApp = [];
let timeOutOpeningApp = [];
let currentOpeningElApp = null;
let currentOpeningEl = null;

const APP_DISPLAY_SELECTOR = ".appDisplay";
const OPEN_CLASS = "open";
const HIDDEN_CLASS = "hidden";

const OPEN_POINTER_DELAY = 300;
const CLOSE_DELAY_DEFAULT = 900;
const CLOSE_DELAY_SCRIPT = 1000;
const CLOSE_TO_CENTER_DURATION = 600;
const OPEN_SWITCH_DURATION = 600;
const OPEN_ISLAND_DURATION = 800;
const OPEN_ISLAND_TIMEOUT = 800;
const OPEN_CAMERA_DURATION = 800;
const OPEN_CAMERA_TIMEOUT = 800;

const MAX_PULL_Y = 160;
const SCALE_DIVISOR = 320;

const EASING_SMOOTH = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASING_BOUNCE = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const EASING_GENTLE = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";

let pendingCloseScript = null;
let closeDelay = CLOSE_DELAY_DEFAULT;
let closeToCenterCheck = defaultCloseToCenterCheck;

function getAppDisplay(appEl) {
    return appEl.querySelector(APP_DISPLAY_SELECTOR);
}

function clearTimer(store, id) {
    const t = store[id];
    if (!t) return;
    clearTimeout(t);
    store[id] = null;
}

function setOpenClasses(appEl, isOpen) {
    allApp.classList.toggle(OPEN_CLASS, isOpen);
    wallpaperHome.classList.toggle(OPEN_CLASS, isOpen);
    if (appEl) appEl.classList.toggle(OPEN_CLASS, isOpen);
}

function hideIcon(iconEl, hide) {
    if (!iconEl) return;
    iconEl.classList.toggle(HIDDEN_CLASS, hide);
}

function setScrollPointerEvents(enabled) {
    scrollAppScreen.style.pointerEvents = enabled ? "" : "none";
}

function runOpenScript(appId) {
    removeScript(`/OriginWEB/appData/${appId}/js/close/close.js`);
    runScript(`/OriginWEB/appData/${appId}/js/open/open.js`);
}

function runCloseScript(appId) {
    removeScript(`/OriginWEB/appData/${appId}/js/open/open.js`);
    runScript(`/OriginWEB/appData/${appId}/js/close/close.js`);
}

function cancelStoredAnimation(appEl) {
    const anim = appAnimations[appEl.id];
    if (!anim) return;
    anim.cancel();
    delete appAnimations[appEl.id];
}

function setStoredAnimation(appEl, anim, onfinish) {
    cancelStoredAnimation(appEl);
    appAnimations[appEl.id] = anim;
    anim.onfinish = () => {
        if (onfinish) onfinish();
        delete appAnimations[appEl.id];
    };
}

function cancelElementAnimation(appEl) {
    if (!appEl || !appEl.anim) return;
    appEl.anim.onfinish = null;
    appEl.anim.cancel();
    appEl.anim = null;
}

function defaultCloseToCenterCheck() {
    if (!currentOpeningEl) return false;
    return isVisuallyInsidePhone(currentOpeningEl.parentElement);
}

function shouldCloseToCenterByParent() {
    if (!currentOpeningEl || !currentOpeningEl.parentElement) return false;
    const parent = currentOpeningEl.parentElement;
    return parent != currentAppScreen && parent.id != "favApp";
}

function addScriptForCloseApp(script) {
    pendingCloseScript = script;
    closeDelay = CLOSE_DELAY_SCRIPT;
    closeToCenterCheck = shouldCloseToCenterByParent;
}

function openApp(el) {
    currentOpeningEl = el;
    currentOpeningElApp = document.getElementById(currentOpeningEl.dataset.app);
    if (currentOpeningElApp.classList.contains("multiClick")) {
        currentOpeningElApp.classList.remove("multiClick");
    }
    const appDisplay = getAppDisplay(currentOpeningElApp);

    currentOpeningElApp.style.transition = ``;

    setOpenClasses(currentOpeningElApp, true);
    appDisplay.style.display = "flex";

    hideIcon(currentOpeningEl, true);
    setScrollPointerEvents(false);

    clearTimer(timeOutClosingApp, currentOpeningElApp.id);

    const appEl = currentOpeningElApp;
    timeOutOpeningApp[appEl.id] = setTimeout(() => {
        appEl.style.pointerEvents = "auto";
        timeOutOpeningApp[appEl.id] = null;
    }, OPEN_POINTER_DELAY * speed);

    runOpenScript(currentOpeningEl.dataset.app);
}

let scaleAllAppReverse = 1 / 0.86;
function closeApp() {
    const didClose = doCloseApp({
        delayMs: closeDelay * speed,
        shouldCloseToCenter: closeToCenterCheck,
        afterClose: pendingCloseScript,
    });
    if (didClose) pendingCloseScript = null;
}

function doCloseApp({delayMs, shouldCloseToCenter, afterClose}) {
    if (!currentOpeningElApp || !currentOpeningEl) return false;

    if (shouldCloseToCenter && shouldCloseToCenter()) {
        closeAppToCenter();
        return false;
    }

    const appEl = currentOpeningElApp;
    const iconEl = currentOpeningEl;
    const appDisplay = getAppDisplay(appEl);

    appEl.style.transition = ``;
    appEl.style.transform = ``;

    currentOpeningElApp = null;
    currentOpeningEl = null;

    setOpenClasses(appEl, false);

    clearTimer(timeOutOpeningApp, appEl.id);

    appEl.style.pointerEvents = ``;

    timeOutClosingApp[appEl.id] = setTimeout(() => {
        appDisplay.style.display = ``;
        hideIcon(iconEl, false);
        appEl.style.opacity = ``;
        timeOutClosingApp[appEl.id] = null;
        setScrollPointerEvents(true);
        runCloseScript(appEl.id);
    }, delayMs);

    if (afterClose) afterClose();

    return true;
}

function closeAppToCenter() {
    closeAppToCenterCore({easing: EASING_GENTLE});
}

function closeAppToCenterWithScript(script) {
    closeAppToCenterCore({easing: EASING_GENTLE, afterFinish: script});
}

function closeAppToCenterCore({easing, afterFinish}) {
    if (!currentOpeningElApp || !currentOpeningEl) return;

    const appEl = currentOpeningElApp;
    const iconEl = currentOpeningEl;
    const appDisplay = getAppDisplay(appEl);

    appEl.style.transition = `all 0s 0.4s, opacity 0s 0s`;
    appEl.style.transform = ``;

    currentOpeningElApp = null;
    currentOpeningEl = null;

    allApp.classList.remove(OPEN_CLASS);
    wallpaperHome.classList.remove(OPEN_CLASS);

    clearTimer(timeOutOpeningApp, appEl.id);

    appEl.style.pointerEvents = ``;
    appEl.style.opacity = ``;
    hideIcon(iconEl, false);

    const anim = appEl.animate(
        [
            {transform: getComputedStyle(appEl).transform, opacity: 1},
            {transform: "translateY(-60px) scale(0.6)", opacity: 0.6},
            {transform: "translateY(-200px) scale(0.02)", opacity: 0},
        ],
        {
            duration: CLOSE_TO_CENTER_DURATION * speed,
            easing: easing || EASING_GENTLE,
            composite: "replace",
        }
    );

    appEl.anim = anim;
    anim.onfinish = () => {
        appDisplay.style.display = ``;
        appEl.classList.remove(OPEN_CLASS);
        setScrollPointerEvents(true);
        runCloseScript(appEl.id);

        if (afterFinish) afterFinish();

        appEl.anim.onfinish = null;
        appEl.anim = null;
    };
}

function closeAppToLeft() {
    if (!currentOpeningElApp || !currentOpeningEl) return;

    const appEl = currentOpeningElApp;
    const iconEl = currentOpeningEl;
    const appDisplay = getAppDisplay(appEl);

    appEl.style.transition = `all 0s`;
    appEl.style.transform = ``;

    currentOpeningElApp = null;
    currentOpeningEl = null;

    allApp.classList.remove(OPEN_CLASS);
    wallpaperHome.classList.remove(OPEN_CLASS);

    clearTimer(timeOutOpeningApp, appEl.id);

    appEl.style.pointerEvents = ``;
    appEl.style.opacity = ``;
    hideIcon(iconEl, false);

    const anim = appEl.animate(
        [
            {transform: getComputedStyle(appEl).transform, opacity: 1},
            {transform: "translateX(-40%) scale(0.92)", opacity: 0.8},
            {transform: "translateX(-120%) scale(0.75)", opacity: 0},
        ],
        {
            duration: OPEN_SWITCH_DURATION * speed,
            easing: EASING_SMOOTH,
        }
    );

    setStoredAnimation(appEl, anim, () => {
        appDisplay.style.display = ``;
        appEl.classList.remove(OPEN_CLASS);
        setScrollPointerEvents(true);
        runCloseScript(appEl.id);
    });
}

function isVisuallyInsidePhone(el) {
    const e = el.getBoundingClientRect();

    return !(
        e.left >= phoneRect.left &&
        e.top >= phoneRect.top &&
        e.right <= phoneRect.right &&
        e.bottom <= phoneRect.bottom
    );
}

function updateTransform(y, x, d = "0.12") {
    const clampedY = Math.max(0, Math.min(MAX_PULL_Y, y));

    currentOpeningElApp.style.transition = `all ${d}s ${EASING_SMOOTH}`;
    currentOpeningElApp.style.transform = `translateX(${x}px) translateY(${-clampedY}px) scale(${
        1 - clampedY / SCALE_DIVISOR
    })`;
}

function resetpop() {
    currentOpeningElApp.style.transition = `all 0.6s ${EASING_BOUNCE}`;
    currentOpeningElApp.style.transform = ``;
}

let startY = 0;
let startX = 0;
let deltaY = 0;
let deltaX = 0;
let dragging = false;
let rafId = 0;
let rafDeltaY = 0;
let rafDeltaX = 0;
let rafDuration = "0.12";

function scheduleTransformUpdate(y, x, d) {
    rafDeltaY = y;
    rafDeltaX = x;
    rafDuration = d;

    if (rafId) return;
    rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!currentOpeningElApp) return;
        updateTransform(rafDeltaY, rafDeltaX, rafDuration);
    });
}

function onTouchStartNav(e) {
    if (!currentOpeningElApp) return;
    hideIcon(currentOpeningEl, true);

    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
    deltaY = 0;
    deltaX = 0;
}
function onTouchMoveNav(e) {
    e.preventDefault();
    if (!currentOpeningElApp) return;

    deltaY = startY - e.touches[0].clientY;
    deltaX = e.touches[0].clientX - startX;
    scheduleTransformUpdate(deltaY, deltaX, "0.15");
}
function onTouchEndNav() {
    if (!currentOpeningElApp) return;

    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
    }
    if (deltaY > 50) closeApp();
    else resetpop();

    deltaY = 0;
    deltaX = 0;
}
function onMouseDownNav(e) {
    deltaY = 0;
    deltaX = 0;
    startY = 0;
    startX = 0;

    if (!currentOpeningElApp) return;

    currentOpeningElApp.style.pointerEvents = "none";
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
    }
    hideIcon(currentOpeningEl, true);
    dragging = true;

    startY = e.clientY;
    startX = e.clientX;
}
function onMouseMoveNav(e) {
    if (!dragging || !currentOpeningElApp) return;
    deltaY = startY - e.clientY;
    deltaX = e.clientX - startX;

    scheduleTransformUpdate(deltaY, deltaX, "0.05");
}
function onMouseUpNav() {
    if (!dragging || !currentOpeningElApp) return;

    currentOpeningElApp.style.pointerEvents = "all";
    dragging = false;

    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
    }
    if (deltaY > 50) closeApp();
    else resetpop();
}
function addNavDragListeners() {
    nav.addEventListener("touchstart", onTouchStartNav);
    nav.addEventListener("touchmove", onTouchMoveNav, {passive: false});
    nav.addEventListener("touchend", onTouchEndNav);

    nav.addEventListener("mousedown", onMouseDownNav);
    window.addEventListener("mousemove", onMouseMoveNav);
    window.addEventListener("mouseup", onMouseUpNav);
}
function removeNavDragListeners() {
    nav.removeEventListener("touchstart", onTouchStartNav);
    nav.removeEventListener("touchmove", onTouchMoveNav);
    nav.removeEventListener("touchend", onTouchEndNav);

    nav.removeEventListener("mousedown", onMouseDownNav);
    window.removeEventListener("mousemove", onMouseMoveNav, {passive: false});
    window.removeEventListener("mouseup", onMouseUpNav);
}

function navStyle(style) {
    if (style == "buttonStyle" && nav.className != "buttonStyle") {
        removeNavDragListeners();
        nav.className = style;
        nav.onclick = function () {
            if (currentOpeningElApp) closeApp();
        };
        localStorage.setItem("nav", style);
    } else if (style == "swipe" && nav.className != "swipe") {
        addNavDragListeners();
        nav.className = style;
        nav.onclick = null;
        localStorage.setItem("nav", style);
    }
}

const appAnimations = {};

function setupOpenById(idApp, transitionValue) {
    currentOpeningElApp = document.getElementById(idApp);
    currentOpeningEl = document.querySelector(`[data-app='${idApp}']`);
    const appEl = currentOpeningElApp;
    const appDisplay = getAppDisplay(appEl);

    appEl.style.transition = transitionValue;

    setOpenClasses(appEl, true);
    appDisplay.style.display = "flex";

    hideIcon(currentOpeningEl, true);
    setScrollPointerEvents(false);

    clearTimer(timeOutClosingApp, appEl.id);

    appEl.style.pointerEvents = "auto";

    return {appEl, iconEl: currentOpeningEl, appDisplay};
}

function openAppByID(idApp) {
    if (isLock) {
        showPasswordScreen(() => {
            hiddenLockScreen();
            openAppByID(idApp);
        }, `Enter password to open ${document.querySelector(`[data-app='${idApp}'] label`).textContent.trim()} app`);
        return;
    }
    const hadNoOpenApp = !currentOpeningElApp;
    const switchingApp = currentOpeningElApp && currentOpeningElApp.id != idApp;
    if (switchingApp) {
        closeAppToLeft();
    }

    const {appEl} = setupOpenById(idApp, "none");

    cancelStoredAnimation(appEl);

    if (switchingApp) {
        const anim = appEl.animate(
            [
                {transform: "translateX(200px) scale(0.88)", opacity: 0.5},
                {transform: "translateX(100px) scale(0.93)", opacity: 0.75},
                {transform: "translateX(30px) scale(0.97)", opacity: 0.92},
                {transform: "scale(1)", opacity: 1},
            ],
            {
                duration: OPEN_SWITCH_DURATION * speed,
                easing: EASING_SMOOTH,
            }
        );
        setStoredAnimation(appEl, anim, () => {
            runOpenScript(appEl.id);
        });
    } else if (hadNoOpenApp) {
        const anim = appEl.animate(
            [
                {transform: "scale(0.75)", opacity: 0},
                {transform: "scale(0.88)", opacity: 0.4},
                {transform: "scale(0.96)", opacity: 0.75},
                {transform: "scale(1.02)", opacity: 0.95},
                {transform: "scale(1)", opacity: 1},
            ],
            {
                duration: OPEN_SWITCH_DURATION * speed,
                easing: EASING_BOUNCE,
                composite: "replace",
            }
        );
        setStoredAnimation(appEl, anim, () => {
            runOpenScript(appEl.id);
        });
    }
}

function openAppByIDFromIslandWithScript(idApp, script) {
    if (dragTarget) pointerUpIconWhileDragIconNoAnim();
    if (isLock) {
        showPasswordScreen(() => {
            hiddenLockScreen();
            openAppByIDFromIslandWithScript(idApp, script);
        }, `Enter password to open ${document.querySelector(`[data-app='${idApp}'] label`).textContent.trim()} app`);
        return;
    }
    const hadNoOpenApp = !currentOpeningElApp;
    const switchingApp = currentOpeningElApp && currentOpeningElApp.id != idApp;

    if (switchingApp) {
        closeAppToLeft();
    }

    const {appEl} = setupOpenById(idApp, "none");

    cancelStoredAnimation(appEl);

    if (switchingApp) {
        const anim = appEl.animate(
            [
                {transform: "translateX(110%) scale(0.88)", opacity: 0.4},
                {transform: "translateX(60%) scale(0.93)", opacity: 0.65},
                {transform: "translateX(25%) scale(0.97)", opacity: 0.85},
                {transform: "scale(1)", opacity: 1},
            ],
            {
                duration: OPEN_SWITCH_DURATION * speed,
                easing: EASING_SMOOTH,
            }
        );
        setStoredAnimation(appEl, anim, () => {
            runOpenScript(appEl.id);
        });
    } else if (hadNoOpenApp) {
        appEl.classList.remove("animationAppOpenFromIsland");
        requestAnimationFrame(() => {
            appEl.classList.add("animationAppOpenFromIsland");
        });
        const anim = appEl.animate([], {
            duration: OPEN_ISLAND_DURATION * speed,
            easing: EASING_SMOOTH,
            composite: "replace",
        });
        appAnimations[appEl.id] = anim;

        timeOutOpeningApp[appEl.id] = setTimeout(() => {
            runOpenScript(appEl.id);
            timeOutOpeningApp[appEl.id] = null;
            delete appAnimations[appEl.id];
        }, OPEN_ISLAND_TIMEOUT * speed);
        setTimeout(() => {
            appEl.classList.remove("animationAppOpenFromIsland");
        }, OPEN_ISLAND_TIMEOUT * speed);
    }

    if (script) script();
}
const cameraBtn = document.querySelector(".cameraBtn");
cameraBtn.addEventListener("click", (e) => {
    if (dragTarget) pointerUpIconWhileDragIconNoAnim();
    openAppByIDFromCameraBtn(document.querySelector(".cameraBtn").dataset.appcamerabtn);
});

function openAppByIDFromCameraBtn(idApp) {
    if (!idApp) return;
    if (isLock) {
        showPasswordScreen(() => {
            hiddenLockScreen();
            openAppByIDFromCameraBtn(idApp);
        }, `Enter password to open ${document.querySelector(`[data-app='${idApp}'] label`).textContent.trim()} app`);
        return;
    }
    const hadNoOpenApp = !currentOpeningElApp;
    const switchingApp = currentOpeningElApp && currentOpeningElApp.id != idApp;
    if (switchingApp) {
        closeAppToLeft();
    }

    const {appEl} = setupOpenById(idApp, "none");

    cancelElementAnimation(appEl);
    cancelStoredAnimation(appEl);

    if (switchingApp) {
        const anim = appEl.animate(
            [
                {transform: "translateX(110%) scale(0.88)", opacity: 0.4},
                {transform: "translateX(60%) scale(0.93)", opacity: 0.65},
                {transform: "translateX(25%) scale(0.97)", opacity: 0.85},
                {transform: "scale(1)", opacity: 1},
            ],
            {
                duration: OPEN_SWITCH_DURATION * speed,
                easing: EASING_SMOOTH,
            }
        );
        setStoredAnimation(appEl, anim, () => {
            runOpenScript(appEl.id);
        });
    } else if (hadNoOpenApp) {
        appEl.classList.remove("animationAppOpenFromCameraBtn");
        requestAnimationFrame(() => {
            appEl.classList.add("animationAppOpenFromCameraBtn");
        });
        const anim = appEl.animate([], {
            duration: OPEN_CAMERA_DURATION * speed,
            easing: EASING_SMOOTH,
            composite: "replace",
        });
        appAnimations[appEl.id] = anim;

        timeOutOpeningApp[appEl.id] = setTimeout(() => {
            timeOutOpeningApp[appEl.id] = null;
            delete appAnimations[appEl.id];
            runOpenScript(appEl.id);
        }, OPEN_CAMERA_TIMEOUT * speed);

        setTimeout(() => {
            appEl.classList.remove("animationAppOpenFromCameraBtn");
        }, OPEN_CAMERA_TIMEOUT * speed);
    }
}
function cancelIfAnimating(el) {
    if (!el) return false;

    const animations = el.getAnimations();

    if (animations.length === 0) return false;

    animations.forEach((anim) => anim.cancel());

    el.style.transition = "none";
    el.offsetHeight;

    return true;
}
