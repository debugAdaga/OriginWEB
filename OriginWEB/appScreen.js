let dragTarget = null;
let preview = null;
let originCol, originRow, originColEnd, originRowEnd, originParent;
let holdTimer = null;
let isDragging = false;
let timeOutRemovePreviewIcon = null;

let iconType = localStorage.getItem("iconPack") || "exquisite_icons";

let startXMovingIcon = 0,
    startYMovingIcon = 0;
let scriptTriggered = false;

const nav = document.getElementById("nav");
//const navOvlay = document.getElementById("navOvlay");

const favApp = document.getElementById("favApp");
let currentAppScreen = document.getElementById("appScreen1");

const allAppScreen = document.getElementById("allAppIconScreen");

const phone = document.getElementById("phone");
let phoneRect = phone.getBoundingClientRect();
window.addEventListener("resize", () => {
    phoneRect = phone.getBoundingClientRect();
    invalidateScreenCache();
});

const blurAllApp = document.getElementById("blurAllApp");

const scrollAppScreen = document.getElementById("horizontalScrollAppScreen");

let COLS = window.getComputedStyle(root).getPropertyValue("--appscreen-grid-col");
let ROWS = window.getComputedStyle(root).getPropertyValue("--appscreen-grid-row");

let speed = getComputedStyle(document.documentElement).getPropertyValue("--bg-speedAnimation");
const DEBUG = false;

let powerOff2TapHomeScreenClickTime = 0;

function powerOff2TapHomeScreen(e) {
    if (e.target.matches(".appScreen")) {
        const currentTime = Date.now();
        const tapInterval = currentTime - powerOff2TapHomeScreenClickTime;

        if (tapInterval < 400 && tapInterval > 0) {
            powerOff();
            showLockScreen();
        }

        powerOff2TapHomeScreenClickTime = currentTime;
    }
}

function pointerUpIcon(e) {
    if (holdTimer) {
        if (currentOpeningElApp) {
            currentOpeningElApp.classList.add("multiClick");
            closeApp();
        }
        clearTimeoutHoldTimer();
        openApp(e.target);
        holdTimer = null;
        window.removeEventListener("pointercancel", clearTimeoutHoldTimer);
        window.removeEventListener("mousemove", clearTimeoutHoldTimer);
    }
}
function clearTimeoutHoldTimer() {
    clearTimeout(holdTimer);
    window.removeEventListener("pointercancel", clearTimeoutHoldTimer);
    window.removeEventListener("mousemove", clearTimeoutHoldTimer);
}

function pointerDownPreviewIconOnBlur(e) {
    isDragging = true;
    scriptTriggered = false;

    startXMovingIcon = e.clientX - phoneRect.left;
    startYMovingIcon = e.clientY - phoneRect.top;
}

