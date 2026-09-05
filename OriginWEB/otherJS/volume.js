const volumeCTN_volume = document.querySelector(".volumeCTN");
const volumeMain_volume = document.querySelector(".volumeCTN .volumeMain.slider");
const volumeMainIn_volume = volumeMain_volume.querySelector(".sliderIN");
const volumeUpBtn_volume = document.getElementById("volumeUp");
const volumeDownBtn_volume = document.getElementById("volumeDown");
const controlCenterRef_volume = document.querySelector(".sys.controlCenter");
let vmCachedCCSliderIn_volume = null;
let vmCachedCCSlider_volume = null;
let vmActiveSlider_volume = null;
let vmActiveSliderHeight_volume = 1;
let vmLastHeightPanel_volume = -1;
let vmLastHeightCC_volume = -1;
let vmHeightTransitionMode_volume = "";

let vmFallbackValue_volume = 100;
let vmRawValue_volume = 100;
let vmWasOvershoot_volume = false;

let vmHoldDir_volume = 0;
let vmHoldDown_volume = false;
let vmHoldTimeout_volume = 0;
let vmHoldInterval_volume = 0;
let vmPressCountSinceOpen_volume = 0;

let vmDragActive_volume = false;
let vmDragStartY_volume = 0;
let vmDragStartRaw_volume = 0;
let vmLastY_volume = 0;
let vmLastT_volume = 0;
let vmVelocity_volume = 0;
let vmInertiaRAF_volume = 0;
let vmInertiaActive_volume = false;
let vmBaseTransition_volume = "";
let vmBaseTransitionCC_volume = "";
let vmOvershootTime_volume = 0;
const vmOvershootMax_volume = 0.03;
let vmAutoCloseTimer_volume = 0;
let vmCloseFallbackTimer_volume = 0;
let vmRuntimeListenersOn_volume = false;

function vmGetValue_volume() {
    return typeof value_volume !== "undefined" ? value_volume : vmFallbackValue_volume;
}

function vmGetCCSliderIn_volume() {
    if (vmCachedCCSliderIn_volume && vmCachedCCSliderIn_volume.isConnected) return vmCachedCCSliderIn_volume;
    vmCachedCCSliderIn_volume = document.querySelector(".sys.controlCenter .grid-cc.main .item.slider.sound .sliderIN");
    if (vmCachedCCSliderIn_volume) {
        vmCachedCCSliderIn_volume.style.transition =
            vmHeightTransitionMode_volume === "none" ? "none" : "height 0.1s ease";
    }
    return vmCachedCCSliderIn_volume;
}

function vmGetCCSlider_volume() {
    if (vmCachedCCSlider_volume && vmCachedCCSlider_volume.isConnected) return vmCachedCCSlider_volume;
    vmCachedCCSlider_volume = document.querySelector(".sys.controlCenter .grid-cc.main .item.slider.sound");
    if (vmCachedCCSlider_volume && !vmBaseTransitionCC_volume) {
        vmBaseTransitionCC_volume = getComputedStyle(vmCachedCCSlider_volume).transition;
    }
    return vmCachedCCSlider_volume;
}

function vmIsControlCenterOpen_volume() {
    return !!controlCenterRef_volume.classList.contains("open");
}

function vmResolveActiveSlider_volume() {
    vmActiveSlider_volume = volumeMain_volume;
    if (vmIsControlCenterOpen_volume()) {
        const ccSlider = vmGetCCSlider_volume();
        if (ccSlider) {
            vmActiveSlider_volume = ccSlider;
        }
    }
    vmActiveSliderHeight_volume = vmActiveSlider_volume ? vmActiveSlider_volume.getBoundingClientRect().height || 1 : 1;
    return vmActiveSlider_volume;
}

function vmOnDocumentPointerDown_volume(e) {
    if (!volumeCTN_volume || !volumeCTN_volume.classList.contains("open")) return;

    const t = e.target;
    if (t === volumeUpBtn_volume || t === volumeDownBtn_volume) return;
    if (volumeCTN_volume.contains(t)) return;
    vmCloseVolumePanel_volume();
}

