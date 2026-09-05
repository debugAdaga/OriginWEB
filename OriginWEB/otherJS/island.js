// island css from phone.css

let islandList = {
    main: {
        type: "",
        openAppId: "",
        image: "",
        text: "",
    },
    small: {
        type: "",
        openAppId: "",
        image: "",
        text: "",
    },
};
// islandList = {main: {openAppId: "id app", type: "clock" || "music"}, small: {openAppId: "id app", type: "clock" || "music"}};

const islandMain = document.querySelector(".island.main");
const islandSmall = document.querySelector(".island.small");

const islandMainComputed = getComputedStyle(islandMain);
const islandSmallComputed = getComputedStyle(islandSmall);

islandMain.pointerdown = function (event) {
    event.preventDefault();
    event.stopPropagation();

    islandMain.pointerup = function (event) {
        event.preventDefault();
        event.stopPropagation();

        let functionWhenOpenApp = function () {
            showIsland("small");
            hideIsland("main");
        };
        if (islandMain.dataset.currentApp === islandList.small.openAppId)
            functionWhenOpenApp = function () {
                showIsland("main");
                hideIsland("small");
            };
        openAppByIDFromIslandWithScript(islandMain.dataset.currentApp, functionWhenOpenApp);

        addScriptForCloseApp(() => {
            showIsland("main");
            showIsland("small");
        });
        islandMain.removeEventListener("pointerup", islandMain.pointerup);
        clearTimeout(islandMain.idTimeOutPoinerUp);
    };

    if (islandMain.classList.contains("open")) return;
    islandMain.addEventListener("pointerup", islandMain.pointerup);

    clearTimeout(islandMain.idTimeOutPoinerUp);
    islandMain.idTimeOutPoinerUp = setTimeout(() => {
        islandMain.removeEventListener("pointerup", islandMain.pointerup);

        openIsland("main");
    }, 400);
};
islandSmall.pointerdown = function (event) {
    event.preventDefault();
    event.stopPropagation();

    islandSmall.pointerup = function (event) {
        event.preventDefault();
        event.stopPropagation();

        let functionWhenOpenApp = function () {
            showIsland("main");
            hideIsland("small");
        };
        if (islandSmall.dataset.currentApp === islandList.main.openAppId)
            functionWhenOpenApp = function () {
                hideIsland("main");
                showIsland("small");
            };
        openAppByIDFromIslandWithScript(islandSmall.dataset.currentApp, functionWhenOpenApp);

        addScriptForCloseApp(() => {
            showIsland("main");
            showIsland("small");
        });
        islandSmall.removeEventListener("pointerup", islandSmall.pointerup);
        clearTimeout(islandSmall.idTimeOutPoinerUp);
    };

    if (islandSmall.classList.contains("open")) return;
    islandSmall.addEventListener("pointerup", islandSmall.pointerup);

    clearTimeout(islandSmall.idTimeOutPoinerUp);
    islandSmall.idTimeOutPoinerUp = setTimeout(() => {
        islandSmall.removeEventListener("pointerup", islandSmall.pointerup);

        openIsland("small");
    }, 400);
};

function animateIslandSmallBlur() {
    islandMain.classList.remove("animationBLur");
    requestAnimationFrame(() => {
        islandMain.classList.add("animationBLur");
    });
}
function animateIslandMainBlur() {
    islandMain.classList.remove("animationBLur");
    requestAnimationFrame(() => {
        islandMain.classList.add("animationBLur");
    });
}
function animateIslandMainBounce() {
    animateIslandMainBlur();
    islandMain.animate(
        [
            {scale: islandMainComputed.scale, width: islandMainComputed.width},
            {scale: "1.0", width: "97px"},
            {scale: "1.1", width: "105px"},
        ],
        {
            duration: 400,
            delay: 100,
            easing: "cubic-bezier(.3,1.45,.6,1.01)",
        }
    );
}
function animateIslandMainClose() {
    islandMain.classList.remove("animationBLur");
    requestAnimationFrame(() => {
        islandMain.classList.add("animationBLur");
    });
    islandMain.animate(
        [
            {scale: islandMainComputed.scale, width: islandMainComputed.width},
            {scale: "0.7", width: islandMainComputed.height},
        ],
        {
            duration: 400,
            delay: 100,
            easing: "ease",
        }
    );
}

const islands = document.querySelector("island");
let timeOutBlockPointerEventIslands = null;
function blockPointerEventIsland(time = 600) {
    islands.style.pointerEvents = "none";
    timeOutBlockPointerEventIslands = setTimeout(() => {
        islands.style.pointerEvents = "";
    }, time);
}

