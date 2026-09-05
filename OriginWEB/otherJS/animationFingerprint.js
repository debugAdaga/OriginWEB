//===============================
// Animation 1: FINGERPRINT 0 → 59
//===============================
const animationFP_time = {
    coloros_1: 25,
    coloros_2: 25,
    begonia: 13,
    duckweed: 13,
    fountain: 35,
    fusion: 30,
    gala: 30,
    phantom: 30,
    round: 30,
    smog: 30,
};
let ani_fingerprint_type = localStorage.getItem("FpAnimation1") || "begonia"; // valuea
let ani_fadein_fingerprint_type = localStorage.getItem("FpAnimation2") || "enter11/normal"; //valueb //"enter11/normal" "enter11/normal_reverse" "enter12/normal" "enter12/normal_reverse" "coloros_1" "coloros_2"
let ani_fadeout_fingerprint_type = localStorage.getItem("FpAnimation2") || "enter11/normal"; //valueb

{
    const activeEl = document.querySelector(
        `[data-valuea="${ani_fingerprint_type}"][data-valueb="${ani_fadein_fingerprint_type}"]`
    );
    activeEl.classList.add("active");

    const textEl = document.querySelector(`[name="fingerprintAnimation"] .currentValue`);
    textEl.textContent = activeEl.textContent.trim();
}

const fingerBtnAnim = document.getElementById("ani_fingerprint");
const animationFP_total = {
    coloros_1: 60,
    coloros_2: 60,
    begonia: 58,
    duckweed: 58,
    fountain: 17,
    fusion: 30,
    gala: 30,
    phantom: 30,
    round: 30,
    smog: 30,
};

// preload tất cả ảnh vào RAM trước khi chạy animation
let KGD_CACHE = {
    fingerprint: [],
    fadein: [],
    fadeout: [],
};

// preload
async function loadFpAnim(onSuccess = function () {}) {
    async function preload(path, prefix, last, cacheArray) {
        for (let i = 0; i <= last; i++) {
            const img = new Image();
            img.src = `${path}/${prefix}_${i}.png`;
            cacheArray.push(img);
        }
    }

    await preload(
        `/OriginWEB/originData/animationFingerprint/${ani_fingerprint_type}`,
        "kgd_fingerprint_element",
        60,
        KGD_CACHE.fingerprint
    );
    await preload(
        `/OriginWEB/originData/animationFingerprint/${ani_fadein_fingerprint_type}`,
        "kgd_osfingerprint_fadein",
        24,
        KGD_CACHE.fadein
    );
    await preload(
        `/OriginWEB/originData/animationFingerprint/${ani_fadeout_fingerprint_type}`,
        "kgd_osfingerprint_fadeout",
        23,
        KGD_CACHE.fadeout
    );
    onSuccess();
}
loadFpAnim();
async function unloadAllPreload() {
    KGD_CACHE.fingerprint.length = 0;
    KGD_CACHE.fadein.length = 0;
    KGD_CACHE.fadeout.length = 0;
}

function runFrameAnimation({getImage, applyFrame, lastFrame, frameDuration, onFinish}) {
    let frame = 0;
    let rafId = 0;
    let stopped = false;
    let nextTime = performance.now() + frameDuration;

    const img0 = getImage(0);
    if (img0 && img0.complete) applyFrame(img0);
    function loop(now) {
        if (stopped) return;
        if (now >= nextTime) {
            frame++;
            if (frame > lastFrame) {
                stopped = true;
                onFinish && onFinish();
                return;
            }
            const img = getImage(frame);
            if (img && img.complete) applyFrame(img);
            nextTime += frameDuration;
        }
        rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    return () => {
        stopped = true;
        cancelAnimationFrame(rafId);
    };
}

function run_fingerprint_animation() {
    const last = animationFP_total[ani_fingerprint_type];
    const cache = KGD_CACHE.fingerprint;

    if (fingerBtnAnim._raf) fingerBtnAnim._raf();

    fingerBtnAnim._raf = runFrameAnimation({
        lastFrame: last,
        frameDuration: animationFP_time[ani_fingerprint_type],
        getImage: (frame) => cache[frame],
        applyFrame: (img) => {
            fingerBtnAnim.style.backgroundImage = `url("${img.src}")`;
        },
    });
}
function run_fadein_animation() {
    const el = document.getElementById("fingerBtn2");
    const el2 = document.getElementById("fingerBtn");
    const cache = KGD_CACHE.fadein;

    if (el._raf) el._raf();

    el._raf = runFrameAnimation({
        lastFrame: 24,
        frameDuration: 30,
        getImage: (frame) => cache[frame],
        applyFrame: (img) => {
            const url = `url("${img.src}")`;
            el.style.backgroundImage = url;
            el2.style.backgroundImage = url;
        },
    });
}
function run_fadeout_animation() {
    const el = document.getElementById("fingerBtn2");
    const el2 = document.getElementById("fingerBtn");
    const cache = KGD_CACHE.fadeout;

    if (el._raf) el._raf();

    el._raf = runFrameAnimation({
        lastFrame: 23,
        frameDuration: 30,
        getImage: (frame) => cache[frame],
        applyFrame: (img) => {
            const url = `url("${img.src}")`;
            el.style.backgroundImage = url;
            el2.style.backgroundImage = url;
        },
    });
}
const fingerBtnAnimPre = document.getElementById("ani_fingerprint2");
function run_fingerprint_animation_pre(onSuccess = function () {}) {
    const last = animationFP_total[ani_fingerprint_type];
    const cache = KGD_CACHE.fingerprint;

    if (fingerBtnAnimPre._raf) fingerBtnAnimPre._raf();

    fingerBtnAnimPre._raf = runFrameAnimation({
        lastFrame: last,
        frameDuration: animationFP_time[ani_fingerprint_type],
        getImage: (frame) => cache[frame],
        applyFrame: (img) => {
            fingerBtnAnimPre.style.backgroundImage = `url("${img.src}")`;
        },
        onFinish: () => {
            setTimeout(() => onSuccess(onSuccess), 200);
        },
    });
}
