let AllAnimUnlock = {};
let AllAnimUnlockForFavApp = {
    specialForOriginOS: {
        favApp: "translateX(0) translateY(120%) scale(1)",
    },
};

transformUnlockAnim = AllAnimUnlock.anim1;
transformUnlockAnimForFavApp = AllAnimUnlockForFavApp.anim3;
durationForUnlockAnim = 600 * speed;
easingForUnlockAnim = "cubic-bezier(.35,1.29,.33,1)";
delayForUnlockAnim = 25 * speed;
delayEasingForUnlockAnim = 5;
let filterForUnlockAnim = "";

async function createCustomUnlockAnim(
    scale = 0,
    name = "anim2",
    nameFav = "anim2",
    scalePosX = 50, // transform-origin
    scalePosY = 40, // transform-origin
    scaleFixed = scale // never mind lol :)
) {
    const WIDTH = 280;
    const HEIGHT = 617;

    const baseX = 0.1;
    const baseStartX = WIDTH * baseX;
    const baseEndX = WIDTH * (1 - baseX);
    const baseStartY = HEIGHT * 0.15;
    const baseEndY = HEIGHT * 0.85;

    const gridAnim = {};
    const favAnim = {};
    const ox = (scalePosX / 100) * WIDTH;
    const oy = (scalePosY / 100) * HEIGHT;

    async function buildGrid({cols, rows, x, y, scaleVar, prefix}) {
        const startX = WIDTH * x;
        const endX = WIDTH * (1 - x);
        const startY = HEIGHT * y;
        const endY = HEIGHT * (1 - y);

        const stepX = (endX - startX) / (cols - 1);
        const stepY = (endY - startY) / (rows - 1);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const px = startX + c * stepX;
                const py = startY + r * stepY;

                const sx = ox + (px - ox) * scale;
                const sy = oy + (py - oy) * scale;

                const dx = (sx - px) / WIDTH;
                const dy = (sy - py) / HEIGHT;

                const key = `${prefix}${r + 1}${c + 1}`;

                gridAnim[key] =
                    `translateX(calc(${dx.toFixed(7)} * var(--bg-widthPhone) * (1 / ${scaleVar}) * 1px)) ` +
                    `translateY(calc(${dy.toFixed(7)} * var(--bg-heightPhone) * (1 / ${scaleVar}) * 1px)) ` +
                    `scale(${scaleFixed})`;
            }

            await new Promise((r) => setTimeout(r, 0));
        }
    }

    await buildGrid({cols: COLS, rows: ROWS, x: 0.1, y: 0.15, scaleVar: "var(--bg-scaleIcon)", prefix: "v"});
    await buildGrid({cols: COLS - 1, rows: ROWS, x: 0.22, y: 0.15, scaleVar: "var(--s)", prefix: "e"});
    await buildGrid({cols: COLS, rows: ROWS - 1, x: 0.1, y: 0.22, scaleVar: "var(--s)", prefix: "k"});
    await buildGrid({cols: COLS - 1, rows: ROWS - 1, x: 0.22, y: 0.22, scaleVar: "var(--s)", prefix: "d"});

    {
        const stepY = (baseEndY - baseStartY) / (ROWS - 1);

        const favX = WIDTH / 2;
        const favY = baseEndY + stepY * 1.6;

        const favSX = ox + (favX - ox) * scale;
        const favSY = oy + (favY - oy) * scale;

        const favDx = (favSX - favX) / WIDTH;
        const favDy = (favSY - favY) / HEIGHT;

        favAnim.favApp =
            `translateX(calc(${favDx.toFixed(7)} * var(--bg-widthPhone) * 1px)) ` +
            `translateY(calc(${favDy.toFixed(7)} * var(--bg-heightPhone) * 1px)) ` +
            `scale(${scale})`;
    }
    AllAnimUnlock[name] = gridAnim;
    AllAnimUnlockForFavApp[nameFav] = favAnim;
    {
        const obj = AllAnimUnlock[name];
        let output = `${name}: {\n`;

        for (const key in obj) {
            output += `    ${key}: "${obj[key]}",\n`;
        }

        output += `},`;
        //console.log(output);
    }
    {
        const obj = AllAnimUnlockForFavApp[nameFav];
        let output = `${name}: {\n`;

        for (const key in obj) {
            output += `    ${key}: "${obj[key]}",\n`;
        }

        output += `},`;
        //console.log(output);
    }
}

