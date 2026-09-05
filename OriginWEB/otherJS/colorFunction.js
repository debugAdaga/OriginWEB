function toRGBA(color) {
    const el = document.createElement("div");
    el.style.color = color.trim();
    document.body.appendChild(el);
    const computed = getComputedStyle(el).color;
    document.body.removeChild(el);

    const match = computed.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)$/);

    if (!match) return;

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const a = match[4] !== undefined ? parseFloat(match[4]) : 1;

    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function darkerColor(color, value = 0) {
    const match = color.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)$/);
    if (!match) return;

    let [_, r, g, b, a] = match;
    r = parseInt(r);
    g = parseInt(g);
    b = parseInt(b);
    a = a !== undefined ? parseFloat(a) : 1;

    // Giảm độ sáng mỗi kênh RGB theo value
    r = Math.round(r * (1 - value));
    g = Math.round(g * (1 - value));
    b = Math.round(b * (1 - value));

    // Đảm bảo không nhỏ hơn 0
    r = Math.max(0, r);
    g = Math.max(0, g);
    b = Math.max(0, b);

    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function darkerOrBrighterColor(color, value = 0) {
    const match = color.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)$/);
    if (!match) return;

    let [_, r, g, b, a] = match;
    r = parseInt(r);
    g = parseInt(g);
    b = parseInt(b);
    a = a !== undefined ? parseFloat(a) : 1;

    // Tính độ sáng
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    let factor;

    if (brightness < 128) {
        // Màu tối → làm sáng
        factor = 1 + value;
    } else {
        // Màu sáng → làm tối
        factor = 1 - value;
    }

    // Áp dụng factor
    r = Math.max(0, Math.min(255, Math.round(r * factor)));
    g = Math.max(0, Math.min(255, Math.round(g * factor)));
    b = Math.max(0, Math.min(255, Math.round(b * factor)));

    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function colorMediumImg(urlImg, sampleSize = 100) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Cho phép ảnh từ domain khác (nếu server hỗ trợ)
        img.decoding = "async";
        img.src = urlImg;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Tính kích thước mẫu (thu nhỏ)
            const width = Math.min(sampleSize, img.width);
            const height = Math.round((img.height / img.width) * width);

            canvas.width = width;
            canvas.height = height;

            // Vẽ ảnh đã được thu nhỏ
            ctx.drawImage(img, 0, 0, width, height);

            const {data} = ctx.getImageData(0, 0, width, height);
            let r = 0,
                g = 0,
                b = 0;
            const pixelCount = width * height;

            // Cộng tất cả pixel
            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
            }

            // Tính trung bình
            r = Math.round(r / pixelCount);
            g = Math.round(g / pixelCount);
            b = Math.round(b / pixelCount);

            // Xoá canvas để tránh rò rỉ bộ nhớ
            canvas.width = canvas.height = 0;

            resolve(`rgba(${r}, ${g}, ${b}, 1)`);
        };

        img.onerror = () => reject(new Error(`Không tải được ảnh: ${urlImg}`));
    });
}
