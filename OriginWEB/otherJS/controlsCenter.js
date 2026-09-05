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
/* ================= CORE ================= */
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
/* ================= POINTER HANDLERS ================= */
function onPointerMove_cc(e) {
    moveDrag_cc(statusBarRight, e.clientY);
}
function onPointerUp_cc(e) {
    endDrag_cc(statusBarRight);
}
function onPointerDown_cc(e) {
    startDrag_cc(statusBarRight, e.clientY);
}
/* ================= EVENT CONTROL ================= */
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
/* ================= EVENT CONTROL WHEN OPEN ================= */
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

// == addition ===
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

/* ================= TRANSFORM ================= */
/* ================= INIT ================= */
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
    if (!sliderVolume_volume || !sliderInVolume_volume) return;
    isDragging_volume = true;
    startY_volume = e.clientY;
    startValue_volume = value_volume;
    sliderHeight_volume = sliderVolume_volume.getBoundingClientRect().height || 1;
    lastY_volume = e.clientY;
    lastT_volume = e.timeStamp || performance.now();
    velocity_volume = 0;
    rawValue_volume = value_volume;
    inertiaActive_volume = false;
    overshootTime_volume = 0;
    overshootLastT_volume = lastT_volume;
    wasOvershoot_volume = false;
    if (inertiaRaf_volume) cancelAnimationFrame(inertiaRaf_volume);
    sliderVolume_volume.style.transition = "all 0.08s";
    sliderVolume_volume.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
}
function volMouseMove(e) {
    if (!isDragging_volume || !sliderVolume_volume || !sliderInVolume_volume) return;
    const delta = startY_volume - e.clientY;
    rawValue_volume = startValue_volume + (delta / sliderHeight_volume) * 100;
    const clamped = Math.min(100, Math.max(0, rawValue_volume));
    value_volume = clamped;
    syncVolumeValueToUI_volume(clamped);
    const nowT = e.timeStamp || performance.now(),
        dtOver = (nowT - overshootLastT_volume) / 1000;
    overshootLastT_volume = nowT;
    applyScaleVolume_volume(rawValue_volume, dtOver, false);
    const now = e.timeStamp || performance.now(),
        dt = Math.max(1, now - lastT_volume),
        dy = lastY_volume - e.clientY,
        deltaValue = (dy / sliderHeight_volume) * 100;
    velocity_volume = deltaValue / dt;
    lastY_volume = e.clientY;
    lastT_volume = now;
    e.preventDefault();
    e.stopPropagation();
}
function volMouseUp() {
    if (!isDragging_volume || !sliderVolume_volume) return;
    isDragging_volume = false;
    inertiaActive_volume = true;
    const minVelocity = 0.005,
        friction = 0.8;
    let lastTime = performance.now();
    const step = (t) => {
        if (!inertiaActive_volume) return;
        const dt = Math.max(1, t - lastTime);
        lastTime = t;
        rawValue_volume += velocity_volume * dt;
        const inOvershoot_volume = rawValue_volume > 100 || rawValue_volume < 0;
        const frictionEffective_volume = inOvershoot_volume ? (friction * friction) / 1.5 : friction;
        velocity_volume *= Math.pow(frictionEffective_volume, dt / 16);
        const clamped = Math.min(100, Math.max(0, rawValue_volume));
        value_volume = clamped;
        syncVolumeValueToUI_volume(clamped);
        applyScaleVolume_volume(rawValue_volume, dt / 1000, true);
        if (Math.abs(velocity_volume) < minVelocity) {
            inertiaActive_volume = false;
            rawValue_volume = value_volume;
            applyScaleVolume_volume(rawValue_volume, 0, true);
            return;
        }
        inertiaRaf_volume = requestAnimationFrame(step);
    };
    inertiaRaf_volume = requestAnimationFrame(step);
}
function briMouseDown(e) {
    if (ccIsDragging) return;
    if (!sliderBrightness_brightness || !sliderInBrightness_brightness) return;
    isDragging_brightness = true;
    startY_brightness = e.clientY;
    startValue_brightness = value_brightness;
    sliderHeight_brightness = sliderBrightness_brightness.getBoundingClientRect().height || 1;
    lastY_brightness = e.clientY;
    lastT_brightness = e.timeStamp || performance.now();
    velocity_brightness = 0;
    rawValue_brightness = value_brightness;
    inertiaActive_brightness = false;
    overshootTime_brightness = 0;
    overshootLastT_brightness = lastT_brightness;
    wasOvershoot_brightness = false;
    if (inertiaRaf_brightness) cancelAnimationFrame(inertiaRaf_brightness);
    sliderBrightness_brightness.style.transition = "all 0.08s";
    sliderBrightness_brightness.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
}
function briMouseMove(e) {
    if (!isDragging_brightness || !sliderBrightness_brightness || !sliderInBrightness_brightness) return;
    const delta = startY_brightness - e.clientY,
        min = 20,
        max = 100,
        range = max - min;
    rawValue_brightness = startValue_brightness + (delta / sliderHeight_brightness) * range;
    const clamped = Math.min(max, Math.max(min, rawValue_brightness));
    value_brightness = clamped;
    const visualPercent = ((clamped - min) / range) * 100;
    sliderInBrightness_brightness.style.height = `${visualPercent}%`;
    const nowT = e.timeStamp || performance.now(),
        dtOver = (nowT - overshootLastT_brightness) / 1000;
    overshootLastT_brightness = nowT;
    applyScaleBrightness_brightness(rawValue_brightness, dtOver, false);
    const now = e.timeStamp || performance.now(),
        dt = Math.max(1, now - lastT_brightness),
        dy = lastY_brightness - e.clientY,
        deltaValue = (dy / sliderHeight_brightness) * range;
    velocity_brightness = deltaValue / dt;
    lastY_brightness = e.clientY;
    lastT_brightness = now;
    e.preventDefault();
    e.stopPropagation();
}
function briMouseUp() {
    if (!isDragging_brightness || !sliderBrightness_brightness) return;
    isDragging_brightness = false;
    inertiaActive_brightness = true;
    const min = 20,
        max = 100,
        range = max - min,
        minVelocity = 0.005,
        friction = 0.8;
    let lastTime = performance.now();
    const step = (t) => {
        if (!inertiaActive_brightness) return;
        const dt = Math.max(1, t - lastTime);
        lastTime = t;
        rawValue_brightness += velocity_brightness * dt;
        const inOvershoot_brightness = rawValue_brightness > max || rawValue_brightness < min;
        const frictionEffective_brightness = inOvershoot_brightness ? (friction * friction) / 1.5 : friction;
        velocity_brightness *= Math.pow(frictionEffective_brightness, dt / 16);
        const clamped = Math.min(max, Math.max(min, rawValue_brightness));
        value_brightness = clamped;
        const visualPercent = ((clamped - min) / range) * 100;
        sliderInBrightness_brightness.style.height = `${visualPercent}%`;
        applyScaleBrightness_brightness(rawValue_brightness, dt / 1000, true);
        if (Math.abs(velocity_brightness) < minVelocity) {
            inertiaActive_brightness = false;
            rawValue_brightness = value_brightness;
            applyScaleBrightness_brightness(rawValue_brightness, 0, true);
            return;
        }
        inertiaRaf_brightness = requestAnimationFrame(step);
    };
    inertiaRaf_brightness = requestAnimationFrame(step);
}
/* ----------------------
   REMOVE EVENT LISTENERS
   ---------------------- */