let unlockAnimStyles = {
    ColorOS: {
        anim: "anim1",
        fav: "anim1",
        duration: 600,
        easing: "cubic-bezier(.3,1.15,.2,1)",
        delay: 32,
        delayEasing: 11,
        group: "anim0",
    },
    HyperOS: {
        anim: "anim1",
        fav: "anim1",
        duration: 450,
        easing: "cubic-bezier(.38,1.15,.27,1)",
        delay: 50,
        delayEasing: 25,
        group: "anim0",
        filter: () => `blur(${rootStyle.getPropertyValue("--bg-advancedBlur").toString()})`,
    },
    OriginOS: {
        anim: "anim0",
        fav: "specialForOriginOS",
        duration: 500,
        easing: "cubic-bezier(.38,1.13,.05,1)",
        delay: 35,
        delayEasing: 20,
        group: "anim5",
    },
    HarmonyOS: {
        anim: "anim2",
        fav: "anim2",
        duration: 500,
        easing: "cubic-bezier(0.4, 1.17, 0.2, 1)",
        delay: 40,
        delayEasing: 17,
        group: "anim1",
    },
    OneUI6: {
        anim: "anim3",
        fav: "anim3",
        duration: 450,
        easing: "ease",
        delay: 0,
        delayEasing: 0,
        group: "anim4",
    },
    OneUI7: {
        anim: "anim2",
        fav: "anim2",
        duration: 600,
        easing: "cubic-bezier(0.4, 1.2, 0.3, 1)",
        delay: 0,
        delayEasing: 0,
        group: "anim4",
    },
    customAnim: {
        anim: "custom",
        fav: "custom",
        duration: 510,
        easing: "cubic-bezier(.38,1.14,.2,1)",
        delay: 20,
        delayEasing: 5,
        group: "anim1",
        filter: () => `blur(calc(${rootStyle.getPropertyValue("--bg-advancedBlur").toString()} * 2))`,
    },
};

function changeUnlockAnimStyle(style) {
    const cfg = unlockAnimStyles[style];
    if (!cfg) return;

    transformUnlockAnim = AllAnimUnlock[cfg.anim];
    transformUnlockAnimForFavApp = AllAnimUnlockForFavApp[cfg.fav];
    durationForUnlockAnim = cfg.duration * speed;
    easingForUnlockAnim = cfg.easing;
    delayForUnlockAnim = cfg.delay * speed;
    delayEasingForUnlockAnim = cfg.delayEasing * speed;
    filterForUnlockAnim = cfg.filter ? cfg.filter() : "";
    groupUnlockAnim = allGroupUnlockAnim[cfg.group];
}

let allGroupUnlockAnim = {
    anim0: [
        {ids: ["v22", "v23", "v32", "v33"]},
        {ids: ["v21", "v24", "v31", "v34"]},
        {ids: ["v12", "v13", "v42", "v43"]},
        {ids: ["v11", "v14", "v41", "v44"]},
        {ids: ["v52", "v53"]},
        {ids: ["v51", "v54"]},
        {ids: ["v62", "v63"]},
        {ids: ["v61", "v64"]},
    ],
    anim1: [
        {ids: ["v22", "v23", "v32", "v33"]},
        {ids: ["v21", "v24", "v31", "v34"]},
        {ids: ["v12", "v13", "v42", "v43"]},
        {ids: ["v11", "v14", "v41", "v44"]},
        {ids: ["v52", "v53", "v51", "v54"]},
        {ids: []},
        {ids: ["v62", "v63"]},
        {ids: ["v61", "v64"]},
    ],
    anim2: [
        {ids: ["v22", "v23", "v32", "v33"]},
        {ids: ["v21", "v24", "v31", "v34", "v12", "v13", "v42", "v43"]},
        {ids: ["v11", "v14", "v41", "v44"]},
        {ids: ["v52", "v53"]},
        {ids: ["v51", "v54"]},
        {ids: ["v62", "v63"]},
        {ids: ["v61", "v64"]},
    ],
    anim3: [
        {ids: ["v12", "v13"]},
        {ids: ["v11", "v14", "v22", "v23"]},
        {ids: ["v21", "v24", "v32", "v33"]},
        {ids: ["v31", "v34", "v42", "v43"]},
        {ids: ["v41", "v44", "v52", "v53"]},
        {ids: ["v51", "v54", "v62", "v63"]},
        {ids: ["v61", "v64"]},
    ],
    anim4: [
        {
            ids: [
                "v11",
                "v12",
                "v13",
                "v14",
                "v21",
                "v22",
                "v23",
                "v24",
                "v31",
                "v32",
                "v33",
                "v34",
                "v41",
                "v42",
                "v43",
                "v44",
                "v51",
                "v52",
                "v53",
                "v54",
                "v61",
                "v62",
                "v63",
                "v64",
            ],
        },
    ],
    anim5: [
        {ids: ["v32", "v33", "v22", "v23"]},
        {ids: []},
        {ids: ["v21", "v24", "v31", "v34"]},
        {ids: ["v12", "v13", "v42", "v43"]},
        {ids: ["v11", "v14", "v41", "v44"]},
        {ids: ["v52", "v53"]},
        {ids: ["v51", "v54"]},
        {ids: ["v62", "v63"]},
        {ids: ["v61", "v64"]},
    ],
};

