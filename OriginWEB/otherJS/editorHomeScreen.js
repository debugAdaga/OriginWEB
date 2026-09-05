const editorHomeScreen = document.querySelector(".editorHomeScreen");
editorHomeScreen.settingsBtn = editorHomeScreen.querySelector(".settingsBtn");
editorHomeScreen.menuSettings = editorHomeScreen.querySelector(".menuSettings");

function openEditorHomeScreen() {
    if (editorHomeScreen.timeout) clearTimeout(editorHomeScreen.timeout);
    editorHomeScreen.classList.remove("displayN");
    requestAnimationFrame(() => {
        allApp.classList.add("scaleForEdit");
    });

    editorHomeScreen.querySelector("[name='done']").addEventListener("click", closeEditorHomeScreen);

    editorHomeScreen.menuHanlder = function (e) {
        if (editorHomeScreen.menuSettings.classList.contains("open")) return;
        editorHomeScreen.menuSettings.classList.add("open");

        editorHomeScreen.querySelector("[name='appApp']").classList.add("notWork");

        {
            const el = editorHomeScreen.menuSettings.querySelector(".closeBtn");
            el.hanlder = function () {
                editorHomeScreen.menuSettings.classList.remove("open");
                {
                    const el1 = document.getElementById("toggle_turnBlurOff2");

                    el1.removeEventListener("click", el1._removeHandler);
                    delete el1._removeHandler;
                }
                {
                    const el1 = document.getElementById("toggle_turnLiquidDockBarOff2");

                    el1.removeEventListener("click", el1._removeHandler);
                    delete el1._removeHandler;
                }
                {
                    const el1 = document.getElementById("toggle_turnDockBarOff2");

                    el1.removeEventListener("click", el1._removeHandler);
                    delete el1._removeHandler;
                }

                editorHomeScreen.querySelector("[name='appApp']").classList.remove("notWork");

                el.removeEventListener("click", el.hanlder);
                delete el.hanlder;
            };
            el.addEventListener("click", el.hanlder);
        }

        {
            const el = document.getElementById("toggle_turnBlurOff2");
            el._removeHandler = (e) => {
                const element = e.target;
                element.classList.toggle("active");
                document.getElementById("toggle_turnBlurOff").classList.toggle("active");
                document.getElementById("blurAllApp").classList.toggle("displayN");
                localStorage.setItem("turnBlurOff", element.classList.contains("active") ? "0" : "1");
            };

            el.addEventListener("click", el._removeHandler);
        }
        {
            const el = document.getElementById("toggle_turnLiquidDockBarOff2");
            el._removeHandler = (e) => {
                const element = e.target;
                element.classList.toggle("active");
                document.getElementById("pager").classList.toggle("liquid");
                document.getElementById("favApp").classList.toggle("liquid");
                localStorage.setItem("turnLiquidDockBarOff", element.classList.contains("active") ? "0" : "1");
            };

            el.addEventListener("click", el._removeHandler);
        }
        {
            const el = document.getElementById("toggle_turnDockBarOff2");
            el._removeHandler = (e) => {
                const element = e.target;
                element.classList.toggle("active");
                document.getElementById("favApp").classList.toggle("hiddenBackground");
                localStorage.setItem("turnDockBarOff", element.classList.contains("active") ? "0" : "1");
            };

            el.addEventListener("click", el._removeHandler);
        }
    };
    editorHomeScreen.settingsBtn.addEventListener("click", editorHomeScreen.menuHanlder);
}
function closeEditorHomeScreen() {
    allApp.classList.remove("scaleForEdit");
    editorHomeScreen.timeout = setTimeout(() => {
        editorHomeScreen.classList.add("displayN");
        updateAppPositions();
    }, 600 * speed);

    editorHomeScreen.querySelector("[name='done']").removeEventListener("click", closeEditorHomeScreen);

    {
        const el = editorHomeScreen.menuSettings.querySelector(".closeBtn");
        editorHomeScreen.menuSettings.classList.remove("open");
        {
            const el1 = document.getElementById("toggle_turnBlurOff2");

            el1.removeEventListener("click", el1._removeHandler);
            delete el1._removeHandler;
        }
        {
            const el1 = document.getElementById("toggle_turnLiquidDockBarOff2");

            el1.removeEventListener("click", el1._removeHandler);
            delete el1._removeHandler;
        }
        {
            const el1 = document.getElementById("toggle_turnDockBarOff2");

            el1.removeEventListener("click", el1._removeHandler);
            delete el1._removeHandler;
        }

        editorHomeScreen.querySelector("[name='appApp']").classList.remove("notWork");

        el.removeEventListener("click", el.hanlder);
        delete el.hanlder;
    }
}
