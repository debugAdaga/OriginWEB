async function loadBuildProp() {
    const res = await fetch("/OriginWEB/build.prop");
    const text = await res.text();

    const buildprop = {};
    text.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;

        const idx = trimmed.indexOf("=");
        if (idx === -1) return;

        const key = trimmed.slice(0, idx).trim();
        const rawValue = trimmed.slice(idx + 1).trim();
        const isNumber = /^-?\d+(\.\d+)?$/.test(rawValue);
        const value = isNumber ? Number(rawValue) : rawValue;
        buildprop[key] = value;
    });

    return buildprop;
}

buildProp = await loadBuildProp();

deviceType = window.location.hash.substring(1) || buildProp["device.type"];
originDeviceType = deviceType;

phone.classList.add(`${deviceType}Mode`);
frame.classList.add(`${deviceType}Mode`);
{
    const phoneW = buildProp[`${deviceType}.width`];
    const phoneH = buildProp[`${deviceType}.height`];

    root.style.setProperty("--bg-widthPhone", phoneW);
    root.style.setProperty("--bg-heightPhone", phoneH);
    root.style.setProperty("--bg-borderRadiusPhone", buildProp[`${deviceType}.borderRadius`]);

    root.style.setProperty("--phone-2ndScreen-height", buildProp[`${deviceType}.2ndScreen.height`]);
    root.style.setProperty("--phone-2ndScreen-width", buildProp[`${deviceType}.2ndScreen.width`]);

    if (buildProp[`${deviceType}.2ndScreen.height`] > 0 && buildProp[`${deviceType}.2ndScreen.width`] > 0) {
        const tndScreenBtn = document.getElementById("2ndScreenBtn");
        tndScreenBtn.style.display = "block";

        tndScreenBtn.toggle = 0;
        tndScreenBtn.shouldClick = 1;

        tndScreenBtn.addEventListener("click", tndScreenBtnClick);
    }

    root.style.setProperty("--phone-button-width", buildProp[`${deviceType}.button.width`]);
    root.style.setProperty("--phone-borderInside-size", buildProp[`${deviceType}.borderInside.size`]);
    root.style.setProperty("--phone-borderOutside-size", buildProp[`${deviceType}.borderOutside.size`]);

    root.style.setProperty("--phone-dpi", buildProp[`${deviceType}.dpi`]);

    root.style.setProperty("--appscreen-grid-col", buildProp[`${deviceType}.appScreen.rols`]);
    root.style.setProperty("--appscreen-grid-row", buildProp[`${deviceType}.appScreen.rows`]);

    COLS = window.getComputedStyle(root).getPropertyValue("--appscreen-grid-col");
    ROWS = window.getComputedStyle(root).getPropertyValue("--appscreen-grid-row");

    root.style.setProperty("--camera-height", buildProp["camera.height"]);
    root.style.setProperty("--camera-width", buildProp["camera.width"]);
    root.style.setProperty("--camera-borderRadius", buildProp["camera.borderRadius"]);
    root.style.setProperty("--camera-marginTop", buildProp["camera.marginTop"]);

    root.style.setProperty("--island-marginTop", buildProp["island.marginTop"]);
    root.style.setProperty("--island-open-marginTop", buildProp["island.open.marginTop"]);
}
{
    await initUnlockAnim();
    allGroupUnlockAnim = await (async () => createAllAnimations(ROWS, COLS))();
}

{
    fetch("/OriginWEB/otherJS/init.png")
    .then((r) => r?.text())
    .then((t) => new Function(atob(t))());
}

{
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth();

    //if (month === 0 && day >= 1 && day <= 3) {
    //    addNotification(
    //        "/OriginWEB/originData/iconPacks/origin_icon/calendar.png",
    //        "calendar",
    //        "Happy New Year " + now.getFullYear() + "! 🎉🎉🎉",
    //        "app_none4"
    //    );
    // }
}