const textMain = islandMain.getElementsByClassName("text");
const imageMain = islandMain.getElementsByClassName("image");
const textSmall = islandSmall.getElementsByClassName("text");
const imageSmall = islandSmall.getElementsByClassName("image");

function addIsland(
    typeIsland = "clock",
    openAppId = "",
    text = "hi",
    image = "url()",
    typeIslandPosition = "auto",
    btn1 = () => {},
    btn2 = () => {},
    btn3 = () => {}
) {
    if (islandList.main.openAppId == openAppId || islandList.small.openAppId == openAppId) return;

    function updateUI(isMain) {
        const target = isMain ? islandMain : islandSmall;
        const list = isMain ? islandList.main : islandList.small;
        const txt = isMain ? textMain : textSmall;
        const img = isMain ? imageMain : imageSmall;

        list.type = typeIsland;
        list.openAppId = openAppId;
        list.text = text;
        list.image = image;

        target.className = `island ${isMain ? "main" : "small"} ${typeIsland}`;
        target.dataset.currentApp = openAppId;

        if (txt.length > 0) txt[0].textContent = text;
        if (img.length > 0) img[0].style.backgroundImage = image;

        target.addEventListener("pointerdown", target.pointerdown);
    }

    // gắn event cho các button
    const targetBtns = islands.querySelector(`.buttons.${typeIsland}`);
    if (targetBtns) {
        const b1 = targetBtns.querySelector(".btn1");
        const b2 = targetBtns.querySelector(".btn2");
        const b3 = targetBtns.querySelector(".btn3");

        if (b1) b1.addEventListener("click", btn1);
        if (b2) b2.addEventListener("click", btn2);
        if (b3) b3.addEventListener("click", btn3);
    }

    // =====================
    // Xác định vị trí
    // =====================
    let isMain;

    if (typeIslandPosition === "small") {
        isMain = false;
    } else if (typeIslandPosition === "main") {
        isMain = true;
    } else if (typeIslandPosition === "auto") {
        if (!islandList.main.openAppId) {
            isMain = true; // main trống
        } else if (!islandList.small.openAppId) {
            isMain = false; // small trống
        } else {
            return; // cả 2 đã có bỏ qua
        }
    }

    updateUI(isMain);
}
function removeIsland(openAppId_needRemove) {
    if (!openAppId_needRemove) return;

    const uiMainKey = islands.dataset.main; // "main" hoặc "small"
    const uiSmallKey = islands.dataset.small;

    const uiMain = uiMainKey === "main" ? islandMain : islandSmall;
    const uiSmall = uiSmallKey === "main" ? islandMain : islandSmall;

    const dataMain = islandList.main;
    const dataSmall = islandList.small;

    // ======================================
    // Xác định openAppId_needRemove thuộc main hay small
    // ======================================
    let targetType = null;

    if (dataMain.openAppId === openAppId_needRemove) {
        targetType = "main";
    } else if (dataSmall.openAppId === openAppId_needRemove) {
        targetType = "small";
    } else {
        return; // không có gì để xóa
    }

    // ==========================
    // REMOVE MAIN
    // ==========================
    if (targetType === "main") {
        const smallIsOnMain = uiMainKey === "small";

        if (smallIsOnMain) {
            // CASE: main đang bị small chiếm - > xóa main (UI + data main) nhưng small vẫn hiển thị
            dataMain.openAppId = "";
            dataMain.text = "";
            dataMain.image = "";
            dataMain.type = "";

            uiMain.className = "island main";
            uiMain.dataset.currentApp = "";
            uiMain.querySelector(".text").textContent = "";
            uiMain.querySelector(".image").style.backgroundImage = "";

            islands.dataset.main = "main";
            islands.dataset.small = "small";
            return;
        }

        // CASE: main không bị chiếm
        dataMain.openAppId = "";
        dataMain.text = "";
        dataMain.image = "";
        dataMain.type = "";

        if (dataSmall.openAppId) {
            // small tồn tại → đẩy small lên main
            dataMain.openAppId = dataSmall.openAppId;
            dataMain.text = dataSmall.text;
            dataMain.image = dataSmall.image;
            dataMain.type = dataSmall.type;

            uiMain.className = `island main ${dataSmall.type}`;
            uiMain.dataset.currentApp = dataSmall.openAppId;
            uiMain.querySelector(".text").textContent = dataSmall.text;
            uiMain.querySelector(".image").style.backgroundImage = dataSmall.image;

            // reset small
            dataSmall.openAppId = "";
            dataSmall.text = "";
            dataSmall.image = "";
            dataSmall.type = "";
            uiSmall.className = "island small";
            uiSmall.dataset.currentApp = "";
            uiSmall.querySelector(".text").textContent = "";
            uiSmall.querySelector(".image").style.backgroundImage = "";
            animateIslandMainBounce();
        } else {
            // main trống → reset UI bình thường
            uiMain.className = "island main";
            uiMain.dataset.currentApp = "";
            uiMain.querySelector(".text").textContent = "";
            uiMain.querySelector(".image").style.backgroundImage = "";
        }

        islands.dataset.main = "main";
        islands.dataset.small = "small";
    }

    // ==========================
    // REMOVE SMALL
    // ==========================
    if (targetType === "small") {
        const smallIsOnMain = uiSmallKey === "main";

        if (smallIsOnMain) {
            // small hiển thị ở UI main
            dataSmall.openAppId = "";
            dataSmall.text = "";
            dataSmall.image = "";
            dataSmall.type = "";

            uiSmall.className = "island main";
            uiSmall.dataset.currentApp = "";
            uiSmall.querySelector(".text").textContent = "";
            uiSmall.querySelector(".image").style.backgroundImage = "";

            islands.dataset.main = "main";
            islands.dataset.small = "small";

            return;
        }

        // small ở đúng chỗ nhỏ
        dataSmall.openAppId = "";
        dataSmall.text = "";
        dataSmall.image = "";
        dataSmall.type = "";

        uiSmall.className = "island small";
        uiSmall.dataset.currentApp = "";
        uiSmall.querySelector(".text").textContent = "";
        uiSmall.querySelector(".image").style.backgroundImage = "";

        return;
    }
}

