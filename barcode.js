// ========== ملف الباركود المنفصل ==========
// هذا الملف يحتوي على دوال الكاميرا ومسح الباركود فقط

let currentScanner = null;

async function requestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (err) {
        console.error('Camera permission error:', err);
        return false;
    }
}

async function startBarcodeScanner(targetInputId) {
    const modal = document.getElementById('barcodeScannerModal');
    const video = document.getElementById('scannerVideo');
    const resultDiv = document.getElementById('scannerResult');
    if (!modal || !video) return;
    
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
        resultDiv.innerHTML = '❌ لا يمكن الوصول إلى الكاميرا. يرجى السماح بالوصول.';
        modal.style.display = 'flex';
        alert('لا يمكن الوصول إلى الكاميرا. الرجاء السماح بالوصول في إعدادات المتصفح.');
        return;
    }
    
    modal.setAttribute('data-target', targetInputId);
    modal.style.display = 'flex';
    resultDiv.innerHTML = 'جاري تشغيل الكاميرا...';
    
    if (currentScanner) {
        try { currentScanner.stop(); } catch(e) {}
        currentScanner = null;
    }
    
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: video,
            constraints: { facingMode: "environment", width: 640, height: 480 }
        },
        decoder: { readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader", "codabar_reader"] },
        locate: true,
        numOfWorkers: navigator.hardwareConcurrency || 2
    }, (err) => {
        if (err) {
            resultDiv.innerHTML = '❌ تعذر فتح الكاميرا. استخدم الإدخال اليدوي.';
            const manualBtn = document.getElementById('manualBarcodeBtn');
            if (manualBtn) manualBtn.style.display = 'inline-block';
            return;
        }
        Quagga.start();
        currentScanner = Quagga;
        resultDiv.innerHTML = 'انتظر مسح الباركود...';
        const manualBtn = document.getElementById('manualBarcodeBtn');
        if (manualBtn) manualBtn.style.display = 'inline-block';
    });
    
    Quagga.onDetected((data) => {
        const code = data.codeResult.code;
        resultDiv.innerHTML = `✅ تم مسح: ${code}`;
        Quagga.stop();
        currentScanner = null;
        modal.style.display = 'none';
        const targetInput = document.getElementById(targetInputId);
        if (targetInput) targetInput.value = code;
    });
}

async function startScannerForSearch() {
    const modal = document.getElementById('barcodeScannerModal');
    const video = document.getElementById('scannerVideo');
    const resultDiv = document.getElementById('scannerResult');
    if (!modal || !video) return;
    
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
        resultDiv.innerHTML = '❌ لا يمكن الوصول إلى الكاميرا.';
        modal.style.display = 'flex';
        alert('لا يمكن الوصول إلى الكاميرا.');
        return;
    }
    
    modal.style.display = 'flex';
    resultDiv.innerHTML = 'جاري تشغيل الكاميرا...';
    
    if (currentScanner) {
        try { currentScanner.stop(); } catch(e) {}
        currentScanner = null;
    }
    
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: video,
            constraints: { facingMode: "environment", width: 640, height: 480 }
        },
        decoder: { readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader", "codabar_reader"] },
        locate: true,
        numOfWorkers: navigator.hardwareConcurrency || 2
    }, (err) => {
        if (err) {
            resultDiv.innerHTML = '❌ تعذر فتح الكاميرا. استخدم الإدخال اليدوي.';
            const manualBtn = document.getElementById('manualBarcodeBtn');
            if (manualBtn) manualBtn.style.display = 'inline-block';
            alert('تعذر الوصول إلى الكاميرا.');
            return;
        }
        Quagga.start();
        currentScanner = Quagga;
        resultDiv.innerHTML = 'انتظر مسح الباركود...';
        const manualBtn = document.getElementById('manualBarcodeBtn');
        if (manualBtn) manualBtn.style.display = 'inline-block';
    });
    
    Quagga.onDetected(async (data) => {
        const code = data.codeResult.code;
        resultDiv.innerHTML = `✅ تم مسح: ${code}`;
        Quagga.stop();
        currentScanner = null;
        modal.style.display = 'none';
        if (typeof window.findMedicineByBarcode === 'function') {
            window.findMedicineByBarcode(code);
        } else {
            alert('لم يتم العثور على دواء بهذا الباركود');
        }
    });
}

function stopScannerAndClose() {
    if (currentScanner) {
        try { currentScanner.stop(); } catch(e) {}
        currentScanner = null;
    }
    const modal = document.getElementById('barcodeScannerModal');
    if (modal) modal.style.display = 'none';
}

// ربط الأزرار بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const scanBarcodeBtn = document.getElementById('scanBarcodeBtn');
    if (scanBarcodeBtn) scanBarcodeBtn.onclick = () => startBarcodeScanner('medBarcode');
    
    const scanBarcodeGenBtn = document.getElementById('scanBarcodeGenBtn');
    if (scanBarcodeGenBtn) scanBarcodeGenBtn.onclick = () => startBarcodeScanner('genBarcode');
    
    const homeBarcodeBtn = document.getElementById('homeBarcodeBtn');
    if (homeBarcodeBtn) homeBarcodeBtn.onclick = () => startScannerForSearch();
    
    const barcodeSearchBtn = document.getElementById('barcodeSearchBtn');
    if (barcodeSearchBtn) barcodeSearchBtn.onclick = () => startScannerForSearch();
    
    const closeScannerModal = document.getElementById('closeScannerModal');
    if (closeScannerModal) closeScannerModal.onclick = stopScannerAndClose;
    
    const cancelScannerBtn = document.getElementById('cancelScannerBtn');
    if (cancelScannerBtn) cancelScannerBtn.onclick = stopScannerAndClose;
    
    const manualBarcodeBtn = document.getElementById('manualBarcodeBtn');
    if (manualBarcodeBtn) {
        manualBarcodeBtn.addEventListener('click', () => {
            const barcode = prompt('أدخل الباركود يدويًا:');
            if (barcode && barcode.trim()) {
                const targetId = document.querySelector('#barcodeScannerModal').getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                if (targetInput) targetInput.value = barcode.trim();
                stopScannerAndClose();
            }
        });
    }
});

// تصدير الدوال للنطاق العام
window.startBarcodeScanner = startBarcodeScanner;
window.startScannerForSearch = startScannerForSearch;
window.stopScannerAndClose = stopScannerAndClose;