function vmSyncSliders_volume(value) {
    if (volumeMainIn_volume && value !== vmLastHeightPanel_volume) {
        volumeMainIn_volume.style.height = `${value}%`;
        vmLastHeightPanel_volume = value;
    }
    const ccSliderIn = vmGetCCSliderIn_volume();
    if (ccSliderIn) {
        if (value !== vmLastHeightCC_volume) {
            ccSliderIn.style.height = `${value}%`;
            vmLastHeightCC_volume = value;
        }
    }
}

function vmRefreshCCSlider_volume() {
    vmCachedCCSliderIn_volume = null;
    vmCachedCCSlider_volume = null;
    vmBaseTransitionCC_volume = "";
    vmLastHeightCC_volume = -1;
    vmResolveActiveSlider_volume();
    vmSyncSliders_volume(vmGetValue_volume());
}

function vmSetHeightTransitionForDrag_volume(isDragging) {
    const mode = isDragging ? "none" : "ease";
    if (mode === vmHeightTransitionMode_volume) return;
    vmHeightTransitionMode_volume = mode;

    const ccSliderIn = vmGetCCSliderIn_volume();
    if (isDragging) {
        if (volumeMainIn_volume) volumeMainIn_volume.style.transition = "none";
        if (ccSliderIn) ccSliderIn.style.transition = "none";
        return;
    }
    if (volumeMainIn_volume) volumeMainIn_volume.style.transition = "height 0.1s ease";
    if (ccSliderIn) ccSliderIn.style.transition = "height 0.1s ease";
}

function vmDampOvershoot_volume(px, maxPx) {
    if (px <= maxPx) return px;
    return maxPx + (px - maxPx) * vmOvershootMax_volume;
}

function vmClearAutoCloseTimer_volume() {
    if (vmAutoCloseTimer_volume) clearTimeout(vmAutoCloseTimer_volume);
    vmAutoCloseTimer_volume = 0;
}

function vmClearCloseFallbackTimer_volume() {
    if (vmCloseFallbackTimer_volume) clearTimeout(vmCloseFallbackTimer_volume);
    vmCloseFallbackTimer_volume = 0;
}

function vmRemoveSmallNoAnim_volume() {
    if (!volumeCTN_volume || !volumeMain_volume) return;
    if (!volumeCTN_volume.classList.contains("small")) return;

    const prevTransition = volumeMain_volume.style.transition;
    volumeMain_volume.style.transition = "none";
    volumeCTN_volume.classList.remove("small");
    volumeMain_volume.style.transition = prevTransition;
}

function vmCloseVolumePanel_volume() {
    if (!volumeCTN_volume || !volumeCTN_volume.classList.contains("open")) return;
    vmClearAutoCloseTimer_volume();
    volumeCTN_volume.classList.remove("open");

    const onEnd = (ev) => {
        if (ev.target !== volumeCTN_volume) return;
        volumeCTN_volume.removeEventListener("transitionend", onEnd);
        vmClearCloseFallbackTimer_volume();
        if (volumeCTN_volume.classList.contains("open")) return;
        vmRemoveSmallNoAnim_volume();
        vmDetachRuntimeListeners_volume();
    };

    volumeCTN_volume.addEventListener("transitionend", onEnd);
    vmClearCloseFallbackTimer_volume();
    vmCloseFallbackTimer_volume = setTimeout(() => {
        volumeCTN_volume.removeEventListener("transitionend", onEnd);
        if (volumeCTN_volume.classList.contains("open")) return;
        vmRemoveSmallNoAnim_volume();
        vmDetachRuntimeListeners_volume();
    }, 900);
}

function vmScheduleAutoClose_volume() {
    vmClearAutoCloseTimer_volume();
    vmAutoCloseTimer_volume = setTimeout(vmCloseVolumePanel_volume, 4500);
}

function vmPingActivity_volume() {
    if (!volumeCTN_volume || !volumeCTN_volume.classList.contains("open")) return;
    vmScheduleAutoClose_volume();
}

