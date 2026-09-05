const statusBarRight = document.getElementById("statusBarRight"),
    statusBarLeft = document.querySelector("#statusBar .left"),
    itemStatusRight = document.getElementById("itemStatusRight"),
    itemStatusLeft = document.getElementById("itemStatusLeft"),
    controlCenter = document.querySelector(".sys.controlCenter"),
    controlCenterEditorGroup = document.querySelector(".sys.controlCenter .edit"),
    controlCenterEditorBtn = document.querySelector(".sys.controlCenter .edit .editBtn"),
    gridCC = document.querySelector(".sys.controlCenter .grid-cc.main"),
    addItemBtnCC = controlCenter.querySelector(".addItemBtn"),
    itemStoreCC = controlCenter.querySelector('[name="itemControlsCenterStore"]'),
    storeGridCC = itemStoreCC ? itemStoreCC.querySelector(".grid-cc") : null;
let ccAnimToken = 0;
controlCenter.style.display = "none";

controlCenterEditorBtn.clickEvent = function () {
    controlCenterEditorBtn.classList.toggle("done");
    if (controlCenterEditorBtn.classList.contains("done")) {
        setCCItemInteractivity(true);
        removeEventListener_ccOpen();
        removeDragVolumeAndBrightnessEvents();
        controlCenter.classList.add("editing");
        addCCDeleteButtons();
        addItemBtnCC.classList.add("display");
        addItemBtnCC.addEventListener("click", addItemBtnCC.clickEvent);
    } else {
        setCCItemInteractivity(false);
        addEventListener_ccOpen();
        addDragVolumeAndBrightnessEvents();
        controlCenter.classList.remove("editing");
        removeCCDeleteButtons();
        addItemBtnCC.classList.remove("display");
        addItemBtnCC.removeEventListener("click", addItemBtnCC.clickEvent);
        if (itemStoreCC.classList.contains("open")) itemStoreCC.classList.remove("open");
    }
};
function openControlsCenter() {
    if (controlCenter.classList.contains("open")) return;
    ccAnimToken += 1;
    const token = ccAnimToken,
        anim = [
            {transform: "scale(0.6) translateY(-20px)", opacity: 0},
            {opacity: 0},
            {transform: "scale(1)", opacity: 1},
        ],
        timing = {duration: 400, fill: "forwards", easing: "ease-out"};
    controlCenter.style.display = "flex";
    controlCenter.offsetHeight;
    controlCenter.classList.add("open");

    gridCC.querySelectorAll(".item").forEach((el) => el.animate(anim, timing));
    controlCenterEditorGroup.querySelectorAll(".item:not(.addItemBtn)").forEach((el) => el.animate(anim, timing));

    const animCC = controlCenter.animate([], timing);
    animCC.onfinish = () => {
        if (token !== ccAnimToken) return;
        animCC.onfinish = null;
    };
    addEventListener_ccOpen();
    addDragVolumeAndBrightnessEvents();
    statusBarLeft.style.pointerEvents = statusBarRight.style.pointerEvents = "none";
    setCCItemInteractivity(controlCenter.classList.contains("editing"));
    controlCenterEditorBtn.addEventListener("click", controlCenterEditorBtn.clickEvent);
    if (dragTarget) pointerUpIconWhileDragIconNoAnim();
}
async function closeControlsCenter(fromSystem = false) {
    if (!controlCenter.classList.contains("open")) return;
    ccAnimToken += 1;
    const anim = [
            {transform: "scale(1)", opacity: 1},
            {opacity: 0.8},
            {opacity: 0},
            {transform: "scale(0.6) translateY(-60px)", opacity: 0},
        ],
        timing = {duration: 250, fill: "forwards", easing: "ease-out"};
    controlCenter.classList.remove("open");
    statusBarLeft.style.transition = statusBarRight.style.transition =
        "transform 0.3s, translate calc(0.3s * var(--bg-speedAnimation))";
    statusBarLeft.style.transform = ``;
    statusBarRight.style.transform = ``;

    gridCC.querySelectorAll(".item").forEach((el) => el.animate(anim, timing));
    controlCenterEditorGroup.querySelectorAll(".item:not(.addItemBtn)").forEach((el) => el.animate(anim, timing));

    backAnim_gridcc();
    addEventListener_cc();
    removeEventListener_ccOpen();
    removeDragVolumeAndBrightnessEvents();
    statusBarLeft.style.pointerEvents = statusBarRight.style.pointerEvents = "";
    getMainItemsCC().forEach((el) => {
        el.removeEventListener("click", toggleActiveItemCC);
        el.removeEventListener("pointerdown", ccPointerDown);
    });
    getMainIItemsCC().forEach((el) => {
        el.removeEventListener("click", toggleActiveItemCC);
    });
    if (controlCenterEditorBtn.classList.contains("done")) {
        controlCenterEditorBtn.classList.remove("done");
        controlCenter.classList.remove("editing");
        addItemBtnCC.classList.remove("display");
        setCCItemInteractivity(false);
        removeCCDeleteButtons();
        addItemBtnCC.removeEventListener("click", addItemBtnCC.clickEvent);
        if (itemStoreCC.classList.contains("open")) itemStoreCC.classList.remove("open");
    }
    controlCenterEditorBtn.removeEventListener("click", controlCenterEditorBtn.clickEvent);

    if (!fromSystem) {
        const token = ccAnimToken;
        const animCC = controlCenter.animate([], {duration: 400, fill: "forwards"});
        animCC.onfinish = () => {
            if (token !== ccAnimToken) return;
            controlCenter.style.display = "none";
            animCC.onfinish = null;
        };
        controlCenter.style.transition = "";
        controlCenter.style.backdropFilter = ``;
    }
}
let startY_cc = 0,
    currentY_cc = 0,
    isDragging_cc = false,
    isOpen_cc = false;
