const containerNotif = document.querySelector(".notificationStacked");
function addNotification(imageUrl = "", name = "", content = "", dataApp = "") {
    if (!containerNotif) return;

    // Tạo thông báo
    const item = document.createElement("div");
    item.className = "notifItem liquid";

    if (imageUrl)
        item.innerHTML = `
        <div class="notifImg"><img src="${imageUrl}"></div>
        <div class="notifText">
            <div class="notifName">${name}</div>
            <div class="notifContent">${content}</div>
        </div>
    `;
    else
        item.innerHTML = `
        <div class="notifImg"><img></div>
        <div class="notifText">
            <div class="notifName">${name}</div>
            <div class="notifContent">${content}</div>
        </div>
    `;
    //addItemToStack(item.innerHTML, dataApp);
    if (isLock) {
        containerNotif.innerHTML = "";
        return;
    }

    containerNotif.appendChild(item);

    // Force reflow
    item.classList.add("show");

    // AUTO REMOVE 5s

    containerNotif.querySelectorAll(".notifItem").forEach((e) => {
        const el = e;
        clearTimeout(el.autoRemove);
        delete item.autoRemove;
    });
    // Start timeout cho top item nếu chưa có

    startTopTimeout();

    // GESTURE HANDLER
    let startX = 0,
        startY = 0;
    let movedX = 0,
        movedY = 0;
    let isSwiping = false;

    item.onDown = (e) => {
        clearTimeout(item.autoRemove);
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        isSwiping = true;
    };

    item.onMove = (e) => {
        if (!isSwiping) return;

        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const y = e.touches ? e.touches[0].clientY : e.clientY;

        movedX = x - startX;
        movedY = y - startY;

        // kéo trực tiếp để item trượt nhẹ theo
        item.style.transform = `translate(0px, ${movedY}px) scale(0.96)`;
        item.style.opacity = 0.7;
    };

    item.onUp = () => {
        if (!isSwiping) return;
        isSwiping = false;

        // =========================
        // 1) SWIPE UP → remove
        // =========================
        if (movedY < -50) {
            item.classList.remove("show");

            delete item.autoRemove;
            setTimeout(() => item.remove(), 300);
            item.style.pointerEvents = "none";
            item.removeEventListener("pointerdown", item.onDown);
            window.removeEventListener("pointermove", item.onMove);
            window.removeEventListener("pointerup", item.onUp);
            delete item.onDown;
            delete item.onMove;
            delete item.onUp;
        }
        // =========================
        // 2) SWIPE DOWN or CLICK → open app
        // =========================
        else if (movedY > 40 || (Math.abs(movedX) < 5 && Math.abs(movedY) < 5)) {
            if (typeof openAppByID === "function") {
                item.style.transition = "";
                item.style.transform = "";
                item.style.opacity = "";
                openAppByID(dataApp);
            }
            item.classList.remove("show");

            delete item.autoRemove;
            setTimeout(() => item.remove(), 300);
            item.style.pointerEvents = "none";
            item.removeEventListener("pointerdown", item.onDown);
            window.removeEventListener("pointermove", item.onMove);
            window.removeEventListener("pointerup", item.onUp);
            delete item.onDown;
            delete item.onMove;
            delete item.onUp;
        }
        // =========================
        // 3) Không đủ lực → reset
        // =========================
        else {
            item.style.transition = "";
            item.style.transform = "";
            item.style.opacity = "";
            item.autoRemove = setTimeout(() => {
                item.classList.remove("show");
                delete item.autoRemove;
                setTimeout(() => item.remove(), 300);
            }, 5000);
            setTimeout(() => (item.style.transition = ""), 300);
        }
    };

    item.addEventListener("pointerdown", item.onDown);
    window.addEventListener("pointermove", item.onMove);
    window.addEventListener("pointerup", item.onUp);
}
const startTopTimeout = () => {
    const topItem = containerNotif.lastElementChild;
    if (topItem) {
        topItem.autoRemove = setTimeout(() => {
            topItem.classList.remove("show");
            setTimeout(() => {
                topItem.remove();
                delete topItem.autoRemove;
                startTopTimeout();
            }, 300);
            topItem.removeEventListener("pointerdown", topItem.onDown);
            window.removeEventListener("pointermove", topItem.onMove);
            window.removeEventListener("pointerup", topItem.onUp);
            delete topItem.onDown;
            delete topItem.onMove;
            delete topItem.onUp;
        }, 5000);
    }
};

function updateStack(container) {
    const items = [...container.querySelectorAll(".stackItem")];
    const wrapper = container.parentElement; // stackWrapper
    const wrapperRect = wrapper.getBoundingClientRect();

    // Lấy offsetY từ transform của addScroll()
    let offsetY = 0;
    const m = container.style.transform.match(/translateY\((-?\d+\.?\d*)px\)/);
    if (m) offsetY = parseFloat(m[1]);

    const stackZone = 120;

    items.forEach((item) => {
        const rect = item.getBoundingClientRect();

        // tính bottom thực của item so với wrapper
        const itemBottom = rect.bottom; // vị trí item thực ngoài viewport
        const wrapperBottom = wrapperRect.bottom; // đáy khung stackWrapper

        // khoảng cách từ đáy wrapper đến đáy item (cộng bù offsetY)
        const distanceFromWrapperBottom = wrapperBottom - itemBottom;

        if (distanceFromWrapperBottom <= 0) {
            const t = Math.min(Math.abs(distanceFromWrapperBottom) / stackZone, 1);

            const scale = 1 - t * 0.5;
            const translateY = -t * 180;
            const opacity = 1 - t * 1.4;
            const zIndex = 100 - Math.floor(t * 20);

            item.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            item.style.opacity = opacity;
            item.style.zIndex = zIndex;
        } else {
            item.style.transform = "";
            item.style.opacity = "1";
            item.style.zIndex = "100";
        }
    });
}