function addDragVolumeAndBrightnessEvents() {
    refreshCCSliderRefs();
    syncVolumeValueToUI_volume(value_volume);
    if (sliderInBrightness_brightness) {
        const min = 20,
            max = 100,
            range = max - min,
            visualPercent = ((value_brightness - min) / range) * 100;
        sliderInBrightness_brightness.style.height = `${Math.min(100, Math.max(0, visualPercent))}%`;
    }
    if (sliderVolume_volume) sliderVolume_volume.addEventListener("pointerdown", volMouseDown);
    if (sliderBrightness_brightness) sliderBrightness_brightness.addEventListener("pointerdown", briMouseDown);
    document.addEventListener("pointermove", volMouseMove);
    document.addEventListener("pointerup", volMouseUp);
    document.addEventListener("pointercancel", volMouseUp);
    document.addEventListener("pointermove", briMouseMove);
    document.addEventListener("pointerup", briMouseUp);
    document.addEventListener("pointercancel", briMouseUp);
}
function removeDragVolumeAndBrightnessEvents() {
    if (sliderVolume_volume) sliderVolume_volume.removeEventListener("pointerdown", volMouseDown);
    if (sliderBrightness_brightness) sliderBrightness_brightness.removeEventListener("pointerdown", briMouseDown);
    document.removeEventListener("pointermove", volMouseMove);
    document.removeEventListener("pointerup", volMouseUp);
    document.removeEventListener("pointercancel", volMouseUp);
    document.removeEventListener("pointermove", briMouseMove);
    document.removeEventListener("pointerup", briMouseUp);
    document.removeEventListener("pointercancel", briMouseUp);
}
closeControlsCenter();
let ccDidDrag = false,
    ccSuppressClickUntil = 0,
    ccHoldTimer = null,
    ccDragTarget = null,
    ccPreview = null,
    ccPreviewDropPos = null,
    ccOriginRow = 0,
    ccOriginCol = 0,
    ccOriginRowEnd = 0,
    ccOriginColEnd = 0,
    ccStartX = 0,
    ccStartY = 0,
    ccLastDx = 0,
    ccLastDy = 0,
    ccIsDragging = false,
    ccTempSwapState = null,
    ccPendingRestore = null,
    ccPendingRestorePos = null,
    ccPreviewBaseLeft = 0,
    ccPreviewBaseTop = 0,
    ccGridLeft = 0,
    ccGridTop = 0,
    ccGridWidth = 0,
    ccGridHeight = 0,
    ccGridCols = 0,
    ccGridRows = 0,
    ccScaleX = 1,
    ccScaleY = 1,
    ccSlotBaseLeft = 0,
    ccSlotBaseTop = 0,
    ccSlotBaseWidth = 0,
    ccSlotBaseHeight = 0,
    ccDropOffsetX = 0,
    ccDropOffsetY = 0,
    ccCheckTimer = null,
    ccDragRowSpan = 1,
    ccDragColSpan = 1,
    ccLastSlotRow = -1,
    ccLastSlotCol = -1,
    ccMoveRaf = 0,
    ccMoveEvent = null,
    ccDragItems = null,
    ccRectCache = null;
