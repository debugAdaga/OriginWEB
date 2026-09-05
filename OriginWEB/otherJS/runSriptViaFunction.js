function runScript(url) {
    if (!document.querySelector(`script[src="${url}"]`)) {
        const s = document.createElement("script");
        s.src = url;
        s.dataset.dynamic = "1";
        document.head.appendChild(s);
    }
}

function removeScript(url) {
    const script = document.querySelector(`script[src="${url}"][data-dynamic="1"]`);
    if (script) {
        script.remove();
    }
}

function runFor(duration = 300, callback) {
    let start = null;

    function loop(timestamp) {
        if (!start) start = timestamp;

        callback(timestamp - start);

        if (timestamp - start < duration) requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}