function createAllAnimations(ROWS, COLS) {
    const groupByDistance = (pctX, pctY, reverse = false) => {
        const map = {};
        const targetR = 1 + (pctY / 100) * (ROWS - 1);
        const targetC = 1 + (pctX / 100) * (COLS - 1);

        for (let r = 1; r <= ROWS; r++) {
            for (let c = 1; c <= COLS; c++) {
                const dist = Math.sqrt(Math.pow(r - targetR, 2) + Math.pow(c - targetC, 2));

                const key = parseFloat(dist.toFixed(2));
                if (!map[key]) map[key] = [];
                map[key].push(`v${r}${c}`);
            }
        }

        return Object.keys(map)
        .map(Number)
        .sort((a, b) => (reverse ? b - a : a - b))
        .map((key) => ({ids: map[key]}));
    };

    return {
        anim0: groupByDistance(50, 30, false),
        anim1: groupByDistance(50, 30, false),
        anim2: groupByDistance(0, 0, false),
        anim3: groupByDistance(100, 50, false),
        anim4: [
            {
                ids: Array.from({length: ROWS * COLS}, (_, i) => `v${Math.floor(i / COLS) + 1}${(i % COLS) + 1}`),
            },
        ],

        anim5: groupByDistance(50, 30, false),
    };
}

let groupUnlockAnim = allGroupUnlockAnim.anim0;

function lockAnimScreen() {
    currentAppScreen.querySelectorAll(".iconApp").forEach((icon) => {
        const [row, col] = icon.style.gridArea.split("/").map((v) => parseInt(v));

        if (!icon) return;

        if (cancelIfAnimating(document.getElementById(icon.dataset.app))) icon.classList.remove("hidden");

        const [r, c] = icon.dataset.unlocka.split("");

        icon.style.transition = "all 0s";
        icon.style.transform = transformUnlockAnim[`${icon.dataset.unlockt}${r}${c}`];
        icon.style.opacity = "1";
        icon.style.zIndex = "0";
    });
    favApp.style.transition = "all 0s";
    favApp.style.transform = transformUnlockAnimForFavApp.favApp;
    favApp.style.opacity = "1";
    favApp.style.zIndex = "0";
}

function hiddenAllAppAndIcon() {
    document.querySelectorAll(".iconApp").forEach((icon) => {
        icon.style.transition = "all 0s";
        icon.style.opacity = "0";
    });
    favApp.style.transition = "all 0s";
    favApp.style.opacity = "0";
}

function showAllAppAndIcon() {
    document.querySelectorAll(".iconApp").forEach((icon) => {
        icon.style.transition = "";
        icon.style.opacity = "1";
    });
    favApp.style.transition = "";
    favApp.style.opacity = "1";
}

let timeOutHiddenAppForUnlockAnim = null;
let lastUnlockAnim = null;

