const viewportScrollYSettingsMain = document.getElementById("viewportScrollYSettingsMain");
const contentScrollYSettingsMain = document.getElementById("contentScrollYSettingsMain");

const functionNameForApp_settings = {
    inputRangeBrightness: function (e) {
        e.preventDefault();
        const val = e.currentTarget.value;

        if (val < 20) val = 20;
        if (val > 100) val = 100;

        const percent = ((val - 20) / (100 - 20)) * 100;

        phone.style.filter = `brightness(${val / 100})`;
        brightnessSlider.style.height = `${percent}%`;
    },
    inputRangeIconSize: function (e) {
        const val = e.currentTarget.value;

        root.style.setProperty("--bg-scaleIcon", val);

        localStorage.setItem("scaleIcon", val);
    },
    inputRangeIconBRadius: function (e) {
        const val = e.currentTarget.value;

        root.style.setProperty("--bg-borderRadiusIcon", val + "px");

        localStorage.setItem("borderRadiusIcon", val);
    },
    scaleIconName: function (e) {
        const val = e.currentTarget.value;

        root.style.setProperty("--bg-scaleIconName", val);

        localStorage.setItem("scaleIconName", val);
    },
};

const functionWhenOpenAppInApp_settings = {
    app_SettingsAppAbout: function () {
        let totalUsed = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                let value = localStorage.getItem(key);
                totalUsed += key.length + (value ? value.length : 0);
            }
        }
        let totalBytes = 5 * 1024 * 1024;
        let usedBytes = totalUsed;
        if (!isNaN(totalBytes) && !isNaN(usedBytes)) {
            document.getElementById("storage").textContent = formatSize(totalBytes);
            document.getElementById("storageUsed").textContent = formatSize(usedBytes);
        }
    },
    app_SettingsAppDisplayAndBrightness: function () {
        const toggleDarkMode = document.getElementById("toggleDarkMode");
        toggleDarkMode._removeHandler = function (e) {
            this.classList.toggle("active");
            if (this.classList.contains("active")) {
                phone.classList.add("darkMode");
                localStorage.setItem("darkMode", "1");
            } else {
                phone.classList.remove("darkMode");
                localStorage.setItem("darkMode", "0");
            }
        };
        toggleDarkMode.addEventListener("click", toggleDarkMode._removeHandler);

        // fullscreen mode toggle
        const toggleFullScreenMode = document.getElementById("toggleFullScreenMode");
        toggleFullScreenMode._fullScreenHandler = function (e) {
            this.classList.toggle("active");
            if (this.classList.contains("active")) {
                window._addHandler = function () {
                    const width = window.innerWidth;
                    const height = window.innerHeight;

                    document.documentElement.style.setProperty("--bg-widthPhone", `${width}`);
                    document.documentElement.style.setProperty("--bg-heightPhone", `${height}`);
                    document.documentElement.style.setProperty("--bg-borderRadiusPhone", `41px`);
                };
                window.addEventListener("resize", window._addHandler);
                const width = window.innerWidth;
                const height = window.innerHeight;
                document.documentElement.style.setProperty("--bg-widthPhone", `${width}`);
                document.documentElement.style.setProperty("--bg-heightPhone", `${height}`);
                document.documentElement.style.setProperty(
                    "--bg-borderRadiusPhone",
                    `calc(41px * (min(${width} / 330, ${height} / 717)))`
                );

                if (currentOpeningElApp)
                    closeAppToCenterWithScript(() => {
                        updateGap();
                        updateAppPosNoRemove();
                        phoneRect = phone.getBoundingClientRect();
                    });

                document.getElementById("allBtnForDebug").style.display = document.getElementById(
                    "frame"
                ).style.display = "none";
                document.body.style.backgroundColor = "black";
                document.documentElement.requestFullscreen();
            } else {
                window.removeEventListener("resize", window._addHandler);
                delete window._addHandler;
                document.documentElement.style.setProperty("--bg-widthPhone", buildProp[`${deviceType}.width`]);
                document.documentElement.style.setProperty("--bg-heightPhone", buildProp[`${deviceType}.height`]);
                document.documentElement.style.setProperty(
                    "--bg-borderRadiusPhone",
                    buildProp[`${deviceType}.borderRadius`]
                );
                if (currentOpeningElApp)
                    closeAppToCenterWithScript(() => {
                        updateAppPosNoRemove();
                        phoneRect = phone.getBoundingClientRect();
                    });

                document.exitFullscreen();

                document.getElementById("allBtnForDebug").style.display = document.getElementById(
                    "frame"
                ).style.display = "";
                document.body.style.backgroundColor = "";
            }
            updateGap();
        };
        toggleFullScreenMode.addEventListener("click", toggleFullScreenMode._fullScreenHandler);
    },
    app_SettingsAppWallpaper: function () {
        const allWallpapers = document.querySelectorAll("#app_SettingsAppWallpaper .itemChild");
        allWallpapers.forEach((wallpaper) => {
            wallpaper.addEventListener("click", wallpaperSetOptions);
        });
        {
            const uploadBtn = document.querySelector('[name="uploadWallpaperBtn"]');
            const fileInput = document.getElementById("wallpaperInput");

            uploadBtn.handler = function () {
                fileInput.click();
            };
            uploadBtn.addEventListener("click", uploadBtn.handler);

            fileInput.handler = function () {
                const file = fileInput.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result;
                    const urlWallpaper = `url('${base64}')`;
                    localStorage.setItem("wallpaper", urlWallpaper);
                    setWallpaperOption(urlWallpaper);
                };
                reader.readAsDataURL(file);
            };

            fileInput.addEventListener("change", fileInput.handler);
        }
        {
            const uploadBtnVd = document.querySelector('[name="uploadVdWallpaperBtn"]');
            const fileInputVd = document.getElementById("wallpaperVdInput");
            const container = document.getElementById("imageForWallpaperLock");

            let currentBlobURL = null;

            uploadBtnVd.onclick = () => {
                fileInputVd.click();
            };

            fileInputVd.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const containerId = "wallpaperLock";

                removeVideoCanvas(containerId);

                if (currentBlobURL) {
                    URL.revokeObjectURL(currentBlobURL);
                    currentBlobURL = null;
                    container.classList.add("video");
                }

                currentBlobURL = URL.createObjectURL(file);

                playVideoCanvas(containerId, currentBlobURL);

                fileInputVd.value = "";
            };
        }
    },
    app_SettingsAppLockEditor: function () {
        const container = document.getElementById("app_SettingsAppLockEditor");
        container.querySelectorAll("[data-classToAdd][data-idNeedAdd]").forEach((el) => {
            const handler = () => {
                document
                .getElementById(el.getAttribute("data-idNeedAdd"))
                .classList.add(...el.getAttribute("data-classToAdd").trim().split(/\s+/));
                container.querySelectorAll("[data-classToAdd][data-idNeedAdd]").forEach((e) => {
                    e.style.pointerEvents = "none";
                });
            };
            el._addHandler = handler;
            el.addEventListener("click", handler);
        });

        container.querySelectorAll("[data-classToRemove][data-idNeedRemove]").forEach((el) => {
            const handler = () => {
                document
                .getElementById(el.getAttribute("data-idNeedRemove"))
                .classList.remove(...el.getAttribute("data-classToRemove").trim().split(/\s+/));
                container.querySelectorAll("[data-classToAdd][data-idNeedAdd]").forEach((e) => {
                    e.style.pointerEvents = "";
                });
            };
            el._removeHandler = handler;
            el.addEventListener("click", handler);
        });

        // move clock position based on saved setting
        const el = document.querySelector(".lockContent.preview");
        el._pointerHandlers = {};
        el._pointerHandlers.down = (e) => {
            el._isDragging = true;
            el._startX = e.clientX - (el._currentX || 0);
            el._startY = e.clientY - (el._currentY || 0);
            el.setPointerCapture(e.pointerId);
        };

        const edgeGap = 10;
        el._pointerHandlers.move = (e) => {
            if (!el._isDragging) return;

            el._currentX = e.clientX - el._startX;
            el._currentY = e.clientY - el._startY;

            el.style.transition = "0s";

            if (Math.abs(el._currentX) <= 8) el._currentX = 0;
            if (Math.abs(el._currentY) <= 8) el._currentY = 0;

            el.style.translate = `${el._currentX}px ${el._currentY}px`;

            const elRect = el.getBoundingClientRect();
            const parentRect = el.parentElement.getBoundingClientRect();

            const leftEdge = parentRect.left + edgeGap;
            const rightEdge = parentRect.right - edgeGap;

            if (elRect.left <= leftEdge && Math.abs(el._currentX) > 8) {
                if (lockContent.dataset.posclock == "left") return;
                lockContent.dataset.posclock = "left";
                el.dataset.posclock = "left";
                localStorage.setItem(`posClock-${deviceType}`, "left");
            } else if (elRect.right >= rightEdge && Math.abs(el._currentX) > 8) {
                if (lockContent.dataset.posclock == "right") return;
                lockContent.dataset.posclock = "right";
                el.dataset.posclock = "right";
                localStorage.setItem(`posClock-${deviceType}`, "right");
            } else {
                if (lockContent.dataset.posclock == "center") return;
                lockContent.dataset.posclock = "center";
                el.dataset.posclock = "center";
                localStorage.setItem(`posClock-${deviceType}`, "center");
            }
        };

        el._pointerHandlers.up = (e) => {
            el.style.transition = "";
            el._isDragging = false;
            el.releasePointerCapture(e.pointerId);

            document.documentElement.style.setProperty(
                "--bg-lockClockTranslate",
                `${el._currentX}px ${el._currentY}px`
            );
            localStorage.setItem(`lockClockPosition-${deviceType}`, `${el._currentX}px ${el._currentY}px`);
        };
        el.addEventListener("pointerdown", el._pointerHandlers.down);
        el.addEventListener("pointermove", el._pointerHandlers.move);
        el.addEventListener("pointerup", el._pointerHandlers.up);

        // {
        //     const el = document.querySelector(".lockContent.preview");
        //     anime.createDraggable(el, {
        //         container: "#app_SettingsAppLockEditor .phonePreview",
        //         velocityMultiplier: 0,
        //         containerFriction: 1,
        //     });
        // }

        // scale lock clock content
        const scaleLockClockSlider = document.getElementById("scaleLockClockSlider");
        const scaleLockClockValue = document.getElementById("scaleLockClockValue");
        scaleLockClockSlider._scaleHandler = (e) => {
            const scale = parseFloat(e.target.value);
            document.documentElement.style.setProperty("--bg-scaleLockContent", scale);
            scaleLockClockValue.textContent = scale.toFixed(2);
            localStorage.setItem(`scaleLockContent-${deviceType}`, scale);
        };
        scaleLockClockSlider.addEventListener("input", scaleLockClockSlider._scaleHandler);

        // font weight for lock clock
        const fontClockWeightSlider = document.getElementById("fontClockWeightSlider");
        const fontClockWeightValue = document.getElementById("fontClockWeightValue");
        fontClockWeightSlider._weightHandler = (e) => {
            const weight = parseInt(e.target.value);
            document.documentElement.style.setProperty("--bg-fontWeightLockClock", weight);
            fontClockWeightValue.textContent = weight;
            localStorage.setItem(`fontWeightLockClock-${deviceType}`, weight);
        };
        fontClockWeightSlider.addEventListener("input", fontClockWeightSlider._weightHandler);

        // color picker for lock clock
        const allColorCircles = document.querySelectorAll("#app_SettingsAppLockEditor .colorCircle");
        allColorCircles.forEach((colorCircle) => {
            colorCircle._colorHandler = (e) => {
                const color = e.currentTarget.style.backgroundColor;
                document.documentElement.style.setProperty("--bg-colorLockClock", color);
                localStorage.setItem(`colorLockClock-${deviceType}`, color);
                document.querySelectorAll("#app_SettingsAppLockEditor .colorCircle.active").forEach((activeCircle) => {
                    activeCircle.classList.remove("active");
                });
                e.currentTarget.classList.add("active");
            };
            colorCircle.addEventListener("click", colorCircle._colorHandler);
        });

        // font picker for lock clock
        const allFontCircle = document.querySelectorAll("#app_SettingsAppLockEditor .fontCircle");
        allFontCircle.forEach((fontCircle) => {
            fontCircle._fontHandler = (e) => {
                const font = e.currentTarget.style.fontFamily;
                document.documentElement.style.setProperty("--bg-fontLockClock", font);
                localStorage.setItem(`fontLockClock-${deviceType}`, font);
                e.currentTarget.classList.add("active");
                const activeFontCircles = document.querySelectorAll("#app_SettingsAppLockEditor .fontCircle.active");
                activeFontCircles.forEach((activeCircle) => {
                    if (activeCircle !== e.currentTarget) {
                        activeCircle.classList.remove("active");
                    }
                });
            };
            fontCircle.addEventListener("click", fontCircle._fontHandler);
        });

        // opacity picker for lock clock
        const opacityLockClockSlider = document.getElementById("opacityLockClockSlider");
        const opacityLockClockValue = document.getElementById("opacityLockClockValue");
        opacityLockClockSlider._opacityHandler = (e) => {
            const opacityPercent = parseInt(e.target.value);
            document.documentElement.style.setProperty("--bg-opacityLockClock", `${opacityPercent}%`);
            opacityLockClockValue.textContent = `${opacityPercent}%`;
            localStorage.setItem(`opacityLockClock-${deviceType}`, `${opacityPercent}%`);
        };
        opacityLockClockSlider.addEventListener("input", opacityLockClockSlider._opacityHandler);
        {
            const item = container.querySelectorAll('[name="allWallpaperOnStyle"] .itemChild');

            item.forEach((el) => {
                el.handler = function (e) {
                    const et = e.target;
                    const val = parseInt(et.dataset.allwallpaperonstyle);

                    currentWallpaperOnStyle = allWallpaperOnStyle[val];
                    currentWallpaperOffStyle = allWallpaperOffStyle[val != 2 ? 0 : val];

                    wallpaperLockPre.animate([{}, currentWallpaperOnStyle.wallpaperLock], {
                        duration: 300 * speed,
                        easing: "ease",
                        fill: "forwards",
                    });

                    const activeItem = container.querySelector('[name="allWallpaperOnStyle"] .itemChild.active');
                    activeItem.classList.remove("active");
                    et.classList.add("active");

                    localStorage.setItem(`allWallpaperOnStyle-${deviceType}`, val);
                    localStorage.setItem(`aodStyle-${deviceType}`, val != 2 ? 0 : val);

                    {
                        document.querySelectorAll("#app_SettingsAppAOD .itemChild.active").forEach((activeEl) => {
                            activeEl.classList.remove("active");
                        });

                        const activeItem = document.querySelector(`[data-style='${val != 2 ? 0 : val}']`);
                        if (activeItem) activeItem.classList.add("active");
                    }
                };
                el.addEventListener("click", el.handler);
            });
        }
    },
    app_SettingsAppHomeLockSettings: function () {
        const el = document.getElementById("toggle_doubleTapOnOff");
        const toggle_doubleTapOnOff = (e) => {
            const element = e.target;
            element.classList.toggle("active");
            doubleTapOnOff = element.classList.contains("active") ? 1 : 0;
            localStorage.setItem("doubleTapOnOff", element.classList.contains("active") ? "1" : "0");
        };
        el._removeHandler = toggle_doubleTapOnOff;
        el.addEventListener("click", toggle_doubleTapOnOff);

        {
            const el = document.getElementById("toggle_turnDarkenWallpaperOff");
            const toggle_doubleTapOnOff = (e) => {
                const element = e.target;
                element.classList.toggle("active");
                doubleTapOnOff = element.classList.contains("active") ? 1 : 0;
                localStorage.setItem("turnDarkenWallpaperOff", element.classList.contains("active") ? "0" : "1");

                wallpaperHome.style.opacity = doubleTapOnOff ? "" : "1";
            };
            el._removeHandler = toggle_doubleTapOnOff;
            el.addEventListener("click", toggle_doubleTapOnOff);
        }
    },
    app_SettingsAppIcon: function () {
        const el = document.getElementById("toggle_hideIconText");
        const toggle_hideIconText = (e) => {
            const element = e.target;
            element.classList.toggle("active");
            phone.classList.toggle("hideIconText");
            localStorage.setItem("hideIconText", element.classList.contains("active") ? 1 : 0);
        };
        el._removeHandler = toggle_hideIconText;
        el.addEventListener("click", toggle_hideIconText);

        {
            const el = document.getElementById("inputRangeIconSize");
            el.handler = function () {
                updateAppPosNoRemove();
            };
            el.addEventListener("pointerup", el.handler);
        }
        {
            const el = document.getElementById("inputRangeIconBRadius");
            el.handler = function () {
                updateAppPosNoRemove();
            };
            el.addEventListener("pointerup", el.handler);
        }
    },
    app_SettingsAppLiquidGlass: function () {
        {
            const elSlider = document.getElementById("inputRangeLiquidOpacity");
            elSlider._inpurtHandler = (e) => {
                const opacityPercent = parseInt(e.target.value);
                document.documentElement.style.setProperty("--bg-liquidOpacity", `${opacityPercent}%`);
                localStorage.setItem("liquidOpacity", `${opacityPercent}%`);
            };
            elSlider.addEventListener("input", elSlider._inpurtHandler);
        }
        {
            const el = document.getElementById("toggle_turnLiquidOff");
            el._inpurtHandler = function (e) {
                const element = e.target;
                element.classList.toggle("active");
                phone.classList.toggle("noLiquid");
                localStorage.setItem("turnLiquidOff", element.classList.contains("active") ? "0" : "1");

                if (phone.classList.contains("noLiquid"))
                    document.querySelectorAll(".settingsItem[notWorkBy='toggle_turnLiquidOff']").forEach((el) => {
                        el.classList.add("notWork");
                    });
                else
                    document.querySelectorAll(".settingsItem[notWorkBy='toggle_turnLiquidOff']").forEach((el) => {
                        el.classList.remove("notWork");
                    });
            };
            el.addEventListener("click", el._inpurtHandler);
        }
    },
    app_SettingsAppActionBtn: function () {
        document.getElementById("app_SettingsAppActionBtn").classList.add("animate");
        cameraBtn.classList.add("animate");
        const elAllBtnCamera = document.querySelectorAll("#app_SettingsAppActionBtn .horizontalScroll .itemChild");
        elAllBtnCamera._handler = function (e) {
            document.querySelectorAll("#app_SettingsAppActionBtn .horizontalScroll .itemChild.active").forEach((el) => {
                el.classList.remove("active");
            });
            e.target.classList.add("active");

            cameraBtn.dataset.appcamerabtn = e.target.dataset.appforcamerabtn;

            localStorage.setItem("appcamerabtn", cameraBtn.dataset.appcamerabtn);

            document
            .querySelector("#app_SettingsAppActionBtn .box .borderPhonePre .buttonPreview svg path")
            .setAttribute("d", e.target.dataset.path);
        };

        elAllBtnCamera.forEach((el) => {
            el.addEventListener("click", elAllBtnCamera._handler);
        });
    },
    app_SettingsAppPhoneColor: function () {
        {
            const scrollItems = document.querySelectorAll("#app_SettingsAppPhoneColor .horizontalScroll .itemChild");
            scrollItems.handler = function (e) {
                document
                .querySelectorAll("#app_SettingsAppPhoneColor .horizontalScroll .itemChild.active")
                .forEach((el) => {
                    el.classList.remove("active");
                });
                e.target.classList.add("active");

                document.documentElement.style.setProperty("--bg-phoneColor", e.target.dataset.colorphone);

                localStorage.setItem("colorPhone", e.target.dataset.colorphone);

                document.querySelector("#app_SettingsAppPhoneColor iframe").src = e.target.dataset.iframe;
            };
            scrollItems.forEach((el) => {
                el.addEventListener("click", scrollItems.handler);
            });
            const activeItem = document.querySelector(
                `[data-colorphone='${
                    localStorage.getItem("colorPhone") ? localStorage.getItem("colorPhone") : "rgb(221, 221, 221)"
                }']`
            );
            document.querySelector("#app_SettingsAppPhoneColor iframe").src = activeItem.dataset.iframe;
        }
        {
            const el = document.getElementById("togglePhoneShadow");
            el.handler = function (e) {
                const element = e.target;
                element.classList.toggle("active");
                phone.classList.toggle("phoneShadow");
                localStorage.setItem("togglePhoneShadow", element.classList.contains("active") ? "1" : "0");
            };

            el.addEventListener("click", el.handler);
        }
    },
    app_SettingsAppAnimation: function () {
        {
            const el = document.getElementById("toggle_turnBlurOff");
            el._removeHandler = (e) => {
                const element = e.target;
                element.classList.toggle("active");
                document.getElementById("toggle_turnBlurOff2").classList.toggle("active");
                document.getElementById("blurAllApp").classList.toggle("displayN");
                localStorage.setItem("turnBlurOff", element.classList.contains("active") ? "0" : "1");
            };

            el.addEventListener("click", el._removeHandler);
        }
        {
            const el = document.getElementById("toggle_turnAdvancedBlurOn");
            el._removeHandler = (e) => {
                const element = e.target;
                element.classList.toggle("active");
                const blurVal = element ? (element.classList.contains("active") ? 6 : 0) : 0;
                root.style.setProperty("--bg-advancedBlur", `${blurVal}px`);
                localStorage.setItem("turnAdvancedBlurOn", element.classList.contains("active") ? "1" : "0");

                const unlockAnimation = localStorage.getItem("unlockAnimation");
                if (unlockAnimation == "HyperOS")
                    filterForUnlockAnim = `blur(${rootStyle.getPropertyValue("--bg-advancedBlur").toString()})`;
            };

            el.addEventListener("click", el._removeHandler);
        }
        {
            // unlock animation select
            const selectUnlockAnimation = document.querySelector(
                "#app_SettingsAppAnimation .select[name='unlockAnimation']"
            );

            const selectBoxs = selectUnlockAnimation.querySelector(".selectBoxs");
            selectUnlockAnimation.handler = (e) => {
                if (e.target.matches(".selectTrigger")) selectBoxs.classList.toggle("open");
            };
            selectUnlockAnimation.addEventListener("click", selectUnlockAnimation.handler);

            const currentValue = selectUnlockAnimation.querySelector(".currentValue");

            selectBoxs.handler = (e) => {
                const value = e.currentTarget.getAttribute("data-value");
                changeUnlockAnimStyle(value);
                localStorage.setItem("unlockAnimation", value);

                currentValue.textContent = e.target.textContent;

                selectBoxs.querySelectorAll(".itemChild").forEach((i) => i.classList.remove("active"));
                e.target.classList.add("active");

                setTimeout(() => {
                    selectBoxs.classList.remove("open");
                }, 200);
            };
            selectBoxs.querySelectorAll(".itemChild").forEach((item) => {
                item.addEventListener("click", selectBoxs.handler);
            });
        }
    },
    app_SettingsAppAOD: function () {
        {
            const allAODStyle = document.querySelectorAll("#app_SettingsAppAOD .itemChild");
            allAODStyle.handler = (e) => {
                document.querySelectorAll("#app_SettingsAppAOD .itemChild.active").forEach((activeEl) => {
                    activeEl.classList.remove("active");
                });
                e.currentTarget.classList.add("active");
                const style = e.currentTarget.getAttribute("data-style");
                currentWallpaperOffStyle = allWallpaperOffStyle[style];
                localStorage.setItem(`aodStyle-${deviceType}`, style);
            };
            allAODStyle.forEach((el) => {
                el.addEventListener("click", allAODStyle.handler);
            });
        }

        {
            // toggle AOD on/off
            const el = document.getElementById("toggle_turnAodOff");
            el.Handler = function (e) {
                const element = e.target;
                element.classList.toggle("active");
                phone.classList.toggle("aodOff");
                localStorage.setItem("turnAodOff", element.classList.contains("active") ? "0" : "1");

                if (phone.classList.contains("aodOff")) {
                    if (currentWallpaperOnStyle === allWallpaperOnStyle[1]) {
                        currentWallpaperOffStyle = allWallpaperOffStyle[1];
                    } else {
                        currentWallpaperOffStyle = allWallpaperOffStyle[2];
                    }

                    document.querySelector("#app_SettingsAppAOD .horizontalScroll").classList.add("notWork");
                } else {
                    const aodStyle = localStorage.getItem(`aodStyle-${deviceType}`);
                    if (aodStyle) {
                        const activeItem = document.querySelector(`[data-style='${aodStyle}']`);
                        if (activeItem) activeItem.classList.add("active");
                        currentWallpaperOffStyle = allWallpaperOffStyle[aodStyle];
                    }
                    document.querySelector("#app_SettingsAppAOD .horizontalScroll").classList.remove("notWork");
                }
            };
            el.addEventListener("click", el.Handler);
        }
    },
    app_SettingsAppPasswordAndSecurity: function () {
        {
            const toggle_fingerprint = document.getElementById("toggle_fingerprint");
            toggle_fingerprint.handler = function (e) {
                const element = e.target;
                element.classList.toggle("active");
                localStorage.setItem("fingerprint", element.classList.contains("active") ? "1" : "0");
                fingerBtn.classList.toggle("displayN");
                document.getElementById("fingerBtn2").classList.toggle("displayN");
                document.getElementById("ani_fingerprint").classList.toggle("displayN");
            };
            toggle_fingerprint.addEventListener("click", toggle_fingerprint.handler);
        }

        {
            // Fingerprint animtion
            const selectFpAnim = document.querySelector(
                "#app_SettingsAppPasswordAndSecurity .select[name='fingerprintAnimation']"
            );

            const selectBoxs = selectFpAnim.querySelector(".selectBoxs");
            selectFpAnim.handler = (e) => {
                if (e.target.matches(".selectTrigger")) selectBoxs.classList.toggle("open");
            };
            selectFpAnim.addEventListener("click", selectFpAnim.handler);

            const currentValue = selectFpAnim.querySelector(".currentValue");

            selectBoxs.handler = async (e) => {
                const {valuea, valueb} = e.currentTarget.dataset;

                await unloadAllPreload();

                ani_fingerprint_type = valuea;
                ani_fadein_fingerprint_type = valueb;
                ani_fadeout_fingerprint_type = valueb;

                localStorage.setItem("FpAnimation1", valuea);
                localStorage.setItem("FpAnimation2", valueb);

                currentValue.textContent = e.target.textContent;

                selectBoxs.querySelectorAll(".itemChild").forEach((i) => i.classList.remove("active"));
                e.target.classList.add("active");

                clearTimeout(fingerBtnAnimPre._timer);
                loadFpAnim();

                setTimeout(() => {
                    selectBoxs.classList.remove("open");
                    run_fingerprint_animation_pre(run_fingerprint_animation_pre);
                }, 200);
            };
            selectBoxs.querySelectorAll(".itemChild").forEach((item) => {
                item.addEventListener("click", selectBoxs.handler);
            });
        }
        {
            //toggle_lockScreenPassword
            const el = document.getElementById("toggle_lockScreenPassword");
            el.handler = function (e) {
                if (!el.classList.contains("active")) {
                    createPasswordScreen(6, () => {
                        el.classList.add("active");
                        document
                        .querySelectorAll(".settingsItem[notWorkBy='toggle_lockScreenPassword']")
                        .forEach((el) => {
                            el.classList.remove("notWork");
                        });
                    });
                } else {
                    correctPassword = "";
                    localStorage.removeItem("password");
                    el.classList.remove("active");
                    document.querySelectorAll(".settingsItem[notWorkBy='toggle_lockScreenPassword']").forEach((el) => {
                        el.classList.add("notWork");
                    });
                }
            };
            el.addEventListener("click", el.handler);
        }
        {
            const el = document.querySelector('#app_SettingsAppPasswordAndSecurity [name="changePwBtn"]');
            el.handler = function () {
                createPasswordScreen(6);
            };
            el.addEventListener("click", el.handler);
        }
        run_fingerprint_animation_pre(run_fingerprint_animation_pre);
    },
    app_SettingsAppSysNav: function () {
        {
            const items = document.querySelectorAll("#app_SettingsAppSysNav .st");
            items.handler = function (e) {
                const el = e.target;
                document.querySelector("#app_SettingsAppSysNav .st.active")?.classList.remove("active");
                el.classList.add("active");
                navStyle(el.dataset.nav);
                updateAppPosNoRemove();
            };
            items.forEach((el) => {
                el.addEventListener("click", items.handler);
            });
        }
    },
    app_SettingsAppAboutOcean: function () {
        const box = document.getElementById("OriginOSocean");

        box.totalClick = 0;
        box.timeOutClick;
        box.shouldShowClickTime = 0;
        if (!box.shouldntClick) box.shouldntClick = 0;

        box.onclick = () => {
            if (box.shouldntClick) {
                tb_system("You are already a developer.");
                return;
            }
            clearTimeout(box.timeOutClick);
            if (++box.totalClick === 9) {
                runScript();
                box.totalClick = 0;
            }
            box.timeOutClick = setTimeout(() => (box.totalClick = 0), 900);

            if (box.totalClick >= 2) box.shouldShowClickTime = 1;
            if (box.shouldShowClickTime) {
                tb_system(`You are now ${9 - box.totalClick} steps away from being a developer.`, 900);
            }
        };

        function runScript() {
            box.shouldntClick = 1;
            box.shouldShowClickTime = 0;
            tb_system("You are already a developer.");
            phone.classList.add("devModOn");
        }
    },
    app_SettingsDev: function () {
        const app = document.getElementById("app_SettingsDev");

        const heightPhoneEditVal = app.querySelector('[name="heightPhoneEdit"] .settingsTextSmall.value');
        const widthPhoneEditVal = app.querySelector('[name="widthPhoneEdit"] .settingsTextSmall.value');
        const borderRadiusPhoneEditVal = app.querySelector('[name="borderRadiusPhoneEdit"] .settingsTextSmall.value');

        const heightPhoneEdit = app.querySelector('[name="heightPhoneEdit"]');
        const widthPhoneEdit = app.querySelector('[name="widthPhoneEdit"]');
        const borderRadiusPhoneEdit = app.querySelector('[name="borderRadiusPhoneEdit"]');

        app.updateText = function () {
            const rootStyle = getComputedStyle(root);
            heightPhoneEditVal.textContent = rootStyle.getPropertyValue("--bg-heightPhone");
            widthPhoneEditVal.textContent = rootStyle.getPropertyValue("--bg-widthPhone");
            borderRadiusPhoneEditVal.textContent = rootStyle.getPropertyValue("--bg-borderRadiusPhone");
        };
        app.updateText();

        {
            heightPhoneEdit.handler = function () {
                showPopupInput({
                    message: "Phone height",
                    placeholder: 617,
                    defaultText: heightPhoneEditVal.textContent.trim(),
                    maxLength: 5,
                    buttonText: "OK",
                    onSubmit: (resultText) => {
                        if (resultText < 600) resultText = 600;

                        heightPhoneEditVal.textContent = resultText;
                        root.style.setProperty("--bg-heightPhone", resultText);
                        updateAppPosNoRemove();
                    },
                });
            };

            heightPhoneEdit.addEventListener("click", heightPhoneEdit.handler);
        }
        {
            widthPhoneEdit.handler = function () {
                showPopupInput({
                    message: "Phone width",
                    placeholder: 280,
                    defaultText: widthPhoneEditVal.textContent.trim(),
                    maxLength: 5,
                    buttonText: "OK",
                    onSubmit: (resultText) => {
                        if (resultText < 280) resultText = 280;

                        widthPhoneEditVal.textContent = resultText;
                        root.style.setProperty("--bg-widthPhone", resultText);
                        updateAppPosNoRemove();
                    },
                });
            };

            widthPhoneEdit.addEventListener("click", widthPhoneEdit.handler);
        }

        {
            borderRadiusPhoneEdit.handler = function () {
                showPopupInput({
                    message: "Phone border radius",
                    placeholder: "34px",
                    defaultText: borderRadiusPhoneEditVal.textContent.trim(),
                    maxLength: 5,
                    buttonText: "OK",
                    onSubmit: (resultText) => {
                        borderRadiusPhoneEditVal.textContent = resultText;
                        root.style.setProperty("--bg-borderRadiusPhone", resultText);
                        updateAppPosNoRemove();
                    },
                });
            };

            borderRadiusPhoneEdit.addEventListener("click", borderRadiusPhoneEdit.handler);
        }

        {
            const el = document.getElementById("toggle_HarmonyOSControlsCenterStyles");
            el.handle = function () {
                el.classList.toggle("active");
                controlCenter.classList.toggle("OriginOS");
                controlCenter.classList.toggle("HarmonyOS");
            };
            el.addEventListener("click", el.handle);
        }
    },
    app_SettingsAppSystemStyle: function () {
        {
            //system corner radius range
            const el = document.getElementById("inputRangeSystemCornerRadius");

            el.handler = function (e) {
                const radius = parseInt(e.target.value);
                document.documentElement.style.setProperty("--bg-systemCornerRadius", `${radius}px`);

                //--bg-borderRadiusSys in root.css

                root.style.setProperty("--bg-borderRadiusSys", `${radius}px`);

                localStorage.setItem("systemCornerRadius", radius);
            };

            el.addEventListener("input", el.handler);
        }
    },
};
const functionWhenCloseAppInApp_settings = {
    app_SettingsAppDisplayAndBrightness: function () {
        const toggleDarkMode = document.getElementById("toggleDarkMode");
        toggleDarkMode.removeEventListener("click", toggleDarkMode._removeHandler);
        delete toggleDarkMode._removeHandler;

        // fullscreen mode toggle
        const toggleFullScreenMode = document.getElementById("toggleFullScreenMode");
        toggleFullScreenMode.removeEventListener("click", toggleFullScreenMode._fullScreenHandler);
        delete toggleFullScreenMode._fullScreenHandler;
    },
    app_SettingsAppWallpaper: function () {
        const allWallpapers = document.querySelectorAll("#app_SettingsAppWallpaper .itemChild");
        allWallpapers.forEach((wallpaper) => {
            wallpaper.removeEventListener("click", wallpaperSetOptions);
        });
        {
            const uploadBtn = document.querySelector('[name="uploadWallpaperBtn"]');
            const fileInput = document.getElementById("wallpaperInput");

            uploadBtn.addEventListener("click", uploadBtn.handler);
            delete uploadBtn.handler;
            fileInput.addEventListener("change", fileInput.handler);
            delete fileInput.handler;
        }
    },
    app_SettingsAppLockEditor: function () {
        const container = document.getElementById("app_SettingsAppLockEditor");
        container.querySelectorAll("[data-classToAdd][data-idNeedAdd]").forEach((el) => {
            if (el._addHandler) {
                el.removeEventListener("click", el._addHandler);
                delete el._addHandler;
            }
        });
        container.querySelectorAll("[data-classToRemove][data-idNeedRemove]").forEach((el) => {
            if (el._removeHandler) {
                el.removeEventListener("click", el._removeHandler);
                delete el._removeHandler;
            }
        });
        const el = document.querySelector(".lockContent.preview");

        el.removeEventListener("pointerdown", el._pointerHandlers.down);
        el.removeEventListener("pointermove", el._pointerHandlers.move);
        el.removeEventListener("pointerup", el._pointerHandlers.up);
        delete el._pointerHandlers;
        delete el._isDragging;
        delete el._currentX;
        delete el._currentY;
        delete el._startX;
        delete el._startY;

        // scale lock clock content
        const scaleLockClockSlider = document.getElementById("scaleLockClockSlider");
        scaleLockClockSlider.removeEventListener("input", scaleLockClockSlider._scaleHandler);
        delete scaleLockClockSlider._scaleHandler;

        // font weight for lock clock
        const fontClockWeightSlider = document.getElementById("fontClockWeightSlider");
        fontClockWeightSlider.removeEventListener("input", fontClockWeightSlider._weightHandler);
        delete fontClockWeightSlider._weightHandler;

        // color picker for lock clock
        const allColorCircles = document.querySelectorAll("#app_SettingsAppLockEditor .colorCircle");
        allColorCircles.forEach((colorCircle) => {
            colorCircle.removeEventListener("click", colorCircle._colorHandler);
            delete colorCircle._colorHandler;
        });

        // font picker for lock clock
        const allFontCircle = document.querySelectorAll("#app_SettingsAppLockEditor .fontCircle");
        allFontCircle.forEach((fontCircle) => {
            fontCircle.removeEventListener("click", fontCircle._fontHandler);
            delete fontCircle._fontHandler;
        });

        // opacity picker for lock clock
        const opacityLockClockSlider = document.getElementById("opacityLockClockSlider");
        opacityLockClockSlider.removeEventListener("input", opacityLockClockSlider._opacityHandler);
        delete opacityLockClockSlider._opacityHandler;
        {
            const item = container.querySelectorAll('[name="allWallpaperOnStyle"] .itemChild');
            item.forEach((el) => {
                el.removeEventListener("click", el.handler);
                delete el.handler;
            });
        }
    },
    app_SettingsAppHomeLockSettings: function () {
        {
            const el = document.getElementById("toggle_doubleTapOnOff");
            el.removeEventListener("click", el._removeHandler);
            delete el._removeHandler;
        }
        {
            const el = document.getElementById("toggle_turnDarkenWallpaperOff");
            el.removeEventListener("click", el._removeHandler);
            delete el._removeHandler;
        }
    },
    app_SettingsAppIcon: function () {
        const el = document.getElementById("toggle_hideIconText");
        el.removeEventListener("click", el._removeHandler);
        delete el._removeHandler;

        {
            const el = document.getElementById("inputRangeIconSize");
            el.removeEventListener("pointerup", el.handler);
            delete el.handler;
        }
        {
            const el = document.getElementById("inputRangeIconBRadius");
            el.removeEventListener("pointerup", el.handler);
            delete el.handler;
        }
    },
    app_SettingsAppLiquidGlass: function () {
        {
            const elSlider = document.getElementById("inputRangeLiquidOpacity");
            elSlider.removeEventListener("input", elSlider._inpurtHandler);
            delete elSlider._inpurtHandler;
        }
        {
            const el = document.getElementById("toggle_turnLiquidOff");
            el.removeEventListener("click", el._inpurtHandler);
            delete el._inpurtHandler;
        }
    },
    app_SettingsAppActionBtn: function () {
        document.getElementById("app_SettingsAppActionBtn").classList.remove("animate");
        cameraBtn.classList.remove("animate");
        const elAllBtnCamera = document.querySelectorAll("#app_SettingsAppActionBtn .horizontalScroll .itemChild");

        elAllBtnCamera.forEach((el) => {
            el.removeEventListener("click", elAllBtnCamera._handler);
        });
        delete elAllBtnCamera._handler;
    },
    app_SettingsAppPhoneColor: function () {
        {
            const scrollItems = document.querySelectorAll("#app_SettingsAppPhoneColor .horizontalScroll .itemChild");
            scrollItems.forEach((el) => {
                el.removeEventListener("click", scrollItems.handler);
            });
            delete scrollItems.handler;
            document.querySelector("#app_SettingsAppPhoneColor iframe").src = "";
        }

        {
            const el = document.getElementById("togglePhoneShadow");
            el.removeEventListener("click", el.handler);
            delete el.handler;
        }
    },
    app_SettingsAppAnimation: function () {
        {
            const el = document.getElementById("toggle_turnBlurOff");
            el.removeEventListener("click", el._removeHandler);
            delete el._removeHandler;
        }
        {
            const el = document.getElementById("toggle_turnAdvancedBlurOn");
            el.removeEventListener("click", el._removeHandler);
            delete el._removeHandler;
        }
        {
            // unlock animation select
            const selectUnlockAnimation = document.querySelector(
                "#app_SettingsAppAnimation .select[name='unlockAnimation']"
            );
            const selectBoxs = selectUnlockAnimation.querySelector(".selectBoxs");

            if (selectBoxs.classList.contains("open")) selectBoxs.classList.remove("open");

            selectUnlockAnimation.removeEventListener("click", selectUnlockAnimation.handler);
            delete selectUnlockAnimation.handler;
            selectBoxs.querySelectorAll(".selectItem").forEach((item) => {
                item.removeEventListener("click", selectBoxs.handler);
            });
            delete selectBoxs.handler;
        }
    },
    app_SettingsAppAOD: function () {
        {
            const allAODStyle = document.querySelectorAll("#app_SettingsAppAOD .itemChild");
            allAODStyle.forEach((el) => {
                el.removeEventListener("click", allAODStyle.handler);
            });
            delete allAODStyle.handler;
        }
        {
            // toggle AOD on/off
            const el = document.getElementById("toggle_turnAodOff");
            el.removeEventListener("click", el.Handler);
            delete el.Handler;
        }
    },
    app_SettingsAppPasswordAndSecurity: function () {
        {
            const toggle_fingerprint = document.getElementById("toggle_fingerprint");
            toggle_fingerprint.removeEventListener("click", toggle_fingerprint.handler);
            delete toggle_fingerprint.handler;
        }

        {
            // Fingerprint animtion
            const selectFpAnim = document.querySelector(
                "#app_SettingsAppPasswordAndSecurity .select[name='fingerprintAnimation']"
            );
            const selectBoxs = selectFpAnim.querySelector(".selectBoxs");

            selectFpAnim.removeEventListener("click", selectFpAnim.handler);
            delete selectFpAnim.handler;

            selectBoxs.querySelectorAll(".itemChild").forEach((item) => {
                item.removeEventListener("click", selectBoxs.handler);
            });
            delete selectBoxs.handler;
        }

        {
            //toggle_lockScreenPassword
            const el = document.getElementById("toggle_lockScreenPassword");
            el.removeEventListener("click", el.handler);
            delete el.handler;
        }

        {
            const el = document.querySelector('#app_SettingsAppPasswordAndSecurity [name="changePwBtn"]');

            el.removeEventListener("click", el.handler);
            delete el.handler;
        }
        clearTimeout(fingerBtnAnimPre._timer);
    },
    app_SettingsAppSysNav: function () {
        {
            const items = document.querySelectorAll("#app_SettingsAppSysNav .st");
            items.forEach((el) => {
                el.removeEventListener("click", items.handler);
            });
            delete items.handler;
        }
    },

    app_SettingsAppAboutOcean: function () {
        const box = document.getElementById("OriginOSocean");

        box.totalClick = 0;
        box.timeOutClick;
        box.shouldShowClickTime = 0;

        box.onclick = null;
    },
    app_SettingsDev: function () {
        const app = document.getElementById("app_SettingsDev");

        const heightPhoneEdit = app.querySelector('[name="heightPhoneEdit"]');
        const widthPhoneEdit = app.querySelector('[name="widthPhoneEdit"]');
        const borderRadiusPhoneEdit = app.querySelector('[name="borderRadiusPhoneEdit"]');

        delete app.updateText;

        {
            heightPhoneEdit.removeEventListener("click", heightPhoneEdit.handler);
            delete heightPhoneEdit.handle;
        }
        {
            widthPhoneEdit.removeEventListener("click", widthPhoneEdit.handler);
            delete widthPhoneEdit.handler;
        }
        {
            borderRadiusPhoneEdit.removeEventListener("click", borderRadiusPhoneEdit.handler);
            delete borderRadiusPhoneEdit.handler;
        }

        {
            const el = document.getElementById("toggle_HarmonyOSControlsCenterStyles");
            el.removeEventListener("click", el.handle);
            delete el.handle;
        }
    },
    app_SettingsAppSystemStyle: function () {
        {
            //system corner radius range
            const el = document.getElementById("inputRangeSystemCornerRadius");
            el.removeEventListener("pointerup", el.handler);
            delete el.handler;
        }
    },
};

