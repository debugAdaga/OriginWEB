addScroll(
    document.getElementById("viewportScrollYSettingsMain"),
    document.getElementById("contentScrollYSettingsMain")
);

document
.getElementById("app_settings")
.querySelectorAll(".settingsItem")
.forEach((item) => {
    if (!item.dataset.openappid) return;
    item.addEventListener("click", settingsItemEvent_app_settings);
});

function settingsItemEvent_app_settings(e) {
    const target = document.getElementById(e.currentTarget.dataset.openappid);

    if (target.dataset.requestpassword === "1") {
        showPasswordScreen(
            () => {
                settingsItemEvent_app_settings_core(target);
            },
            "Enter password to unlock",
            0
        );
    } else settingsItemEvent_app_settings_core(target);
}
function settingsItemEvent_app_settings_core(target) {
    if (target) {
        document.querySelectorAll("#app_settings .appInApp.open").forEach((el) => {
            if (
                el.parentElement.id == target.parentElement.id &&
                el.id != target.id &&
                !target.classList.contains("fullScr")
            )
                removeClassAnim(el);
        });
        addClassAnim(target);

        target.querySelector(".backBtnForAppInApp").addEventListener("click", backBtnForAppInAppEven_app_setting);

        function backBtnForAppInAppEven_app_setting(e) {
            removeClassAnim(target);
            target
            .querySelector(".backBtnForAppInApp")
            .removeEventListener("click", backBtnForAppInAppEven_app_setting);
            if (scrollYSettings && scrollContent) {
                removeScroll(scrollYSettings, scrollContent);
            }

            target.querySelectorAll(".inputInSettings").forEach((el) => {
                el.removeEventListener("input", functionNameForApp_settings[el.id]);
            });

            functionWhenCloseAppInApp_settings[target.id]?.();
        }
        target.querySelectorAll(".inputInSettings").forEach((el) => {
            el.addEventListener("input", functionNameForApp_settings[el.id]);
        });

        const scrollYSettings = target.querySelector(".scrollYSettings");
        const scrollContent = target.querySelector(".scrollContent");
        if (scrollYSettings && scrollContent) {
            addScroll(scrollYSettings, scrollContent);
        }
        functionWhenOpenAppInApp_settings[target.id]?.();
    }
}

document
.getElementById("app_settings")
.querySelectorAll(".appInApp.open")
.forEach((panel) => {
    const backBtn = panel.querySelector(".backBtnForAppInApp");
    if (backBtn) {
        backBtn.addEventListener("click", backBtnForAppInAppEven_app_setting);

        function backBtnForAppInAppEven_app_setting(e) {
            removeClassAnim(panel);
            panel.querySelector(".backBtnForAppInApp").removeEventListener("click", backBtnForAppInAppEven_app_setting);
            if (scrollYSettings && scrollContent) {
                removeScroll(scrollYSettings, scrollContent);
            }
            functionWhenCloseAppInApp_settings[panel.id]?.();
        }
    }
    const scrollYSettings = panel.querySelector(".scrollYSettings");
    const scrollContent = panel.querySelector(".scrollContent");

    if (scrollYSettings && scrollContent) {
        addScroll(scrollYSettings, scrollContent);
    }
});

//document.querySelector('[data-openappid="app_SettingsAppAbout"]').click();
//document.querySelector('[data-openappid="app_SettingsAppAboutOcean"]').click();
