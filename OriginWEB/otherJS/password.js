//========================
// PASSWORD SCREEN HANDLER
//========================
let password = "";
let newPassword = "";
let correctPassword = localStorage.getItem("password") || "";

if (correctPassword != "") {
    const el = document.getElementById("toggle_lockScreenPassword");
    el.classList.add("active");
    document.querySelectorAll(".settingsItem[notWorkBy='toggle_lockScreenPassword']").forEach((el) => {
        el.classList.remove("notWork");
    });
}

const passwordScreen = document.querySelector(".passwordScreen");
const displayPasswordScreen = document.getElementById("displayPasswordScreen");

displayPasswordScreen.innerHTML = "";

let dots_pw = Array.from(document.querySelectorAll("#displayPasswordScreen .dot"));

function updateNumberOfDots(n) {
    displayPasswordScreen.innerHTML = "";
    for (let i = 0; i < n; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        displayPasswordScreen.appendChild(dot);
    }

    dots_pw = Array.from(document.querySelectorAll("#displayPasswordScreen .dot"));
}
updateNumberOfDots(correctPassword.length);

const keypad_pw = document.getElementById("keypad");
const buttons_pw = Array.from(document.querySelectorAll("#passwordScreen button"));
const textScreen_pw = document.getElementById("textScreen_pw");

const fingerBtn2 = document.getElementById("fingerBtn2");

// list hoạt ảnh
const listAnimPasswordBtn = {
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "clear",
    11: "0",
    12: "enter",
};

//========================
// ANIMATION MỞ
//========================
let isOpened_pw = false;
function animateOpen_pw() {
    isOpened_pw = true;
    passwordScreen.animate([{opacity: 0}, {opacity: 1}], {
        duration: 400,
        easing: "cubic-bezier(.2, .8, .2, 1)",
        fill: "forwards",
    });
    keypad_pw.style.pointerEvents = "all";

    buttons_pw.forEach((btn) => btn.getAnimations().forEach((a) => a.cancel()));

    buttons_pw.forEach((btn) => {
        const key = btn.dataset.key;
        let animIndex_pw = null;

        for (let k in listAnimPasswordBtn) {
            if (listAnimPasswordBtn[k] === key) {
                animIndex_pw = parseInt(k);
                break;
            }
        }

        if (!animIndex_pw) animIndex_pw = 99;
        btn.style.transform = "scale(0.5) translateY(50px)";
        btn.style.opacity = "0";
        btn.animate(
            [
                {transform: "scale(0.5) translateY(50px)", opacity: 0},
                {transform: "scale(1)", opacity: 1},
            ],
            {
                duration: 400,
                easing: "cubic-bezier(.2, .8, .2, 1)",
                delay: animIndex_pw * 10,
                fill: "forwards",
            }
        );
    });
}
function animateClose_pw() {
    isOpened_pw = false;
    return new Promise((resolve) => {
        //anim for screen
        passwordScreen.animate([{opacity: 1}, {opacity: 0}], {
            duration: 400,
            easing: "cubic-bezier(.2, .8, .2, 1)",
            fill: "forwards",
        });
        keypad_pw.style.pointerEvents = "none";

        // animation for button
        let finished_pw = 0;

        buttons_pw.forEach((btn) => btn.getAnimations().forEach((a) => a.cancel()));

        buttons_pw.forEach((btn) => {
            const key = btn.dataset.key; // DÙNG DATA-KEY
            let animIndex_pw = null;

            for (let k in listAnimPasswordBtn) {
                if (listAnimPasswordBtn[k] === key) {
                    animIndex_pw = parseInt(k);
                    break;
                }
            }

            if (!animIndex_pw) animIndex_pw = 99;

            const anim = btn.animate(
                [
                    {transform: "scale(1)", opacity: 1},
                    {transform: "scale(0.5) translateY(-50px)", opacity: 0},
                ],
                {
                    duration: 1000,
                    easing: "cubic-bezier(.2, .8, .2, 1)",
                    //delay: animIndex_pw * 10,
                    fill: "forwards",
                }
            );

            anim.onfinish = () => {
                finished_pw++;
                if (finished_pw === buttons_pw.length) resolve();
            };
        });
    });
}
async function hidePasswordScreen() {
    if (!cr_PW_4pinBtn.classList.contains("displayN")) {
        cr_PW_4pinBtn.classList.add("displayN");
        cr_PW_4pinBtn.removeEventListener("click", cr_PW_4pinBtn.handler);
        delete cr_PW_4pinBtn.handler;
    }
    if (!passwordScreen.classList.contains("open") || !isOpened_pw) return;
    await animateClose_pw();
    passwordScreen.classList.remove("open");
}