const DRAG_THRESHOLD_ccOpen = 15;
const DRAG_THRESHOLD_cc = 35;
function dampY_cc(y) {
    return y <= 100 ? y : 100 + (y - 100) * 0.2;
}
function backAnim_gridcc() {
    controlCenterEditorGroup.style.transition = `transform calc(0.4s * var(--bg-speedAnimation)) cubic-bezier(.57,1.3,.45,1), width calc(0.3s * var(--bg-speedAnimation))`;
    gridCC.style.transition = `all calc(0.4s * var(--bg-speedAnimation)) cubic-bezier(.57,1.3,.45,1), row-gap calc(0.5s * var(--bg-speedAnimation)) cubic-bezier(.57,1.5,.4,1)`;
    gridCC.style.rowGap = ``;
    controlCenterEditorGroup.style.transform = gridCC.style.transform = ``;

    controlCenter.style.transition = "";
    controlCenter.style.backdropFilter = `blur(20px) brightness(0.59)`;
}
function updateTransformS2(y) {
    y = Math.min(dampY_cc(y), 200);
    const x = y / 3.5;
    statusBarLeft.style.transition = statusBarRight.style.transition =
        "transform 0.08s, translate calc(0.3s * var(--bg-speedAnimation))";
    controlCenterEditorGroup.style.transition = gridCC.style.transition = "all 0.08s";
    statusBarRight.style.transform = `translateY(${y / 1.1}px) translateX(${-Math.min(x, 10)}px)`;
    statusBarLeft.style.transform = `translateY(${y / 1.1}px) translateX(${Math.min(x, 10)}px)`;
    gridCC.style.rowGap = `calc(23px + ${y / 8}px)`;
    gridCC.style.transform = `translate(0, ${y - DRAG_THRESHOLD_cc}px)`;
    controlCenterEditorGroup.style.transform = `translate(0, ${y / 1.07 - DRAG_THRESHOLD_cc}px)`;

    controlCenter.style.transition = "opacity 0.08s";
    const ccO = Math.min(Math.max(0, y / 50), 1);
    controlCenter.style.backdropFilter = `blur(${ccO * 20}px) brightness(${1 - 0.41 * ccO})`;
}
function startDrag_cc(slider, clientY) {
    isDragging_cc = true;
    startY_cc = clientY;
    currentY_cc = 0;
    controlCenter.style.display = "flex";
}
function moveDrag_cc(slider, clientY) {
    if (!isDragging_cc) return;
    currentY_cc = Math.max(0, clientY - startY_cc);
    updateTransformS2(currentY_cc);
    if (currentY_cc >= DRAG_THRESHOLD_cc) {
        if (!isOpen_cc) {
            openControlsCenter();
            isOpen_cc = true;
        }
    } else {
        if (isOpen_cc) {
            closeControlsCenter(true);
            isOpen_cc = false;
        }
    }
}
function endDrag_cc(slider) {
    if (!isDragging_cc) return;
    isDragging_cc = false;
    if (isOpen_cc) {
        statusBarLeft.style.transition = statusBarRight.style.transition =
            "transform 0.3s, translate calc(0.1s * var(--bg-speedAnimation))";
        statusBarLeft.style.transform = `translateY(34px) translateX(10px)`;
        statusBarRight.style.transform = `translateY(34px) translateX(-10px)`;
        backAnim_gridcc();
        removeEventListener_cc();
    } else {
        statusBarLeft.style.transition = statusBarRight.style.transition =
            "transform 0.3s, translate calc(0.1s * var(--bg-speedAnimation))";
        statusBarLeft.style.transform = ``;
        statusBarRight.style.transform = ``;

        const token = ccAnimToken;
        const animCC = controlCenter.animate([], {duration: 400, fill: "forwards"});
        animCC.onfinish = () => {
            if (token !== ccAnimToken) return;
            controlCenter.style.display = "none";
            animCC.onfinish = null;
        };

        controlCenter.style.transition = "";
        controlCenter.style.backdropFilter = ``;
    }
}
function onPointerMove_cc(e) {
    moveDrag_cc(statusBarRight, e.clientY);
}
function onPointerUp_cc(e) {
    endDrag_cc(statusBarRight);
}
function onPointerDown_cc(e) {
    startDrag_cc(statusBarRight, e.clientY);
}
function addEventListener_cc() {
    document.addEventListener("pointermove", onPointerMove_cc);
    document.addEventListener("pointerup", onPointerUp_cc);
    document.addEventListener("pointercancel", onPointerUp_cc);
    statusBarRight.addEventListener("pointerdown", onPointerDown_cc);
}
function removeEventListener_cc() {
    document.removeEventListener("pointermove", onPointerMove_cc);
    document.removeEventListener("pointerup", onPointerUp_cc);
    document.removeEventListener("pointercancel", onPointerUp_cc);
    statusBarRight.removeEventListener("pointerdown", onPointerDown_cc);
}
function dampY_ccOpen(y) {
    return y <= 100 ? y : 100 + (y - 100) * 0.2;
}
function updateTransformS2_open(y) {
    y = Math.min(dampY_ccOpen(y), 200);

    let x = (y + DRAG_THRESHOLD_cc) / 3.5;

    statusBarLeft.style.transition = statusBarRight.style.transition =
        "transform 0.08s, translate calc(0.3s * var(--bg-speedAnimation))";
    controlCenterEditorGroup.style.transition = gridCC.style.transition = "all 0.08s";

    y = Math.max(y, -34);
    x = Math.max(x, -10);

    statusBarRight.style.transform = `translateY(${34 + y / 1.1}px) translateX(${-Math.min(Math.max(x, 0), 10)}px)`;
    statusBarLeft.style.transform = `translateY(${34 + y / 1.1}px) translateX(${Math.min(Math.max(x, 0), 10)}px)`;

    gridCC.style.rowGap = `calc(15px + ${y / 8}px)`;

    gridCC.style.transform = `translate(0, ${y}px)`;
    controlCenterEditorGroup.style.transform = `translate(0, ${y / 1.07}px)`;

    controlCenter.style.transition = "opacity 0.08s";

    const ccO = Math.min(Math.max(0, 1 + y / 30), 1);
    controlCenter.style.backdropFilter = `blur(${ccO * 20}px) brightness(${1 - 0.41 * ccO})`;
}