async function startDrag(icon, e) {
    if (dragTarget) await pointerUpIconWhileDragIconNoAnim();
    dragTarget = icon;
    isDragging = true;

    scriptTriggered = false;
    startXMovingIcon = e.clientX - phoneRect.left;
    startYMovingIcon = e.clientY - phoneRect.top;

    originParent = icon.parentElement;

    icon.style.visibility = "hidden";

    const rect = icon.getBoundingClientRect();

    preview = document.createElement("div");
    preview.classList.add("previewIcon");
    preview.style.left = rect.left - phoneRect.left + "px";
    preview.style.top = rect.top - phoneRect.top + "px";

    const cs = window.getComputedStyle(icon);
    preview.style.backgroundImage = cs.backgroundImage;
    preview.style.backgroundColor = cs.backgroundColor;
    preview.style.backgroundSize = cs.backgroundSize;
    preview.style.backgroundPosition = cs.backgroundPosition;
    preview.style.backgroundRepeat = cs.backgroundRepeat;

    const width = rect.width;
    const height = rect.height;
    const offsetW = width * 0.1;
    const offsetH = height * 0.1;

    originRow = parseInt(cs.gridRowStart);
    originCol = parseInt(cs.gridColumnStart);
    originRowEnd = cs.gridRowEnd === "auto" ? originRow + 1 : parseInt(cs.gridRowEnd);
    originColEnd = cs.gridColumnEnd === "auto" ? originCol + 1 : parseInt(cs.gridColumnEnd);

    let containerPosition = "top";
    if (originRow < 3 && icon.parentElement.id !== "favApp") containerPosition = "bottom";

    if (DEBUG) console.log(originRow, originCol, originRowEnd, originColEnd);
    preview.animate(
        [
            {
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate(0, 0)`,
            },
            {
                width: `${width * 1.2}px`,
                height: `${height * 1.2}px`,
                transform: `translate(${-offsetW}px, ${-offsetH}px)`,
            },
        ],
        {
            duration: 400,
            easing: "cubic-bezier(0.5, 2.5, 0.65, 1)",
            fill: "forwards",
        }
    );

    phone.appendChild(preview);

    preview.setAttribute("data-app", icon.dataset.app);
    preview.innerHTML = `
    <div class='containerPreview ${containerPosition} liquid noActiveAnim'>
        <button onclick='removeApp("${preview.dataset.app}")' style='color: red'>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 -960 960 960'>
                <path d='m379-278 101-102 102 102 80-80-102-102 102-102-80-80-102 102-101-102-80 80 101 102-101 102 80 80ZM267-74q-55.73 0-95.86-39.44Q131-152.88 131-210v-501H68v-136h268v-66h287v66h269v136h-63v501q0 57.12-39.44 96.56Q750.13-74 693-74H267Zm426-637H267v501h426v-501Zm-426 0v501-501Z'/>
            </svg>
            remove
        </button>

        <button onclick="extendIcon(dragTarget || this.closest('.iconApp'), 1, 2)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path d="M210-234q-56.73 0-96.36-40.14Q74-314.27 74-370v-220q0-55.72 39.64-95.86Q153.27-726 210-726h540q56.72 0 96.36 40.14T886-590v220q0 55.73-39.64 95.86Q806.72-234 750-234H210Z"/>
            </svg>
            1&times;2
        </button>
        <button onclick="extendIcon(dragTarget || this.closest('.iconApp'), 2, 1)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path d="M375-74q-57.12 0-96.56-39.44Q239-152.88 239-210v-540q0-57.13 39.44-96.56Q317.88-886 375-886h210q57.13 0 96.56 39.44Q721-807.13 721-750v540q0 57.12-39.44 96.56Q642.13-74 585-74H375Z"/>
            </svg>
            2&times;1
        </button>
        <button onclick="extendIcon(dragTarget || this.closest('.iconApp'), 2, 2)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" style="scale: 1.2">
                <path d="M210-74q-57.12 0-96.56-39.44Q74-152.88 74-210v-540q0-57.13 39.44-96.56Q152.88-886 210-886h540q57.13 0 96.56 39.44Q886-807.13 886-750v540q0 57.12-39.44 96.56Q807.13-74 750-74H210Z"/>
            </svg>
            2&times;2
        </button>


        <button onclick="narrowIcon(dragTarget || this.closest('.iconApp'), 1, 1)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" style="scale: 0.7">
                <path d="M210-74q-57.12 0-96.56-39.44Q74-152.88 74-210v-540q0-57.13 39.44-96.56Q152.88-886 210-886h540q57.13 0 96.56 39.44Q886-807.13 886-750v540q0 57.12-39.44 96.56Q807.13-74 750-74H210Z"/>
            </svg>
            1&times;1
        </button>
    </div>
    
    <div class="dropPos"></div>
    `;
    previewDropPos = preview.querySelector(".dropPos");
    previewContainer = preview.querySelector(".containerPreview");

    clearTimeout(timeOutRemovePreviewIcon);
    createAppScreen();
    allApp.classList.add("scaleForMovingApp");
}

let autoScrollInterval = null;
let tempSwapState = null;
let pendingRestoreTimeout = null;
let pendingRestorePos = null;
let pendingRestoreSlot = null;
let previewDropPos = null;
let previewContainer = null;

function animateGridRelayout(elements, applyLayout) {
    const first = new Map();
    for (const el of elements) {
        first.set(el, el.getBoundingClientRect());
    }

    applyLayout();

    requestAnimationFrame(() => {
        for (const el of elements) {
            const f = first.get(el);
            if (!f) continue;
            const last = el.getBoundingClientRect();
            const dx = f.left - last.left;
            const dy = f.top - last.top;
            if (dx || dy) {
                el.animate([{transform: `translate(${dx}px, ${dy}px)`}, {transform: "translate(0, 0)"}], {
                    duration: 322,
                    easing: "cubic-bezier(.22,.61,.36,1)",
                    composite: "add",
                });
            }
        }
    });
}

function getGridRect(el) {
    const cs = getComputedStyle(el);
    let rowStart = parseInt(cs.gridRowStart);
    let colStart = parseInt(cs.gridColumnStart);
    if (isNaN(rowStart) || isNaN(colStart)) return null;
    let rowEnd = parseInt(cs.gridRowEnd);
    let colEnd = parseInt(cs.gridColumnEnd);
    if (isNaN(rowEnd)) rowEnd = rowStart + 1;
    if (isNaN(colEnd)) colEnd = colStart + 1;
    return {rowStart, colStart, rowEnd, colEnd};
}

function getHoverSlot(x, y, rowSpan, colSpan) {
    const containers = getContainers();

    for (const container of containers) {
        const rect = container.getBoundingClientRect();
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) continue;

        const isFav = container.id === "favApp";
        const maxCols = COLS;
        const maxRows = isFav ? 1 : ROWS;

        let col = Math.floor(((x - rect.left) / rect.width) * maxCols) + 1;
        let row = isFav ? 1 : Math.floor(((y - rect.top) / rect.height) * maxRows) + 1;

        col = Math.min(maxCols, Math.max(1, col));
        row = Math.min(maxRows, Math.max(1, row));

        if (row + rowSpan - 1 > maxRows) row = maxRows - rowSpan + 1;
        if (col + colSpan - 1 > maxCols) col = maxCols - colSpan + 1;

        if (row < 1 || col < 1) continue;

        return {container, row, col, rowSpan, colSpan};
    }

    return null;
}

function restoreTempSwap() {
    if (!tempSwapState) return;
    const elements = tempSwapState.items.map((i) => i.el);
    animateGridRelayout(elements, () => {
        for (const item of tempSwapState.items) {
            item.el.style.gridArea = item.gridArea;
            if (item.parent && item.el.parentElement !== item.parent) {
                item.parent.appendChild(item.el);
            }
        }
    });
    tempSwapState = null;
    if (pendingRestoreTimeout) {
        clearTimeout(pendingRestoreTimeout);
        pendingRestoreTimeout = null;
    }
    pendingRestorePos = null;
    pendingRestoreSlot = null;
}

function tryTempSwap(slot) {
    if (!slot || !dragTarget) return;

    const {container, row, col, rowSpan, colSpan} = slot;
    const items = [];

    const allIcons = container.querySelectorAll(".iconApp");
    for (const icon of allIcons) {
        if (icon === dragTarget) continue;
        const rect = getGridRect(icon);
        if (!rect) continue;

        const intersects = !(
            rect.rowEnd <= row ||
            rect.rowStart >= row + rowSpan ||
            rect.colEnd <= col ||
            rect.colStart >= col + colSpan
        );
        if (!intersects) continue;

        const fullyInside =
            rect.rowStart >= row &&
            rect.rowEnd <= row + rowSpan &&
            rect.colStart >= col &&
            rect.colEnd <= col + colSpan;
        if (!fullyInside) return;

        items.push({
            el: icon,
            parent: icon.parentElement,
            gridArea: `${rect.rowStart} / ${rect.colStart} / ${rect.rowEnd} / ${rect.colEnd}`,
            relRow: rect.rowStart - row,
            relCol: rect.colStart - col,
            relRowEnd: rect.rowEnd - row,
            relColEnd: rect.colEnd - col,
        });
    }

    if (!items.length) return;

    restoreTempSwap();

    const originParentEl = originParent || dragTarget.parentElement;
    const elements = items.map((i) => i.el);
    animateGridRelayout(elements, () => {
        items.forEach((item) => {
            const newRowStart = originRow + item.relRow;
            const newColStart = originCol + item.relCol;
            const newRowEnd = originRow + item.relRowEnd;
            const newColEnd = originCol + item.relColEnd;
            item.el.style.gridArea = `${newRowStart} / ${newColStart} / ${newRowEnd} / ${newColEnd}`;
            if (originParentEl && item.el.parentElement !== originParentEl) {
                originParentEl.appendChild(item.el);
            }
        });
    });

    tempSwapState = {
        container,
        row,
        col,
        rowSpan,
        colSpan,
        items,
    };
}

function pointerMovingIcon(e) {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const x = clientX - phoneRect.left;
    const y = clientY - phoneRect.top;
    // ==== CHECK KHOẢNG CÁCH ====
    const dx = x - startXMovingIcon;
    const dy = y - startYMovingIcon;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= 50 && !scriptTriggered) {
        scriptTriggered = true;
        allApp.classList.remove("scaleForMovingApp");
        preview.style.translate = "";
        preview.querySelector(".containerPreview").classList.add("hidden");
    }

    if (!scriptTriggered) {
        return;
    }

    //preview.style.left = x - preview.offsetWidth / 2 + "px";
    //preview.style.top = y - preview.offsetHeight / 2 + "px";
    preview.style.translate = `${dx}px ${dy}px`;

    const rowSpan = Math.max(1, originRowEnd ? originRowEnd - originRow : 1);
    const colSpan = Math.max(1, originColEnd ? originColEnd - originCol : 1);
    const rectDropPos = preview.querySelector(".dropPos").getBoundingClientRect();
    const slotX = rectDropPos.left + rectDropPos.width / 2;
    const slotY = rectDropPos.top + rectDropPos.height / 2;
    const slot = getHoverSlot(slotX, slotY, rowSpan, colSpan);
    if (tempSwapState) {
        const sameSlot =
            slot &&
            tempSwapState.container === slot.container &&
            tempSwapState.row === slot.row &&
            tempSwapState.col === slot.col;
        if (!sameSlot) {
            if (!pendingRestoreTimeout) {
                pendingRestorePos = {x: slotX, y: slotY};
                pendingRestoreTimeout = setTimeout(() => {
                    restoreTempSwap();
                }, 322);
            } else if (pendingRestorePos) {
                const dxr = slotX - pendingRestorePos.x;
                const dyr = slotY - pendingRestorePos.y;
                if (dxr * dxr + dyr * dyr > 100) {
                    clearTimeout(pendingRestoreTimeout);
                    pendingRestoreTimeout = null;
                    pendingRestorePos = {x: slotX, y: slotY};
                    pendingRestoreTimeout = setTimeout(() => {
                        restoreTempSwap();
                    }, 322);
                }
            }
        } else if (pendingRestoreTimeout) {
            clearTimeout(pendingRestoreTimeout);
            pendingRestoreTimeout = null;
            pendingRestorePos = null;
        }
    }
    if (!tempSwapState && !pendingRestoreTimeout) tryTempSwap(slot);

    handleAutoScroll(x);
}

function handleAutoScroll(x) {
    const threshold = 20; // px mép trái/phải để kích hoạt

    clearInterval(autoScrollInterval);

    if (x < threshold) {
        // sát bên trái
        autoScrollInterval = setInterval(() => {
            if (scrollAppScreen.scrollLeft > 0) {
                scrollAppScreen.scrollBy({left: -10, behavior: "smooth"});
            }
        }, 11 - 0);
    } else if (phoneRect.width - x < threshold) {
        // sát bên phải
        autoScrollInterval = setInterval(() => {
            const maxScroll = scrollAppScreen.scrollWidth - scrollAppScreen.clientWidth;
            if (scrollAppScreen.scrollLeft < maxScroll) {
                scrollAppScreen.scrollBy({left: 10, behavior: "smooth"});
            }
        }, 100);
    }
}

async function finishDragAnimation({removeBlur = false}, timeout = 300) {
    clearInterval(autoScrollInterval);
    isDragging = false;

    const rect = dragTarget.getBoundingClientRect();
    const previewRect = preview.getBoundingClientRect();

    const deltaX = rect.left - previewRect.left;
    const deltaY = rect.top - previewRect.top;

    const offsetW = (rect.width * 0.2) / 2;
    const offsetH = (rect.height * 0.2) / 2;

    preview.animate(
        [
            {width: "", height: "", transform: ""},
            {
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                transform: `translate(${deltaX - offsetW}px, ${deltaY - offsetH}px)`,
            },
        ],
        {
            duration: timeout,
            easing: "ease",
            fill: "forwards",
        }
    );

    async function timeoutF() {
        preview?.remove();
        previewDropPos = null;
        previewContainer = null;
        previewDropPos = null;
        previewContainer = null;

        await updateAppPosNoRemove(() => {
            const favIcons = favApp ? favApp.querySelectorAll(".iconApp") : [];
            const layers = findWaterDrop(dragTarget, [...currentAppScreen.querySelectorAll(".iconApp"), ...favIcons]);
            addAnimationWaterDrop(dragTarget, layers);

            dragTarget.animate([{transform: "scale(1)"}, {transform: "scale(0.8)"}, {transform: "scale(1)"}], {
                duration: 500,
                easing: "ease-out",
            });
        });
        if (removeBlur) allApp.classList.remove("scaleForMovingApp");

        dragTarget.style.visibility = "";
        dragTarget = null;
        preview = null;
    }

    if (timeout) {
        timeOutRemovePreviewIcon = setTimeout(timeoutF, timeout);

        await cleanupEmptyScreens();
        saveAppLayout();
    } else await timeoutF();

    document.removeEventListener("pointermove", pointerMovingIcon);
    document.removeEventListener("pointerup", pointerUpIconWhileDragIcon);
    document.removeEventListener("pointercancel", pointerUpIconWhileDragIcon);
}
async function pointerUpIconWhileDragIcon(e) {
    if (holdTimer) clearTimeout(holdTimer);
    if (!isDragging || !dragTarget) return;

    if (!scriptTriggered) {
        isDragging = false;
        scriptTriggered = true;

        blurAllApp.addEventListener("pointerup", pointerUpIconWhileDragIconForBlurApp);
        blurAllApp.style.pointerEvents = "all";

        preview.addEventListener("pointerdown", pointerDownPreviewIconOnBlur);
        return;
    }

    blurAllApp.removeEventListener("pointerup", pointerUpIconWhileDragIconForBlurApp);
    blurAllApp.style.pointerEvents = "";

    const rectDropPos = previewDropPos.getBoundingClientRect();
    const x = rectDropPos.left;
    const y = rectDropPos.top;

    const dropSlot = findSmartEmptySlot(x, y, originRowEnd, originColEnd);
    if (dropSlot) {
        if (
            tempSwapState &&
            (tempSwapState.container !== dropSlot.container ||
                tempSwapState.row !== dropSlot.row ||
                tempSwapState.col !== dropSlot.col)
        ) {
            restoreTempSwap();
        } else if (tempSwapState) {
            tempSwapState = null;
        }
        dropSlot.container.appendChild(dragTarget);
    } else {
        restoreTempSwap();
        tb_system("not enough space");
        originParent.appendChild(dragTarget);
        dragTarget.style.gridArea = `${originRow} / ${originCol} / ${originRowEnd} / ${originColEnd}`;
    }

    await finishDragAnimation({removeBlur: false});
}
async function pointerUpIconWhileDragIconForBlurApp(e) {
    if (holdTimer) clearTimeout(holdTimer);
    if (!dragTarget) return;
    restoreTempSwap();

    blurAllApp.removeEventListener("pointerup", pointerUpIconWhileDragIconForBlurApp);
    blurAllApp.style.pointerEvents = "";

    previewContainer?.classList.add("hidden");

    await finishDragAnimation({removeBlur: true});
}
async function pointerUpIconWhileDragIconNoAnim(e) {
    if (holdTimer) clearTimeout(holdTimer);
    if (!dragTarget) return;
    restoreTempSwap();

    blurAllApp.removeEventListener("pointerup", pointerUpIconWhileDragIconForBlurApp);
    blurAllApp.style.pointerEvents = "";

    previewContainer?.classList.add("hidden");

    await finishDragAnimation({removeBlur: true}, 0);
}

let screenCounter = 2;
async function createAppScreen(idScreen = "") {
    const screen = document.createElement("div");
    screen.className = "appScreen";

    if (!idScreen) screen.id = `appScreen${screenCounter++}`;
    else screen.id = idScreen;

    scrollAppScreen.appendChild(screen);
    invalidateScreenCache();

    await buildDots();
    return screen;
}

async function cleanupEmptyScreens() {
    const screens = getAppScreens();
    screens.forEach((screen) => {
        if (!screen.querySelector(".iconApp")) {
            screen.remove();
            screenCounter--;
        }
    });
    invalidateScreenCache();
    await buildDots();
}
function isAreaFree(container, row, col, rowSpan, colSpan, ignoreEl) {
    const targetRowEnd = row + rowSpan;
    const targetColEnd = col + colSpan;

    return !Array.from(container.children).some((child) => {
        if (child === ignoreEl) return false;

        const cs = getComputedStyle(child);

        const r1 = parseInt(cs.gridRowStart);
        const c1 = parseInt(cs.gridColumnStart);

        if (isNaN(r1) || isNaN(c1)) return false;

        let r2 = parseInt(cs.gridRowEnd);
        let c2 = parseInt(cs.gridColumnEnd);

        if (isNaN(r2)) r2 = r1 + 1;
        if (isNaN(c2)) c2 = c1 + 1;

        // overlap check
        return !(targetRowEnd <= r1 || row >= r2 || targetColEnd <= c1 || col >= c2);
    });
}
function findSmartEmptySlot(x, y, rowEnd, colEnd) {
    const containers = getContainers();

    for (const container of containers) {
        const rect = container.getBoundingClientRect();
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) continue;

        const isFav = container.id === "favApp";
        const maxCols = COLS;
        const maxRows = isFav ? 1 : ROWS;

        // vị trí pointer → cell
        let col = Math.floor(((x - rect.left) / rect.width) * maxCols) + 1;
        let row = isFav ? 1 : Math.floor(((y - rect.top) / rect.height) * maxRows) + 1;

        col = Math.min(maxCols, Math.max(1, col));
        row = Math.min(maxRows, Math.max(1, row));

        //  span icon
        const rowSpan = Math.max(1, rowEnd ? rowEnd - originRow : 1);
        const colSpan = Math.max(1, colEnd ? colEnd - originCol : 1);

        //  không vượt biên
        if (row + rowSpan - 1 > maxRows) row = maxRows - rowSpan + 1;
        if (col + colSpan - 1 > maxCols) col = maxCols - colSpan + 1;

        if (row < 1 || col < 1) continue;

        //  check cell-map overlap
        if (!isAreaFree(container, row, col, rowSpan, colSpan, dragTarget)) continue;

        //  apply
        dragTarget.style.gridArea = `${row} / ${col} / ${row + rowSpan} / ${col + colSpan}`;
        return {container, row, col};
    }

    return null;
}
function applyIconBackgroundBySize(icon, sizeKey, setForPreviewIcon = false) {
    let imgKey = `image${sizeKey}`;
    let imgKey2 = `support${sizeKey}`;

    let bgKey = `/OriginWEB/originData/iconPacks/${iconType}/`;

    if (!icon.dataset[imgKey]) {
        imgKey = imgKey2;
        bgKey = "";
        if (!icon.dataset[imgKey]) return false;
        else if (icon.dataset[imgKey] === "1") return true;
    } else if (icon.dataset[imgKey] === "1") return true;
    const bgImage = `url('${bgKey}${icon.dataset[imgKey]}')`;
    icon.style.backgroundImage = bgImage;

    if (setForPreviewIcon && preview) {
        preview.style.backgroundImage = bgImage;

        preview.animate([{filter: "blur(10px)"}, {filter: "blur(0px)"}], {
            duration: 400,
            easing: "ease",
            fill: "forwards",
        });
    }
    return true;
}

function extendIcon(icon, rowSpan = 1, colSpan = 2) {
    const sizeKey = `${rowSpan}x${colSpan}`;

    const container = icon.parentElement;
    const cs = getComputedStyle(icon);

    let baseRow = parseInt(cs.gridRowStart);
    let baseCol = parseInt(cs.gridColumnStart);
    if (isNaN(baseRow) || isNaN(baseCol)) return;

    const maxCols = COLS;
    const maxRows = container.id === "favApp" ? 1 : ROWS;

    const candidates = [];

    let row = Math.min(baseRow, maxRows - rowSpan + 1);
    let col = Math.min(baseCol, maxCols - colSpan + 1);

    candidates.push([row, col]);
    candidates.push([row, col - 1]);
    candidates.push([row - 1, col]);
    candidates.push([row - 1, col - 1]);

    for (const [r, c] of candidates) {
        if (r < 1 || c < 1) continue;
        if (r + rowSpan - 1 > maxRows) continue;
        if (c + colSpan - 1 > maxCols) continue;

        if (isAreaFree(container, r, c, rowSpan, colSpan, icon)) {
            if (!applyIconBackgroundBySize(icon, sizeKey, true)) {
                tb_system(`This icon does not support ${sizeKey}.`);
                return;
            }

            icon.style.gridArea = `${r} / ${c} / ${r + rowSpan} / ${c + colSpan}`;

            icon.dataset.size =
                document.querySelector(".previewIcon").dataset.size =
                document.querySelector(`#${icon.dataset.app}`).dataset.size =
                    sizeKey;

            pointerUpIconWhileDragIconForBlurApp();
            updateBgIcon(icon);
            return;
        }
    }

    tb_system("not enough space");
}

function narrowIcon(icon) {
    const cs = getComputedStyle(icon);

    let row = parseInt(cs.gridRowStart);
    let col = parseInt(cs.gridColumnStart);

    icon.style.gridArea = `${row} / ${col}`;

    applyIconBackgroundBySize(icon, "1x1", true);

    delete icon.dataset.size;
    delete document.querySelector(".previewIcon")?.dataset.size;

    pointerUpIconWhileDragIconForBlurApp();
    updateBgIcon(icon);
}

//----==
//--== save layout ==--
//----==
// ===========================
// BIẾN TOÀN CỤC
// ===========================
let removedApps = [];
let addedApps = [];
let isLoadingLayout = false;

// ===========================
// ADD APPS
// ===========================
async function addApps(
    name = "none",
    appid = "none",
    background = "",
    anim = false,
    updatePos = true,
    dataIconSet = {
        // For example:
        //  {
        //      support1x1: "1",
        //      support1x2: "url('/OriginWEB/originData/iconPacks/exquisite_icons/com.android.settings_1x2.png')",
        //      support2x1: "url('/OriginWEB/originData/iconPacks/exquisite_icons/com.android.settings_2x1.png')",
        //      support2x2: "1"
        //  }
        // If you set it to "1", it will support that extended icon type, but it will use the same icon image, not recommended.
        // If you set it to "url('')", that icon size type will have its own icon image, so choose an image that matches the icon size.
    },
    options = {}
) {
    const {skipAutoPlace = false} = options;
    if (getAllIcons().length >= 60) {
        tb_system("maximum is 60 applications");
        return;
    }

    if (currentOpeningElApp) {
        addScriptForCloseApp(() => {
            setTimeout(() => addApps(name, appid, background, anim, updatePos, dataIconSet), 700 * speed);
        });
        closeApp();
        return;
    }

    if (!appid) appid = "app_" + Date.now();

    let originalId = appid,
        counter = 1;
    while (document.getElementById(appid)) {
        appid = originalId + counter++;
    }

    removedApps = removedApps.filter((id) => id !== appid);

    /* ===== CREATE ICON ===== */
    const icon = document.createElement("div");
    icon.className = "iconApp";
    icon.dataset.app = appid;
    icon.style.background = `${background} no-repeat center center/105%`;

    const label = document.createElement("label");
    label.textContent = name;
    icon.appendChild(label);

    // dataset
    delete dataIconSet.app;
    delete dataIconSet.noremove;
    for (const key in dataIconSet) {
        icon.dataset[key] = dataIconSet[key];
    }

    /* ===== EVENTS ===== */
    icon.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        holdTimer = setTimeout(() => {
            if (currentOpeningEl) return;
            startDrag(icon, e);
            holdTimer = null;

            document.addEventListener("touchmove", pointerMovingIcon);
            document.addEventListener("touchend", pointerUpIconWhileDragIcon, {passive: false});
            document.addEventListener("pointermove", pointerMovingIcon, {passive: false});
            document.addEventListener("pointerup", pointerUpIconWhileDragIcon, {passive: false});

            icon.removeEventListener("pointercancel", clearTimeoutHoldTimer);
            window.removeEventListener("mousemove", clearTimeoutHoldTimer);
        }, 500);

        icon.addEventListener("pointerup", pointerUpIcon);
        window.addEventListener("pointercancel", clearTimeoutHoldTimer);
        window.addEventListener("mousemove", clearTimeoutHoldTimer);
    });

    /* ===== CREATE APP BOX ===== */
    const appBox = document.createElement("div");
    appBox.className = "app";
    appBox.id = appid;
    appBox.innerHTML = `
        <div class="appDisplay">
            <div class="centerText">${name}</div>
        </div>
    `;
    allAppScreen.appendChild(appBox);

    if (skipAutoPlace) {
        const fallbackScreen =
            currentAppScreen || document.getElementById("appScreen1") || (await createAppScreen("appScreen1"));
        fallbackScreen.appendChild(icon);
    } else {
        let placed = false;

        for (let i = parseInt(String(currentAppScreen.id).slice(-1)); i <= screenCounter; i++) {
            const container = document.getElementById(`appScreen${i}`);
            if (!container) continue;

            const cs = getComputedStyle(container);
            const maxCols = cs.gridTemplateColumns.split(" ").length;
            const maxRows = cs.gridTemplateRows.split(" ").length;

            for (let r = 1; r <= maxRows && !placed; r++) {
                for (let c = 1; c <= maxCols && !placed; c++) {
                    if (isAreaFree(container, r, c, 1, 1, icon)) {
                        icon.style.gridArea = `${r} / ${c}`;
                        icon.dataset.row = r;
                        icon.dataset.col = c;
                        container.appendChild(icon);
                        placed = true;
                    }
                }
            }

            if (placed) break;
        }

        /* ===== FULL → CREATE NEW SCREEN ===== */
        if (!placed) {
            const newScreen = await createAppScreen();
            newScreen.id = `appScreen${screenCounter}`;
            icon.style.gridArea = "1 / 1";
            newScreen.appendChild(icon);
        }
    }

    invalidateIconsCache();
    addedApps.push({id: appid, name, background, dataIconSet});
    if (currentAppScreen != icon.parentElement) {
        scrollAppScreen.scrollTo({left: icon.parentElement.offsetLeft, behavior: "instant"});
    }
    saveAppLayout();

    if (updatePos) {
        if (anim) {
            updateAppPositions(() => {
                const layers = findWaterDrop(icon, icon.parentElement);
                addAnimationWaterDrop(icon, layers);

                icon.animate([{transform: "scale(1)"}, {transform: "scale(0.9)"}, {transform: "scale(1)"}], {
                    duration: 600,
                    easing: "ease-out",
                });
            }, icon.parentElement);
        } else {
            updateAppPositions(() => {}, icon.parentElement);
        }
    }
}

