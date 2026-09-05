const videoCanvasMap = new Map();

let video = null;
let canvas = null;
let ctx = null;
let heightPhone = getComputedStyle(document.documentElement).getPropertyValue("--bg-heightPhone");
let widthPhone = getComputedStyle(document.documentElement).getPropertyValue("--bg-widthPhone");
function initVideoCanvas(containerId, width = widthPhone, height = heightPhone) {
    //return null;
    if (videoCanvasMap.has(containerId)) {
        return videoCanvasMap.get(containerId);
    }

    const container = document.getElementById(containerId);
    if (!container) return null;

    const dpr = window.devicePixelRatio || 1;

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.style.zIndex = "2";
    canvas.dataset.videoCanvas = "1";

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    container.appendChild(canvas);

    const state = {
        container,
        video,
        canvas,
        ctx,
        rafId: null,
        width,
        height,
        dpr,
    };

    video.onended = () => {
        if (state.rafId) cancelAnimationFrame(state.rafId);
        drawFrame(state);
    };

    videoCanvasMap.set(containerId, state);
    return state;
}

function playVideoCanvas(containerId, src) {
    const state = initVideoCanvas(containerId);
    if (!state) return;

    if (state.src && state.src !== src) {
        URL.revokeObjectURL(state.src);
    }

    state.src = src;
    state.ready = false;

    state.video.src = src;

    state.video.onloadeddata = () => {
        state.ready = true;
        state.video.currentTime = 0;
        state.video.play();
        drawLoop(state);
    };
}

function drawLoop(state) {
    drawFrame(state);
    state.rafId = requestAnimationFrame(() => drawLoop(state));
}

function drawFrame(state) {
    if (!state.ready) return;

    const {video, ctx, width, height} = state;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const vr = vw / vh;
    const cr = width / height;

    let sx, sy, sw, sh;

    if (vr > cr) {
        sh = vh;
        sw = vh * cr;
        sx = (vw - sw) / 2;
        sy = 0;
    } else {
        sw = vw;
        sh = vw / cr;
        sx = 0;
        sy = (vh - sh) / 2;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, width, height);
}
function replayVideoCanvas(containerId) {
    const state = videoCanvasMap.get(containerId);
    if (!state || !state.video) return;

    console.log("Replay video:", containerId);

    if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
    }

    const video = state.video;

    state.ready = false;

    if (video.readyState < 2) {
        video.onloadeddata = () => {
            state.ready = true;
            video.currentTime = 0;
            video.play();
            drawLoop(state);
        };
        return;
    }

    video.currentTime = 0;

    const playPromise = video.play();
    if (playPromise) {
        playPromise
        .then(() => {
            state.ready = true;
            drawLoop(state);
        })
        .catch(() => {});
    } else {
        state.ready = true;
        drawLoop(state);
    }
}

function pauseVideoCanvas(containerId) {
    const state = videoCanvasMap.get(containerId);
    if (!state) return;

    state.video.pause();
    cancelAnimationFrame(state.rafId);
    drawFrame(state);
}

function resumeVideoCanvas(containerId) {
    const state = videoCanvasMap.get(containerId);
    if (!state) return;

    state.video.play();
    drawLoop(state);
}

function stopVideoCanvas(containerId) {
    const state = videoCanvasMap.get(containerId);
    if (!state) return;

    state.video.pause();
    state.video.currentTime = state.video.duration;
    cancelAnimationFrame(state.rafId);
    drawFrame(state);
}
function removeVideoCanvas(containerId) {
    const state = videoCanvasMap.get(containerId);
    if (!state) return;

    console.log("Destroy video canvas:", containerId);

    // stop RAF
    if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
    }

    // remove tilt
    if (state._tiltHandler) {
        window.removeEventListener("deviceorientation", state._tiltHandler);
        state._tiltHandler = null;
    }

    // remove resize
    if (state._resizeHandler) {
        window.removeEventListener("resize", state._resizeHandler);
        state._resizeHandler = null;
    }

    // stop video
    if (state.video) {
        state.video.onended = null;
        state.video.pause();
        state.video.src = "";
        state.video.load();
    }

    // revoke blob
    if (state.src) {
        URL.revokeObjectURL(state.src);
        state.src = null;
    }

    // remove ONLY canvas
    if (state.canvas && state.canvas.isConnected) {
        state.canvas.remove();
    }

    videoCanvasMap.delete(containerId);
}