function vmAttachRuntimeListeners_volume() {
    if (vmRuntimeListenersOn_volume) return;

    document.addEventListener("pointerup", vmOnButtonUp_volume);
    document.addEventListener("pointercancel", vmOnButtonUp_volume);
    document.addEventListener("pointerdown", vmOnDocumentPointerDown_volume);
    document.addEventListener("pointermove", vmOnVolumePointerMove_volume);
    document.addEventListener("pointerup", vmOnVolumePointerUp_volume);
    document.addEventListener("pointercancel", vmOnVolumePointerUp_volume);
    vmRuntimeListenersOn_volume = true;
}

function vmDetachRuntimeListeners_volume() {
    if (!vmRuntimeListenersOn_volume) return;

    document.removeEventListener("pointerup", vmOnButtonUp_volume);
    document.removeEventListener("pointercancel", vmOnButtonUp_volume);
    document.removeEventListener("pointerdown", vmOnDocumentPointerDown_volume);
    document.removeEventListener("pointermove", vmOnVolumePointerMove_volume);
    document.removeEventListener("pointerup", vmOnVolumePointerUp_volume);
    document.removeEventListener("pointercancel", vmOnVolumePointerUp_volume);
    vmRuntimeListenersOn_volume = false;
}

function vmSetScaleTransition_volume(durationSec, withOriginDelay) {
    const target = vmActiveSlider_volume || vmResolveActiveSlider_volume();
    if (!target) return;
    const base =
        target === volumeMain_volume
            ? vmBaseTransition_volume
            : vmBaseTransitionCC_volume || getComputedStyle(target).transition;
    const originPart = withOriginDelay ? `, transform-origin 0s ${durationSec}s` : ", transform-origin 0s";
    target.style.transition = `${base}, scale ${durationSec}s cubic-bezier(.57,1.4,.45,1)${originPart}`;
}

function vmApplyScale_volume(raw, recoverWhenInside, dtSec) {
    const target = vmActiveSlider_volume || vmResolveActiveSlider_volume();
    if (!target) return;
    const h = vmActiveSliderHeight_volume || 1;
    const maxOvershootPx = h * vmOvershootMax_volume;

    if (raw > 100) {
        const overshootPx = ((raw - 100) / 100) * h;
        const damped = vmDampOvershoot_volume(overshootPx, maxOvershootPx);
        const extra = Math.min(vmOvershootMax_volume, damped / h);
        vmSetScaleTransition_volume(0.3, false);
        target.style.transformOrigin = "center 180%";
        const extra2 =
            volumeCTN_volume.classList.contains("small") && !!controlCenter.classList.contains("open")
                ? extra * 10
                : extra;
        target.style.scale = `${1 - extra2} ${1 + extra}`;
        vmWasOvershoot_volume = true;
        vmOvershootTime_volume = Math.min(vmOvershootMax_volume, vmOvershootTime_volume + Math.max(0, dtSec || 0));
        return;
    }

    if (raw < 0) {
        const overshootPx = ((0 - raw) / 100) * h;
        const damped = vmDampOvershoot_volume(overshootPx, maxOvershootPx);
        const extra = Math.min(vmOvershootMax_volume, damped / h);
        vmSetScaleTransition_volume(0.3, false);
        target.style.transformOrigin = "center -80%";
        const extra2 =
            volumeCTN_volume.classList.contains("small") && !!controlCenter.classList.contains("open")
                ? extra * 10
                : extra;
        target.style.scale = `${1 - extra2} ${1 + extra}`;
        vmWasOvershoot_volume = true;
        vmOvershootTime_volume = Math.min(vmOvershootMax_volume, vmOvershootTime_volume + Math.max(0, dtSec || 0));
        return;
    }

    if (recoverWhenInside && vmWasOvershoot_volume) {
        const recover =
            vmOvershootMax_volume <= 0
                ? 0.3
                : 0.3 + (Math.min(vmOvershootMax_volume, vmOvershootTime_volume) / vmOvershootMax_volume) * 0.3;
        vmSetScaleTransition_volume(recover, true);
        target.style.transformOrigin = "";
    }
    target.style.scale = "";
    vmOvershootTime_volume = 0;
    vmWasOvershoot_volume = false;
}