// ===========================
// XOÁ APP
// ===========================
async function removeApp(appId) {
    // Xóa icon
    const el1 = document.querySelector(`[data-app="${appId}"]`);
    const el2 = document.getElementById(appId);

    if (el1.dataset.noremove == "1") {
        tb_system("This app cannot be removed.");
        return;
    }
    if (el1) el1.remove();
    if (el2) el2.remove();
    invalidateIconsCache();

    // Ghi nhớ là app này đã xóa
    if (!removedApps.includes(appId)) removedApps.push(appId);
    addedApps = addedApps.filter((app) => app.id !== appId);

    // Sau đó có thể gọi saveAppLayout()

    if (holdTimer) clearTimeout(holdTimer);

    blurAllApp.removeEventListener("pointerup", pointerUpIconWhileDragIconForBlurApp);
    blurAllApp.style.pointerEvents = "";

    clearInterval(autoScrollInterval);

    isDragging = false;

    document.removeEventListener("pointermove", pointerMovingIcon);
    document.removeEventListener("pointerup", pointerUpIconWhileDragIcon);
    document.removeEventListener("pointercancel", pointerUpIconWhileDragIcon);
    previewContainer?.classList.add("hidden");

    async function animatePreviewRemove() {
        if (!preview) return;
        const anim = preview.animate(
            [
                {opacity: 1, scale: "1", filter: "blur(0px)"},
                {opacity: 0.7, filter: "blur(18px)"},
                {opacity: 0, scale: "1.5", filter: "blur(18px)"},
            ],
            {duration: 220, easing: "ease-out", fill: "forwards"}
        );

        try {
            await anim.finished;
        } catch {}
        preview?.remove();
    }

    await animatePreviewRemove();
    dragTarget = preview = null;
    allApp.classList.remove("scaleForMovingApp");

    await cleanupEmptyScreens();
    updateAppPosNoRemove();

    saveAppLayout();
}