function toggleActiveItemCC(e) {
    if (e.currentTarget.classList.contains("iitem")) e.stopPropagation();
    if (e.currentTarget.classList.contains("nonActive")) return;
    if (Date.now() < ccSuppressClickUntil) return;
    e.currentTarget.classList.toggle("active");
}
const ccLiftScale = 1.1;
function getCCGridAreaString(el) {
    const inline = el.style.gridArea;
    if (inline) {
        const parts = inline.split("/").map((p) => parseInt(p, 10));
        if (parts.length >= 4 && parts.every((n) => !isNaN(n))) {
            return `${parts[0]} / ${parts[1]} / ${parts[2]} / ${parts[3]}`;
        }
    }
    const rect = getCCGridRect(el);
    if (!rect) return inline || "1 / 1 / 2 / 2";
    return `${rect.rowStart} / ${rect.colStart} / ${rect.rowEnd} / ${rect.colEnd}`;
}
function saveCCLayout() {
    const items = Array.from(gridCC.querySelectorAll(":scope > .item")).filter(
        (el) => !el.classList.contains("cc-removed") && !el.classList.contains("cc-preview")
    );
    if (!items.length) {
        localStorage.setItem(CC_LAYOUT_STORAGE_KEY, "[]");
        return;
    }
    const layout = items.map((el, i) => ({
        name: getCCName(el) || "",
        size: getCCSize(el),
        id: getCCItemId(el, i),
        gridArea: getCCGridAreaString(el),
    }));
    localStorage.setItem(CC_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
}
function getCCItems() {
    return Array.from(gridCC.querySelectorAll(":scope > .item")).filter(
        (el) => !el.classList.contains("cc-removed") && !el.classList.contains("cc-preview")
    );
}
function getCCGridRect(el) {
    if (ccRectCache && ccRectCache.has(el)) return ccRectCache.get(el);
    const ga = el.style.gridArea;
    if (ga) {
        const parts = ga.split("/").map((p) => parseInt(p, 10));
        if (parts.length >= 4 && parts.every((n) => !isNaN(n))) {
            const rect = {rowStart: parts[0], colStart: parts[1], rowEnd: parts[2], colEnd: parts[3]};
            if (ccRectCache) ccRectCache.set(el, rect);
            return rect;
        }
    }
    const cs = getComputedStyle(el),
        rowStart = parseInt(cs.gridRowStart) || 1,
        colStart = parseInt(cs.gridColumnStart) || 1,
        rowEndRaw = cs.gridRowEnd,
        colEndRaw = cs.gridColumnEnd;
    let rowEnd = !rowEndRaw || rowEndRaw === "auto" ? rowStart + 1 : parseInt(rowEndRaw);
    let colEnd = !colEndRaw || colEndRaw === "auto" ? colStart + 1 : parseInt(colEndRaw);
    if (rowEndRaw && rowEndRaw.includes("span"))
        rowEnd = rowStart + (parseInt(rowEndRaw.replace(/[^\d]/g, ""), 10) || 1);
    if (colEndRaw && colEndRaw.includes("span"))
        colEnd = colStart + (parseInt(colEndRaw.replace(/[^\d]/g, ""), 10) || 1);
    if (!rowEnd) rowEnd = rowStart + 1;
    if (!colEnd) colEnd = colStart + 1;
    const rect = {rowStart, colStart, rowEnd, colEnd};
    if (ccRectCache) ccRectCache.set(el, rect);
    return rect;
}
function ccGetHoverSlot(x, y, rowSpan, colSpan) {
    const left = ccGridLeft,
        top = ccGridTop,
        width = ccGridWidth,
        height = ccGridHeight;
    if (x < left || x > left + width || y < top || y > top + height) return null;
    const cols = ccGridCols || 1,
        rows = ccGridRows || 1;
    let col = Math.floor(((x - left) / width) * cols) + 1;
    let row = Math.floor(((y - top) / height) * rows) + 1;
    col = Math.min(cols, Math.max(1, col));
    row = Math.min(rows, Math.max(1, row));
    if (row + rowSpan - 1 > rows) row = rows - rowSpan + 1;
    if (col + colSpan - 1 > cols) col = cols - colSpan + 1;
    if (row < 1 || col < 1) return null;
    return {row, col, rowSpan, colSpan};
}
function ccIsAreaFree(row, col, rowSpan, colSpan, ignoreEl, items) {
    const targetRowEnd = row + rowSpan;
    const targetColEnd = col + colSpan;
    const list = items || getCCItems();
    for (const child of list) {
        if (child === ignoreEl) continue;
        const rect = getCCGridRect(child);
        if (
            !(
                targetRowEnd <= rect.rowStart ||
                row >= rect.rowEnd ||
                targetColEnd <= rect.colStart ||
                col >= rect.colEnd
            )
        )
            return false;
    }
    return true;
}
const isAeraFreeCC = (slot) =>
    slot && ccIsAreaFree(slot.row, slot.col, ccDragRowSpan, ccDragColSpan, ccDragTarget, ccDragItems);
function animateCCRelayout(elements, applyLayout) {
    if (elements.length > 12) {
        applyLayout();
        return;
    }
    const first = new Map();
    for (const el of elements) first.set(el, el.getBoundingClientRect());
    applyLayout();
    requestAnimationFrame(() => {
        for (const el of elements) {
            const f = first.get(el);
            if (!f) continue;
            const last = el.getBoundingClientRect(),
                dx = f.left - last.left,
                dy = f.top - last.top;
            if (dx || dy)
                el.animate([{transform: `translate(${dx}px, ${dy}px)`}, {transform: "translate(0,0)"}], {
                    duration: 220,
                    easing: "cubic-bezier(.22,.61,.36,1)",
                    composite: "add",
                });
        }
    });
}
function ccRestoreTempSwap() {
    if (!ccTempSwapState) return;
    const items = ccTempSwapState.items;
    const elements = items.map((i) => i.el);
    animateCCRelayout(elements, () => {
        for (const item of items) {
            item.el.style.gridArea = item.gridArea;
            if (ccRectCache) {
                const parts = item.gridArea.split("/").map((p) => parseInt(p, 10));
                ccRectCache.set(item.el, {
                    rowStart: parts[0],
                    colStart: parts[1],
                    rowEnd: parts[2],
                    colEnd: parts[3],
                });
            }
        }
    });
    ccTempSwapState = null;
    if (ccPendingRestore) {
        clearTimeout(ccPendingRestore);
        ccPendingRestore = null;
    }
    ccPendingRestorePos = null;
}
function ccTryTempSwap(row, col) {
    const rowSpan = ccDragRowSpan,
        colSpan = ccDragColSpan,
        items = [],
        allIcons = ccDragItems || getCCItems();
    let totalArea = 0;
    for (const icon of allIcons) {
        if (icon === ccDragTarget) continue;
        const rect = getCCGridRect(icon);
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
            gridArea: `${rect.rowStart} / ${rect.colStart} / ${rect.rowEnd} / ${rect.colEnd}`,
            relRow: rect.rowStart - row,
            relCol: rect.colStart - col,
            relRowEnd: rect.rowEnd - row,
            relColEnd: rect.colEnd - col,
        });
        totalArea += (rect.rowEnd - rect.rowStart) * (rect.colEnd - rect.colStart);
    }
    if (!items.length || totalArea > rowSpan * colSpan) return;
    ccRestoreTempSwap();
    animateCCRelayout(
        items.map((i) => i.el),
        () => {
            items.forEach((item) => {
                const newRowStart = ccOriginRow + item.relRow,
                    newColStart = ccOriginCol + item.relCol,
                    newRowEnd = ccOriginRow + item.relRowEnd,
                    newColEnd = ccOriginCol + item.relColEnd;
                item.el.style.gridArea = `${newRowStart} / ${newColStart} / ${newRowEnd} / ${newColEnd}`;
                if (ccRectCache)
                    ccRectCache.set(item.el, {
                        rowStart: newRowStart,
                        colStart: newColStart,
                        rowEnd: newRowEnd,
                        colEnd: newColEnd,
                    });
            });
        }
    );
    ccTempSwapState = {row, col, rowSpan, colSpan, items};
}
function ccPointerDown(e) {
    if (e.currentTarget.classList.contains("iitem") || ccIsDragging) return;
    const el = e.currentTarget,
        startX = e.clientX,
        startY = e.clientY,
        clearHold = () => {
            if (ccHoldTimer) {
                clearTimeout(ccHoldTimer);
                ccHoldTimer = null;
            }
            window.removeEventListener("pointercancel", clearHold);
            window.removeEventListener("pointerup", clearHold);
            window.removeEventListener("pointermove", onMoveHold);
        },
        onMoveHold = (ev) => {
            const dx = ev.clientX - startX,
                dy = ev.clientY - startY;
            if (dx * dx + dy * dy > 25) clearHold();
        };
    ccHoldTimer = setTimeout(() => {
        clearHold();
        ccStartDrag(el, e);
    }, 400);
    window.addEventListener("pointercancel", clearHold);
    window.addEventListener("pointerup", clearHold);
    window.addEventListener("pointermove", onMoveHold);
}
function ccStartDrag(el, e) {
    ccDragTarget = el;
    ccIsDragging = true;
    ccDidDrag = true;
    ccStartX = e.clientX;
    ccStartY = e.clientY;
    ccLastDx = 0;
    ccLastDy = 0;
    if (e.pointerId !== undefined) ccDragTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
    if (el.classList.contains("slider")) {
        if (el === sliderVolume_volume) volMouseUp();
        if (el === sliderBrightness_brightness) briMouseUp();
        isDragging_volume = false;
        isDragging_brightness = false;
    }
    const gridRect = gridCC.getBoundingClientRect(),
        cs = getComputedStyle(el),
        gridCS = getComputedStyle(gridCC);
    let scaleX = 1,
        scaleY = 1;
    const ow = gridCC.offsetWidth || 0,
        oh = gridCC.offsetHeight || 0;
    if (ow > 0) scaleX = gridRect.width / ow;
    if (oh > 0) scaleY = gridRect.height / oh;
    if (!isFinite(scaleX) || scaleX <= 0) scaleX = 1;
    if (!isFinite(scaleY) || scaleY <= 0) scaleY = 1;
    ccOriginRow = parseInt(cs.gridRowStart);
    ccOriginCol = parseInt(cs.gridColumnStart);
    ccOriginRowEnd = cs.gridRowEnd === "auto" ? ccOriginRow + 1 : parseInt(cs.gridRowEnd);
    ccOriginColEnd = cs.gridColumnEnd === "auto" ? ccOriginCol + 1 : parseInt(cs.gridColumnEnd);
    const previewLeft = el.offsetLeft,
        previewTop = el.offsetTop,
        previewWidth = el.offsetWidth,
        previewHeight = el.offsetHeight;
    ccPreviewBaseLeft = previewLeft;
    ccPreviewBaseTop = previewTop;
    ccGridLeft = gridRect.left;
    ccGridTop = gridRect.top;
    ccGridWidth = gridRect.width || 1;
    ccGridHeight = gridRect.height || 1;
    ccScaleX = scaleX;
    ccScaleY = scaleY;
    const colTokens = gridCS.gridTemplateColumns.split(" ").filter(Boolean),
        rowTokens = gridCS.gridTemplateRows.split(" ").filter(Boolean);
    ccGridCols = colTokens.length || 1;
    ccGridRows = rowTokens.length || 1;
    const colSize = parseFloat(colTokens[0] || "0") || 0,
        rowSize = parseFloat(rowTokens[0] || "0") || 0,
        colGap = parseFloat(gridCS.columnGap || gridCS.gap || "0") || 0,
        rowGap = parseFloat(gridCS.rowGap || gridCS.gap || "0") || 0,
        rowSpan = Math.max(1, ccOriginRowEnd - ccOriginRow),
        colSpan = Math.max(1, ccOriginColEnd - ccOriginCol);
    const cellW = (ccGridWidth - (ccGridCols - 1) * colGap) / ccGridCols,
        cellH = (ccGridHeight - (ccGridRows - 1) * rowGap) / ccGridRows;
    ccDragRowSpan = rowSpan;
    ccDragColSpan = colSpan;
    ccLastSlotRow = -1;
    ccLastSlotCol = -1;
    ccSlotBaseLeft = (ccOriginCol - 1) * (colSize + colGap);
    ccSlotBaseTop = (ccOriginRow - 1) * (rowSize + rowGap);
    ccSlotBaseWidth = colSpan * colSize + Math.max(0, colSpan - 1) * colGap;
    ccSlotBaseHeight = rowSpan * rowSize + Math.max(0, rowSpan - 1) * rowGap;
    ccDragItems = getCCItems();
    ccRectCache = new Map();
    for (const item of ccDragItems) {
        ccRectCache.set(item, getCCGridRect(item));
    }
    ccPreview = el.cloneNode(true);
    ccPreview.classList.add("cc-preview", "noActiveAnim");
    ccPreview.style.position = "absolute";
    ccPreview.style.left = `${previewLeft}px`;
    ccPreview.style.top = `${previewTop}px`;
    ccPreview.style.width = `${previewWidth}px`;
    ccPreview.style.height = `${previewHeight}px`;
    ccPreview.style.margin = "0";
    ccPreview.style.gridArea = "auto";
    ccPreview.style.boxSizing = "border-box";
    ccPreview.style.pointerEvents = "none";
    ccPreview.style.opacity = "1";
    ccPreview.style.zIndex = "999";
    ccPreview.style.transformOrigin = "0 0";
    ccPreview.style.transition = "transform 80ms linear";
    ccPreview.style.transform = `scale(1)`;
    ccPreviewDropPos = document.createElement("div");
    ccPreviewDropPos.className = "dropPos";
    ccPreview.appendChild(ccPreviewDropPos);

    gridCC.appendChild(ccPreview);
    ccDropOffsetX = ccPreviewDropPos.offsetLeft;
    ccDropOffsetY = ccPreviewDropPos.offsetTop;
    if (ccCheckTimer) clearInterval(ccCheckTimer);
    ccCheckTimer = setInterval(ccCheckSlotTick, 120);
    ccPreview.animate([{scale: 1}, {scale: ccLiftScale}], {duration: 300, easing: "ease"});
    ccPreview.style.scale = ccLiftScale;
    el.style.transition = "none";
    el.style.setProperty("opacity", "0", "important");
    el.style.visibility = "hidden";
    document.addEventListener("pointermove", ccPointerMove, {passive: false});
    document.addEventListener("pointerup", ccPointerUp, {passive: false});
    document.addEventListener("pointercancel", ccPointerUp, {passive: false});
}
function ccCheckSlotTick() {
    if (!ccIsDragging) return;
    const r = ccPreviewDropPos.getBoundingClientRect(),
        slotX = r.left + r.width / 2,
        slotY = r.top + r.height / 2,
        slot = ccGetHoverSlot(slotX, slotY, ccDragRowSpan, ccDragColSpan);

    let row = -1;
    let col = -1;
    if (slot) {
        row = slot.row;
        col = slot.col;
    }

    if (row === ccLastSlotRow && col === ccLastSlotCol) return;
    ccLastSlotRow = row;
    ccLastSlotCol = col;
    if (ccTempSwapState) {
        const sameSlot = row === ccTempSwapState.row && col === ccTempSwapState.col;
        if (sameSlot && ccPendingRestore) {
            clearTimeout(ccPendingRestore);
            ccPendingRestore = null;
            ccPendingRestorePos = null;
        } else if (!sameSlot) {
            if (!ccPendingRestore) {
                ccPendingRestorePos = {x: slotX, y: slotY};
                ccPendingRestore = setTimeout(() => {
                    ccRestoreTempSwap();
                }, 120);
            } else if (ccPendingRestorePos) {
                const dxr = slotX - ccPendingRestorePos.x,
                    dyr = slotY - ccPendingRestorePos.y;
                if (dxr * dxr + dyr * dyr > 100) {
                    clearTimeout(ccPendingRestore);
                    ccPendingRestore = null;
                    ccPendingRestorePos = {x: slotX, y: slotY};
                    ccPendingRestore = setTimeout(() => {
                        ccRestoreTempSwap();
                    }, 120);
                }
            }
        }
    }
    if (slot && !ccTempSwapState && !ccPendingRestore) ccTryTempSwap(row, col);
}
function ccPointerMove(e) {
    if (!ccIsDragging) return;
    e.preventDefault();
    const dx = (e.clientX - ccStartX) / (ccScaleX || 1),
        dy = (e.clientY - ccStartY) / (ccScaleY || 1);
    ccPreview.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    ccLastDx = dx;
    ccLastDy = dy;
}
function ccPointerUp(e) {
    if (!ccIsDragging) return;
    ccIsDragging = false;
    if (ccDidDrag) ccSuppressClickUntil = Date.now() + 250;
    ccDidDrag = false;
    document.removeEventListener("pointermove", ccPointerMove);
    document.removeEventListener("pointerup", ccPointerUp);
    document.removeEventListener("pointercancel", ccPointerUp);
    if (ccCheckTimer) {
        clearInterval(ccCheckTimer);
        ccCheckTimer = null;
    }
    if (ccMoveRaf) {
        cancelAnimationFrame(ccMoveRaf);
        ccMoveRaf = 0;
    }
    const r = ccPreviewDropPos.getBoundingClientRect(),
        slotX = r.left + r.width / 2,
        slotY = r.top + r.height / 2,
        slot = ccGetHoverSlot(slotX, slotY, ccDragRowSpan, ccDragColSpan);
    if (isAeraFreeCC(slot))
        ccDragTarget.style.gridArea = `${slot.row} / ${slot.col} / ${slot.row + ccDragRowSpan} / ${
            slot.col + ccDragColSpan
        }`;
    else {
        ccRestoreTempSwap();
        ccDragTarget.style.gridArea = `${ccOriginRow} / ${ccOriginCol} / ${ccOriginRowEnd} / ${ccOriginColEnd}`;
    }
    const previewEl = ccPreview,
        targetEl = ccDragTarget,
        cleanupPreview = () => {
            targetEl.style.transition = "";
            targetEl.style.opacity = "";
            targetEl.style.removeProperty("opacity");
            targetEl.style.visibility = "";
            previewEl._ccCleaned = true;
            previewEl.remove();
        };
    requestAnimationFrame(() => {
        const toX = (targetEl.offsetLeft || 0) - ccPreviewBaseLeft,
            toY = (targetEl.offsetTop || 0) - ccPreviewBaseTop,
            fromX = ccLastDx,
            fromY = ccLastDy,
            anim = previewEl.animate(
                [
                    {transform: `translate(${fromX}px, ${fromY}px)`, scale: ccLiftScale},
                    {transform: `translate(${toX}px, ${toY}px)`, scale: 1},
                ],
                {duration: 280, easing: "ease"}
            );
        anim.onfinish = cleanupPreview;
        anim.oncancel = cleanupPreview;
        setTimeout(cleanupPreview, 360);
    });
    saveCCLayout();
    ccPreview = null;
    ccDragTarget = null;
    ccPreviewDropPos = null;
    ccTempSwapState = null;
    ccPendingRestore = null;
    ccPendingRestorePos = null;
    ccDragItems = null;
    ccRectCache = null;
}