async function unlockAnimWA(currentAppScreenTmp = currentAppScreen) {
    const wallpaperLockStyle = getComputedStyle(wallpaperLock);
    wallpaperHome.animate(
        [
            {
                background: `${wallpaperLockStyle.backgroundImage} no-repeat center/cover`,
                translate: wallpaperLockStyle.translate,
                borderRadius: wallpaperLockStyle.borderRadius,
                width: wallpaperLockStyle.width,
                height: wallpaperLockStyle.height,
                bottom: wallpaperLockStyle.bottom,
                scale: wallpaperLockStyle.scale,
                opacity: wallpaperLockStyle.opacity,
            },
            {
                background: "var(--bg-wallpaperHome) no-repeat center/cover",
                translate: "",
                borderRadius: "var(--bg-borderRadiusPhone)",
                width: "",
                height: "",
                bottom: "",
                scale: "",
                opacity: "",
            },
        ],
        {
            duration: 300 * speed,
            easing: "ease",
        }
    );

    if (currentOpeningElApp) {
        allAppScreen
        .animate([{scale: 0.9}, {scale: 1}], {
            duration: 400 * speed,
            easing: "ease",
            composite: "replace",
        })
        .effect.updateTiming({fill: "backwards"});
        return;
    }

    favApp.querySelectorAll(".iconApp").forEach((el) => {
        if (cancelIfAnimating(document.getElementById(el.dataset.app))) el.classList.remove("hidden");
    });

    groupUnlockAnim.forEach((group, groupIndex) => {
        const delay = groupIndex * delayForUnlockAnim - groupIndex * delayEasingForUnlockAnim;

        group.ids.forEach((id) => {
            const numericPart = id.slice(1);
            const [row, col] = numericPart.split("");
            const icon = currentAppScreenTmp.querySelector(`[data-unlocks*="${row}${col}"]`);

            if (!icon) return;

            if (cancelIfAnimating(document.getElementById(icon.dataset.app))) icon.classList.remove("hidden");

            icon.style.pointerEvents = "none";

            const [r, c] = icon.dataset.unlocka.split("");

            icon.animate(
                [
                    {
                        opacity: 0,
                        transform: transformUnlockAnim[`${icon.dataset.unlockt}${r}${c}`],
                        zIndex: 0,
                        filter: filterForUnlockAnim,
                    },
                    {filter: filterForUnlockAnim, opacity: 1},
                    {transform: "none", zIndex: 1, filter: ""},
                ],
                {
                    duration: durationForUnlockAnim,
                    delay,
                    easing: easingForUnlockAnim,
                    composite: "replace",
                }
            ).effect.updateTiming({fill: "backwards"});
        });
    });

    // favApp
    const delay =
        (groupUnlockAnim.length - 1) * delayForUnlockAnim - (groupUnlockAnim.length - 1) * delayEasingForUnlockAnim;

    Object.entries(transformUnlockAnimForFavApp).forEach(([key, value]) => {
        const el = document.getElementById(key);
        if (!el) return;

        el.animate([{opacity: 0, transform: value, zIndex: 0}, {opacity: 1}, {transform: "none", zIndex: 1}], {
            duration: durationForUnlockAnim,
            delay,
            easing: easingForUnlockAnim,
            composite: "replace",
        }).effect.updateTiming({fill: "backwards"});
    });

    lastUnlockAnim = document.getElementById("favApp").getAnimations()[
        document.getElementById("favApp").getAnimations().length - 1
    ];
    if (lastUnlockAnim) {
        await lastUnlockAnim.finished;

        if (lastUnlockAnim && lastUnlockAnim.playState !== "finished") {
            return;
        }

        updateAppPosNoRemove();
        document.querySelectorAll(".iconApp").forEach((icon) => {
            icon.style.pointerEvents = "";
        });
    }
}