let startY_ccOpen = 0;
let deltaY_ccOpen = 0;
let hasMoved_ccOpen = false;
let dragDirection_ccOpen = null;
let item = null;
let ccOpenActive = false;
let ccOpenAllow = true;
const CC_OPEN_MOVE_THRESHOLD = 5;
function onPointerDown_ccOpen(e) {
    if (ccIsDragging || !e.target.closest(".grid-cc.main .item, .grid-cc.main .iitem, .controlCenter")) return;
    item = !!e.target.closest(".item, .iitem");
    ccOpenAllow = !e.target.closest(".item.slider");
    startY_ccOpen = e.clientY;
    deltaY_ccOpen = 0;
    hasMoved_ccOpen = false;
    dragDirection_ccOpen = null;
    ccOpenActive = !item && ccOpenAllow;
    if (ccOpenActive && e.pointerId !== undefined) controlCenter.setPointerCapture(e.pointerId);
    document.addEventListener("pointermove", onPointerMove_ccOpen);
    document.addEventListener("pointerup", onPointerUp_ccOpen);
    document.addEventListener("pointercancel", onPointerUp_ccOpen);
}
function onPointerMove_ccOpen(e) {
    if (ccIsDragging || !e.target.closest(".grid-cc.main .item, .grid-cc.main .iitem, .controlCenter")) return;
    if (!ccOpenAllow) return;
    const dy = startY_ccOpen - e.clientY;
    if (!ccOpenActive) {
        if (Math.abs(dy) < CC_OPEN_MOVE_THRESHOLD) return;
        ccOpenActive = true;
        ccSuppressClickUntil = Date.now() + 250;
        if (ccHoldTimer) {
            clearTimeout(ccHoldTimer);
            ccHoldTimer = null;
        }
        if (e.pointerId !== undefined) controlCenter.setPointerCapture(e.pointerId);
    }
    deltaY_ccOpen = dy;
    updateTransformS2_open(-deltaY_ccOpen);
    if (!hasMoved_ccOpen && Math.abs(deltaY_ccOpen) > 3) {
        hasMoved_ccOpen = true;
        dragDirection_ccOpen = deltaY_ccOpen > 0 ? "up" : "down";
    }
    if (deltaY_ccOpen <= DRAG_THRESHOLD_ccOpen) {
        if (!isOpen_cc) {
            openControlsCenter();
            isOpen_cc = true;
        }
    } else {
        if (isOpen_cc) {
            closeControlsCenter(true);
            isOpen_cc = false;
        }
    }
}
function onPointerUp_ccOpen(e) {
    document.removeEventListener("pointermove", onPointerMove_ccOpen);
    document.removeEventListener("pointerup", onPointerUp_ccOpen);
    document.removeEventListener("pointercancel", onPointerUp_ccOpen);
    if (!ccOpenActive) {
        item = 0;
        ccOpenAllow = true;
        return;
    }
    if (!hasMoved_ccOpen && !item) {
        isOpen_cc = false;
        closeControlsCenter(true);

        controlCenter.style.transition = "";
        controlCenter.style.backdropFilter = `none`;

        statusBarLeft.style.transform = statusBarRight.style.transform = ``;
        const token = ccAnimToken;
        const animCC = controlCenter.animate([], {duration: 400, fill: "forwards"});
        animCC.onfinish = () => {
            if (token !== ccAnimToken) return;
            controlCenter.style.display = "none";
            animCC.onfinish = null;
        };
        return;
    }
    if (dragDirection_ccOpen === "up" && deltaY_ccOpen >= DRAG_THRESHOLD_ccOpen) {
        closeControlsCenter(true);

        controlCenter.style.transition = "";
        controlCenter.style.backdropFilter = `none`;

        statusBarLeft.style.transform = statusBarRight.style.transform = ``;
        isOpen_cc = false;
        const token = ccAnimToken;
        const animCC = controlCenter.animate([], {duration: 400, fill: "forwards"});
        animCC.onfinish = () => {
            if (token !== ccAnimToken) return;
            controlCenter.style.display = "none";
            animCC.onfinish = null;
        };
    } else {
        backAnim_gridcc();
        statusBarLeft.style.transition = statusBarRight.style.transition =
            "transform 0.3s, translate calc(0.3s * var(--bg-speedAnimation))";
        statusBarLeft.style.transform = `translateY(34px) translateX(10px)`;
        statusBarRight.style.transform = `translateY(34px) translateX(-10px)`;
    }
    item = 0;
    ccOpenAllow = true;
    ccOpenActive = false;
}
function addEventListener_ccOpen() {
    controlCenter.addEventListener("pointerdown", onPointerDown_ccOpen);
}
function removeEventListener_ccOpen() {
    controlCenter.removeEventListener("pointerdown", onPointerDown_ccOpen);
}