function addItemToStack(content = "", dataApp = "") {
    const containerLockNotif = document.querySelector("#lockScreen .stackContainer");
    if (!containerLockNotif) return;

    const item = document.createElement("div");
    item.className = "stackItem liquid";
    item.innerHTML = content;
    containerLockNotif.prepend(item);

    // scroll xuống item mới
    containerLockNotif.scrollTop = containerLockNotif.scrollHeight;

    let startX = 0,
        startY = 0;
    let movedX = 0,
        movedY = 0;
    let isSwiping = false;
    let isHorizontal = false; // NEW: xác định hướng

    item.onDown = (e) => {
        clearTimeout(item.autoRemove);

        const point = e.touches ? e.touches[0] : e;
        startX = point.clientX;
        startY = point.clientY;

        movedX = movedY = 0;
        isSwiping = true;
        isHorizontal = false;
    };

    item.onMove = (e) => {
        if (!isSwiping) return;

        const point = e.touches ? e.touches[0] : e;

        movedX = point.clientX - startX;
        movedY = point.clientY - startY;

        // Khi mới chạm, xác định hướng swipe
        if (!isHorizontal) {
            // Nếu Y lớn hơn X → reject (người dùng kéo dọc)
            if (Math.abs(movedY) > Math.abs(movedX)) {
                isSwiping = false;
                return;
            }
            isHorizontal = true;
        }

        // Chỉ cho kéo ngang
        item.style.translate = `${movedX}px 0px`;
        item.style.opacity = 0.7;
    };

    item.onUp = () => {
        if (!isSwiping) return;
        isSwiping = false;

        if (Math.abs(movedX) > 120) {
            item.style.transition = "all 0.2s 0.2s, translate 0.2s, opacity 0.2s 0.2s";
            if (movedX > 0) item.style.translate = "300px 0";
            if (movedX < 0) item.style.translate = "-300px 0";
            item.style.height = "0";
            item.style.width = "0";
            item.style.marginBottom = "0px";
            item.style.padding = "0px";
            item.style.opacity = "0";

            item.classList.remove("show");

            delete item.autoRemove;
            setTimeout(() => {
                item.remove();
                removeScroll(document.querySelector(".stackWrapper"), document.querySelector(".stackContainer"));
                addScrollScriptWithoutReset(
                    document.querySelector(".stackWrapper"),
                    document.querySelector(".stackContainer"),
                    (y) => {
                        updateStack(containerLockNotif);
                        if (y < -60) lockContentDiv.style.transform = `translate(0px, ${y + 60}px)`;
                    }
                );
            }, 600);
            runFor(500, () => {
                updateStack(containerLockNotif);
            });
            item.style.pointerEvents = "none";
            item.removeEventListener("pointerdown", item.onDown);
            window.removeEventListener("pointermove", item.onMove);
            window.removeEventListener("pointerup", item.onUp);

            return;
        }

        // =========================
        // 3) TAP → open app
        // =========================
        if (Math.abs(movedX) < 5 && Math.abs(movedY) < 5) {
            item.style.transition = "all 0.2s, translate 0.2s, visibility 0s 0.1s";
            item.style.height = "0";
            item.style.width = "0";
            item.style.marginBottom = "0px";
            item.style.padding = "0px";
            item.style.visibility = "hidden";

            delete item.autoRemove;
            setTimeout(() => item.remove(), 300);

            openAppByID(dataApp);
            return;
        }

        // =========================
        // 4) Không đủ lực → reset
        // =========================
        item.style.transition = "translate 0.3s, opacity 0.3s";
        item.style.translate = "0px 0px";
        item.style.opacity = "1";

        item.autoRemove = setTimeout(() => {
            item.classList.remove("show");
            delete item.autoRemove;
            setTimeout(() => item.remove(), 300);
        }, 5000);

        setTimeout(() => (item.style.transition = ""), 300);
    };

    item.addEventListener("pointerdown", item.onDown);
    window.addEventListener("pointermove", item.onMove);
    window.addEventListener("pointerup", item.onUp);

    if (!isLock) {
        updateStack(containerLockNotif);
        return;
    } else {
        runFor(600, () => {
            updateStack(containerLockNotif);
        });
    }

    removeScroll(document.querySelector(".stackWrapper"), document.querySelector(".stackContainer"));
    addScrollScriptWithoutReset(
        document.querySelector(".stackWrapper"),
        document.querySelector(".stackContainer"),
        (y) => {
            updateStack(containerLockNotif);
            if (y < -60) lockContentDiv.style.transform = `translate(0px, ${y + 60}px)`;
        }
    );
}

//scroll listener
