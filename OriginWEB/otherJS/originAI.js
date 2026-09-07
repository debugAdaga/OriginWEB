const ORIGIN_AI_ENDPOINT = "https://originaiworker.bian27374.workers.dev";

const HOLD_THRESHOLD_MS = 1000;

let originAIHoldTimer = null;
let originAIHoldTriggered = false;
let originAIActive = false;

function initOriginAIPowerHold() {
    const powerBtn = document.getElementById("powerBtn");
    if (!powerBtn) return;

    powerBtn.addEventListener("pointerdown", onOriginAIPowerDown);
    powerBtn.addEventListener("pointerup", onOriginAIPowerUp);
    powerBtn.addEventListener("pointerleave", onOriginAIPowerCancel);
    powerBtn.addEventListener("click", suppressClickIfHoldTriggered, true);
}

function onOriginAIPowerDown() {
    originAIHoldTriggered = false;
    originAIHoldTimer = setTimeout(() => {
        originAIHoldTriggered = true;
        showOriginAI();
    }, HOLD_THRESHOLD_MS);
}

function onOriginAIPowerUp() {
    clearTimeout(originAIHoldTimer);
}

function onOriginAIPowerCancel() {
    clearTimeout(originAIHoldTimer);
}

function suppressClickIfHoldTriggered(e) {
    if (originAIHoldTriggered) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }
}

function showOriginAI() {
    if (originAIActive) return;
    originAIActive = true;

    const aiEl = document.querySelector(".ai");
    const backdrop = document.getElementById("originAIBackdrop");
    if (aiEl) aiEl.classList.add("show_alert");
    if (backdrop) backdrop.classList.add("show_alert");

    const input = document.getElementById("originAIInput");
    if (input) {
        input.value = "";
        input.focus();
    }

    const responseEl = document.getElementById("originAIResponse");
    if (responseEl) responseEl.textContent = "";
}

function hideOriginAI() {
    if (!originAIActive) return;
    originAIActive = false;

    const aiEl = document.querySelector(".ai");
    const backdrop = document.getElementById("originAIBackdrop");
    if (aiEl) aiEl.classList.remove("show_alert");
    if (backdrop) backdrop.classList.remove("show_alert");
}

function initOriginAIInput() {
    const form = document.getElementById("originAIForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("originAIInput");
        const userText = input.value.trim();
        if (!userText) return;

        sendToOriginAI(userText);
    });

    const backdrop = document.getElementById("originAIBackdrop");
    const panel = document.getElementById("originAIPanel");
    if (backdrop && panel) {
        backdrop.addEventListener("click", (e) => {
            if (!panel.contains(e.target)) {
                hideOriginAI();
            }
        });
    }
}

async function sendToOriginAI(userText) {
    const responseEl = document.getElementById("originAIResponse");
    if (responseEl) responseEl.textContent = "Thinking...";

    try {
        const res = await fetch(ORIGIN_AI_ENDPOINT, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({text: userText}),
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        if (responseEl) responseEl.textContent = data.text || "";

        if (data.audio) {
            const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
            audio.play();
        }
    } catch (err) {
        if (responseEl) responseEl.textContent = "Something went wrong. Please try again.";
    }
}

initOriginAIPowerHold();
initOriginAIInput();
