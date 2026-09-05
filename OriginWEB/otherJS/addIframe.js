async function loadHTMLInto(divSelector, htmlFile, htmlText) {
    const container = typeof divSelector === "string" ? document.querySelector(divSelector) : divSelector;
    if (!container) {
        console.error("Không tìm thấy element:", divSelector);
        return;
    }

    // Xóa nội dung cũ
    container.innerHTML = "";

    // Tạo iframe
    const iframe = document.createElement("iframe");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-pointer-lock allow-presentation"
    );

    //allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.position = "absolute";
    iframe.style.top = "0";
    iframe.overFlow = "hidden";

    container.appendChild(iframe);

    try {
        let html = htmlText;
        if (typeof html !== "string") {
            const response = await fetch(htmlFile);
            html = await response.text();
        }

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
    } catch (err) {
        console.error("Không load được HTML:", err);
    }

    iframe.onload = async () => {
        try {
            let cssText = await fetch("/OriginWEB/root.css").then((r) => r.text());
            cssText += `:root {
                            --bg-itemBackground: rgb(23, 23, 23) ;
                            --bg-appbackground: rgb(0, 0, 0) ;
                            --bg-color: rgb(255, 255, 255) ;
                        }`;

            const styleTag = document.createElement("style");
            styleTag.textContent = cssText;

            const head = iframe.contentDocument.head;
            head.insertBefore(styleTag, head.firstChild);
        } catch (err) {
            console.error("Không tải được CSS:", err);
        }
    };
}

function getIframeByIdApp(idApp) {
    const iframe = document.querySelector(`#${idApp} iframe`);
    if (iframe) return iframe;
}

function runCmd() {
    const input = document.getElementById("cmdInput");
    const code = input.value.trim();
    if (!code) return;

    showPopup2_alert(
        "Do you want to run this command?",
        "Yes",
        "No",
        () => {
            try {
                new Function(code)();
                input.value = ""; // xoá sau khi chạy
            } catch (e) {
                console.error(e);
                alert(e.message);
            }
        },
        () => {}
    );
}

function runCmdFromFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        try {
            new Function(reader.result)();
        } catch (e) {
            console.error(e);
            alert(e.message);
        }
    };
    reader.readAsText(file);
}

//function findIsland(type, id) {
//   if(islandList.main[type]) {
//}