// ===========================
// animation gợn sóng
// ===========================

function getGridPositionForWaterAnimation(el) {
    const gridArea = getComputedStyle(el).gridArea;
    let [row, col] = gridArea.split("/").map((v) => parseInt(v.trim()));
    if (el.parentElement.id == "favApp") return {row: row + 6, col};

    return {row, col};
}

function getDirectionVector(fromBox, toBox) {
    const from = getGridPositionForWaterAnimation(fromBox);
    const to = getGridPositionForWaterAnimation(toBox);

    let dx = to.col - from.col;
    let dy = to.row - from.row;

    const length = Math.sqrt(dx * dx + dy * dy) || 1;

    return {
        x: dx / length,
        y: dy / length,
    };
}

function findWaterDrop(centerBox, gridBox) {
    // nếu truyền vào 1 element → tìm box con bên trong
    if (gridBox instanceof HTMLElement) {
        gridBox = [...gridBox.querySelectorAll(".iconApp")];
    }

    const centerPos = getGridPositionForWaterAnimation(centerBox);
    const layers = {};

    gridBox.forEach((box) => {
        if (box === centerBox) return;

        const {row, col} = getGridPositionForWaterAnimation(box);

        const distance = Math.sqrt((row - centerPos.row) ** 2 + (col - centerPos.col) ** 2);

        const layer = Math.ceil(distance);

        if (!layers[`layer${layer}`]) {
            layers[`layer${layer}`] = [];
        }

        layers[`layer${layer}`].push(box);
    });

    if (DEBUG) console.log(layers);
    return layers;
}