async function reloadAppscreenAnimWA(script = () => {}, currentAppScreenTmp = currentAppScreen) {
    const cfg = {
        anim: "reloadAnim",
        fav: "reloadAnim",
        duration: 500,
        easing: "cubic-bezier(0.4, 1.17, 0.2, 1)",
        delay: 40,
        delayEasing: 17,
        group: "anim1",
    };
    if (!cfg) return;

    let localTransformUnlockAnim = AllAnimUnlock[cfg.anim];
    let localTransformUnlockAnimForFavApp = AllAnimUnlockForFavApp[cfg.fav];
    let localDurationForUnlockAnim = cfg.duration * speed;
    let localEasingForUnlockAnim = cfg.easing;
    let localDelayForUnlockAnim = cfg.delay * speed;
    let localDelayEasingForUnlockAnim = cfg.delayEasing * speed;
    let localFilterForUnlockAnim = cfg.filter ? cfg.filter() : "";
    let localGroupUnlockAnim = allGroupUnlockAnim[cfg.group];

    if (!localTransformUnlockAnim || !localTransformUnlockAnimForFavApp || !localGroupUnlockAnim) return;

    const runAllAppScreenReverseOpacity = () => {
        setTimeout(() => {
            allAppScreen.style.opacity = "0.001";
        }, 300);
    };

    const runAllAppScreenForwardOpacity = () => {
        allAppScreen.style.opacity = "";
    };

    runAllAppScreenReverseOpacity();

    favApp.querySelectorAll(".iconApp").forEach((el) => {
        if (cancelIfAnimating(document.getElementById(el.dataset.app))) el.classList.remove("hidden");
    });

    const reverseGroups = [...localGroupUnlockAnim].reverse();

    reverseGroups.forEach((group, groupIndex) => {
        const delay = groupIndex * localDelayForUnlockAnim - groupIndex * localDelayEasingForUnlockAnim;

        group.ids.forEach((id) => {
            const numericPart = id.slice(1);
            const [row, col] = numericPart.split("");
            const icon = currentAppScreenTmp.querySelector(`[data-unlocks*="${row}${col}"]`);

            if (!icon) return;

            if (cancelIfAnimating(document.getElementById(icon.dataset.app))) icon.classList.remove("hidden");

            icon.style.pointerEvents = "none";

            const [r, c] = icon.dataset.unlocka.split("");

            icon.animate(
                [
                    {
                        transform: "none",
                        zIndex: 1,
                        filter: "",
                    },
                    {filter: localFilterForUnlockAnim, opacity: 1},
                    {
                        opacity: 0,
                        transform: localTransformUnlockAnim[`${icon.dataset.unlockt}${r}${c}`],
                        zIndex: 0,
                        filter: localFilterForUnlockAnim,
                    },
                ],
                {
                    duration: localDurationForUnlockAnim,
                    delay,
                    easing: localEasingForUnlockAnim,
                    composite: "replace",
                }
            ).effect.updateTiming({fill: "backwards"});
        });
    });

    Object.entries(localTransformUnlockAnimForFavApp).forEach(([key, value]) => {
        const el = document.getElementById(key);
        if (!el) return;

        el.animate([{transform: "none", zIndex: 1}, {opacity: 1}, {opacity: 0, transform: value, zIndex: 0}], {
            duration: localDurationForUnlockAnim,
            delay: 0,
            easing: localEasingForUnlockAnim,
            composite: "replace",
        }).effect.updateTiming({fill: "backwards"});
    });

    const maxReverseDelay =
        localGroupUnlockAnim.length > 0
            ? (localGroupUnlockAnim.length - 1) * localDelayForUnlockAnim -
              (localGroupUnlockAnim.length - 1) * localDelayEasingForUnlockAnim
            : 0;
    const reverseWait = Math.max(300 * speed, maxReverseDelay + localDurationForUnlockAnim);
    await new Promise((resolve) => setTimeout(resolve, reverseWait));

    await script();

    localTransformUnlockAnim = AllAnimUnlock[cfg.anim];
    localTransformUnlockAnimForFavApp = AllAnimUnlockForFavApp[cfg.fav];
    localDurationForUnlockAnim = cfg.duration * speed;
    localEasingForUnlockAnim = cfg.easing;
    localDelayForUnlockAnim = cfg.delay * speed;
    localDelayEasingForUnlockAnim = cfg.delayEasing * speed;
    localFilterForUnlockAnim = cfg.filter ? cfg.filter() : "";
    localGroupUnlockAnim = allGroupUnlockAnim[cfg.group];

    runAllAppScreenForwardOpacity();

    favApp.querySelectorAll(".iconApp").forEach((el) => {
        if (cancelIfAnimating(document.getElementById(el.dataset.app))) el.classList.remove("hidden");
    });

    localGroupUnlockAnim.forEach((group, groupIndex) => {
        const delay = groupIndex * localDelayForUnlockAnim - groupIndex * localDelayEasingForUnlockAnim;

        group.ids.forEach((id) => {
            const numericPart = id.slice(1);
            const [row, col] = numericPart.split("");
            const icon = currentAppScreenTmp.querySelector(`[data-unlocks*="${row}${col}"]`);

            if (!icon) return;

            if (cancelIfAnimating(document.getElementById(icon.dataset.app))) icon.classList.remove("hidden");

            icon.style.pointerEvents = "";

            const [r, c] = icon.dataset.unlocka.split("");

            icon.animate(
                [
                    {
                        opacity: 0,
                        transform: localTransformUnlockAnim[`${icon.dataset.unlockt}${r}${c}`],
                        zIndex: 0,
                        filter: localFilterForUnlockAnim,
                    },
                    {filter: localFilterForUnlockAnim, opacity: 1},
                    {transform: "none", zIndex: 1, filter: ""},
                ],
                {
                    duration: localDurationForUnlockAnim,
                    delay,
                    easing: localEasingForUnlockAnim,
                    composite: "replace",
                }
            ).effect.updateTiming({fill: "backwards"});
        });
    });

    const delay =
        (localGroupUnlockAnim.length - 1) * localDelayForUnlockAnim -
        (localGroupUnlockAnim.length - 1) * localDelayEasingForUnlockAnim;

    Object.entries(localTransformUnlockAnimForFavApp).forEach(([key, value]) => {
        const el = document.getElementById(key);
        if (!el) return;

        el.animate([{opacity: 0, transform: value, zIndex: 0}, {opacity: 1}, {transform: "none", zIndex: 1}], {
            duration: localDurationForUnlockAnim,
            delay,
            easing: localEasingForUnlockAnim,
            composite: "replace",
        }).effect.updateTiming({fill: "backwards"});
    });
}

// lock

document.getElementById("powerBtn").addEventListener("click", powerBtnEvent);

let isOn = true;
let isLock = false;

function powerBtnEvent() {
    hideAllAlerts();
    closeControlsCenter();
    if (!isOn) {
        powerOn();
    } else {
        powerOff();
        if (!isLock) showLockScreen();
    }
}