function hideIsland(typeIsland = "main", noAnim = false) {
    if (typeIsland === "main") {
        if (islandSmall.dataset.currentApp) {
            islandMain.className = `island main ${islandList.small["type"]}`;
            islandSmall.className = `island small`;
            islandMain.dataset.currentApp = islandList.small["openAppId"];
            islandSmall.dataset.currentApp = "";

            if (textMain[0]) textMain[0].textContent = islandList.small["text"];
            if (imageMain[0]) imageMain[0].style.backgroundImage = islandList.small["image"];

            if (textSmall[0]) textSmall[0].textContent = "";
            if (imageSmall[0]) imageSmall[0].style.backgroundImage = "";

            islands.dataset.main = "small";
            islands.dataset.small = "main";

            if (!noAnim) animateIslandMainBounce();
        } else {
            islandMain.className = `island main`;
            islandMain.dataset.currentApp = "";
            if (textMain[0]) textMain[0].textContent = "";
            if (imageMain[0]) imageMain[0].style.backgroundImage = "";
        }
    } else if (typeIsland === "small" && islandList.small["type"]) {
        islandSmall.className = `island small`;
        islandSmall.dataset.currentApp = "";
        if (textSmall[0]) textSmall[0].textContent = "";
        if (imageSmall[0]) imageSmall[0].style.backgroundImage = "";

        if (!noAnim) animateIslandMainBounce();
    }
}

function showIsland(typeIsland = "main", noAnim = false) {
    if (typeIsland === "main") {
        if (islandList.small["type"]) {
            islandMain.className = `island main ${islandList.main["type"]}`;
            islandSmall.className = `island small ${islandList.small["type"]}`;

            islandMain.dataset.currentApp = islandList.main["openAppId"];
            islandSmall.dataset.currentApp = islandList.small["openAppId"];

            if (textMain[0]) textMain[0].textContent = islandList.main["text"];
            if (imageMain[0]) imageMain[0].style.backgroundImage = islandList.main["image"];

            if (textSmall[0]) textSmall[0].textContent = islandList.small["text"];
            if (imageSmall[0]) imageSmall[0].style.backgroundImage = islandList.small["image"];

            islands.dataset.main = "main";
            islands.dataset.small = "small";

            if (!noAnim) animateIslandMainBounce();
        } else {
            islandMain.className = `island main ${islandList.main["type"]}`;
            islandMain.dataset.currentApp = islandList.main["openAppId"];

            if (textMain[0]) textMain[0].textContent = islandList.main["text"];
            if (imageMain[0]) imageMain[0].style.backgroundImage = islandList.main["image"];
        }
    } else if (typeIsland === "small" && islandList.small["type"]) {
        islandSmall.className = `island small ${islandList.small["type"]}`;
        islandSmall.dataset.currentApp = islandList.small["openAppId"];

        if (textSmall[0]) textSmall[0].textContent = islandList.small["text"];
        if (imageSmall[0]) imageSmall[0].style.backgroundImage = islandList.small["image"];

        if (!noAnim) animateIslandMainBounce();
    }
}