//========================
// RESET DOTS
//========================
// reset password và dots
function resetPasswordDots_pw() {
    password = "";
    dots_pw.forEach((d) => d.classList.remove("active"));
}
function removeHorizontalShakingPW() {
    displayPasswordScreen.classList.remove("horizontalShaking");
}

// update dots theo password
function updateDots_pw() {
    // thêm class active cho các dot tương ứng số ký tự đã nhập
    dots_pw.forEach((dot, index) => {
        if (index < password.length) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}

//========================
// XỬ LÝ NÚT BẤM
//========================
async function keypad_pw_handler(e, onSuccess) {
    const btn = e.target.closest("button");
    if (!btn) return;

    const key = btn.dataset.key;

    // CLEAR
    if (key === "clear") {
        if (password.length === 0) {
            // chưa nhập gì đóng màn hình
            await animateClose_pw();
            passwordScreen.classList.remove("open");
            return;
        } else {
            // xóa ký tự cuối
            password = password.slice(0, -1);
            updateDots_pw();
            return;
        }
    }

    // ENTER
    if (key === "enter") {
        if (password.length === 0) {
            // chưa nhập gì đóng màn hình
            await animateClose_pw();
            passwordScreen.classList.remove("open");
            return;
        }
        if (password === correctPassword) {
            await animateClose_pw();
            passwordScreen.classList.remove("open");
            if (typeof onSuccess === "function") onSuccess();
        } else {
            resetPasswordDots_pw();
            setTimeout(removeHorizontalShakingPW, 300);
            displayPasswordScreen.classList.add("horizontalShaking");
        }
        return;
    }

    // NUMBER
    if (/^\d$/.test(key)) {
        if (password.length < correctPassword.length) {
            password += key;
            updateDots_pw();
        }

        // đủ số tự check
        if (password.length === correctPassword.length) {
            if (password === correctPassword) {
                if (typeof onSuccess === "function") onSuccess();
                await animateClose_pw();
                passwordScreen.classList.remove("open");
            } else {
                setTimeout(resetPasswordDots_pw, 150);
                setTimeout(removeHorizontalShakingPW, 300);
                displayPasswordScreen.classList.add("horizontalShaking");
            }
        }
    }
    e.preventDefault();
}

function showPasswordScreen(onSuccess = function () {}, message = "Enter password to unlock", fingerBtnMode = "1") {
    if (!correctPassword) {
        onSuccess();
        return;
    }
    resetPasswordDots_pw();
    passwordScreen.classList.add("open");

    animateOpen_pw();

    keypad_pw.removeEventListener("pointerdown", keypad_pw.handler);
    delete keypad_pw.handler;
    fingerBtn2.removeEventListener("pointerdown", fingerBtn2.handler);
    delete fingerBtn2.handler;

    keypad_pw.handler = function (e) {
        keypad_pw_handler(e, onSuccess);
    };
    keypad_pw.addEventListener("pointerdown", keypad_pw.handler);

    textScreen_pw.textContent = message;

    {
        if (!fingerBtnMode) {
            fingerBtn2.style.opacity = "0";
            return;
        }
        fingerBtn2.style.opacity = "";
        fingerBtn2.handler = function (e) {
            hiddenLockScreen();
            run_fingerprint_animation();
            fingerBtnAnim.style.opacity = 1;
            e.preventDefault();
            onSuccess();
        };
        fingerBtn2.addEventListener("pointerdown", fingerBtn2.handler);
    }
}

async function keypad_pw_handler_create(e, n, onSuccess = function () {}) {
    const btn = e.target.closest("button");
    if (!btn) return;

    const key = btn.dataset.key;

    if (key === "clear") {
        if (password.length === 0) {
            // chưa nhập gì đóng màn hình
            await animateClose_pw();
            passwordScreen.classList.remove("open");
            return;
        } else {
            // xóa ký tự cuối
            password = password.slice(0, -1);
            updateDots_pw();
            return;
        }
    }

    if (key === "enter") {
        if (password.length === 0) {
            // chưa nhập gì đóng màn hình
            await animateClose_pw();
            passwordScreen.classList.remove("open");
            return;
        }
        if (password.length === n) {
            await animateClose_pw();
            passwordScreen.classList.remove("open");
        } else {
            resetPasswordDots_pw();
            setTimeout(removeHorizontalShakingPW, 300);
            displayPasswordScreen.classList.add("horizontalShaking");
        }
        return;
    }

    // NUMBER
    if (/^\d$/.test(key)) {
        if (password.length < n) {
            password += key;
            newPassword = password;
            updateDots_pw();
        }

        // đủ số tự check
        if (password.length === n) {
            textScreen_pw.textContent = "Confirm your password";
            keypad_pw.removeEventListener("pointerdown", keypad_pw.handler);
            delete keypad_pw.handler;
            keypad_pw.handler = function (e) {
                keypad_pw_handler_comfirm(e, newPassword, onSuccess);
            };
            password = "";
            updateDots_pw();
            keypad_pw.addEventListener("pointerdown", keypad_pw.handler);
        }
    }
    e.preventDefault();
}
async function keypad_pw_handler_comfirm(e, firstPW, onSuccess2 = function () {}) {
    const btn = e.target.closest("button");
    if (!btn) return;

    const key = btn.dataset.key;

    function onSuccess() {
        correctPassword = password;
        localStorage.setItem("password", password);
        document.getElementById("passwordIn4").textContent =
            "password: " + (correctPassword !== "" ? correctPassword : "not set");
        onSuccess2();
    }

    // CLEAR
    if (key === "clear") {
        if (password.length === 0) {
            // chưa nhập gì đóng màn hình
            await animateClose_pw();
            passwordScreen.classList.remove("open");
            return;
        } else {
            // xóa ký tự cuối
            password = password.slice(0, -1);
            updateDots_pw();
            return;
        }
    }

    if (key === "enter") {
        if (password.length === 0) {
            // chưa nhập gì đóng màn hình
            await animateClose_pw();
            passwordScreen.classList.remove("open");
            return;
        }
        if (password === firstPW) {
            await animateClose_pw();
            passwordScreen.classList.remove("open");
            onSuccess();
        } else {
            resetPasswordDots_pw();
            setTimeout(removeHorizontalShakingPW, 300);
            displayPasswordScreen.classList.add("horizontalShaking");
        }
        return;
    }

    if (/^\d$/.test(key)) {
        if (password.length < firstPW.length) {
            password += key;
            updateDots_pw();
        }

        // đủ số tự check
        if (password.length === firstPW.length) {
            if (password === firstPW) {
                onSuccess();
                await animateClose_pw();
                passwordScreen.classList.remove("open");
            } else {
                setTimeout(resetPasswordDots_pw, 150);
                setTimeout(removeHorizontalShakingPW, 300);
                displayPasswordScreen.classList.add("horizontalShaking");
            }
        }
    }
    e.preventDefault();
}
const cr_PW_4pinBtn = document.querySelector("#passwordScreen .bottomBtn");
function createPasswordScreen(passwordLength = 6, onSuccess = function () {}) {
    newPassword = "";

    if (passwordLength != 6) cr_PW_4pinBtn.textContent = `6 PIN`;
    else cr_PW_4pinBtn.textContent = `4 PIN`;
    cr_PW_4pinBtn.classList.remove("displayN");

    updateNumberOfDots(passwordLength);

    resetPasswordDots_pw();
    passwordScreen.classList.add("open");

    animateOpen_pw();

    fingerBtn2.removeEventListener("pointerdown", fingerBtn2.handler);
    delete fingerBtn2.handler;

    keypad_pw.removeEventListener("pointerdown", keypad_pw.handler);
    delete keypad_pw.handler;
    keypad_pw.handler = function (e) {
        keypad_pw_handler_create(e, passwordLength, onSuccess);
    };
    keypad_pw.addEventListener("pointerdown", keypad_pw.handler);

    textScreen_pw.textContent = "enter new password";
    fingerBtn2.style.opacity = "0";

    cr_PW_4pinBtn.removeEventListener("click", cr_PW_4pinBtn.handler);
    cr_PW_4pinBtn.handler = function () {
        if (passwordLength == 6) passwordLength = 4;
        else passwordLength = 6;
        if (passwordLength != 6) cr_PW_4pinBtn.textContent = `6 PIN`;
        else cr_PW_4pinBtn.textContent = `4 PIN`;

        updateNumberOfDots(passwordLength);

        keypad_pw.removeEventListener("pointerdown", keypad_pw.handler);
        delete keypad_pw.handler;
        keypad_pw.handler = function (e) {
            keypad_pw_handler_create(e, passwordLength, onSuccess);
        };
        keypad_pw.addEventListener("pointerdown", keypad_pw.handler);

        textScreen_pw.textContent = "enter new password";
        newPassword = "";
        password = "";
    };
    cr_PW_4pinBtn.addEventListener("click", cr_PW_4pinBtn.handler);
}