const fingerBtn = document.getElementById("fingerBtn");
const phoneFrame = document.getElementById("frame");

const wallpaperLockPre = document.querySelector(".imageForWallpaperLock.preview");
const wallpaperLockColorPre = wallpaperLockPre.closest(".wallpaper");

const wallpaperLockColor = document.getElementById("wallpaperLock");
const wallpaperLock = document.getElementById("imageForWallpaperLock");
const bottomBtn = document.querySelector(".bottomBtn");
const statusBar = document.getElementById("statusBar");
const lockContent = document.querySelector("#lockContent");
const lockContentDiv = document.querySelector("#lockContent div");

function applyStyle(el, styleObj) {
    if (!el || !styleObj) return;

    for (const [key, value] of Object.entries(styleObj)) {
        const cssKey = key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
        el.style.setProperty(cssKey, value);
    }
}

function applyWallpaperStyle(style) {
    applyStyle(wallpaperLock, style.wallpaperLock);
    applyStyle(bottomBtn, style.bottomBtn);
    applyStyle(statusBar, style.statusBar);
    applyStyle(lockContent, style.lockContent);
}

let originColorWallpaperLock = "#54126eff",
    darkerColorWallpaperLock = "#925252ff";

let allWallpaperOffStyle = {
    0: {
        wallpaperLock: {
            width: "calc(0.4px * var(--bg-widthPhone))",
            height: "calc(0.4px * var(--bg-widthPhone))",
            translate: "0 calc((1px * var(--bg-widthPhone) - 0.4px * var(--bg-widthPhone)) / 2)",
            borderRadius: "0px",
            bottom: "calc(100% - calc(0.4px * var(--bg-widthPhone)))",
        },
        bottomBtn: {opacity: "0"},
        statusBar: {opacity: "0"},
        lockContent: {
            translate: "0 calc((1px * var(--bg-widthPhone) - 0.5px * var(--bg-widthPhone)))",
            transform: "scale(0.9)",
        },
    },

    1: {
        wallpaperLock: {
            height: "calc(100% - 300px)",
            width: "calc(100% - 50px)",
            translate: "0 00%",
            borderRadius: "calc(0.06px * var(--bg-widthPhone))",
            scale: "0.95",
            bottom: "50px",
        },
        bottomBtn: {opacity: "0"},
        statusBar: {opacity: "0"},
        lockContent: {translate: "var(--bg-lockClockTranslate)", transform: "none"},
    },

    2: {
        wallpaperLock: {
            bottom: "0px",
            scale: "1.1",
            opacity: "0.8",
            height: "100%",
            width: "100%",
            translate: "none",
            borderRadius: "var(--bg-borderRadiusPhone)",
        },
        bottomBtn: {opacity: "0"},
        statusBar: {opacity: "0"},
        lockContent: {translate: "var(--bg-lockClockTranslate)", transform: "none"},
    },
};

let currentWallpaperOffStyle = allWallpaperOffStyle[1];

function wallpaperOffStyle() {
    wallpaperLockColor.style.background = "linear-gradient(#000000ff)";
    applyWallpaperStyle(currentWallpaperOffStyle);
}

let allWallpaperOnStyle = {
    1: {
        wallpaperLock: {
            height: "calc(100% - 300px)",
            width: "calc(100% - 50px)",
            translate: "0 00%",
            borderRadius: "calc(0.06px * var(--bg-widthPhone))",
            bottom: "50px",
            scale: "none",
        },
        bottomBtn: {opacity: "1"},
        statusBar: {opacity: "1"},
        lockContent: {translate: "var(--bg-lockClockTranslate)", transform: "none"},
    },

    2: {
        wallpaperLock: {
            bottom: "0px",
            height: "100%",
            width: "100%",
            translate: "none",
            borderRadius: "var(--bg-borderRadiusPhone)",
            scale: "none",
            opacity: "1",
        },
        bottomBtn: {opacity: "1"},
        statusBar: {opacity: "1"},
        lockContent: {translate: "var(--bg-lockClockTranslate)", transform: "none"},
    },
};

let currentWallpaperOnStyle = 1;

{
    const activeItem = document.querySelector(
        '#app_SettingsAppLockEditor [name="allWallpaperOnStyle"] .itemChild.active'
    );
    activeItem.classList.remove("active");

    const needActive = document.querySelector(
        `#app_SettingsAppLockEditor [name="allWallpaperOnStyle"] [data-allwallpaperonstyle="${
            parseInt(localStorage.getItem(`allWallpaperOnStyle-${deviceType}`)) || 1
        }"]`
    );
    needActive.classList.add("active");
}

wallpaperLockPre.animate([{}, currentWallpaperOnStyle.wallpaperLock], {
    fill: "forwards",
});