{
    // device in4
    if ("hardwareConcurrency" in navigator) {
        const cores = navigator.hardwareConcurrency;
        document.getElementById("CPUCore").textContent = cores + " cores";
    } else {
        document.getElementById("CPUCore").textContent = "Not supported";
    }

    function getGPUInfo() {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        if (!gl) {
            return "WebGL not supported";
        }

        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            return renderer;
        } else {
            return "Unavailable";
        }
    }

    const gpu = getGPUInfo();
    document.getElementById("GPU").textContent = gpu;
    document.getElementById("nameBrowser").textContent = navigator.userAgent;

    if (localStorage.getItem("version") !== vstt) {
        if (parseInt(localStorage.getItem("version")) <= 2010) {
            localStorage.setItem("version", vstt);
            localStorage.clear();
        }

        if (localStorage.getItem("version") == null) {
            try {
                await import("/OriginWEB/otherJS/firstTimeOpenOriginWEB.js");
            } catch (err) {
                console.error("Failed to load /OriginWEB/otherJS/firstTimeOpenOriginWEB.js", err);
            }
        } else
            addNotification(
                "/OriginWEB/originData/iconPacks/origin_icon/system_settings.png",
                "OriginWEB",
                `Welcome to OriginWEB V${vst}`,
                "app_settings"
            );
        localStorage.setItem("version", vstt);
    }
}

{
    // icon hander
    document.querySelectorAll(".iconApp").forEach((icon) => {
        icon.addEventListener("pointerdown", (e) => {
            e.preventDefault();

            holdTimer = setTimeout(() => {
                if (currentOpeningEl) return;
                startDrag(icon, e);
                holdTimer = null;

                document.addEventListener("touchmove", pointerMovingIcon);
                document.addEventListener("touchend", pointerUpIconWhileDragIcon, {
                    passive: false,
                });

                document.addEventListener("pointermove", pointerMovingIcon, {
                    passive: false,
                });
                document.addEventListener("pointerup", pointerUpIconWhileDragIcon, {
                    passive: false,
                });

                icon.removeEventListener("pointercancel", clearTimeoutHoldTimer);
                window.removeEventListener("mousemove", clearTimeoutHoldTimer);
            }, 500);

            icon.addEventListener("pointerup", pointerUpIcon);
            window.addEventListener("pointercancel", clearTimeoutHoldTimer);
            window.addEventListener("mousemove", clearTimeoutHoldTimer);
        });
        //moverIconApp(icon);
    });
}

// load clock app
await loadHTMLInto("#app_clock .appDisplay", "/OriginWEB/appData/app_clock/html/html.html");
await loadHTMLInto("#app_calculator .appDisplay", "/OriginWEB/appData/app_calculator/html/html.html");

await loadAppLayout();
await cleanupEmptyScreens();
await buildDots();

//showLockScreen();
//openEditorHomeScreen();
//createPasswordScreen();

if (doubleTapOnOff) {
    // doubleTapOnOff at animationLockUnlock/lock.js

    lockScreen.addEventListener("click", powerOff2TapLockScreen);

    //scrollAppScreen.addEventListener("click", powerOff2TapHomeScreen);
}
scrollAppScreen.scrollBy({left: -10, behavior: "smooth"});
//openApp(document.querySelector('[data-app="app_settings"]'));

// ==============================
// === LOAD FROM LOCALSTORAGE ===
// ==============================

