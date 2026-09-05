document.querySelectorAll(".settingsItem").forEach((item) => {
    item.removeEventListener("click", settingsItemEvent_app_settings);
});

// Gỡ sự kiện backBtn + removeScroll cho mỗi panel đang mở
document
.getElementById("app_settings")
.querySelectorAll(".appInApp.open")
.forEach((panel) => {
    const backBtn = panel.querySelector(".backBtnForAppInApp");
    if (backBtn) {
        // Clone để remove mọi listeners (vì bạn dùng inline function trong scope nên không thể reference lại function đã bind)
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);
    }

    panel.querySelectorAll(".inputInSettings").forEach((el) => {
        el.removeEventListener("input", functionNameForApp_settings[el.id]);
    });

    const scrollYSettings = panel.querySelector(".scrollYSettings");
    const scrollContent = panel.querySelector(".scrollContent");

    if (scrollYSettings && scrollContent) removeScroll(scrollYSettings, scrollContent);

    removeClassAnim(panel);

    functionWhenCloseAppInApp_settings[panel.id]?.();
});
removeScroll(viewportScrollYSettingsMain, contentScrollYSettingsMain);