function addAnimationWaterDrop(centerBox, layerBoxes) {
    const maxScale = 0.75; // layer gần nhất
    const scaleStep = -0.06;

    const maxTranslate = -15; // layer gần nhất
    const translateStep = -3;

    const delayStep = 70;

    const layers = Object.keys(layerBoxes)
    .map((key) => ({
        key,
        index: parseInt(key.replace("layer", "")),
    }))
    .sort((a, b) => a.index - b.index);

    layers.forEach(({key, index}) => {
        const boxes = layerBoxes[key];
        const layerIndex = index;

        const scale = Math.min(maxScale - scaleStep * (layerIndex - 1), 1);

        const magnitude = Math.min(maxTranslate - translateStep * (layerIndex - 1), 0);

        const delay = delayStep * (layerIndex - 1);

        boxes.forEach((box) => {
            box.getAnimations().forEach((a) => a.cancel());

            const dir = getDirectionVector(centerBox, box);

            const x = dir.x * magnitude;
            const y = dir.y * magnitude;

            box.animate(
                [
                    {transform: "translate(0,0) scale(1)"}, //, boxShadow: ""
                    {transform: `translate(${x}px, ${y}px) scale(${scale})`}, //, boxShadow: "0 0 0rem 0 #05dbe9"
                    {transform: "translate(0,0) scale(1)"}, //, boxShadow: ""
                ],
                {
                    duration: 800 + delay / 2,
                    delay,
                    easing: "cubic-bezier(.22,.61,.36,1)",
                    fill: "both",
                }
            );
        });
    });
}