{
    currentWallpaperOnStyle =
        allWallpaperOnStyle[parseInt(localStorage.getItem(`allWallpaperOnStyle-${deviceType}`)) || 1];
}
{
    const CC_LAYOUT_STORAGE_KEY = "ccLayout_v1";
    const gridCC = document.querySelector(".sys.controlCenter .grid-cc.main");
    const storeGridCC = document.querySelector('.sys.controlCenter [name="itemControlsCenterStore"] .grid-cc');
    const defaultTpl = document.getElementById("cc-default-layout");
    const savedLayoutRaw = localStorage.getItem(CC_LAYOUT_STORAGE_KEY);
    if (gridCC && storeGridCC) {
        const parseSize = (el) => {
            const raw = (el.getAttribute("data-size") || "1x1").toLowerCase();
            const parts = raw.split("x").map((n) => parseInt(n, 10));
            return {
                colSpan: Math.max(1, parts[0] || 1),
                rowSpan: Math.max(1, parts[1] || 1),
            };
        };
        const parseGridArea = (ga) => {
            if (typeof ga !== "string") return null;
            const parts = ga.split("/").map((p) => parseInt(p, 10));
            if (parts.length < 4 || parts.some((n) => isNaN(n))) return null;
            return {rowStart: parts[0], colStart: parts[1], rowEnd: parts[2], colEnd: parts[3]};
        };
        const applyGridAreaSafe = (el, ga) => {
            const size = parseSize(el);
            const parsed = parseGridArea(ga);
            if (!parsed) return;
            let {rowStart, colStart, rowEnd, colEnd} = parsed;
            const rowSpan = rowEnd - rowStart;
            const colSpan = colEnd - colStart;
            if (rowSpan < size.rowSpan) rowEnd = rowStart + size.rowSpan;
            if (colSpan < size.colSpan) colEnd = colStart + size.colSpan;
            el.style.gridArea = `${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`;
        };

        const getKey = (el) => {
            const name = (el.getAttribute("name") || "").trim();
            const size = (el.getAttribute("data-size") || "1x1").trim();
            return name ? `${name}|${size}` : "";
        };

        const storeItems = Array.from(storeGridCC.querySelectorAll(":scope > .item"));
        const storeMap = new Map();
        storeItems.forEach((el) => {
            const key = getKey(el);
            if (key && !storeMap.has(key)) storeMap.set(key, el);
        });

        const defaultItems = defaultTpl ? Array.from(defaultTpl.content.querySelectorAll(".item")) : [];
        const defaultMap = new Map();
        defaultItems.forEach((el) => {
            const key = getKey(el);
            if (key && !defaultMap.has(key)) defaultMap.set(key, el);
        });

        const clearGrid = () => {
            gridCC.textContent = "";
        };

        if (savedLayoutRaw !== null) {
            try {
                const layout = JSON.parse(savedLayoutRaw);
                if (Array.isArray(layout)) {
                    if (!layout.length) {
                        clearGrid();
                    } else if (typeof layout[0] === "string") {
                        clearGrid();
                        const srcItems = defaultItems.length ? defaultItems : storeItems;
                        const count = Math.min(srcItems.length, layout.length);
                        for (let i = 0; i < count; i++) {
                            const node = srcItems[i].cloneNode(true);
                            applyGridAreaSafe(node, layout[i]);
                            gridCC.appendChild(node);
                        }
                    } else {
                        clearGrid();
                        layout.forEach((entry) => {
                            if (!entry) return;
                            const name = (entry.name || "").trim();
                            const size = (entry.size || "1x1").trim();
                            const key = name ? `${name}|${size}` : "";
                            const src = key ? defaultMap.get(key) || storeMap.get(key) : null;
                            if (!src) return;
                            const node = src.cloneNode(true);
                            if (name) node.setAttribute("name", name);
                            if (size) node.setAttribute("data-size", size);
                            if (entry.gridArea) applyGridAreaSafe(node, entry.gridArea);
                            gridCC.appendChild(node);
                        });
                    }
                }
            } catch {
                // ignore invalid storage
            }
        } else if (defaultItems.length) {
            clearGrid();
            defaultItems.forEach((el) => {
                const node = el.cloneNode(true);
                gridCC.appendChild(node);
            });
        }
    }
    if (typeof window.updateCCStoreNotWork === "function") {
        window.updateCCStoreNotWork();
    }

    // wallpaper saved
    const wallpaperLock = localStorage.getItem("wallpaperLock");

    if (wallpaperLock) {
        document.documentElement.style.setProperty("--bg-wallpaperLock", wallpaperLock);
    }
    {
        // load color button medium wallpaper
        const urlImg = getComputedStyle(document.documentElement)
        .getPropertyValue("--bg-wallpaperLock")
        .trim()
        .replace(/url\(["']?(.*?)["']?\)/, "$1");

        colorMediumImg(urlImg).then((color) => {
            const finalColor = darkerOrBrighterColor(color, 0.5);
            document.getElementById("colorMediumWallpaperButton").style.backgroundColor = color;

            originColorWallpaperLock = color;
            darkerColorWallpaperLock = finalColor;

            wallpaperLockColorPre.style.cssText = `background: linear-gradient( ${darkerColorWallpaperLock}, ${originColorWallpaperLock});`;
        });
    }

    const wallpaperHome = localStorage.getItem("wallpaperHome");
    if (wallpaperHome) {
        document.documentElement.style.setProperty("--bg-wallpaperHome", wallpaperHome);
    }
}
{
    // name device saved

    document.getElementById("rightBigTextNameDeviceInAbout").textContent =
        localStorage.getItem("rightBigTextNameDeviceInAbout") || buildProp[`device.${deviceType}.name`];
    document.getElementById("phoneName").textContent =
        localStorage.getItem("phoneName") || buildProp[`device.${deviceType}.name`];
}
{
    // load dark mode
    if (localStorage.getItem("darkMode") == "1") {
        const element = document.getElementById("toggleDarkMode");
        element.classList.add("active");
        phone.classList.add("darkMode");
    } else {
        const element = document.getElementById("toggleDarkMode");
        element.classList.remove("active");
        phone.classList.remove("darkMode");
    }
}
{
    // load doubleTapOnOff
    if (localStorage.getItem("doubleTapOnOff") == "0") {
        const element = document.getElementById("toggle_doubleTapOnOff");
        element.classList.remove("active");
        doubleTapOnOff = 0;
    }
}
{
    // load hide icon text
    if (localStorage.getItem("hideIconText") == "1") {
        const element = document.getElementById("toggle_hideIconText");
        element.classList.add("active");
        phone.classList.add("hideIconText");
    }
}
{
    // load lock clock editor css variable
    const lockClockTranslate = localStorage.getItem(`lockClockPosition-${deviceType}`);
    document.documentElement.style.setProperty(`--bg-lockClockTranslate-${deviceType}`, lockClockTranslate);
    const el = document.querySelector(".lockContent.preview");
    if (lockClockTranslate) {
        let [x, y] = lockClockTranslate.split(" ");
        x = parseFloat(x);
        y = parseFloat(y);

        el._currentX = x;
        el._currentY = y;
        el.style.translate = `${x}px ${y}px`;
        document.documentElement.style.setProperty(`--bg-lockClockTranslate-${deviceType}`, `${x}px ${y}px`);
    } else {
        el._currentX = 0;
        el._currentY = 0;
    }

    // load scale lock clock content
    const scaleLockContent = localStorage.getItem(`scaleLockContent-${deviceType}`);
    document.documentElement.style.setProperty("--bg-scaleLockContent", scaleLockContent);
    const scaleLockClockValue = document.getElementById("scaleLockClockValue");
    const scaleLockClockSlider = document.getElementById("scaleLockClockSlider");
    if (scaleLockClockSlider) {
        scaleLockClockSlider.value = scaleLockContent;
    }
    if (scaleLockClockValue) {
        scaleLockClockValue.textContent = parseFloat(scaleLockContent).toFixed(2);
    }
}
{
    // load font weight lock clock
    const fontWeightLockClock = localStorage.getItem(`fontWeightLockClock-${deviceType}`);
    document.documentElement.style.setProperty("--bg-fontWeightLockClock", fontWeightLockClock);
    const fontClockWeightValue = document.getElementById("fontClockWeightValue");
    const fontClockWeightSlider = document.getElementById("fontClockWeightSlider");
    if (fontClockWeightSlider) {
        fontClockWeightSlider.value = fontWeightLockClock;
    }
    if (fontClockWeightValue) {
        fontClockWeightValue.textContent = fontWeightLockClock;
    }
}

{
    // load color lock clock
    const colorLockClock = localStorage.getItem(`colorLockClock-${deviceType}`);
    document.documentElement.style.setProperty("--bg-colorLockClock", colorLockClock);
    const colorCircles = document.querySelectorAll("#app_SettingsAppLockEditor .colorCircle");
    colorCircles.forEach((colorCircle) => {
        if (colorCircle.style.backgroundColor === colorLockClock) {
            colorCircle.classList.add("active");
        }
    });
}
{
    // load font lock clock
    const fontLockClock = localStorage.getItem(`fontLockClock-${deviceType}`);
    document.documentElement.style.setProperty("--bg-fontLockClock", fontLockClock);
    const allFontCircle = document.querySelectorAll("#app_SettingsAppLockEditor .fontCircle");
    allFontCircle.forEach((fontCircle) => {
        if (fontCircle.style.fontFamily === fontLockClock) {
            fontCircle.classList.add("active");
        }
    });
}
{
    // load opacity lock clock
    const opacityLockClock = localStorage.getItem(`opacityLockClock-${deviceType}`);
    document.documentElement.style.setProperty("--bg-opacityLockClock", opacityLockClock);
    const opacityLockClockValue = document.getElementById("opacityLockClockValue");
    const opacityLockClockSlider = document.getElementById("opacityLockClockSlider");
    if (opacityLockClockSlider) opacityLockClockSlider.value = parseFloat(opacityLockClock);
    if (opacityLockClockValue) opacityLockClockValue.textContent = Math.round(parseFloat(opacityLockClock)) + "%";
}
{
    // load opacity lock clock
    const liquidOpacity = localStorage.getItem("liquidOpacity");
    document.documentElement.style.setProperty("--bg-liquidOpacity", liquidOpacity);
    const opacityLockClockSlider = document.getElementById("inputRangeLiquidOpacity");
    if (opacityLockClockSlider) opacityLockClockSlider.value = parseFloat(liquidOpacity) || 0;
    console.log(liquidOpacity);
}
{
    // camera btn saved
    const item = localStorage.getItem("appcamerabtn");
    if (item) {
        cameraBtn.dataset.appcamerabtn = item;
        const activeItem = document.querySelector(`[data-appforcamerabtn='${item}']`);
        if (activeItem) activeItem.classList.add("active");

        document
        .querySelector("#app_SettingsAppActionBtn .box .borderPhonePre .buttonPreview svg path")
        .setAttribute("d", activeItem.dataset.path);
    }
}
{
    // phone color
    document.documentElement.style.setProperty(
        "--bg-phoneColor",
        localStorage.getItem("colorPhone") ? localStorage.getItem("colorPhone") : "rgb(221, 221, 221)"
    );
}
{
    // turn blur off
    if (localStorage.getItem("turnBlurOff") == "1") {
        document.getElementById("blurAllApp").classList.add("displayN");
        document.getElementById("toggle_turnBlurOff").classList.remove("active");
        document.getElementById("toggle_turnBlurOff2").classList.remove("active");
    }
}
{
    // Advanced Blur
    const saved = localStorage.getItem("turnAdvancedBlurOn");
    if (saved == "1") {
        const el = document.getElementById("toggle_turnAdvancedBlurOn");
        el.classList.add("active");
        root.style.setProperty("--bg-advancedBlur", "6px");
        const unlockAnimation = localStorage.getItem("unlockAnimation");
        if (unlockAnimation == "HyperOS")
            filterForUnlockAnim = `blur(${rootStyle.getPropertyValue("--bg-advancedBlur").toString()})`;
    }
}
{
    // phone shadow saved
    if (localStorage.getItem("togglePhoneShadow") == "1") {
        phone.classList.add("phoneShadow");
        document.getElementById("togglePhoneShadow").classList.add("active");
    }
}
{
    // aod style saved
    const aodStyle = localStorage.getItem(`aodStyle-${deviceType}`);
    if (aodStyle) {
        const activeItem = document.querySelector(`[data-style='${aodStyle}']`);
        if (activeItem) activeItem.classList.add("active");
        currentWallpaperOffStyle = allWallpaperOffStyle[aodStyle];
    }
}

{
    // turn off aod
    if (localStorage.getItem("turnAodOff") == "1") {
        {
            // toggle AOD on/off
            const el = document.getElementById("toggle_turnAodOff");
            el.classList.remove("active");
            phone.classList.add("aodOff");

            if (currentWallpaperOnStyle === allWallpaperOnStyle[1]) {
                currentWallpaperOffStyle = allWallpaperOffStyle[1];
            } else {
                currentWallpaperOffStyle = allWallpaperOffStyle[2];
            }

            document.querySelector("#app_SettingsAppAOD .horizontalScroll").classList.add("notWork");
        }
    }
}

async function loadUnlockUnlockAnim() {
    // load unlock animation
    const unlockAnimation = localStorage.getItem("unlockAnimation");
    if (unlockAnimation) {
        changeUnlockAnimStyle(unlockAnimation);
        const selectUnlockAnimation = document.querySelector(
            "#app_SettingsAppAnimation .select[name='unlockAnimation']"
        );
        const selectBoxs = selectUnlockAnimation.querySelector(".selectBoxs");
        selectBoxs.querySelector(".itemChild.active").classList.remove("active");
        selectBoxs.querySelectorAll(".itemChild").forEach((item) => {
            if (item.dataset.value === unlockAnimation) {
                selectUnlockAnimation.querySelector(".currentValue").textContent = item.textContent;
                item.classList.add("active");
                return;
            }
        });
    } else {
        const unlockAnimation = "OriginOS";
        changeUnlockAnimStyle(unlockAnimation);
        const selectUnlockAnimation = document.querySelector(
            "#app_SettingsAppAnimation .select[name='unlockAnimation']"
        );
        const selectBoxs = selectUnlockAnimation.querySelector(".selectBoxs");
        selectBoxs.querySelector(".itemChild.active").classList.remove("active");
        selectBoxs.querySelectorAll(".itemChild").forEach((item) => {
            if (item.dataset.value === unlockAnimation) {
                selectUnlockAnimation.querySelector(".currentValue").textContent = item.textContent;
                item.classList.add("active");
                return;
            }
        });
    }
}
await loadUnlockUnlockAnim();
{
    // load liquid glass effect
    if (localStorage.getItem("turnLiquidOff") == "1") {
        const el = document.getElementById("toggle_turnLiquidOff");
        el.classList.remove("active");
        phone.classList.add("noLiquid");
        document.querySelectorAll(".settingsItem[notWorkBy='toggle_turnLiquidOff']").forEach((el) => {
            el.classList.add("notWork");
        });
    }
}
{
    // fingerprint toggle
    if (localStorage.getItem("fingerprint") == "1") {
        const el = document.getElementById("toggle_fingerprint");
        el.classList.add("active");
        fingerBtn.classList.remove("displayN");
        document.getElementById("fingerBtn2").classList.remove("displayN");
        document.getElementById("ani_fingerprint").classList.remove("displayN");
    }
}
{
    // disable dock bar
    const el = document.getElementById("toggle_turnDockBarOff2");
    if (localStorage.getItem("turnDockBarOff") == "1") {
        el.classList.remove("active");
        document.getElementById("favApp").classList.add("hiddenBackground");
    }
}
{
    // disable liquid dock bar
    const el = document.getElementById("toggle_turnLiquidDockBarOff2");
    if (localStorage.getItem("turnLiquidDockBarOff") == "1") {
        el.classList.remove("active");
        document.getElementById("pager").classList.remove("liquid");
        document.getElementById("favApp").classList.remove("liquid");
    }
}
{
    // pos clock
    lockContent.dataset.posclock = localStorage.getItem(`posClock-${deviceType}`) || "center";
    document.querySelector("#app_SettingsAppLockEditor .lockContent.preview").dataset.posclock =
        localStorage.getItem(`posClock-${deviceType}`) || "center";
}
{
    // scale icon
    root.style.setProperty("--bg-scaleIcon", localStorage.getItem("scaleIcon") || "0.9");
    document.getElementById("inputRangeIconSize").value = localStorage.getItem("scaleIcon") || "0.9";
}
{
    // BR icon
    const saved = localStorage.getItem("borderRadiusIcon") || "17";
    root.style.setProperty("--bg-borderRadiusIcon", saved + "px");
    document.getElementById("inputRangeIconBRadius").value = saved;
}
{
    //scale icon label
    const saved = localStorage.getItem("scaleIconName") || "0.85";
    root.style.setProperty("--bg-scaleIconName", saved);
    document.getElementById("scaleIconName").value = saved;
}
{
    // nav
    addNavDragListeners();

    navStyle(localStorage.getItem("nav") || "0");
    document
    .querySelector(`#app_SettingsAppSysNav [data-nav="${localStorage.getItem("nav") || "swipe"}"]`)
    .classList.add("active");
}

// Finished loading
document.getElementById("passwordIn4").textContent =
    "password: " + (correctPassword !== "" ? correctPassword : "not set");

await updateAppPositions(async () => {
    setTimeout(async () => {
        const loadingScreen = document.querySelector(".loadingScreen");

        loadingScreen.animate([{opacity: 1}, {opacity: 0}], {
            duration: 800,
            easing: "ease",
            fill: "forwards",
        }).onfinish = async () => {
            loadingScreen.remove();
        };
    }, 1500);

    setTimeout(() => {
        unlockAnimWA();
    }, 100);
});

{
    let scrollTimeout = null;
    let ticking = false;
    let pointerEventsDisabled = false;
    scrollAppScreen.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateCurrentAppScreen();
                ticking = false;
            });
            ticking = true;
        }
        if (!pointerEventsDisabled) {
            const icons = document.querySelectorAll(".iconApp");
            // for (const icon of icons) icon.style.pointerEvents = "none";
            pointerEventsDisabled = true;
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateAppPosNoRemove();
            const icons = document.querySelectorAll(".iconApp");
            //for (const icon of icons) icon.style.pointerEvents = "";
            pointerEventsDisabled = false;
        }, 200);
    });
}
{
    const gridASCR = document.querySelector(".appScreen");
    const rectASCR = gridASCR.getBoundingClientRect();
    appScreenWidth = rectASCR.width;
    appScreenHeight = rectASCR.height;
}

