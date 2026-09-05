function splitText(selector) {
    const el = document.querySelector(selector);
    const text = el.textContent;
    el.textContent = "";

    const chars = [];

    [...text].forEach((char) => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.display = "inline-block";
        span.style.clipPath = "inset(0)";
        el.appendChild(span);
        chars.push(span);
    });

    return chars;
}

const chars = splitText(".webName");

document
.querySelector(".webName")
.animate([{transform: "scale(1.5) translateY(20px)"}, {transform: "scale(1) translateY(0px)"}], {
    duration: 800,
    easing: "ease",
    fill: "forwards",
}).onfinish = () => {
    chars.forEach((char, i) => {
        char.animate([{opacity: 1}, {opacity: 0.5}, {opacity: 1}], {
            duration: 900,
            delay: i * 50,
            easing: "ease-in-out",
            iterations: Infinity,
        });
    });
};

const logo = document.querySelector(".loadingLogo");
setTimeout(() => {
    document.querySelector(".version").animate(
        [
            {transform: "translateY(-10px) scale(0.4)", opacity: 0},
            {transform: "translateY(0) scale(1)", opacity: 1},
        ],
        {
            duration: 600,
            easing: "ease",
            fill: "forwards",
        }
    );

    logo.logoAnim = logo.animate(
        [
            {transform: "translateY(-10px) scale(0.4)", opacity: 0},
            {transform: "translateY(0) scale(1)", opacity: 1},
        ],
        {
            duration: 600,
            easing: "ease-out",
            fill: "forwards",
        }
    );

    logo.logoAnim.finished.then(() => {
        window.dispatchEvent(new CustomEvent("loadingLogo:done"));
    });
}, 500);