// ===========================
// LƯU APP LAYOUT
// ===========================
function saveAppLayout() {
    if (isLoadingLayout) return;

    const layout = {};

    const containers = getContainers();
    containers.forEach((container) => {
        const screenId = container.id;
        if (!layout[screenId]) layout[screenId] = {};

        container.querySelectorAll(".iconApp").forEach((icon) => {
            const cs = getComputedStyle(icon);
            const parentId = icon.parentElement?.id || screenId;

            const rowStart = parseInt(cs.gridRowStart) || 1;
            const colStart = parseInt(cs.gridColumnStart) || 1;
            const rowEnd = parseInt(cs.gridRowEnd) || rowStart + 1;
            const colEnd = parseInt(cs.gridColumnEnd) || colStart + 1;

            layout[screenId][icon.dataset.app] = {
                id: icon.dataset.app,
                parentId,
                rowStart,
                colStart,
                rowEnd,
                colEnd,
            };
        });
    });

    if (originDeviceType !== deviceType) {
        // layout save only for deviceType
        const oldData = localStorage.getItem(`appLayout-${deviceType}`);
        const oldState = oldData ? JSON.parse(oldData) : {};
        const state = {
            layout,
            removedApps: oldState.removedApps || [],
            addedApps: oldState.addedApps || [],
            screenCounter: oldState.screenCounter || 2,
        };

        localStorage.setItem(`appLayout-${deviceType}`, JSON.stringify(state));

        // removedApps addedApps only for originDeviceType
        const oldOriginData = localStorage.getItem(`appLayout-${originDeviceType}`);
        const oldOriginState = oldOriginData ? JSON.parse(oldOriginData) : {};
        const newOriginState = {
            layout: oldOriginState.layout || {},
            removedApps,
            addedApps,
            screenCounter: oldOriginState.screenCounter || 2,
        };
        localStorage.setItem(`appLayout-${originDeviceType}`, JSON.stringify(newOriginState));
    } else {
        const state = {layout, removedApps, addedApps, screenCounter};
        localStorage.setItem(`appLayout-${originDeviceType}`, JSON.stringify(state));
    }
}

// ===========================
// TẢI APP LAYOUT
// ===========================

// nếu

async function loadAppOnlyLayout() {
    const data = localStorage.getItem(`appLayout-${deviceType}`);
    if (!data) return;

    const state = JSON.parse(data);
    const {layout = {}, screenCounter: savedCounter = 2} = state;
    screenCounter = savedCounter;

    Object.entries(layout).forEach(async ([screenId, screenIcons]) => {
        let container = document.getElementById(screenId);
        if (!container && screenId && screenId.startsWith("appScreen")) {
            await createAppScreen(screenId);
            container = document.getElementById(screenId);
        }

        Object.values(screenIcons).forEach(async (item) => {
            const icon = document.querySelector(`[data-app="${item.id}"]`);
            const targetParentId = item.parentId || screenId;
            const targetContainer = document.getElementById(targetParentId) || container;

            if (!icon || !targetContainer) return;

            let spanRow = item.rowEnd - item.rowStart;
            let spanCol = item.colEnd - item.colStart;

            icon.style.gridArea = `${item.rowStart} / ${item.colStart} / ${item.rowEnd} / ${item.colEnd}`;
            targetContainer.appendChild(icon);

            if (spanRow > 1 || spanCol > 1) {
                await applyIconBackgroundBySize(icon, `${spanRow}x${spanCol}`);
                icon.dataset.size = document.getElementById(item.id).dataset.size = `${item.rowEnd - item.rowStart}x${
                    item.colEnd - item.colStart
                }`;
            } else {
                await applyIconBackgroundBySize(icon, `1x1`);
                icon.dataset.size = document.getElementById(item.id).dataset.size = `${item.rowEnd - item.rowStart}x${
                    item.colEnd - item.colStart
                }`;
            }
        });
    });
}

async function loadAppLayout() {
    const data = localStorage.getItem(`appLayout-${originDeviceType}`);
    const dataFirst = localStorage.getItem(`appLayout-${deviceType}`);

    if (!data) return;

    isLoadingLayout = true;

    const state = JSON.parse(data);
    const {
        layout = {},
        removedApps: savedRemoved = [],
        addedApps: savedAdded = [],
        screenCounter: savedCounter = 2,
    } = state;

    screenCounter = savedCounter;
    removedApps = savedRemoved;
    addedApps = savedAdded;

    // Tạo lại app đã thêm
    for (const app of addedApps) {
        if (!document.querySelector(`[data-app="${app.id}"]`)) {
            await addApps(app.name, app.id, app.background, 0, 0, app.dataIconSet, {skipAutoPlace: true});
            if (DEBUG) console.log(app.dataIconSet);
        }
    }

    // Restore vị trí

    Object.entries(layout).forEach(async ([screenId, screenIcons]) => {
        let container = document.getElementById(screenId);
        if (!container && screenId && screenId.startsWith("appScreen")) {
            await createAppScreen(screenId);
            container = document.getElementById(screenId);
        }

        Object.values(screenIcons).forEach((item) => {
            const icon = document.querySelector(`[data-app="${item.id}"]`);
            const targetParentId = item.parentId || screenId;
            const targetContainer = document.getElementById(targetParentId) || container;

            if (!icon || !targetContainer) return;

            let spanRow = item.rowEnd - item.rowStart;
            let spanCol = item.colEnd - item.colStart;

            icon.style.gridArea = `${item.rowStart} / ${item.colStart} / ${item.rowEnd} / ${item.colEnd}`;
            targetContainer.appendChild(icon);

            if (spanRow > 1 || spanCol > 1) {
                applyIconBackgroundBySize(icon, `${spanRow}x${spanCol}`);
                icon.dataset.size = document.getElementById(item.id).dataset.size = `${item.rowEnd - item.rowStart}x${
                    item.colEnd - item.colStart
                }`;
            }
        });
    });

    // Xóa app bị gỡ
    removedApps.forEach((appId) => {
        document.querySelector(`[data-app="${appId}"]`)?.remove();
        document.getElementById(appId)?.remove();
    });

    invalidateScreenCache();
    isLoadingLayout = false;
}