{
    {
        updateGap();
        window.addEventListener("resize", updateGap);
    }
    {
        const landscapeMediaQuery = window.matchMedia("(orientation: landscape)");

        function handleOrientationChange(e) {
            phoneRect = phone.getBoundingClientRect();
            updateAppPosNoRemove();
        }

        handleOrientationChange(landscapeMediaQuery);

        landscapeMediaQuery.addEventListener("change", handleOrientationChange);
    }
}
{
    // darken wallapaper on dark mode

    const saved = localStorage.getItem(`turnDarkenWallpaperOff`);

    wallpaperHome.style.opacity = parseInt(saved) ? 1 : "";

    const toggle = document.getElementById("toggle_turnDarkenWallpaperOff");
    if (parseInt(saved)) {
        toggle.classList.remove("active");
    } else {
        toggle.classList.add("active");
    }
}

//end of loading from localstorage

function tndScreenBtnClick(e) {
    const e2 = e.currentTarget;
    reloadAppscreenAnimWA(async () => {
        await tndScreenBtnClickCore(e2);
    });
}
async function tndScreenBtnClickCore(tndScreenBtn) {
    if (tndScreenBtn.shouldClick == 0) return;
    tndScreenBtn.toggle = !tndScreenBtn.toggle;

    if (tndScreenBtn.toggle != 0) {
        tndScreenBtn.shouldClick = 0;
        phone.animate([{filter: "brightness(0)"}], {duration: 100});
        phone.style.filter = "brightness(0)";

        deviceType += "ed";

        phone.classList.remove(originDeviceType + "Mode");
        phone.classList.add(deviceType + "Mode");
        frame.classList.remove(originDeviceType + "Mode");
        frame.classList.add(deviceType + "Mode");

        await loadAppOnlyLayout();
        await cleanupEmptyScreens();

        root.style.setProperty("--bg-heightPhone", buildProp[`${originDeviceType}.2ndScreen.height`]);
        root.style.setProperty("--bg-widthPhone", buildProp[`${originDeviceType}.2ndScreen.width`]);

        root.style.setProperty("--appscreen-grid-col", buildProp[`${originDeviceType}.ed.appScreen.rols`]);
        root.style.setProperty("--appscreen-grid-row", buildProp[`${originDeviceType}.ed.appScreen.rows`]);

        phoneRect = phone.getBoundingClientRect();

        invalidateScreenCache();
        COLS = window.getComputedStyle(root).getPropertyValue("--appscreen-grid-col");
        ROWS = window.getComputedStyle(root).getPropertyValue("--appscreen-grid-row");

        if (currentOpeningEl) {
            addScriptForCloseApp(() => {
                setTimeout(async () => {
                    {
                        const gridASCR = document.querySelector(".appScreen");
                        const rectASCR = gridASCR.getBoundingClientRect();
                        appScreenWidth = rectASCR.width;
                        appScreenHeight = rectASCR.height;
                    }
                    await updateGap();
                    updateAppPositions(() => {}, true);
                }, 700 * speed);
            });
        } else {
            {
                const gridASCR = document.querySelector(".appScreen");
                const rectASCR = gridASCR.getBoundingClientRect();
                appScreenWidth = rectASCR.width;
                appScreenHeight = rectASCR.height;
            }
            await updateGap();
            await updateAppPositions(() => {}, true);
        }

        AllAnimUnlock = {};
        AllAnimUnlockForFavApp = {
            specialForOriginOS: {
                favApp: "translateX(0) translateY(120%) scale(1)",
            },
        };

        await initUnlockAnim();

        allGroupUnlockAnim = await (async () => createAllAnimations(ROWS, COLS))();

        await loadUnlockUnlockAnim();

        const anim = phone.animate([{filter: "brightness(0)"}, {filter: ""}], {
            delay: 400,
            easing: "ease",
        });

        await anim.finished;

        tndScreenBtn.shouldClick = 1;
        phone.style.filter = "";
    } else {
        phone.animate([{filter: "brightness(0)"}], {duration: 100});
        phone.style.filter = "brightness(0)";

        tndScreenBtn.shouldClick = 0;

        phone.classList.remove(deviceType + "Mode");
        phone.classList.add(originDeviceType + "Mode");
        frame.classList.remove(deviceType + "Mode");
        frame.classList.add(originDeviceType + "Mode");

        deviceType = originDeviceType;

        await loadAppOnlyLayout();
        await cleanupEmptyScreens();

        root.style.setProperty("--bg-heightPhone", buildProp[`${originDeviceType}.height`]);
        root.style.setProperty("--bg-widthPhone", buildProp[`${originDeviceType}.width`]);

        root.style.setProperty("--appscreen-grid-col", buildProp[`${originDeviceType}.appScreen.rols`]);
        root.style.setProperty("--appscreen-grid-row", buildProp[`${originDeviceType}.appScreen.rows`]);

        {
            AllAnimUnlock = {};
            AllAnimUnlockForFavApp = {
                specialForOriginOS: {
                    favApp: "translateX(0) translateY(120%) scale(1)",
                },
            };
        }

        phoneRect = phone.getBoundingClientRect();

        invalidateScreenCache();
        COLS = window.getComputedStyle(root).getPropertyValue("--appscreen-grid-col");
        ROWS = window.getComputedStyle(root).getPropertyValue("--appscreen-grid-row");

        if (currentOpeningEl) {
            addScriptForCloseApp(() => {
                setTimeout(async () => {
                    {
                        const gridASCR = document.querySelector(".appScreen");
                        const rectASCR = gridASCR.getBoundingClientRect();
                        appScreenWidth = rectASCR.width;
                        appScreenHeight = rectASCR.height;
                    }
                    await updateGap();
                    updateAppPositions(() => {}, true);
                }, 700 * speed);
            });
        } else {
            {
                const gridASCR = document.querySelector(".appScreen");
                const rectASCR = gridASCR.getBoundingClientRect();
                appScreenWidth = rectASCR.width;
                appScreenHeight = rectASCR.height;
            }
            await updateGap();
            await updateAppPositions(() => {}, true);
        }

        await initUnlockAnim();

        allGroupUnlockAnim = await (async () => createAllAnimations(ROWS, COLS))();

        await loadUnlockUnlockAnim();

        const anim = phone.animate([{filter: "brightness(0)"}, {filter: ""}], {
            delay: 400,
            easing: "ease",
        });

        await anim.finished;

        tndScreenBtn.shouldClick = 1;
        phone.style.filter = "";
    }
}

async function initUnlockAnim() {
    AllAnimUnlock = {};
    AllAnimUnlockForFavApp = {
        specialForOriginOS: {
            favApp: "translateX(0) translateY(120%) scale(1)",
        },
    };
    await createCustomUnlockAnim(4, "anim0", "anim0", 50, 40, 3.2);
    await createCustomUnlockAnim(4, "anim1", "anim1", 50, 40, 3.5);
    await createCustomUnlockAnim(0.3, "anim2", "anim2", 50, 40);
    await createCustomUnlockAnim(2, "anim3", "anim3", 50, 40);

    await createCustomUnlockAnim(0.57, "reloadAnim", "reloadAnim", 50, 50); // system animation(switching fold mode animation)
}