const CC_LAYOUT_STORAGE_KEY = "ccLayout_v1";
const ccReduceMotion =
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4);
const CC_IGNORE_CLASSES = new Set([
    "item",
    "iitem",
    "liquid",
    "cc",
    "nonActive",
    "noActiveAnim",
    "notEvent",
    "active",
    "activeCOrange",
    "display",
    "done",
]);
let ccUidCounter = 1;
function ccSlugify(text) {
    return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function getCCName(el) {
    return (el && el.getAttribute("name") ? el.getAttribute("name") : "").trim();
}
function getCCSize(el) {
    return (el && el.getAttribute("data-size") ? el.getAttribute("data-size") : "1x1").trim() || "1x1";
}
function getCCKey(el) {
    const name = getCCName(el);
    const size = getCCSize(el);
    return name ? `${name}|${size}` : "";
}
function getCCItemId(el, fallbackIndex = 0) {
    const existingId = el.dataset.ccId;
    const canUpgradeLegacy = existingId && (existingId.startsWith("item-") || existingId.startsWith("cc-uid-"));
    if (existingId && !canUpgradeLegacy) return existingId;
    const name = getCCName(el);
    const size = getCCSize(el);
    if (name) {
        const id = size ? `${name}-${size}` : name;
        el.dataset.ccId = id;
        return id;
    }
    const classes = Array.from(el.classList).filter((c) => !CC_IGNORE_CLASSES.has(c));
    let id = "";
    if (classes.includes("slider")) {
        const type = classes.find((c) => c !== "slider");
        id = type ? `slider-${type}` : "slider";
    } else if (classes.length) {
        id = classes.sort().join("-");
    }
    if (!id) {
        const label = el.querySelector("label");
        if (label && label.textContent) id = ccSlugify(label.textContent.trim());
    }
    if (id && size) id = `${id}-${size}`;
    if (!id) {
        const rand =
            typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${ccUidCounter++}`;
        id = `cc-uid-${rand}`;
    }
    el.dataset.ccId = id;
    return id;
}
function ensureCCItemIds(container) {
    if (!container) return;
    const items = Array.from(container.querySelectorAll(":scope > .item"));
    items.forEach((el, i) => getCCItemId(el, i));
}
function getMainItemsCC() {
    return Array.from(gridCC.querySelectorAll(":scope > .item"));
}
function getMainIItemsCC() {
    return Array.from(gridCC.querySelectorAll(".iitem"));
}
function setCCItemInteractivity(isEditing) {
    getMainItemsCC().forEach((el) => {
        el.removeEventListener("click", toggleActiveItemCC);
        el.removeEventListener("pointerdown", ccPointerDown);
        if (isEditing) {
            el.addEventListener("pointerdown", ccPointerDown);
        } else {
            el.addEventListener("click", toggleActiveItemCC);
        }
    });
    getMainIItemsCC().forEach((el) => {
        el.removeEventListener("click", toggleActiveItemCC);
        if (!isEditing) el.addEventListener("click", toggleActiveItemCC);
    });
}
function addCCDeleteButtons() {
    getMainItemsCC().forEach((item) => {
        if (item.querySelector(".cc-delete-btn")) return;
        const btn = document.createElement("div");
        btn.type = "div";
        btn.className = "cc-delete-btn";
        btn.addEventListener("pointerdown", (e) => {
            e.stopPropagation();
        });
        btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (ccIsDragging) return;
            const target = item;
            const anim = target.animate(
                [
                    {opacity: 1, scale: "1", filter: "blur(0px)"},
                    {opacity: 0.7, filter: "blur(18px)"},
                    {opacity: 0, scale: "0.6", filter: "blur(5px)"},
                ],
                {duration: 220 * speed, easing: "ease"}
            );
            try {
                await anim.finished;
            } catch {}
            target.classList.add("cc-removed");
            target.style.display = "none";
            target.style.gridArea = "";
            saveCCLayout();
            updateCCStoreNotWork();
        });
        item.appendChild(btn);
    });
}
function removeCCDeleteButtons() {
    gridCC.querySelectorAll(".cc-delete-btn").forEach((btn) => btn.remove());
}
function updateCCStoreNotWork() {
    if (!storeGridCC) return;
    const inUseKeys = new Set(
        getCCItems()
        .map((el) => getCCKey(el))
        .filter(Boolean)
    );
    storeGridCC.querySelectorAll(":scope > .item").forEach((el) => {
        const key = getCCKey(el);
        if (!key) return;
        el.classList.toggle("notWork", inUseKeys.has(key));
    });
}
window.updateCCStoreNotWork = updateCCStoreNotWork;
addItemBtnCC.clickEvent = function () {
    itemStoreCC.classList.toggle("open");
};
ensureCCItemIds(gridCC);
ensureCCItemIds(storeGridCC);
function parseCCSize(el) {
    const raw = (el.getAttribute("data-size") || "1x1").toLowerCase();
    const parts = raw.split("x").map((n) => parseInt(n, 10));
    const colSpan = Math.max(1, parts[0] || 1);
    const rowSpan = Math.max(1, parts[1] || 1);
    return {rowSpan, colSpan};
}
function findCCFreeSlot(rowSpan, colSpan) {
    const cs = getComputedStyle(gridCC);
    const cols = cs.gridTemplateColumns.split(" ").length || 1;
    const rows = cs.gridTemplateRows.split(" ").length || 1;
    for (let row = 1; row <= rows - rowSpan + 1; row++) {
        for (let col = 1; col <= cols - colSpan + 1; col++) {
            if (ccIsAreaFree(row, col, rowSpan, colSpan, null)) return {row, col};
        }
    }
    return null;
}
function addStoreItemToCC(storeItem) {
    if (!storeItem) return;
    const fromRect = storeItem.getBoundingClientRect();
    const name = getCCName(storeItem);
    const size = getCCSize(storeItem);
    const keySelector =
        name && size ? `:scope > .item[name="${CSS.escape(name)}"][data-size="${CSS.escape(size)}"]` : null;
    const existing = keySelector ? gridCC.querySelector(keySelector) : null;
    if (existing && !existing.classList.contains("cc-removed")) {
        tb_system("This item already exists in Control Center.");
        updateCCStoreNotWork();
        return;
    }
    const {rowSpan, colSpan} = parseCCSize(storeItem);
    const slot = findCCFreeSlot(rowSpan, colSpan);
    if (!slot) {
        tb_system("Not enough empty space.");
        return;
    }
    const newItem = existing ? existing : storeItem.cloneNode(true);
    if (name) newItem.setAttribute("name", name);
    newItem.setAttribute("data-size", size);
    newItem.dataset.ccId = getCCItemId(newItem);
    newItem.style.display = "";
    newItem.classList.remove("cc-removed");
    newItem.style.gridArea = `${slot.row} / ${slot.col} / ${slot.row + rowSpan} / ${slot.col + colSpan}`;
    const del = newItem.querySelector(".cc-delete-btn");
    if (del && !controlCenter.classList.contains("editing")) del.remove();
    if (!existing) gridCC.appendChild(newItem);
    if (controlCenter.classList.contains("editing")) {
        newItem.addEventListener("pointerdown", ccPointerDown);
        addCCDeleteButtons();
    } else {
        newItem.addEventListener("click", toggleActiveItemCC);
        newItem.querySelectorAll(".iitem").forEach((el) => el.addEventListener("click", toggleActiveItemCC));
    }
    if (newItem.classList.contains("slider") && newItem.classList.contains("sound")) {
        if (typeof window.vmRefreshCCSlider_volume === "function") window.vmRefreshCCSlider_volume();
    }
    animateCCAddFromStore(newItem, fromRect);
    saveCCLayout();
    updateCCStoreNotWork();
    newItem.animate([{opacity: 0}, {opacity: 1}], {fill: "forwards"});
}
if (itemStoreCC) {
    itemStoreCC.addEventListener("click", (e) => {
        const storeItem = e.target.closest(".item");
        if (!storeItem) return;
        if (!controlCenter.classList.contains("editing")) return;
        e.preventDefault();
        e.stopPropagation();
        addStoreItemToCC(storeItem);
    });
}
function animateCCAddFromStore(newItem, fromRect) {
    if (!newItem || !fromRect) return;
    if (fromRect.width <= 0 || fromRect.height <= 0) return;
    newItem.style.transformOrigin = "top left";
    newItem.style.opacity = "0.2";
    requestAnimationFrame(() => {
        const toRect = newItem.getBoundingClientRect();
        if (toRect.width <= 0 || toRect.height <= 0) {
            newItem.style.transformOrigin = "";
            newItem.style.opacity = "";
            return;
        }
        const dx = fromRect.left - toRect.left;
        const dy = fromRect.top - toRect.top;
        const sx = fromRect.width / toRect.width;
        const sy = fromRect.height / toRect.height;
        const anim = newItem.animate(
            [
                {transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity: 0.2, scale: 1},
                {transform: "translate(0,0) scale(1)", scale: 1, opacity: 1},
            ],
            {duration: 320, easing: "ease"}
        );
        anim.onfinish = () => {
            newItem.style.transformOrigin = "";
            newItem.style.opacity = "";
        };
    });
}

addEventListener_cc();
let value_volume = 50;
let value_brightness = 100;
let sliderVolume_volume = null;
let sliderInVolume_volume = null;
const sliderInVolumePanel_volume = gridCC.querySelector(".volumeCTN .volumeMain.slider .sliderIN");
let sliderBrightness_brightness = null;
let sliderInBrightness_brightness = null;
function refreshCCSliderRefs() {
    sliderVolume_volume = gridCC.querySelector(".item.slider.sound");
    sliderInVolume_volume = sliderVolume_volume ? sliderVolume_volume.querySelector(".sliderIN") : null;
    sliderBrightness_brightness = gridCC.querySelector(".item.slider.brightness");
    sliderInBrightness_brightness = sliderBrightness_brightness
        ? sliderBrightness_brightness.querySelector(".sliderIN")
        : null;
}
refreshCCSliderRefs();
let isDragging_volume = false;
let startY_volume = 0;
let startValue_volume = 0;
let sliderHeight_volume = 0;
let lastY_volume = 0;
let lastT_volume = 0;
let velocity_volume = 0;
let rawValue_volume = 0;
let inertiaRaf_volume = 0;
let inertiaActive_volume = false;
let overshootTime_volume = 0;
let overshootLastT_volume = 0;
let wasOvershoot_volume = false;
const overshootMax_volume = 0;
let isDragging_brightness = false;
let startY_brightness = 0;
let startValue_brightness = 0;
let sliderHeight_brightness = 0;
let lastY_brightness = 0;
let lastT_brightness = 0;
let velocity_brightness = 0;
let rawValue_brightness = 0;
let inertiaRaf_brightness = 0;
let inertiaActive_brightness = false;
let overshootTime_brightness = 0;
let overshootLastT_brightness = 0;
let wasOvershoot_brightness = false;
const overshootMax_brightness = 0;
function recoverTime_volume() {
    if (overshootMax_volume <= 0) return 0.45;
    return 0.45 + (overshootTime_volume / overshootMax_volume) * 0.45;
}
function recoverTime_brightness() {
    if (overshootMax_brightness <= 0) return 0.45;
    return 0.45 + (overshootTime_brightness / overshootMax_brightness) * 0.45;
}
function syncVolumeValueToUI_volume(value) {
    if (sliderInVolume_volume) sliderInVolume_volume.style.height = `${value}%`;
    if (sliderInVolumePanel_volume) sliderInVolumePanel_volume.style.height = `${value}%`;
}
function applyScaleVolume_volume(rawValue, dtSec, recoverOnInside) {
    const maxOvershootPx = sliderHeight_volume;
    const dampOvershoot = (px, maxPx) => (px <= maxPx ? px : maxPx + (px - maxPx) * 0.2) / 2;
    if (rawValue > 100) {
        const overshootPx = ((rawValue - 100) / 100) * sliderHeight_volume;
        const damped = dampOvershoot(overshootPx, maxOvershootPx);
        const extra = Math.min(0.05, damped / sliderHeight_volume);
        sliderVolume_volume.style.transformOrigin = "center 180%";
        sliderVolume_volume.style.scale = `${1 - extra / 2.7} ${1 + extra}`;
        wasOvershoot_volume = true;
        if (overshootMax_volume > 0) {
            overshootTime_volume = Math.min(overshootMax_volume, overshootTime_volume + dtSec);
        }
        return;
    }
    if (rawValue < 0) {
        const overshootPx = ((0 - rawValue) / 100) * sliderHeight_volume;
        const damped = dampOvershoot(overshootPx, maxOvershootPx);
        const extra = Math.min(0.05, damped / sliderHeight_volume);
        sliderVolume_volume.style.transformOrigin = "center -80%";
        sliderVolume_volume.style.scale = `${1 - extra / 2.7} ${1 + extra}`;
        wasOvershoot_volume = true;
        if (overshootMax_volume > 0) {
            overshootTime_volume = Math.min(overshootMax_volume, overshootTime_volume + dtSec);
        }
        return;
    }
    if (recoverOnInside && wasOvershoot_volume) {
        const recover = recoverTime_volume();
        sliderVolume_volume.style.transition = `scale ${recover}s cubic-bezier(.57,1.6,.45,1), transform-origin 0s 0.4s`;
        sliderVolume_volume.style.transformOrigin = "center";
    }
    sliderVolume_volume.style.scale = "";
    overshootTime_volume = 0;
    wasOvershoot_volume = false;
}
function applyScaleBrightness_brightness(rawValue, dtSec, recoverOnInside) {
    const maxOvershootPx = sliderHeight_brightness;
    const dampOvershoot = (px, maxPx) => (px <= maxPx ? px : maxPx + (px - maxPx) * 0.2);
    if (rawValue > 100) {
        const overshootPx = ((rawValue - 100) / 100) * sliderHeight_brightness;
        const damped = dampOvershoot(overshootPx, maxOvershootPx);
        const extra = Math.min(0.05, damped / sliderHeight_brightness);
        sliderBrightness_brightness.style.transformOrigin = "center 180%";
        sliderBrightness_brightness.style.scale = `${1 - extra / 2.7} ${1 + extra}`;
        wasOvershoot_brightness = true;
        if (overshootMax_brightness > 0) {
            overshootTime_brightness = Math.min(overshootMax_brightness, overshootTime_brightness + dtSec);
        }
        return;
    }
    if (rawValue < 20) {
        const overshootPx = ((20 - rawValue) / 100) * sliderHeight_brightness;
        const damped = dampOvershoot(overshootPx, maxOvershootPx);
        const extra = Math.min(0.05, damped / sliderHeight_brightness);
        sliderBrightness_brightness.style.transformOrigin = "center -80%";
        sliderBrightness_brightness.style.scale = `${1 - extra / 2.7} ${1 + extra}`;
        wasOvershoot_brightness = true;
        if (overshootMax_brightness > 0) {
            overshootTime_brightness = Math.min(overshootMax_brightness, overshootTime_brightness + dtSec);
        }
        return;
    }
    if (recoverOnInside && wasOvershoot_brightness) {
        const recover = recoverTime_brightness();
        sliderBrightness_brightness.style.transition = `scale ${recover}s cubic-bezier(.57,1.6,.45,1), transform-origin 0s 0.4s`;
        sliderBrightness_brightness.style.transformOrigin = "center";
    }
    sliderBrightness_brightness.style.scale = "";
    overshootTime_brightness = 0;
    wasOvershoot_brightness = false;
}
function volMouseDown(e) {
    if (ccIsDragging) return;
    if (!sliderVolume_volume) {
        refreshCCSliderRefs();
        if (!sliderVolume_volume) return;
    }
    const rect = sliderInVolume_volume.getBoundingClientRect();
    sliderHeight_volume = rect.height;
    startY_volume = e.clientY;
    startValue_volume = value_volume;
    isDragging_volume = true;
    lastY_volume = e.clientY;
    lastT_volume = performance.now();
    velocity_volume = 0;
    rawValue_volume = value_volume;
    if (inertiaActive_volume) {
        cancelAnimationFrame(inertiaRaf_volume);
        inertiaActive_volume = false;
    }
    sliderVolume_volume.style.transition = "none";
    sliderInVolume_volume.style.transition = "none";
    if (e.pointerId !== undefined) sliderVolume_volume.setPointerCapture(e.pointerId);
    document.addEventListener("pointermove", volMouseMove);
    document.addEventListener("pointerup", volMouseUp);
    document.addEventListener("pointercancel", volMouseUp);
}
function volMouseMove(e) {
    if (!isDragging_volume) return;
    const now = performance.now();
    const dt = Math.min(now - lastT_volume, 100) / 1000;
    lastT_volume = now;
    const dy = -(e.clientY - lastY_volume);
    lastY_volume = e.clientY;
    const sensitivity = 0.8;
    const deltaValue = (dy / sliderHeight_volume) * 100 * sensitivity;
    rawValue_volume = Math.max(-10, Math.min(110, rawValue_volume + deltaValue));
    const clampedValue = Math.max(0, Math.min(100, rawValue_volume));
    value_volume = clampedValue;
    syncVolumeValueToUI_volume(clampedValue);
    applyScaleVolume_volume(rawValue_volume, dt, false);
    if (typeof window.vmSetVolume === "function") window.vmSetVolume(value_volume);
}
function volMouseUp(e) {
    if (!isDragging_volume) return;
    isDragging_volume = false;
    document.removeEventListener("pointermove", volMouseMove);
    document.removeEventListener("pointerup", volMouseUp);
    document.removeEventListener("pointercancel", volMouseUp);
    const finalValue = Math.max(0, Math.min(100, rawValue_volume));
    value_volume = finalValue;
    syncVolumeValueToUI_volume(finalValue);
    applyScaleVolume_volume(rawValue_volume, 0, true);
    if (typeof window.vmSetVolume === "function") window.vmSetVolume(value_volume);
}
function brightMouseDown(e) {
    if (ccIsDragging) return;
    if (!sliderBrightness_brightness) {
        refreshCCSliderRefs();
        if (!sliderBrightness_brightness) return;
    }
    const rect = sliderInBrightness_brightness.getBoundingClientRect();
    sliderHeight_brightness = rect.height;
    startY_brightness = e.clientY;
    startValue_brightness = value_brightness;
    isDragging_brightness = true;
    lastY_brightness = e.clientY;
    lastT_brightness = performance.now();
    velocity_brightness = 0;
    rawValue_brightness = value_brightness;
    if (inertiaActive_brightness) {
        cancelAnimationFrame(inertiaRaf_brightness);
        inertiaActive_brightness = false;
    }
    sliderBrightness_brightness.style.transition = "none";
    sliderInBrightness_brightness.style.transition = "none";
    if (e.pointerId !== undefined) sliderBrightness_brightness.setPointerCapture(e.pointerId);
    document.addEventListener("pointermove", brightMouseMove);
    document.addEventListener("pointerup", brightMouseUp);
    document.addEventListener("pointercancel", brightMouseUp);
}
function brightMouseMove(e) {
    if (!isDragging_brightness) return;
    const now = performance.now();
    const dt = Math.min(now - lastT_brightness, 100) / 1000;
    lastT_brightness = now;
    const dy = -(e.clientY - lastY_brightness);
    lastY_brightness = e.clientY;
    const sensitivity = 0.8;
    const deltaValue = (dy / sliderHeight_brightness) * 100 * sensitivity;
    rawValue_brightness = Math.max(10, Math.min(110, rawValue_brightness + deltaValue));
    const clampedValue = Math.max(20, Math.min(100, rawValue_brightness));
    value_brightness = clampedValue;
    if (sliderInBrightness_brightness) sliderInBrightness_brightness.style.height = `${clampedValue}%`;
    applyScaleBrightness_brightness(rawValue_brightness, dt, false);
    if (typeof window.vmSetBrightness === "function") window.vmSetBrightness(value_brightness);
}
function brightMouseUp(e) {
    if (!isDragging_brightness) return;
    isDragging_brightness = false;
    document.removeEventListener("pointermove", brightMouseMove);
    document.removeEventListener("pointerup", brightMouseUp);
    document.removeEventListener("pointercancel", brightMouseUp);
    const finalValue = Math.max(20, Math.min(100, rawValue_brightness));
    value_brightness = finalValue;
    if (sliderInBrightness_brightness) sliderInBrightness_brightness.style.height = `${finalValue}%`;
    applyScaleBrightness_brightness(rawValue_brightness, 0, true);
    if (typeof window.vmSetBrightness === "function") window.vmSetBrightness(value_brightness);
}
function addDragVolumeAndBrightnessEvents() {
    if (sliderVolume_volume) {
        sliderVolume_volume.addEventListener("pointerdown", volMouseDown);
    }
    if (sliderBrightness_brightness) {
        sliderBrightness_brightness.addEventListener("pointerdown", brightMouseDown);
    }
}
function removeDragVolumeAndBrightnessEvents() {
    if (sliderVolume_volume) {
        sliderVolume_volume.removeEventListener("pointerdown", volMouseDown);
    }
    if (sliderBrightness_brightness) {
        sliderBrightness_brightness.removeEventListener("pointerdown", brightMouseDown);
    }
}
function openControlCenterDirectly() {
    try {
        if (!controlCenter) {
            console.error("Control Center element not found");
            return false;
        }
        if (controlCenter.classList.contains("open")) {
            console.log("Control Center already open");
            return true;
        }
        openControlsCenter();
        console.log("Control Center opened successfully");
        return true;
    } catch (error) {
        console.error("Error opening Control Center:", error);
        return false;
    }
}
function toggleControlCenter() {
    if (controlCenter.classList.contains("open")) {
        closeControlsCenter(false);
        console.log("Control Center closed");
    } else {
        openControlCenterDirectly();
    }
}
window.toggleControlCenter = toggleControlCenter;
window.openControlCenter = openControlCenterDirectly;
window.closeControlCenter = closeControlsCenter;
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing Control Center...");
    setTimeout(() => {
        openControlCenterDirectly();
    }, 100);
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && controlCenter.classList.contains('open')) {
        closeControlsCenter(false);
        e.preventDefault();
    }
});
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        toggleControlCenter();
    }
});
const originalOpen = openControlsCenter;
openControlsCenter = function() {
    try {
        if (controlCenter.classList.contains("open")) {
            console.log("Already open");
            return;
        }
        console.log("Opening Control Center...");
        controlCenter.style.display = "flex";
        controlCenter.style.opacity = "0";
        requestAnimationFrame(() => {
            controlCenter.classList.add("open");
            controlCenter.style.opacity = "1";
        });
        originalOpen.call(this);
        controlCenter.animate([
            { opacity: 0, transform: 'scale(0.95)' },
            { opacity: 1, transform: 'scale(1)' }
        ], {
            duration: 300,
            easing: 'ease-out'
        });
    } catch (error) {
        console.error("Error in openControlsCenter:", error);
        controlCenter.style.display = "flex";
        controlCenter.classList.add("open");
        controlCenter.style.opacity = "1";
    }
};
const originalClose = closeControlsCenter;
closeControlsCenter = function(fromSystem = false) {
    try {
        if (!controlCenter.classList.contains("open")) {
            console.log("Already closed");
            return;
        }
        console.log("Closing Control Center...");
        controlCenter.animate([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.95)' }
        ], {
            duration: 200,
            easing: 'ease-in'
        });
        originalClose.call(this, fromSystem);
        setTimeout(() => {
            if (!controlCenter.classList.contains("open")) {
                controlCenter.style.display = "none";
                controlCenter.style.opacity = "0";
            }
        }, 250);
    } catch (error) {
        console.error("Error in closeControlsCenter:", error);
        controlCenter.classList.remove("open");
        controlCenter.style.display = "none";
        controlCenter.style.opacity = "0";
    }
};
console.log("Control Center initialized!");
console.log("Use toggleControlCenter() to open/close");
console.log("Or press Ctrl+Shift+C");