function wallpaperSetOptions(e) {
    const bgImg = e.currentTarget.style.backgroundImage;
    setWallpaperOption(bgImg);
}

function setWallpaperOption(bgImg) {
    const overlay = document.querySelector(".overlayFullScreen");
    const optionBox = document.getElementById("optionSelectWallpaper");
    overlay.classList.add("openForWallpaper");

    optionBox.querySelector('[data-buttonWallpaper="setForLockScreen"]').onclick = () => {
        overlay.classList.remove("openForWallpaper");
        document.documentElement.style.setProperty("--bg-wallpaperLock", bgImg);
        localStorage.setItem("wallpaperLock", bgImg);

        {
            // load color button medium wallpaper
            const urlImg = getComputedStyle(document.documentElement)
            .getPropertyValue("--bg-wallpaperLock")
            .trim()
            .replace(/url\(["']?(.*?)["']?\)/, "$1");

            colorMediumImg(urlImg).then((color) => {
                const finalColor = darkerOrBrighterColor(color, 0.5);
                document.getElementById("colorMediumWallpaperButton").style.backgroundColor = color;

                originColorWallpaperLock = color;
                darkerColorWallpaperLock = finalColor;

                document.documentElement.style.setProperty("--bg-colorLockClock", color);
                document.querySelectorAll("#app_SettingsAppLockEditor .colorCircle.active").forEach((activeCircle) => {
                    activeCircle.classList.remove("active");
                });
                document.getElementById("colorMediumWallpaperButton").classList.add("active");
                wallpaperLockColorPre.style.cssText = `background: linear-gradient( ${darkerColorWallpaperLock}, ${originColorWallpaperLock});`;
            });
        }
        wallpaperLock.classList.remove("video");
        removeVideoCanvas("wallpaperLock");
    };
    optionBox.querySelector('[data-buttonWallpaper="setForHomeScreen"]').onclick = () => {
        overlay.classList.remove("openForWallpaper");
        document.documentElement.style.setProperty("--bg-wallpaperHome", bgImg);
        localStorage.setItem("wallpaperHome", bgImg);
    };
    optionBox.querySelector('[data-buttonWallpaper="setForBothScreen"]').onclick = () => {
        overlay.classList.remove("openForWallpaper");
        document.documentElement.style.setProperty("--bg-wallpaperLock", bgImg);
        document.documentElement.style.setProperty("--bg-wallpaperHome", bgImg);
        localStorage.setItem("wallpaperLock", bgImg);
        localStorage.setItem("wallpaperHome", bgImg);

        {
            // load color button medium wallpaper
            const urlImg = getComputedStyle(document.documentElement)
            .getPropertyValue("--bg-wallpaperLock")
            .trim()
            .replace(/url\(["']?(.*?)["']?\)/, "$1");

            colorMediumImg(urlImg).then((color) => {
                const finalColor = darkerOrBrighterColor(color, 0.5);
                document.getElementById("colorMediumWallpaperButton").style.backgroundColor = color;

                originColorWallpaperLock = color;
                darkerColorWallpaperLock = finalColor;

                document.documentElement.style.setProperty("--bg-colorLockClock", color);

                localStorage.setItem(`colorLockClock-${deviceType}`, color);

                document.querySelectorAll("#app_SettingsAppLockEditor .colorCircle.active").forEach((activeCircle) => {
                    activeCircle.classList.remove("active");
                });
                document.getElementById("colorMediumWallpaperButton").classList.add("active");
                wallpaperLockColorPre.style.cssText = `background: linear-gradient( ${darkerColorWallpaperLock}, ${originColorWallpaperLock});`;
            });
        }
        wallpaperLock.classList.remove("video");
        removeVideoCanvas("wallpaperLock");
    };
    optionBox.querySelector('[data-buttonWallpaper="cancelSetWallpaper"]').onclick = () => {
        overlay.classList.remove("openForWallpaper");
    };
}