function wallpaperOnStyle() {
    const gradient =
        currentWallpaperOnStyle == allWallpaperOnStyle[1]
            ? `linear-gradient(${darkerColorWallpaperLock}, ${originColorWallpaperLock})`
            : `linear-gradient(#000, #000)`;
    wallpaperLockColor.style.background = gradient;
    applyWallpaperStyle(currentWallpaperOnStyle);
}

let doubleTapOnOff = 1;
function powerOff() {
    isOn = false;
    phone.classList.add("off");

    wallpaperOffStyle();

    hidePasswordScreen();

    removeEventListener_cc();

    // event listener
    if (doubleTapOnOff) lockScreen.addEventListener("click", powerOn2TapLockScreen);
    lockScreen.removeEventListener("click", powerOff2TapLockScreen);

    pauseVideoCanvas("wallpaperLock");

    //notif
    /*
    removeScroll(document.querySelector(".stackWrapper"), document.querySelector(".stackContainer"));
    stackWrapper.style.display = "none";
    notifBtn.toggleClick = 1;
    notifBtn.classList.remove("hidden"); 
    */
}

function powerOn() {
    isOn = true;
    phone.classList.remove("off");

    wallpaperOnStyle();

    addEventListener_cc();

    // event listener
    if (doubleTapOnOff) lockScreen.addEventListener("click", powerOff2TapLockScreen);
    lockScreen.removeEventListener("click", powerOn2TapLockScreen);

    resumeVideoCanvas("wallpaperLock");
}

const lockScreen = document.getElementById("lockScreen");
const statusClock = document.getElementById("statusClock");
const networkName = document.getElementById("networkName");

function fingerBtnPointerDown(e) {
    hiddenLockScreen();
    run_fingerprint_animation();
    fingerBtnAnim.style.pointerEvents = "all";
    e.preventDefault();
    e.stopPropagation();
    window.addEventListener("pointerup", fingerBtnPointerUp);
}
function fingerBtnPointerUp() {
    fingerBtnAnim.style.pointerEvents = "none";
    window.removeEventListener("pointerup", fingerBtnPointerUp);
}

function showLockScreen() {
    fingerBtn.addEventListener("pointerdown", fingerBtnPointerDown);

    allAppScreen.classList.add("hidden");
    lockScreen.style.display = "flex";
    allAppScreen.style.pointerEvents = "none";

    statusClock.style.display = "none";
    networkName.style.display = "flex";

    isLock = true;

    //containerNotif.innerHTML = "";

    // event listener
    lockScreen.addEventListener("pointerdown", pointerdown_scrollLockScreenToUnlock);
    window.addEventListener("pointermove", pointermove_scrollLockScreenToUnlock);
    window.addEventListener("pointerup", pointerup_scrollLockScreenToUnlock);
    run_fadein_animation();

    containerNotif.style.display = "none";

    islands.classList.add("Ihidden");

    if (allAppScreen.classList.contains("scaleForEdit")) closeEditorHomeScreen();

    if (dragTarget) pointerUpIconWhileDragIconNoAnim();

    return;
    const wallpaperLockStyle = getComputedStyle(wallpaperHome);
    wallpaperLock.animate(
        [
            {
                background: `${wallpaperLockStyle.backgroundImage} no-repeat center/cover`,
                translate: wallpaperLockStyle.translate,
                borderRadius: wallpaperLockStyle.borderRadius,
                width: wallpaperLockStyle.width,
                height: wallpaperLockStyle.height,
                bottom: wallpaperLockStyle.bottom,
                scale: wallpaperLockStyle.scale,
            },
            {
                background: "",
                translate: "",
                borderRadius: "",
                width: "",
                height: "",
                bottom: "",
                scale: "",
            },
        ],
        {
            duration: 300 * speed,
            easing: "ease",
        }
    );
}

function hiddenLockScreen() {
    fingerBtn.removeEventListener("pointerdown", hiddenLockScreen);

    allAppScreen.classList.remove("hidden");
    allAppScreen.style.pointerEvents = lockScreen.style.display = "";
    unlockAnimWA();

    statusClock.style.display = networkName.style.display = "";

    isLock = false;
    if (!isOn) {
        powerOn();
        isOn = true;
    }

    hidePasswordScreen();

    // event listener
    lockScreen.removeEventListener("pointerdown", pointerdown_scrollLockScreenToUnlock);
    window.removeEventListener("pointermove", pointermove_scrollLockScreenToUnlock);
    window.removeEventListener("pointerup", pointerup_scrollLockScreenToUnlock);

    containerNotif.style.display = "";

    islands.classList.remove("Ihidden");

    pauseVideoCanvas("wallpaperLock");

    //notif
    //removeScroll(document.querySelector(".stackWrapper"), document.querySelector(".stackContainer"));
}

