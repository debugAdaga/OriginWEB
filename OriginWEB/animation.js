const allApp = document.getElementById("allAppIconScreen");
const wallpaperHome = document.getElementById("wallpaperHome");

let timeOutClosingApp = [];
let timeOutOpeningApp = [];
let currentOpeningElApp = null;
let currentOpeningEl = null;

const APP_DISPLAY_SELECTOR = ".appDisplay";
const OPEN_CLASS = "open";
const HIDDEN_CLASS = "hidden";

const OPEN_POINTER_DELAY = 200;
const CLOSE_DELAY_DEFAULT = 700;
const CLOSE_DELAY_SCRIPT = 800;
const CLOSE_TO_CENTER_DURATION = 400;
const OPEN_SWITCH_DURATION = 400;
const OPEN_ISLAND_DURATION = 650;
const OPEN_ISLAND_TIMEOUT = 650;
const OPEN_CAMERA_DURATION = 650;
const OPEN_CAMERA_TIMEOUT = 650;

const MAX_PULL_Y = 140;
const SCALE_DIVISOR = 280;

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
    closeAppToCenterCore({easing: null});
}

function closeAppToCenterWithScript(script) {
    closeAppToCenterCore({easing: "ease-out", afterFinish: script});
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
            {transform: getComputedStyle(appEl).transform},
            {opacity: 1},
            {transform: "translateY(-150px) scale(0.01)", opacity: 0},
        ],
        {
            duration: CLOSE_TO_CENTER_DURATION * speed,
            easing: easing || undefined,
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
            {transform: getComputedStyle(appEl).transform},
            {opacity: 1},
            {transform: "translateX(-100%) scale(0.8)", opacity: 1},
        ],
        {
            duration: OPEN_SWITCH_DURATION * speed,
            easing: "ease-out",
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

function updateTransform(y, x, d = "0.1") {
    const clampedY = Math.max(0, Math.min(MAX_PULL_Y, y));

    currentOpeningElApp.style.transition = `all ${d}s`;
    currentOpeningElApp.style.transform = `translateX(${x}px) translateY(${-clampedY}px) scale(${
        1 - clampedY / SCALE_DIVISOR
    })`;
}

function resetpop() {
    currentOpeningElApp.style.transition = `all 0.4s`;
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
let rafDuration = "0.1";

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
    scheduleTransformUpdate(deltaY, deltaX, "0.1");
}
function onTouchEndNav() {
    if (!currentOpeningElApp) return;

    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
    }
    if (deltaY > 40) closeApp();
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

    scheduleTransformUpdate(deltaY, deltaX, "0");

    // navOvlay.style.transform = `translateX(${deltaX}px) translateY(${-deltaY}px)`;
}
function onMouseUpNav() {
    if (!dragging || !currentOpeningElApp) return;

    currentOpeningElApp.style.pointerEvents = "all";
    dragging = false;

    // navOvlay.style.transform = "";
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
    }
    if (deltaY > 40) closeApp();
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

// Store running animations by app id
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
                {transform: "translateX(330px) scale(0.8)"},
                {transform: "translateX(200px) scale(0.8)"},
                {transform: "translateX(100px) scale(0.85)"},
                {transform: "scale(1)"},
            ],
            {
                duration: OPEN_SWITCH_DURATION * speed,
                easing: "ease-out",
            }
        );
        setStoredAnimation(appEl, anim, () => {
            runOpenScript(appEl.id);
        });
    } else if (hadNoOpenApp) {
        const anim = appEl.animate([{transform: "scale(0.6)", opacity: 0}, {opacity: 1}, {transform: "scale(1)"}], {
            duration: OPEN_SWITCH_DURATION * speed,
            easing: "ease",
            composite: "replace",
        });
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
                {transform: "translateX(120%) scale(0.8)"},
                {transform: "translateX(80%) scale(0.8)"},
                {transform: "translateX(40%) scale(0.85)"},
                {transform: "scale(1)"},
            ],
            {
                duration: OPEN_SWITCH_DURATION * speed,
                easing: "ease-out",
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
            easing: "ease-in-out",
            composite: "replace",
        });
        appAnimations[appEl.id] = anim;

        timeOutOpeningApp[appEl.id] = setTimeout(() => {
            runOpenScript(appEl.id);
            timeOutOpeningApp[appEl.id] = null;
            delete appAnimations[appEl.id];
        }, OPEN_ISLAND_TIMEOUT);
        setTimeout(() => {
            appEl.classList.remove("animationAppOpenFromIsland");
        }, OPEN_ISLAND_TIMEOUT);
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
                {transform: "translateX(120%) scale(0.8)"},
                {transform: "translateX(80%) scale(0.8)"},
                {transform: "translateX(40%) scale(0.85)"},
                {transform: "scale(1)"},
            ],
            {
                duration: OPEN_SWITCH_DURATION * speed,
                easing: "ease-out",
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
            easing: "ease-in-out",
            composite: "replace",
        });
        appAnimations[appEl.id] = anim;

        timeOutOpeningApp[appEl.id] = setTimeout(() => {
            timeOutOpeningApp[appEl.id] = null;
            delete appAnimations[appEl.id];
            runOpenScript(appEl.id);
        }, OPEN_CAMERA_TIMEOUT);

        setTimeout(() => {
            appEl.classList.remove("animationAppOpenFromCameraBtn");
        }, OPEN_CAMERA_TIMEOUT);
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
