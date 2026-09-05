const root = document.documentElement;
const rootStyle = getComputedStyle(root);
let vst = "2.0.50",
    vstt = "2050";

let buildProp = {};

let deviceType;
let originDeviceType;

window.addEventListener("DOMContentLoaded", async () => {
    // Run init.js as module
    try {
        await import("/OriginWEB/init.js");
    } catch (err) {
        console.error("Failed to load /OriginWEB/init.js", err);
    }
});
function formatSize(bytes) {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
}
const deviceMemory = navigator.deviceMemory;

let appScreenWidth;
let appScreenHeight;

async function updateGap() {
    const fav = document.querySelector(".favApp, #favApp");
    if (allApp.classList.contains("scaleForEdit")) return;

    const getCSSVar = (name) => parseFloat(getComputedStyle(root).getPropertyValue(name));
    const cell = getCSSVar("--icon-px");

    /* GAP X */
    const usedW = COLS * cell;
    const freeW = appScreenWidth - usedW;
    const gapX = COLS > 1 ? freeW / (COLS - 1) : 0;

    /* GAP Y */
    const usedH = ROWS * cell;
    const freeH = appScreenHeight - usedH;
    const gapY = ROWS > 1 ? freeH / (ROWS - 1) : 0;

    root.style.setProperty("--gap-x", `${Math.max(gapX, 0)}px`);
    root.style.setProperty("--gap-y", `${Math.max(gapY, 0)}px`);

    {
        const style = getComputedStyle(fav);
        const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + 8;

        const contentWidth = fav.clientWidth - padding;

        const used = COLS * cell;
        const free = contentWidth - used;

        const gap = COLS > 1 ? free / (COLS - 1) : 0;

        root.style.setProperty("--fav-gap-x", `${Math.max(gap, 0)}px`);
    }
}
