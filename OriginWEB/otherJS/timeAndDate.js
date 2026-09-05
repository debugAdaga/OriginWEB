function updateTime(el) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    el.textContent = `${hours}:${minutes}`;
}
function updateTimeQueryAll(el) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    el.forEach((element) => {
        element.textContent = `${hours}:${minutes}`;
    });
}

const AllClockMain = document.querySelectorAll(".clockMain");
updateTimeQueryAll(AllClockMain);
setInterval(() => {
    updateTimeQueryAll(AllClockMain);
}, 10000);

const now = new Date();
const options = {
    weekday: "long", // "long" | "short" | "narrow"
    month: "short", // "numeric" | "2-digit" | "long" | "short" | "narrow"
    day: "numeric", // "numeric" | "2-digit"
    //year: "numeric", // "numeric" | "2-digit"
};

const formatted = now.toLocaleDateString("en-US", options);

document.querySelectorAll(".dateText").forEach((element) => {
    element.textContent = formatted;
});
