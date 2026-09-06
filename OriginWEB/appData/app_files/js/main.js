function openFilesApp() {
    const app = document.getElementById('filesApp');
    if (app) {
        app.style.display = 'flex';
        app.style.animation = 'none';
        setTimeout(() => {
            app.style.animation = 'appOpen 0.3s ease';
        }, 10);
    }
    updateStorageInfo();
}

function closeFilesApp() {
    const app = document.getElementById('filesApp');
    if (app) {
        app.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.toolbar-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', function() {
            tabs.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const tabName = this.dataset.tab;
            document.querySelectorAll('.files-tab').forEach(tab => {
                tab.style.display = 'none';
            });
            
            const targetTab = document.getElementById(tabName + 'Tab');
            if (targetTab) {
                targetTab.style.display = 'block';
            }
        });
    });
});

document.addEventListener('click', function(e) {
    const fileItem = e.target.closest('.file-item');
    if (fileItem) {
        const fileName = fileItem.querySelector('.file-name')?.textContent || 'File';
        alert(`Opening: ${fileName}`);
    }
    
    const categoryItem = e.target.closest('.category-item');
    if (categoryItem) {
        const categoryName = categoryItem.querySelector('.category-name')?.textContent || 'Category';
        alert(`Opening category: ${categoryName}`);
    }
});

function updateStorageInfo() {
    try {
        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(estimate => {
                const usedGB = (estimate.usage / (1024 * 1024 * 1024)).toFixed(1);
                const totalGB = (estimate.quota / (1024 * 1024 * 1024)).toFixed(1);
                const percent = (estimate.usage / estimate.quota * 100).toFixed(0);
                
                const usedElement = document.querySelector('.storage-detail-item:first-child .detail-value');
                const freeElement = document.querySelector('.storage-detail-item:last-child .detail-value');
                const progressElement = document.querySelector('.storage-progress');
                const totalElement = document.querySelector('.storage-value');
                
                if (usedElement) usedElement.textContent = `${usedGB} GB`;
                if (freeElement) freeElement.textContent = `${(totalGB - usedGB).toFixed(1)} GB`;
                if (progressElement) progressElement.style.width = `${percent}%`;
                if (totalElement) totalElement.textContent = `${totalGB} GB`;
            });
        }
    } catch (e) {
        console.log('Storage API not supported');
    }
}

function clearCache() {
    if (confirm('Clear browser cache?')) {
        try {
            localStorage.clear();
            showNotification('Cache cleared!');
            updateStorageInfo();
        } catch (e) {
            showNotification('Error clearing cache');
        }
    }
}

function showStorageInfo() {
    let info = 'Storage Information:\n\n';
    
    try {
        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(estimate => {
                const usedMB = (estimate.usage / (1024 * 1024)).toFixed(2);
                const totalMB = (estimate.quota / (1024 * 1024)).toFixed(2);
                info += `Used: ${usedMB} MB\n`;
                info += `Total: ${totalMB} MB\n`;
                info += `Usage: ${((estimate.usage / estimate.quota) * 100).toFixed(1)}%`;
                alert(info);
            });
        } else {
            info += 'Information not available\n';
            info += 'Use a modern browser';
            alert(info);
        }
    } catch (e) {
        alert('Error getting storage information');
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        z-index: 9999;
        animation: slideUp 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideDown {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
`;
document.head.appendChild(style);

setInterval(() => {
    const app = document.getElementById('filesApp');
    if (app && app.style.display !== 'none') {
        updateStorageInfo();
    }
}, 30000);

function openFile(fileName) {
    alert(`Opening file: ${fileName}`);
}

function openCategory(categoryName) {
    alert(`Opening category: ${categoryName}`);
}

console.log('Files app loaded successfully!');