function vmApplyRaw_volume(raw, recoverWhenInside, dtSec) {
    vmRawValue_volume = raw;
    const clamped = Math.max(0, Math.min(100, raw));
    vmFallbackValue_volume = clamped;
    if (typeof value_volume !== "undefined") value_volume = clamped;
    vmSyncSliders_volume(clamped);
    vmApplyScale_volume(raw, recoverWhenInside, dtSec);
}

function vmEnsureOpen_volume() {
    if (!volumeCTN_volume) return;
    vmClearCloseFallbackTimer_volume();
    if (!volumeCTN_volume.classList.contains("open")) {
        volumeCTN_volume.classList.add("open");
        vmPressCountSinceOpen_volume = 1;
        return;
    }
    vmPressCountSinceOpen_volume += 1;
}

function vmStepButton_volume(dir) {
    const step = 2;
    vmApplyRaw_volume(vmRawValue_volume + step * dir, false, 0);
}

function vmClearHoldTimers_volume() {
    if (vmHoldTimeout_volume) clearTimeout(vmHoldTimeout_volume);
    if (vmHoldInterval_volume) clearInterval(vmHoldInterval_volume);
    vmHoldTimeout_volume = 0;
    vmHoldInterval_volume = 0;
}

function vmOnButtonDown_volume(dir, e) {
    if (!volumeCTN_volume || !volumeMain_volume || !isOn) return;
    vmResolveActiveSlider_volume();
    const ccMode = vmIsControlCenterOpen_volume();

    vmHoldDir_volume = dir;
    vmHoldDown_volume = true;
    vmAttachRuntimeListeners_volume();
    vmClearAutoCloseTimer_volume();
    if (!ccMode) {
        vmEnsureOpen_volume();
    }

    vmSetScaleTransition_volume(0, false);
    vmSetHeightTransitionForDrag_volume(false);
    vmRawValue_volume = vmGetValue_volume();

    // Respond immediately on press to avoid perceived input lag.
    if (!ccMode && !volumeCTN_volume.classList.contains("small") && vmPressCountSinceOpen_volume >= 2) {
        volumeCTN_volume.classList.add("small");
    }
    vmStepButton_volume(dir);

    vmClearHoldTimers_volume();
    vmHoldTimeout_volume = setTimeout(() => {
        if (!vmHoldDown_volume) return;
        if (!ccMode && !volumeCTN_volume.classList.contains("small")) volumeCTN_volume.classList.add("small");
        vmHoldInterval_volume = setInterval(() => {
            if (!vmHoldDown_volume) return;
            vmStepButton_volume(vmHoldDir_volume);
        }, 40);
    }, 200);

    volumeCTN_volume.classList.add("click");

    if (e) e.preventDefault();
}

function vmOnButtonUp_volume() {
    vmHoldDown_volume = false;
    vmClearHoldTimers_volume();
    if (!volumeMain_volume) return;
    vmSetHeightTransitionForDrag_volume(false);
    vmSetScaleTransition_volume(0.3, true);
    vmApplyScale_volume(vmGetValue_volume(), true, 0);
    vmRawValue_volume = vmGetValue_volume();
    if (!vmIsControlCenterOpen_volume()) vmPingActivity_volume();
    volumeCTN_volume.classList.remove("click");
    vmActiveSlider_volume = null;
}