// nhấn đúp -> sáng/tắt màn
let powerOn2TapLockScreenClickTime = 0;
function powerOn2TapLockScreen() {
    const currentTime = Date.now();
    const tapInterval = currentTime - powerOn2TapLockScreenClickTime;

    if (tapInterval < 400 && tapInterval > 0) {
        powerOn();
    }

    powerOn2TapLockScreenClickTime = currentTime;
}
let powerOff2TapLockScreenClickTime = 0;
function powerOff2TapLockScreen(e) {
    if (passwordScreen.classList.contains("open") || e.target.closest(".stackContainer")) return;
    const currentTime = Date.now();
    const tapInterval = currentTime - powerOff2TapLockScreenClickTime;

    if (tapInterval < 400 && tapInterval > 0) {
        powerOff();
    }

    powerOff2TapLockScreenClickTime = currentTime;
}

// scroll lockScreen on  up to hiddenLockScreen()
const scaleForOff = document.getElementById("scaleForOff");

let startY_lock = 0;
let currentY_lock = 0;
let lastY_lock = 0;
let lastTime_lock = 0;
let velocity_lock = 0;
let isDragging_lock = false;

function pointerdown_scrollLockScreenToUnlock(e) {
    if (!isOn || isOpened_pw || e.target.closest(".stackContainer")) return;
    startY_lock = e.clientY;
    currentY_lock = startY_lock;
    lastY_lock = startY_lock;
    lastTime_lock = Date.now();
    velocity_lock = 0;
    isDragging_lock = true;
    scaleForOff.style.transition = "transform 0.1s";
    e.preventDefault();
}

function pointermove_scrollLockScreenToUnlock(e) {
    if (!isDragging_lock) return;

    currentY_lock = e.clientY;
    let now = Date.now();

    // Tính vận tốc tại 100ms cuối
    let dt = now - lastTime_lock;
    if (dt > 0) {
        velocity_lock = (currentY_lock - lastY_lock) / dt; // px/ms
        lastY_lock = currentY_lock;
        lastTime_lock = now;
    }

    // Giới hạn chỉ vuốt lên (deltaY âm)
    let deltaY = currentY_lock - startY_lock;
    if (deltaY > 0) deltaY = 0;

    let scaleValue = 1 + deltaY / 2000;
    if (scaleValue < 0.9) scaleValue = 0.9;

    scaleForOff.style.transform = `scale(${scaleValue})`;
    e.preventDefault();
}

function pointerup_scrollLockScreenToUnlock(e) {
    if (!isDragging_lock) return;
    isDragging_lock = false;
    scaleForOff.style.transition = "";

    let deltaY = currentY_lock - startY_lock;

    // velocity_lock âm nghĩa là vuốt lên, ta lấy trị tuyệt đối để so sánh tốc độ
    let speed = Math.abs(velocity_lock);

    // Điều kiện: đủ cao (vuốt lên > 80px) và đủ nhanh (trên 0.5 px/ms)
    if (deltaY < -80 && speed > 0.5) {
        scaleForOff.style.transform = "";
        showPasswordScreen(hiddenLockScreen);
    } else {
        scaleForOff.style.transform = "";
    }
}

//notif
// ==== notif btn ====
/*

const notifBtn = document.querySelector(".notifBtn");
notifBtn.toggleClick = 0;
notifBtn.clickEvent = function (e) {
    if (notifBtn.toggleClick) {
        addScrollScript(document.querySelector(".stackWrapper"), document.querySelector(".stackContainer"), (y) => {
            updateStack(containerLockNotif);
            if (y < -60) lockContentDiv.style.transform = `translate(0px, ${y + 60}px)`;
        });
        stackWrapper.style.display = "";
        runFor(500, () => {
            updateStack(containerLockNotif);
        });
        setTimeout(() => {
            removeScroll(document.querySelector(".stackWrapper"), document.querySelector(".stackContainer"));
            addScrollScriptWithoutReset(
                document.querySelector(".stackWrapper"),
                document.querySelector(".stackContainer"),
                (y) => {
                    updateStack(containerLockNotif);
                    if (y < -60) lockContentDiv.style.transform = `translate(0px, ${y + 60}px)`;
                }
            );
        }, 500);
        e.target.classList.add("hidden");
    } else {
        removeScroll(document.querySelector(".stackWrapper"), document.querySelector(".stackContainer"));
        stackWrapper.style.display = "none";
        e.target.classList.remove("hidden");
    }
    notifBtn.toggleClick = !notifBtn.toggleClick;
};
notifBtn.addEventListener("click", notifBtn.clickEvent);

*/