// == DDDDDDDDDDDD-------------DDDDDDDDDDDDD
// == DDDDDDDDD--DDDDDDDDDDDDDDD--DDDDDDDDDD
// == DDDDDD--DDDDDDDDDDDDDDDDDDDDD--DDDDDDD
// == DDD--DDDDDDDDDDDDDDDDDDDDDDDDDDD--DDDD
// == DDD--DDDDDDDDDDDDDDDDDDDDDDDDDDD--DDDD
// == DDD--DDDDDDDDDDDDDDDDDDDDDDDDDDD--DDDD
// == DDD--DDDDDDDDDDDDDDDDDDDDDDDDDDD--DDDD
// == DDD--DDDDDDDDDDDDDDDDDDDDDDDDDDD--DDDD
// == DDD--DDDDDDDDDDDDDDDDDDDDDDDDDDD--DDDD
// == DDD--DDDDDDDDDDDDDDDDDDDDDDDDDDD--DDDD
// == DDD--DDDDDDDDDDDDDDDDDDDDDDDDDDD--DDDD
// == DDD--DDDDDDDDDDDDDDDDDD---DDDDDD--DDDD
// == DDD--DDDDDDDDDDDDDDDDDDDDDD--DDD--DDDD
// == DDDDDD--DDDDDDDDDDDDDDDDDDDDD--DDDDDDD
// == DDDDDDDDD--DDDDDDDDDDDDDDD--DDD--DDDDD
// == DDDDDDDDDDDD-------------DDDDDDDD---DD