function vmStartInertia_volume() {
    if (!volumeMain_volume) return;
    if (!vmActiveSlider_volume) vmResolveActiveSlider_volume();
    vmInertiaActive_volume = true;
    const friction = 0.9;
    const minVelocity = 0.004;
    let last = performance.now();

    const step = (t) => {
        if (!vmInertiaActive_volume) return;
        const dt = Math.max(1, t - last);
        last = t;

        vmRawValue_volume += vmVelocity_volume * dt;
        const inOvershoot = vmRawValue_volume > 100 || vmRawValue_volume < 0;
        const f = inOvershoot ? (friction * friction) / 2 : friction;
        vmVelocity_volume *= Math.pow(f, dt / 16);

        vmApplyRaw_volume(vmRawValue_volume, true, dt / 1000);

        if (Math.abs(vmVelocity_volume) < minVelocity) {
            vmInertiaActive_volume = false;
            vmRawValue_volume = vmGetValue_volume();
            vmApplyRaw_volume(vmRawValue_volume, true, 0);
            vmSetHeightTransitionForDrag_volume(false);
            vmActiveSlider_volume = null;
            return;
        }
        vmInertiaRAF_volume = requestAnimationFrame(step);
    };

    vmInertiaRAF_volume = requestAnimationFrame(step);
}

function vmOnVolumePointerDown_volume(e) {
    if (!volumeMain_volume) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    vmResolveActiveSlider_volume();

    vmAttachRuntimeListeners_volume();
    vmEnsureOpen_volume();
    vmClearAutoCloseTimer_volume();

    volumeCTN_volume.classList.remove("small");

    vmDragActive_volume = true;
    vmInertiaActive_volume = false;
    if (vmInertiaRAF_volume) cancelAnimationFrame(vmInertiaRAF_volume);

    vmDragStartY_volume = e.clientY;
    vmDragStartRaw_volume = vmRawValue_volume = vmGetValue_volume();
    vmOvershootTime_volume = 0;
    vmLastY_volume = e.clientY;
    vmLastT_volume = e.timeStamp || performance.now();
    vmVelocity_volume = 0;

    vmSetScaleTransition_volume(0, false);
    vmSetHeightTransitionForDrag_volume(true);
    volumeMain_volume.setPointerCapture(e.pointerId);
    e.preventDefault();

    volumeMain_volume.classList.add("active");
}

function vmOnVolumePointerMove_volume(e) {
    if (!vmDragActive_volume || !volumeMain_volume) return;

    const h = vmActiveSliderHeight_volume || 1;
    const delta = vmDragStartY_volume - e.clientY;
    const raw = vmDragStartRaw_volume + (delta / h) * 100;
    const now = e.timeStamp || performance.now();
    const dt = Math.max(1, now - vmLastT_volume);
    vmApplyRaw_volume(raw, false, dt / 1000);
    const dy = vmLastY_volume - e.clientY;
    vmVelocity_volume = ((dy / h) * 100) / dt;
    vmLastY_volume = e.clientY;
    vmLastT_volume = now;
    e.preventDefault();
}

function vmOnVolumePointerUp_volume(e) {
    if (!vmDragActive_volume || !volumeMain_volume) return;
    vmDragActive_volume = false;
    // Keep height transition disabled during inertia; re-enable when inertia ends.
    vmSetHeightTransitionForDrag_volume(true);
    vmSetScaleTransition_volume(0.3, true);
    vmStartInertia_volume();
    vmPingActivity_volume();
    e.preventDefault();

    volumeMain_volume.classList.remove("active");
}

function vmInit_volume() {
    if (!volumeCTN_volume || !volumeMain_volume || !volumeMainIn_volume) return;
    vmBaseTransition_volume = getComputedStyle(volumeMain_volume).transition;
    volumeMainIn_volume.style.transition = "height 0.1s ease";
    vmHeightTransitionMode_volume = "ease";
    // Prevent browser touch-gesture arbitration delay on mobile drag.
    volumeMain_volume.style.touchAction = "none";
    vmApplyRaw_volume(vmGetValue_volume(), false, 0);
    if (volumeUpBtn_volume) volumeUpBtn_volume.addEventListener("pointerdown", (e) => vmOnButtonDown_volume(2.5, e));
    if (volumeDownBtn_volume)
        volumeDownBtn_volume.addEventListener("pointerdown", (e) => vmOnButtonDown_volume(-2.5, e));
    volumeMain_volume.addEventListener("pointerdown", vmOnVolumePointerDown_volume);
}

vmInit_volume();

// expose for Control Center refresh
window.vmRefreshCCSlider_volume = vmRefreshCCSlider_volume;