phone.pointerDownForIslandMainOpen = function (e) {
    if (e.target.closest(".island.main")) {
        console.log("asd");
        return;
    }
    if (idTimeOutCloseIsland) clearTimeout(idTimeOutCloseIsland);
    closeIsland();
};
islandMain.pointerDownForIslandMainOpen = function () {
    if (idTimeOutCloseIsland) clearTimeout(idTimeOutCloseIsland);
    idTimeOutCloseIsland = setTimeout(() => {
        closeIsland();
    }, 6000);
};

let idTimeOutCloseIsland = null;
function openIsland(typeIsland = "main" || "small") {
    if (typeIsland == "main") {
        islandMain.classList.add("open");
    } else if (typeIsland == "small") {
        hideIsland("main", true);
        islandMain.timeOutAnimOpen = setTimeout(() => {
            openIsland("main");
        }, 100);
    }
    if (idTimeOutCloseIsland) clearTimeout(idTimeOutCloseIsland);
    idTimeOutCloseIsland = setTimeout(() => {
        closeIsland();
    }, 6000);
    phone.addEventListener("pointerdown", phone.pointerDownForIslandMainOpen);
    islandMain.addEventListener("pointerdown", islandMain.pointerDownForIslandMainOpen);
}
function closeIsland() {
    if (islandMain.timeOutAnimOpen) clearTimeout(islandMain.timeOutAnimOpen);
    if (islandList.small.openAppId) {
        if (currentOpeningEl) {
            if (
                currentOpeningElApp.id != islandList.small.openAppId &&
                currentOpeningElApp.id != islandList.main.openAppId
            )
                islandMain.timeOutAnimOpen = setTimeout(() => {
                    showIsland("main", true);
                }, 100);
        } else
            islandMain.timeOutAnimOpen = setTimeout(() => {
                showIsland("main", true);
            }, 100);
    }
    animateIslandMainBlur();
    blockPointerEventIsland();
    islandMain.animate(
        [
            {height: islandMainComputed.height, width: islandMainComputed.width},
            {height: "", width: "105px"},
        ],
        {
            duration: 500,
            easing: "cubic-bezier(0.3, 1.3, 0.6, 1.01)",
        }
    );
    islandMain.classList.remove("open");
    phone.removeEventListener("pointerdown", phone.pointerDownForIslandMainOpen);
}
function updateIsland(openAppId_needUpdate, typeContent, content) {
    if (typeContent !== "text" && typeContent !== "image") return;

    // -----------------------
    // 1) tìm dataIsland theo openAppId
    // -----------------------
    let dataIsland = null;
    let typeIsland = null;

    if (islandList.main.openAppId === openAppId_needUpdate) {
        dataIsland = islandList.main;
        typeIsland = "main";
    } else if (islandList.small.openAppId === openAppId_needUpdate) {
        dataIsland = islandList.small;
        typeIsland = "small";
    } else {
        return;
    }

    // -----------------------
    // -----------------------
    dataIsland[typeContent] = content;

    // -----------------------
    // -----------------------
    const uiKey = islands.dataset[typeIsland] === "main" ? "main" : "small";
    const islandEl = uiKey === "main" ? islandMain : islandSmall;

    // -----------------------
    // -----------------------
    if (typeContent === "text") {
        const textEl = islandEl.querySelector(".text");
        if (textEl && textEl.textContent !== content) {
            textEl.textContent = content;
        }
    } else if (typeContent === "image") {
        const imageEl = islandEl.querySelector(".image");
        if (imageEl && imageEl.style.backgroundImage !== content) {
            imageEl.style.backgroundImage = content;
        }
    }
}

// ======= PARENT =======
function getIdApp(iframeEl) {
    if (!iframeEl) return null;

    const appDisplay = iframeEl.closest(".appDisplay");
    if (!appDisplay) return null;

    const appRoot = appDisplay.closest(".app");
    if (!appRoot) return null;

    return appRoot.id;
}
window.addEventListener("message", (event) => {
    if (event.data.function === "getIdApp") {
        getIdApp();
    }
});