function setBackgroundColor(box, imageUrl) {
    return new Promise((resolve) => {
        const appId = document.getElementById(box?.dataset?.app);
        if (!box || !imageUrl || imageUrl === "none") {
            box.style.backgroundColor = "rgb(140, 140, 140)";
            if (appId) appId.style.backgroundColor = "rgb(140, 140, 140)";
            return resolve();
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;

        img.onload = () => {
            const targetH = 50;
            const canvas = document.createElement("canvas");
            canvas.width = 1;
            canvas.height = targetH;

            const ctx = canvas.getContext("2d", {willReadFrequently: true});

            ctx.drawImage(img, img.width / 2, 0, 1, img.height, 0, 0, 1, targetH);

            const imgData = ctx.getImageData(0, 0, 1, targetH).data;
            let finalColor = "rgb(140, 140, 140)";

            for (let y = targetH - 1; y >= 0; y--) {
                const i = y * 4;
                const alpha = imgData[i + 3];

                if (alpha > 0) {
                    finalColor = `rgb(${imgData[i]}, ${imgData[i + 1]}, ${imgData[i + 2]})`;
                    break;
                }
            }

            box.style.backgroundColor = finalColor;
            if (appId) appId.style.backgroundColor = finalColor;

            resolve();
        };

        img.onerror = () => resolve();
    });
}
async function updateIconUnlockPosAnim(icon) {
    const cs = window.getComputedStyle(icon);
    const row = parseInt(cs.gridRowStart);
    const col = parseInt(cs.gridColumnStart);
    const tt =
        icon.dataset.size === "1x2" ? "e" : icon.dataset.size === "2x1" ? "k" : icon.dataset.size === "2x2" ? "d" : "v";
    const coltt = (tt == "e" || tt == "d") && col < COLS / 2 ? 1 : 0;
    const rowtt = (tt == "k" || tt == "d") && row < row / 3 ? 1 : 0;
    icon.dataset.unlockt = tt;
    icon.dataset.unlocka = `${row}${col}`;
    icon.dataset.unlocks = `${row + rowtt}${col + coltt}`;
}
async function updateIconUnlockPosAnimWithPos(icon, row, col) {
    const tt =
        icon.dataset.size === "1x2" ? "e" : icon.dataset.size === "2x1" ? "k" : icon.dataset.size === "2x2" ? "d" : "v";
    const coltt = (tt == "e" || tt == "d") && col < 2 ? 1 : 0;
    const rowtt = (tt == "k" || tt == "d") && row < 2 ? 1 : 0;
    icon.dataset.unlockt = tt;
    icon.dataset.unlocka = `${row}${col}`;
    icon.dataset.unlocks = `${row + rowtt}${col + coltt}`;
}
async function updateAppPositions(script = function () {}, updateUnlockAnimPos = false) {
    const phone = allAppScreen;
    const phoneRect = phone.getBoundingClientRect();
    const innerW = phoneRect.width;
    const centerX = innerW / 2;

    let styleTag = document.getElementById("dynamicAppPos");
    if (styleTag) styleTag.remove();

    styleTag = document.createElement("style");
    styleTag.id = "dynamicAppPos";
    document.head.appendChild(styleTag);

    let cssRules = "";
    const icons = getAllIcons();

    const bgTasks = [];
    for (const icon of icons) {
        const appId = icon.dataset.app;
        if (!document.getElementById(appId)) continue;

        const r = icon.getBoundingClientRect();

        const relLeft = r.left - phoneRect.left;
        const relBottom = phoneRect.bottom - r.bottom; // FIX

        const iconW = Math.round(r.width);
        const iconH = Math.round(r.height);

        const isLeft = relLeft - iconW / 2 < centerX;
        const posX = isLeft ? "left" : "right";
        const offsetX = isLeft ? Math.round(relLeft) : Math.round(innerW - (relLeft + iconW));

        const cs = getComputedStyle(icon);
        const bg = cs.background;

        const bgUrl = cs.backgroundImage.replace(/url\(["']?(.+?)["']?\)/, "$1");
        bgTasks.push(setBackgroundColor(icon, bgUrl));

        cssRules += `
#${appId}{
    ${posX}:${offsetX}px;
    bottom:${relBottom}px;
    width:${iconW}px;
    height:${iconH}px;
}
#${appId}.open{
    ${posX}:0;
    bottom:50%;
    translate:0 50%;
    width:100%;
    height:100%;
}
#${appId}::before{
    background:${bg};
}`;
        const row = parseInt(cs.gridRowStart);
        const col = parseInt(cs.gridColumnStart);
        if ((!isNaN(row) && !isNaN(col)) || updateUnlockAnimPos) await updateIconUnlockPosAnimWithPos(icon, row, col);
    }

    styleTag.textContent = cssRules;
    upsertCssRule._cache = null;
    upsertCssRule._cacheSheet = null;
    if (bgTasks.length) Promise.all(bgTasks).catch(() => {});
    script();
    if (DEBUG) console.log("update");
}
function updateBgIcon(icon) {
    const cs = getComputedStyle(icon);
    setBackgroundColor(icon, cs.backgroundImage.replace(/url\(["']?(.+?)["']?\)/, "$1"));
    const appId = icon.dataset.app;
    upsertCssRule(document.getElementById("dynamicAppPos").sheet, `#${appId}::before`, `background:${cs.background};`);
}

function upsertCssRule(sheet, selector, cssText) {
    if (!sheet) return;
    if (!upsertCssRule._cache || upsertCssRule._cacheSheet !== sheet) {
        const map = new Map();
        for (let i = 0; i < sheet.cssRules.length; i++) {
            const rule = sheet.cssRules[i];
            if (rule.selectorText) map.set(rule.selectorText, rule);
        }
        upsertCssRule._cache = map;
        upsertCssRule._cacheSheet = sheet;
    }
    const cached = upsertCssRule._cache.get(selector);
    if (cached) {
        cached.style.cssText = cssText;
        return;
    }
    for (let i = 0; i < sheet.cssRules.length; i++) {
        const rule = sheet.cssRules[i];
        if (rule.selectorText === selector) {
            rule.style.cssText = cssText;
            return;
        }
    }
    const idx = sheet.cssRules.length;
    sheet.insertRule(`${selector}{${cssText}}`, idx);
    const newRule = sheet.cssRules[idx];
    if (newRule && newRule.selectorText) upsertCssRule._cache.set(newRule.selectorText, newRule);
}

async function updateAppPosNoRemove(script = function () {}, screen = currentAppScreen) {
    const phone = allAppScreen;
    const phoneRect = phone.getBoundingClientRect();

    const scaleX = phoneRect.width / phone.offsetWidth || 1;
    const scaleY = phoneRect.height / phone.offsetHeight || 1;
    const innerW = phone.offsetWidth;
    const innerH = phone.offsetHeight;
    const centerX = innerW / 2;

    const styleTag =
        document.getElementById("dynamicAppPos") ||
        (() => {
            const tag = document.createElement("style");
            tag.id = "dynamicAppPos";
            document.head.appendChild(tag);
            return tag;
        })();
    const sheet = styleTag.sheet;

    const favIcons = favApp ? favApp.querySelectorAll(".iconApp") : [];
    const allIcons = [...screen.querySelectorAll(".iconApp"), ...favIcons];

    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            allIcons.forEach((icon) => {
                const appId = icon.dataset.app;
                const r = icon.getBoundingClientRect();

                const relLeft = (r.left - phoneRect.left) / scaleX;
                const relTop = (r.top - phoneRect.top) / scaleY;
                const iconW = r.width / scaleX;
                const iconH = r.height / scaleY;

                const isLeft = relLeft + iconW / 2 < centerX;
                const posX = isLeft ? "left" : "right";
                const offsetX = isLeft ? relLeft : innerW - (relLeft + iconW);

                const offsetY = innerH - (relTop + iconH);

                upsertCssRule(
                    sheet,
                    `#${appId}`,
                    `${posX}:${offsetX}px; bottom:${offsetY}px; width:${iconW}px; height:${iconH}px;`
                );

                upsertCssRule(
                    sheet,
                    `#${appId}.open`,
                    `${posX}:0%; bottom:50%; translate:0 50%; height: 100%; width: 100%;`
                );

                const row =
                    parseInt(icon.style.gridArea?.split("/")[0]) || parseInt(getComputedStyle(icon).gridRowStart);
                const col =
                    parseInt(icon.style.gridArea?.split("/")[1]) || parseInt(getComputedStyle(icon).gridColumnStart);
                if (!isNaN(row) && !isNaN(col)) updateIconUnlockPosAnimWithPos(icon, row, col);
            });

            if (script) script();

            resolve();
            if (DEBUG) console.log("updateNoRemove");
        });
    });
}

// Hàm tìm appScreen ở giữa màn hình
function updateCurrentAppScreen() {
    if (appScreenCacheInvalid) refreshAppScreenCache();
    if (!appScreensCached.length) return;

    const containerCenter = scrollAppScreen.scrollLeft + scrollAppScreen.clientWidth / 2;

    // Binary search closest center
    let lo = 0;
    let hi = appScreenCenters.length - 1;
    while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (appScreenCenters[mid] < containerCenter) lo = mid;
        else hi = mid;
    }
    let closestIndex = lo;
    if (Math.abs(appScreenCenters[hi] - containerCenter) < Math.abs(appScreenCenters[lo] - containerCenter)) {
        closestIndex = hi;
    }

    currentAppScreen = appScreensCached[closestIndex];

    if (closestIndex !== lastActiveIndex) {
        if (lastActiveIndex >= 0) pagerDotsCache[lastActiveIndex]?.classList.remove("active");
        pagerDotsCache[closestIndex]?.classList.add("active");
        lastActiveIndex = closestIndex;
    }
}

// Dùng scroll + debounce bằng requestAnimationFrame

const pager = document.getElementById("pager");
let appScreensCached = [];
let appScreenCenters = [];
let appScreenCacheInvalid = true;
let lastActiveIndex = -1;
let appIconsCache = [];
let appIconsCacheInvalid = true;
let pagerDotsCache = [];

function invalidateScreenCache() {
    appScreenCacheInvalid = true;
    appIconsCacheInvalid = true;
}

function invalidateIconsCache() {
    appIconsCacheInvalid = true;
}

function refreshAppScreenCache() {
    appScreensCached = Array.from(scrollAppScreen.querySelectorAll(".appScreen"));
    appScreenCenters = appScreensCached.map((screen) => screen.offsetLeft + screen.offsetWidth / 2);
    appScreenCacheInvalid = false;
}

function getAppScreens() {
    if (appScreenCacheInvalid) refreshAppScreenCache();
    return appScreensCached;
}

function getContainers() {
    const screens = getAppScreens();
    return favApp ? [...screens, favApp] : [...screens];
}

function getAllIcons() {
    if (appIconsCacheInvalid) {
        const list = [];
        const screens = getAppScreens();
        for (const screen of screens) {
            list.push(...screen.querySelectorAll(".iconApp"));
        }
        if (favApp) list.push(...favApp.querySelectorAll(".iconApp"));
        appIconsCache = list;
        appIconsCacheInvalid = false;
    }
    return appIconsCache;
}

async function buildDots() {
    pager.innerHTML = "";
    const screens = getAppScreens();

    screens.forEach(() => {
        const dot = document.createElement("div");
        dot.className = "dot";
        pager.appendChild(dot);
    });

    const dots = pager.querySelectorAll(".dot");
    pagerDotsCache = Array.from(dots);

    let activeIndex = 0;
    if (typeof currentAppScreen !== "undefined" && currentAppScreen) {
        activeIndex = screens.indexOf(currentAppScreen);
        if (activeIndex < 0) activeIndex = 0;
    }

    pagerDotsCache.forEach((dot, i) => {
        dot.classList.toggle("active", i === activeIndex);
    });
    lastActiveIndex = activeIndex;
}

// mover icon
function moverIconApp(icon) {
    const maxMove = 10;

    const handleMove = (e) => {
        const rect = icon.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const moveX = ((x - centerX) / centerX) * maxMove;
        const moveY = ((y - centerY) / centerY) * maxMove;

        icon.style.translate = `${moveX}px ${moveY}px`;
        icon.classList.add("hover");
    };

    const handleLeave = () => {
        icon.style.translate = "0 0";
        icon.removeEventListener("mousemove", handleMove);
        icon.classList.remove("hover");
    };

    icon.addEventListener("mouseenter", () => {
        icon.addEventListener("mousemove", handleMove);
    });

    icon.addEventListener("mouseleave", handleLeave);
}
