// ========== فحص Dexie ==========
if (typeof Dexie === 'undefined') {
    alert('خطأ: مكتبة Dexie لم يتم تحميلها');
    throw new Error('Dexie not loaded');
}

const db = new Dexie('PharmacyDB');
db.version(1).stores({
    meds: '++id, name, expiry, type, category, company, scientificName, origin, image, barcode, dosageForm, dosage, createdAt',
    deletedMeds: '++id, name, expiry, type, category, company, scientificName, origin, image, barcode, dosageForm, dosage, createdAt',
    notifications: '++id, message, date, read',
    notificationLog: '++id, medId, lastNotified, count'
});

const MED_TYPES = { GENERAL: 'general', PHARMACY: 'pharmacy' };

function showLoading(msg) {
    const el = document.getElementById('loadingText');
    if (el) el.innerText = msg;
    const ov = document.getElementById('loadingOverlay');
    if (ov) ov.style.display = 'flex';
    if (window._lt) clearTimeout(window._lt);
    window._lt = setTimeout(() => hideLoading(), 5000);
}
function hideLoading() {
    if (window._lt) clearTimeout(window._lt);
    const ov = document.getElementById('loadingOverlay');
    if (ov) ov.style.display = 'none';
}

const translations = {
    ar: {
        home_title: 'مدير الصيدلية', inbox_title: 'صندوق الوارد', explore_title: 'استكشف',
        settings_title: 'الإعدادات', about_app: 'حول التطبيق', language: 'اللغة',
        dark_mode: 'الوضع المظلم', backup_restore: 'النسخ الاحتياطي والاستعادة',
        export_db: 'تصدير JSON', import_db: 'استيراد JSON', export_csv: 'تصدير CSV',
        export_pdf: 'تصدير PDF', about_text: 'Pharmacy Manager Pro\nنسخة متطورة.',
        save: 'حفظ', cancel: 'إلغاء', name: 'الاسم', search_placeholder: 'بحث...',
        sort_by: 'ترتيب حسب', closest_expiry: 'الأقرب انتهاء', farthest_expiry: 'الأبعد انتهاء',
        name_asc: 'اسم (أ-ي)', name_desc: 'اسم (ي-أ)', newest_first: 'الأحدث أولاً',
        batch_delete: 'حذف المحدد', batch_add_to_pharmacy: 'إضافة المحدد إلى الصيدلية',
        add_med: 'إضافة دواء', add_general_med: 'إضافة دواء', trade_name: 'الاسم التجاري *',
        scientific_name: 'الاسم العلمي', company: 'الشركة', origin: 'المنشأ', category: 'التصنيف',
        expiry_date: 'تاريخ الانتهاء *', save_med: 'حفظ', no_meds: 'لا توجد أدوية',
        total: 'إجمالي', pharmacy_count: 'صيدلية', expired: 'منتهية', expiring_30: 'تنتهي خلال 30 يوم',
        categories: 'التصنيفات', companies: 'الشركات', expiring_soon: 'القريبة',
        no_notifications: 'لا توجد إشعارات', no_categories: 'لا توجد تصنيفات', no_companies: 'لا توجد شركات',
        delete_confirm: 'تأكيد الحذف؟', batch_delete_confirm: n => `حذف ${n} دواء؟`,
        med_details: 'تفاصيل', edit_med: 'تعديل', delete_med: 'حذف',
        all_medicines: 'كل الأدوية', pharmacy_medicines: 'أدوية الصيدلية',
        therapeutic_categories: 'التصنيفات العلاجية', international_companies: 'شركات الأدوية',
        search_btn: 'بحث', barcode_search: 'بحث بالباركود', scan_barcode: 'مسح باركود',
        companies_sort: 'ترتيب الشركات', alphabetical: 'أبجدي', by_med_count: 'حسب عدد الأدوية',
        popular: 'الأكثر شيوعاً', medicine_count: 'عدد الأدوية', barcode_label: 'الباركود (اختياري)',
        back_to_companies: 'العودة إلى الشركات', add_to_pharmacy: 'إضافة إلى الصيدلية',
        add_expiry: 'أدخل تاريخ الانتهاء', added_to_pharmacy: 'تمت الإضافة',
        select_all: 'تحديد الكل', deselect_all: 'إلغاء الكل',
        long_press_guide: 'اضغط مطولاً لتحديد عدة أدوية',
        dosage_form: 'الشكل الدوائي', dosage: 'الجرعة', deleted_items: 'سلة المحذوفات',
        restore: 'استعادة', delete_permanently: 'حذف نهائي', empty_trash: 'تفريغ السلة',
        restore_confirm: 'استعادة الدواء؟', delete_permanently_confirm: 'حذف نهائي؟',
        empty_trash_confirm: 'تفريغ السلة بالكامل؟', expiry1: 'تاريخ الانتهاء 1',
        expiry2: 'تاريخ الانتهاء 2', expiry3: 'تاريخ الانتهاء 3',
        medicine_exists_in_pharmacy: 'هذا الدواء موجود بالفعل. هل تريد إضافته بصلاحية جديدة؟',
        notification_days: 'تنبيه قبل (أيام)', default_expiry: 'الصلاحية الافتراضية',
        one_year: 'سنة واحدة', two_years: 'سنتان', three_years: '3 سنوات', five_years: '5 سنوات',
        manual: 'يدوي', notification_set: 'تم حفظ الإعدادات', default_expiry_set: 'تم حفظ الصلاحية',
        add_selected_to_pharmacy: 'إضافة الأدوية المحددة', batch_add_success: 'تمت الإضافة',
        search_history: 'سجل البحث'
    },
    en: {
        home_title: 'Pharmacy Manager', inbox_title: 'Inbox', explore_title: 'Explore',
        settings_title: 'Settings', about_app: 'About', language: 'Language',
        dark_mode: 'Dark Mode', backup_restore: 'Backup & Restore',
        export_db: 'Export JSON', import_db: 'Import JSON', export_csv: 'Export CSV',
        export_pdf: 'Export PDF', about_text: 'Pharmacy Manager Pro',
        save: 'Save', cancel: 'Cancel', name: 'Name', search_placeholder: 'Search...',
        sort_by: 'Sort by', closest_expiry: 'Closest expiry', farthest_expiry: 'Farthest expiry',
        name_asc: 'Name A-Z', name_desc: 'Name Z-A', newest_first: 'Newest first',
        batch_delete: 'Delete Selected', batch_add_to_pharmacy: 'Add to Pharmacy',
        add_med: 'Add Medicine', trade_name: 'Trade Name *', scientific_name: 'Scientific Name',
        company: 'Company', origin: 'Origin', category: 'Category', expiry_date: 'Expiry Date *',
        save_med: 'Save', no_meds: 'No medicines', total: 'Total', pharmacy_count: 'Pharmacy',
        expired: 'Expired', expiring_30: 'Expiring in 30d', categories: 'Categories',
        companies: 'Companies', expiring_soon: 'Expiring Soon', no_notifications: 'No notifications',
        no_categories: 'No categories', no_companies: 'No companies', delete_confirm: 'Delete?',
        batch_delete_confirm: n => `Delete ${n} medicine(s)?`, med_details: 'Details',
        edit_med: 'Edit', delete_med: 'Delete', all_medicines: 'All Medicines',
        pharmacy_medicines: 'Pharmacy Medicines', therapeutic_categories: 'Categories',
        international_companies: 'Companies', search_btn: 'Search', barcode_search: 'Barcode Search',
        scan_barcode: 'Scan', companies_sort: 'Sort Companies', alphabetical: 'Alphabetical',
        by_med_count: 'By Count', popular: 'Popular', medicine_count: 'Count',
        barcode_label: 'Barcode', back_to_companies: 'Back', add_to_pharmacy: 'Add to Pharmacy',
        add_expiry: 'Enter expiry date', added_to_pharmacy: 'Added', select_all: 'Select All',
        deselect_all: 'Deselect All', long_press_guide: 'Long press to select',
        dosage_form: 'Dosage Form', dosage: 'Dosage', deleted_items: 'Trash',
        restore: 'Restore', delete_permanently: 'Delete Permanently', empty_trash: 'Empty Trash',
        restore_confirm: 'Restore?', delete_permanently_confirm: 'Permanently delete?',
        empty_trash_confirm: 'Empty trash?', expiry1: 'Expiry 1', expiry2: 'Expiry 2', expiry3: 'Expiry 3',
        medicine_exists_in_pharmacy: 'Medicine exists. Add with new expiry?',
        notification_days: 'Notify before (days)', default_expiry: 'Default expiry',
        one_year: '1 year', two_years: '2 years', three_years: '3 years', five_years: '5 years',
        manual: 'Manual', notification_set: 'Saved', default_expiry_set: 'Saved',
        add_selected_to_pharmacy: 'Add selected', batch_add_success: 'Added',
        search_history: 'Search History'
    }
};

let currentLang = localStorage.getItem('appLang') || 'ar';
let currentPage = 'home';
let searchQuery = '';
let sortBy = 'expiry_asc';
let typeFilter = MED_TYPES.GENERAL;
let selectedMeds = new Set();
let chart = null;
let currentMed = null;
let isEditing = false;
let currentCompany = null;
let recentSearches = {
    all: JSON.parse(localStorage.getItem('recentSearches_all') || '[]'),
    pharmacy: JSON.parse(localStorage.getItem('recentSearches_pharmacy') || '[]'),
    companies: JSON.parse(localStorage.getItem('recentSearches_companies') || '[]'),
    expiring: JSON.parse(localStorage.getItem('recentSearches_expiring') || '[]')
};
let selectionMode = false;
let longPressTimer = null;
let touchSelectionActive = false;
let currentScanner = null;
let currentPageNumber = 1;
let itemsPerPage = 50;
let totalFilteredItems = 0;
let currentFilteredList = [];
let pageHistoryStack = [];
let isInEditMode = false;
let selectedCompanies = new Set();
let selectedCategories = new Set();
let batchMode = false;

function t(key, ...args) {
    let text = translations[currentLang][key] || key;
    if (args.length && typeof text === 'function') text = text(...args);
    return text;
}
function escapeHtml(str) { return str ? String(str).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]) : ''; }
function getDaysRemaining(dateStr) {
    const today = new Date(); today.setHours(0,0,0,0);
    const expiry = new Date(dateStr); expiry.setHours(0,0,0,0);
    return Math.ceil((expiry - today) / 86400000);
}

async function migrateData() { /* as before */ }
async function initDemoData() { /* as before */ }
async function addMedicineToGeneralIfNotExists(medData) { /* as before */ }

function updateHeaderButtons() {
    const back = document.getElementById('backBtn');
    const settings = document.getElementById('settingsHeaderBtn');
    const notif = document.getElementById('notifBtn');
    if (currentPage === 'home') {
        if (back) back.style.display = 'none';
        if (settings) settings.style.display = 'flex';
        if (notif) notif.style.display = 'flex';
    } else {
        if (back) back.style.display = 'flex';
        if (settings) settings.style.display = 'none';
        if (notif) notif.style.display = 'none';
    }
}

function pushPageToHistory(p) { if (pageHistoryStack[pageHistoryStack.length-1] !== p) pageHistoryStack.push(p); if (pageHistoryStack.length > 10) pageHistoryStack.shift(); }
function switchPage(page) { pushPageToHistory(currentPage); currentPage = page; updateHeaderButtons(); updateAllText(); }
function refreshCurrentPage() {
    const pages = { home: renderHome, all: renderAllMedicines, pharmacy: renderPharmacyMedicines, categories: renderCategoriesPage, companies: renderCompaniesPage, expiring: renderExpiringSoonPage, inbox: renderInbox, explore: renderExplore, deleted: renderDeletedItems };
    if (pages[currentPage]) pages[currentPage]();
}
function updateAllText() {
    const titles = { home: 'home_title', all: 'all_medicines', pharmacy: 'pharmacy_medicines', categories: 'therapeutic_categories', companies: 'international_companies', expiring: 'expiring_soon', inbox: 'inbox_title', explore: 'explore_title', deleted: 'deleted_items' };
    const titleEl = document.getElementById('appTitle');
    if (titleEl) titleEl.innerText = t(titles[currentPage] || 'home_title');
    refreshCurrentPage();
}
window.handleBackButton = function() {
    if (isInEditMode && currentMed) {
        showSaveChangesModal(async () => { await saveMedFromForm(); isInEditMode = false; currentMed = null; closeMedFormModal(); refreshCurrentPage(); },
            () => { isInEditMode = false; currentMed = null; closeMedFormModal(); refreshCurrentPage(); });
        return;
    }
    if (currentCompany !== null) { currentCompany = null; renderCompaniesPage(); return; }
    if (searchQuery !== '') { searchQuery = ''; currentPageNumber = 1; refreshCurrentPage(); return; }
    if (currentPage !== 'home') {
        if (pageHistoryStack.length) switchPage(pageHistoryStack.pop());
        else switchPage('home');
        return;
    }
    document.getElementById('exitConfirmModal').style.display = 'flex';
};
function showSaveChangesModal(onSave, onDiscard) { /* as before */ }
function goHome() { if (currentPage === 'home') document.getElementById('exitConfirmModal').style.display = 'flex'; else switchPage('home'); }
function hideExitConfirmation() { document.getElementById('exitConfirmModal').style.display = 'none'; }
function exitApp() { if (confirm('إغلاق التطبيق؟')) window.close(); hideExitConfirmation(); }

function saveSearchQuery(key, q) { if (!q.trim()) return; let arr = recentSearches[key]; arr = [q, ...arr.filter(s => s !== q)].slice(0,5); recentSearches[key] = arr; localStorage.setItem(`recentSearches_${key}`, JSON.stringify(arr)); }
function performSearch(q, key) { searchQuery = q; saveSearchQuery(key, q); currentPageNumber = 1; refreshCurrentPage(); }

async function updateSearchSuggestions(input, box, type) {
    const q = input.value.trim().toLowerCase();
    if (!q) { box.classList.remove('show'); return; }
    let matches = [];
    if (type === 'medicines') {
        const all = await db.meds.toArray();
        matches = all.filter(m => m.name.toLowerCase().startsWith(q)).map(m => m.name).slice(0,10);
    } else if (type === 'companies') {
        const all = await db.meds.toArray();
        const comps = new Set();
        all.forEach(m => { if (m.company && m.company.toLowerCase().startsWith(q)) comps.add(m.company); });
        matches = Array.from(comps).slice(0,10);
    }
    if (!matches.length) { box.classList.remove('show'); return; }
    box.innerHTML = matches.map(s => `<div class="suggestion-item">${escapeHtml(s)}</div>`).join('');
    box.classList.add('show');
    box.querySelectorAll('.suggestion-item').forEach(el => el.addEventListener('click', () => {
        input.value = el.innerText;
        box.classList.remove('show');
        if (type === 'medicines') performSearch(input.value, 'all');
        else if (type === 'companies') filterCompanies(input.value);
    }));
}
function enhanceSearchInput(input, pageKey) {
    if (!input || input.hasAttribute('data-enhanced')) return;
    input.setAttribute('data-enhanced', 'true');
    const wrapper = input.parentElement;
    const sugg = document.createElement('div'); sugg.className = 'suggestions-list';
    wrapper.style.position = 'relative'; wrapper.appendChild(sugg);
    input.addEventListener('input', () => updateSearchSuggestions(input, sugg, pageKey === 'companies' ? 'companies' : 'medicines'));
    input.addEventListener('keypress', e => { if (e.key === 'Enter') { const v = input.value.trim(); if (v) performSearch(v, pageKey); sugg.classList.remove('show'); } });
    input.addEventListener('blur', () => setTimeout(() => sugg.classList.remove('show'), 200));
    const btn = wrapper.querySelector('button');
    if (btn && !btn._bound) { btn._bound = true; btn.addEventListener('click', () => { const v = input.value.trim(); if (v) performSearch(v, pageKey); sugg.classList.remove('show'); }); }
}

async function getFilteredAndSorted() {
    let list = await db.meds.toArray();
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(m => m.name.toLowerCase().includes(q) || (m.scientificName && m.scientificName.toLowerCase().includes(q)) || (m.company && m.company.toLowerCase().includes(q)) || (m.barcode && m.barcode.toLowerCase().includes(q)));
    }
    if (typeFilter !== 'all') list = list.filter(m => m.type === typeFilter);
    if (sortBy === 'expiry_asc') list.sort((a,b) => getDaysRemaining(a.expiry) - getDaysRemaining(b.expiry));
    else if (sortBy === 'expiry_desc') list.sort((a,b) => getDaysRemaining(b.expiry) - getDaysRemaining(a.expiry));
    else if (sortBy === 'name_asc') list.sort((a,b) => a.name.localeCompare(b.name));
    else if (sortBy === 'name_desc') list.sort((a,b) => b.name.localeCompare(a.name));
    else if (sortBy === 'date_desc') list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
}

function renderMedications(list, showDel) {
    const container = document.getElementById('contentList');
    if (!container) return;
    container.innerHTML = '';
    if (!list.length) { container.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`; return; }
    list.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const isSelected = selectedMeds.has(med.id);
        const card = document.createElement('div');
        card.className = `med-card ${isSelected ? 'selected' : ''} ${selectionMode ? 'selection-mode' : ''}`;
        card.setAttribute('data-id', med.id);
        card.innerHTML = `<div class="checkbox"></div><div class="med-info">${thumb}<div class="med-text"><div class="med-name">💊 ${escapeHtml(med.name)}</div></div></div>`;
        if (showDel) {
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-button';
            delBtn.innerHTML = `<div class="trash-bin-icon"><div class="bin-lid"></div><div class="bin-container"><div class="bin-line"></div><div class="bin-line"></div></div></div>`;
            delBtn.addEventListener('click', (e) => { e.stopPropagation(); if (confirm(t('delete_confirm'))) moveToDeleted(med.id); });
            card.appendChild(delBtn);
        }
        card.addEventListener('click', (e) => { if (selectionMode) { e.stopPropagation(); toggleSelectMed(med.id); } else showMedDetails(med); });
        card.addEventListener('touchstart', (e) => handleTouchStart(e, med.id, card));
        card.addEventListener('touchmove', handleTouchMove);
        card.addEventListener('touchend', handleTouchEnd);
        container.appendChild(card);
    });
    updateBatchDeleteButton();
    updateSelectionButtons();
}

async function renderMedicationsWithPagination(list, showDel) {
    currentFilteredList = list;
    totalFilteredItems = list.length;
    const start = (currentPageNumber-1)*itemsPerPage;
    renderMedications(list.slice(start, start+itemsPerPage), showDel);
    renderPaginationControls();
}
function renderPaginationControls() {
    const container = document.getElementById('contentList');
    if (!container) return;
    const total = Math.ceil(totalFilteredItems / itemsPerPage);
    let div = document.getElementById('paginationControls');
    if (!div) { div = document.createElement('div'); div.id = 'paginationControls'; div.className = 'pagination'; container.parentNode.insertBefore(div, container.nextSibling); }
    if (total <= 1) { div.style.display = 'none'; return; }
    div.style.display = 'flex';
    div.innerHTML = `<button id="firstPageBtn" ${currentPageNumber===1?'disabled':''}>⏮ الأول</button><button id="prevPageBtn" ${currentPageNumber===1?'disabled':''}>◀ السابق</button><span>${currentPageNumber} / ${total}</span><button id="nextPageBtn" ${currentPageNumber===total?'disabled':''}>التالي ▶</button><button id="lastPageBtn" ${currentPageNumber===total?'disabled':''}>الأخير ⏭</button>`;
    document.getElementById('firstPageBtn')?.addEventListener('click',()=>goToPage(1));
    document.getElementById('prevPageBtn')?.addEventListener('click',()=>goToPage(currentPageNumber-1));
    document.getElementById('nextPageBtn')?.addEventListener('click',()=>goToPage(currentPageNumber+1));
    document.getElementById('lastPageBtn')?.addEventListener('click',()=>goToPage(total));
}
function goToPage(p) { currentPageNumber = p; renderMedicationsWithPagination(currentFilteredList, true); window.scrollTo({top:0}); }

async function moveToDeleted(id) { const med = await db.meds.get(id); if(med){ await db.deletedMeds.add(med); await db.meds.delete(id); selectedMeds.delete(id); refreshCurrentPage(); updateBarChart(); } }
async function restoreFromDeleted(id) { const med = await db.deletedMeds.get(id); if(med){ await db.meds.add(med); await db.deletedMeds.delete(id); renderDeletedItems(); } }
async function permanentlyDelete(id) { if(confirm(t('delete_permanently_confirm'))){ await db.deletedMeds.delete(id); renderDeletedItems(); } }
async function emptyTrash() { if(confirm(t('empty_trash_confirm'))){ await db.deletedMeds.clear(); renderDeletedItems(); } }

async function renderDeletedItems() {
    const list = await db.deletedMeds.toArray();
    const container = document.getElementById('pageContent');
    container.innerHTML = `<div class="filters-bar"><button id="emptyTrashBtn">${t('empty_trash')}</button></div><div class="content-list" id="contentList"></div>`;
    document.getElementById('emptyTrashBtn')?.addEventListener('click', emptyTrash);
    const listDiv = document.getElementById('contentList');
    if (!list.length) { listDiv.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`; return; }
    list.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const card = document.createElement('div'); card.className = 'med-card';
        card.innerHTML = `<div class="med-info">${thumb}<div class="med-text"><div class="med-name">💊 ${escapeHtml(med.name)}</div></div></div><div><button class="restore-btn small-btn" data-id="${med.id}">${t('restore')}</button><button class="delete-permanently-btn small-btn danger-btn" data-id="${med.id}">${t('delete_permanently')}</button></div>`;
        card.querySelector('.restore-btn')?.addEventListener('click', e => { e.stopPropagation(); restoreFromDeleted(med.id); });
        card.querySelector('.delete-permanently-btn')?.addEventListener('click', e => { e.stopPropagation(); permanentlyDelete(med.id); });
        listDiv.appendChild(card);
    });
}

function handleTouchStart(e, id, card) { if(selectionMode) return; longPressTimer = setTimeout(() => { selectionMode = true; touchSelectionActive = true; document.querySelectorAll('.med-card .checkbox').forEach(cb => cb.style.display = 'flex'); document.querySelectorAll('.med-card').forEach(c => c.classList.add('selection-mode')); toggleSelectMed(id); updateSelectionButtons(); }, 800); }
function handleTouchMove(e) { if(!touchSelectionActive) return; const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY); const card = el?.closest('.med-card'); if(card){ const id = parseInt(card.getAttribute('data-id')); if(!selectedMeds.has(id)) toggleSelectMed(id); } }
function handleTouchEnd() { clearTimeout(longPressTimer); touchSelectionActive = false; }
function toggleSelectMed(id) { if(selectedMeds.has(id)) selectedMeds.delete(id); else selectedMeds.add(id); const card = document.querySelector(`.med-card[data-id="${id}"]`); if(card) card.classList.toggle('selected', selectedMeds.has(id)); updateBatchDeleteButton(); updateSelectionButtons(); if(selectedMeds.size===0){ selectionMode=false; document.querySelectorAll('.med-card .checkbox').forEach(cb=>cb.style.display='none'); document.querySelectorAll('.med-card').forEach(c=>c.classList.remove('selection-mode')); } }
function updateBatchDeleteButton() { const del = document.getElementById('batchDeleteBtn'); if(del) del.style.display = selectedMeds.size ? 'inline-flex' : 'none'; const add = document.getElementById('batchAddToPharmacyBtn'); if(add) add.style.display = selectedMeds.size ? 'inline-flex' : 'none'; }
function updateSelectionButtons() { const sel = document.getElementById('selectAllBtn'); const desel = document.getElementById('deselectAllBtn'); const has = document.querySelectorAll('.med-card').length>0; if(sel) sel.style.display = has && selectionMode ? 'inline-flex' : 'none'; if(desel) desel.style.display = has && selectedMeds.size ? 'inline-flex' : 'none'; }
function selectAllMeds() { document.querySelectorAll('.med-card').forEach(c => { const id = parseInt(c.getAttribute('data-id')); if(!selectedMeds.has(id)) toggleSelectMed(id); }); }
function deselectAllMeds() { document.querySelectorAll('.med-card').forEach(c => { const id = parseInt(c.getAttribute('data-id')); if(selectedMeds.has(id)) toggleSelectMed(id); }); }
async function batchDelete() { if(!selectedMeds.size) return; if(confirm(t('batch_delete_confirm', selectedMeds.size))){ showLoading('جاري الحذف...'); try{ for(let id of selectedMeds){ const m = await db.meds.get(id); if(m) await db.deletedMeds.add(m); await db.meds.delete(id); } selectedMeds.clear(); selectionMode=false; document.querySelectorAll('.med-card .checkbox').forEach(cb=>cb.style.display='none'); refreshCurrentPage(); updateBarChart(); } finally{ hideLoading(); } } }
async function batchAddToPharmacy() { if(!selectedMeds.size) return; const medicines = []; for(let id of selectedMeds){ const m = await db.meds.get(id); if(m) medicines.push(m); } if(!medicines.length) return; const modalHtml = `<div id="batchExpiryModal" class="modal" style="display:flex;"><div class="modal-content"><h3>${t('add_selected_to_pharmacy')}</h3><div id="batchExpiryList"></div><div class="modal-buttons"><button id="batchExpiryConfirmBtn" class="primary-btn">${t('save')}</button><button id="batchExpiryCancelBtn" class="cancel-btn">${t('cancel')}</button></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const listDiv = document.getElementById('batchExpiryList');
    medicines.forEach(med => { listDiv.innerHTML += `<div class="batch-expiry-item"><span>${escapeHtml(med.name)}</span><input type="date" class="batch-expiry-date" value="${new Date(Date.now()+30*86400000).toISOString().slice(0,10)}"></div>`; });
    const confirm = document.getElementById('batchExpiryConfirmBtn');
    const cancel = document.getElementById('batchExpiryCancelBtn');
    const close = () => document.getElementById('batchExpiryModal')?.remove();
    confirm.addEventListener('click', async () => {
        showLoading('جاري الإضافة...');
        try {
            let added = 0;
            for(let i=0; i<medicines.length; i++) {
                const med = medicines[i];
                const expiry = document.querySelectorAll('.batch-expiry-date')[i].value;
                if(!expiry) continue;
                const newMed = { name: med.name, expiry, scientificName: med.scientificName||'', company: med.company||'', origin: med.origin||'', type: MED_TYPES.PHARMACY, category: med.category||'', barcode: med.barcode||'', image: med.image||null, dosageForm: med.dosageForm||'', dosage: med.dosage||'', createdAt: new Date().toISOString() };
                await db.meds.add(newMed);
                await addMedicineToGeneralIfNotExists(newMed);
                added++;
            }
            if(added){ const toast = document.createElement('div'); toast.className = 'offline-toast'; toast.innerText = t('batch_add_success') + ` (${added})`; document.body.appendChild(toast); setTimeout(()=>toast.remove(),2000); refreshCurrentPage(); }
        } finally { hideLoading(); close(); }
    });
    cancel.addEventListener('click', close);
}

function renderHome() {
    const container = document.getElementById('pageContent');
    container.innerHTML = `<div class="dashboard-search"><div class="search-wrapper"><input type="text" id="dashboardSearch" placeholder="${t('search_placeholder')}"><button class="search-btn">${t('search_btn')}</button></div><div id="suggestionsBox" class="suggestions-list"></div></div><div class="chart-container"><canvas id="expiryBarChart"></canvas></div><div class="main-buttons"><button class="main-btn" data-page="all">${t('all_medicines')}</button><button class="main-btn" data-page="pharmacy">${t('pharmacy_medicines')}</button><button class="main-btn" data-page="categories">${t('therapeutic_categories')}</button><button class="main-btn" data-page="companies">${t('international_companies')}</button><button class="main-btn" data-page="expiring">${t('expiring_soon')}</button></div><div id="stats"></div>`;
    document.querySelectorAll('.main-btn').forEach(btn => btn.addEventListener('click', () => switchPage(btn.dataset.page)));
    const search = document.getElementById('dashboardSearch');
    if(search) enhanceSearchInput(search, 'all');
    updateBarChart();
    showStats();
    showFirstTimeGuidance();
}
async function updateBarChart() {
    const ctx = document.getElementById('expiryBarChart')?.getContext('2d');
    if(!ctx) return;
    const meds = await db.meds.toArray();
    const expired = meds.filter(m=>getDaysRemaining(m.expiry)<0).length;
    const soon = meds.filter(m=>{const d=getDaysRemaining(m.expiry); return d>=0 && d<=30;}).length;
    const later = meds.length - expired - soon;
    if(chart) chart.destroy();
    chart = new Chart(ctx, { type: 'bar', data: { labels: [t('expired'), t('expiring_30'), (currentLang==='ar'?'أكثر من 30 يوم':'More than 30 days')], datasets: [{ label: t('total'), data: [expired, soon, later], backgroundColor: ['#e76f51','#f4a261','#2c7da0'], borderRadius: 8 }] }, options: { responsive: true } });
}
async function showStats() {
    const meds = await db.meds.toArray();
    const total = meds.length, expired = meds.filter(m=>getDaysRemaining(m.expiry)<0).length, exp30 = meds.filter(m=>{const d=getDaysRemaining(m.expiry); return d>=0&&d<=30;}).length, ph = meds.filter(m=>m.type===MED_TYPES.PHARMACY).length;
    const statsDiv = document.getElementById('stats');
    if(statsDiv) statsDiv.innerHTML = `<div class="stats-box"><div>${t('total')}: <strong>${total}</strong></div><div>${t('pharmacy_count')}: <strong>${ph}</strong></div><div>${t('expired')}: <strong style="color:var(--danger)">${expired}</strong></div><div>${t('expiring_30')}: <strong style="color:var(--warning)">${exp30}</strong></div></div>`;
}

async function renderAllMedicines() {
    typeFilter = MED_TYPES.GENERAL;
    const container = document.getElementById('pageContent');
    container.innerHTML = `<div class="search-container"><div class="search-wrapper"><input type="text" id="search" placeholder="${t('search_placeholder')}"><button class="search-btn">${t('search_btn')}</button></div><div id="suggestionsBox" class="suggestions-list"></div></div><div class="filters-bar"><select id="sortBy"><option value="expiry_asc">${t('closest_expiry')}</option><option value="expiry_desc">${t('farthest_expiry')}</option><option value="name_asc">${t('name_asc')}</option><option value="name_desc">${t('name_desc')}</option><option value="date_desc">${t('newest_first')}</option></select><button id="barcodeSearchBtn" class="small-btn">${t('barcode_search')}</button><button id="selectAllBtn" class="select-all-btn" style="display:none">${t('select_all')}</button><button id="deselectAllBtn" class="deselect-all-btn" style="display:none">${t('deselect_all')}</button><button id="batchAddToPharmacyBtn" style="display:none">${t('batch_add_to_pharmacy')}</button><button id="batchDeleteBtn" style="display:none">${t('batch_delete')}</button><button id="addGeneralMedBtn" class="plus-icon-btn">${t('add_med')}</button></div><div class="content-list" id="contentList"></div><div id="stats"></div>`;
    document.getElementById('sortBy').value = sortBy;
    document.getElementById('sortBy').addEventListener('change', e => { sortBy = e.target.value; refreshCurrentPage(); });
    document.getElementById('barcodeSearchBtn')?.addEventListener('click', () => startScannerForSearch());
    document.getElementById('batchDeleteBtn')?.addEventListener('click', batchDelete);
    document.getElementById('selectAllBtn')?.addEventListener('click', selectAllMeds);
    document.getElementById('deselectAllBtn')?.addEventListener('click', deselectAllMeds);
    document.getElementById('batchAddToPharmacyBtn')?.addEventListener('click', batchAddToPharmacy);
    document.getElementById('addGeneralMedBtn')?.addEventListener('click', showAddGeneralFormModal);
    const searchInput = document.getElementById('search');
    if(searchInput) enhanceSearchInput(searchInput, 'all');
    const list = await getFilteredAndSorted();
    await renderMedicationsWithPagination(list, true);
    showStats();
}

async function renderPharmacyMedicines() {
    typeFilter = MED_TYPES.PHARMACY;
    const container = document.getElementById('pageContent');
    container.innerHTML = `<div class="search-container"><div class="search-wrapper"><input type="text" id="search" placeholder="${t('search_placeholder')}"><button class="search-btn">${t('search_btn')}</button></div><div id="suggestionsBox" class="suggestions-list"></div></div><div class="filters-bar"><select id="sortBy"><option value="expiry_asc">${t('closest_expiry')}</option><option value="expiry_desc">${t('farthest_expiry')}</option><option value="name_asc">${t('name_asc')}</option><option value="name_desc">${t('name_desc')}</option><option value="date_desc">${t('newest_first')}</option></select><button id="barcodeSearchBtn" class="small-btn">${t('barcode_search')}</button><button id="selectAllBtn" style="display:none">${t('select_all')}</button><button id="deselectAllBtn" style="display:none">${t('deselect_all')}</button><button id="batchDeleteBtn" style="display:none">${t('batch_delete')}</button><button id="addMedBtn" class="plus-icon-btn">${t('add_med')}</button><button id="recycleBinBtn">${t('deleted_items')}</button></div><div class="content-list" id="contentList"></div><div id="stats"></div>`;
    document.getElementById('sortBy').value = sortBy;
    document.getElementById('sortBy').addEventListener('change', e => { sortBy = e.target.value; refreshCurrentPage(); });
    document.getElementById('barcodeSearchBtn')?.addEventListener('click', () => startScannerForSearch());
    document.getElementById('batchDeleteBtn')?.addEventListener('click', batchDelete);
    document.getElementById('selectAllBtn')?.addEventListener('click', selectAllMeds);
    document.getElementById('deselectAllBtn')?.addEventListener('click', deselectAllMeds);
    document.getElementById('addMedBtn')?.addEventListener('click', showAddFormModal);
    document.getElementById('recycleBinBtn')?.addEventListener('click', () => switchPage('deleted'));
    const searchInput = document.getElementById('search');
    if(searchInput) enhanceSearchInput(searchInput, 'pharmacy');
    const list = await getFilteredAndSorted();
    await renderMedicationsWithPagination(list, true);
    showStats();
}

// Companies & Categories
function toggleBatchMode() { batchMode = !batchMode; /* same logic but simplified */ }
function toggleSelectCompany(name) { if(selectedCompanies.has(name)) selectedCompanies.delete(name); else selectedCompanies.add(name); const card = document.querySelector(`.company-card[data-company="${escapeHtml(name)}"]`); if(card) card.classList.toggle('selected', selectedCompanies.has(name)); }
function toggleSelectCategory(name) { if(selectedCategories.has(name)) selectedCategories.delete(name); else selectedCategories.add(name); const card = document.querySelector(`.category-card[data-category="${escapeHtml(name)}"]`); if(card) card.classList.toggle('selected', selectedCategories.has(name)); }
async function batchRenameCompanies() { if(!selectedCompanies.size) return; const newName = prompt('الاسم الجديد:'); if(!newName) return; showLoading('...'); try{ await db.transaction('rw', db.meds, db.deletedMeds, async()=>{ for(let old of selectedCompanies){ let meds = await db.meds.where('company').equals(old).toArray(); for(let m of meds) await db.meds.update(m.id, {company: newName}); let del = await db.deletedMeds.where('company').equals(old).toArray(); for(let d of del) await db.deletedMeds.update(d.id, {company: newName}); } }); alert(`تم تغيير ${selectedCompanies.size} شركة`); selectedCompanies.clear(); batchMode=false; renderCompaniesPage(); } catch(e){ alert('خطأ'); } finally{ hideLoading(); } }
async function batchRenameCategories() { if(!selectedCategories.size) return; const newName = prompt('الاسم الجديد:'); if(!newName) return; showLoading('...'); try{ await db.transaction('rw', db.meds, db.deletedMeds, async()=>{ for(let old of selectedCategories){ let meds = await db.meds.where('category').equals(old).toArray(); for(let m of meds) await db.meds.update(m.id, {category: newName}); let del = await db.deletedMeds.where('category').equals(old).toArray(); for(let d of del) await db.deletedMeds.update(d.id, {category: newName}); } }); alert(`تم تغيير ${selectedCategories.size} تصنيف`); selectedCategories.clear(); batchMode=false; renderCategoriesPage(); } catch(e){ alert('خطأ'); } finally{ hideLoading(); } }

async function renderCompaniesPage() {
    if(currentCompany) { await showMedicinesByCompany(currentCompany); return; }
    batchMode=false; selectedCompanies.clear();
    const meds = await db.meds.toArray();
    const map = new Map();
    meds.forEach(m => { if(m.company && m.company.trim()) map.set(m.company, { origin: m.origin||'غير معروف', count: (map.get(m.company)?.count||0)+1 }); });
    let companies = Array.from(map.entries()).map(([n,d])=>({name:n, origin:d.origin, count:d.count}));
    companies.sort((a,b)=>a.name.localeCompare(b.name));
    const container = document.getElementById('pageContent');
    if(!companies.length) { container.innerHTML = `<div class="empty-state">${t('no_companies')}</div>`; return; }
    container.innerHTML = `<div class="search-container"><div class="search-wrapper"><input type="text" id="companySearch" placeholder="بحث..."><button id="searchCompanyBtn" class="search-btn">${t('search_btn')}</button></div><div id="suggestionsBox" class="suggestions-list"></div></div><div class="filters-bar"><label>${t('companies_sort')}</label><select id="companiesSort"><option value="alpha">${t('alphabetical')}</option><option value="count_desc">${t('by_med_count')} ↓</option><option value="count_asc">${t('by_med_count')} ↑</option></select><button id="addCompanyBtn" class="main-btn">إضافة شركة</button><button id="batchModeBtn" class="main-btn" style="background:var(--warning)">تحديد متعدد</button></div><div id="batchActionsBar" class="batch-actions-bar" style="display:none"><button id="batchRenameBtn">تعديل جماعي (0)</button><button id="batchCancelBtn">إلغاء</button></div><div id="companiesList"></div>`;
    const searchInput = document.getElementById('companySearch');
    if(searchInput) enhanceSearchInput(searchInput, 'companies');
    document.getElementById('searchCompanyBtn')?.addEventListener('click', ()=>{ const q=searchInput?.value.trim(); if(q) filterCompanies(q); });
    document.getElementById('companiesSort')?.addEventListener('change', ()=>{ filterCompanies(searchInput?.value||''); });
    document.getElementById('addCompanyBtn')?.addEventListener('click', window.addNewCompany);
    const batchModeBtn = document.getElementById('batchModeBtn');
    const batchBar = document.getElementById('batchActionsBar');
    const renameBtn = document.getElementById('batchRenameBtn');
    const cancelBtn = document.getElementById('batchCancelBtn');
    batchModeBtn?.addEventListener('click', ()=>{
        batchMode = !batchMode;
        if(batchMode){ batchBar.style.display='flex'; batchModeBtn.innerText='إلغاء التحديد'; batchModeBtn.style.background='var(--success)'; renderCompaniesInBatchMode(); }
        else { batchBar.style.display='none'; batchModeBtn.innerText='تحديد متعدد'; batchModeBtn.style.background='var(--warning)'; selectedCompanies.clear(); renderCompaniesPage(); }
    });
    renameBtn?.addEventListener('click', batchRenameCompanies);
    cancelBtn?.addEventListener('click', ()=>{ selectedCompanies.clear(); renameBtn.innerText='تعديل جماعي (0)'; renderCompaniesPage(); });
    await displayCompanies('', 'alpha');
}
async function renderCompaniesInBatchMode() {
    const meds = await db.meds.toArray();
    const map = new Map();
    meds.forEach(m => { if(m.company && m.company.trim()) map.set(m.company, { origin: m.origin||'غير معروف', count: (map.get(m.company)?.count||0)+1 }); });
    let companies = Array.from(map.entries()).map(([n,d])=>({name:n, origin:d.origin, count:d.count}));
    companies.sort((a,b)=>a.name.localeCompare(b.name));
    const container = document.getElementById('companiesList');
    container.innerHTML = `<div class="companies-grid">${companies.map(c=>`<div class="company-card ${selectedCompanies.has(c.name)?'selected':''}" data-company="${escapeHtml(c.name)}"><div>${escapeHtml(c.name)}</div><div>${escapeHtml(c.origin)}</div><div>${t('medicine_count')}: ${c.count}</div><div class="checkbox"></div></div>`).join('')}</div>`;
    document.querySelectorAll('.company-card').forEach(card => {
        card.addEventListener('click', (e) => { e.stopPropagation(); const company = card.getAttribute('data-company'); if(batchMode) { toggleSelectCompany(company); document.getElementById('batchRenameBtn').innerText = `تعديل جماعي (${selectedCompanies.size})`; } else showCompanyMedicines(company); });
    });
}
async function displayCompanies(search, sortType) {
    const meds = await db.meds.toArray();
    const map = new Map();
    meds.forEach(m => { if(m.company && m.company.trim()) map.set(m.company, { origin: m.origin||'غير معروف', count: (map.get(m.company)?.count||0)+1 }); });
    let companies = Array.from(map.entries()).map(([n,d])=>({name:n, origin:d.origin, count:d.count}));
    if(search.trim()) companies = companies.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()));
    if(sortType==='alpha') companies.sort((a,b)=>a.name.localeCompare(b.name));
    else if(sortType==='count_desc') companies.sort((a,b)=>b.count-a.count);
    else if(sortType==='count_asc') companies.sort((a,b)=>a.count-b.count);
    const container = document.getElementById('companiesList');
    if(!companies.length) { container.innerHTML = `<div class="empty-state">${t('no_companies')}</div>`; return; }
    container.innerHTML = `<div class="companies-grid">${companies.map(c=>`<div class="company-card" data-company="${escapeHtml(c.name)}"><div>${escapeHtml(c.name)}</div><div>${escapeHtml(c.origin)}</div><div>${t('medicine_count')}: ${c.count}</div></div>`).join('')}</div>`;
    document.querySelectorAll('.company-card').forEach(card => card.addEventListener('click', () => showCompanyMedicines(card.getAttribute('data-company'))));
}
function filterCompanies(term) { const sort = document.getElementById('companiesSort')?.value||'alpha'; displayCompanies(term, sort); }
function showCompanyMedicines(company) { currentCompany = company; showMedicinesByCompany(company); }
async function showMedicinesByCompany(company) {
    const list = await db.meds.where('company').equals(company).toArray();
    const container = document.getElementById('pageContent');
    container.innerHTML = `<div><button id="backToCompaniesBtn" class="back-to-companies-btn">← ${t('back_to_companies')}</button><h3>${escapeHtml(company)}</h3></div><div class="content-list" id="companyMedsList"></div>`;
    document.getElementById('backToCompaniesBtn')?.addEventListener('click', ()=>{ currentCompany=null; renderCompaniesPage(); });
    const listDiv = document.getElementById('companyMedsList');
    if(!list.length) { listDiv.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`; return; }
    list.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const card = document.createElement('div'); card.className = 'med-card';
        card.innerHTML = `<div class="med-info">${thumb}<div class="med-text"><div class="med-name">💊 ${escapeHtml(med.name)}</div></div></div>`;
        const delBtn = document.createElement('button'); delBtn.className = 'delete-button'; delBtn.innerHTML = `<div class="trash-bin-icon"><div class="bin-lid"></div><div class="bin-container"><div class="bin-line"></div><div class="bin-line"></div></div></div>`;
        delBtn.addEventListener('click', (e) => { e.stopPropagation(); if(confirm(t('delete_confirm'))) moveToDeleted(med.id); });
        card.appendChild(delBtn);
        card.addEventListener('click', () => showMedDetails(med));
        listDiv.appendChild(card);
    });
}
async function renderCategoriesPage() {
    const meds = await db.meds.toArray();
    const catsMap = new Map();
    meds.forEach(m => { if(m.category && m.category.trim()) catsMap.set(m.category, (catsMap.get(m.category)||0)+1); });
    const cats = Array.from(catsMap.keys()).sort((a,b)=>a.localeCompare(b));
    const container = document.getElementById('pageContent');
    if(!cats.length) { container.innerHTML = `<div class="empty-state">${t('no_categories')}</div>`; return; }
    container.innerHTML = `<div class="filters-bar"><button id="addCategoryBtn" class="main-btn">إضافة تصنيف</button><button id="batchModeCategoriesBtn" class="main-btn" style="background:var(--warning)">تحديد متعدد</button></div><div id="batchActionsCategoriesBar" class="batch-actions-bar" style="display:none"><button id="batchRenameCategoriesBtn">تعديل جماعي (0)</button><button id="batchCancelCategoriesBtn">إلغاء</button></div><div class="categories-grid" id="categoriesGrid"></div>`;
    document.getElementById('addCategoryBtn')?.addEventListener('click', addNewCategoryForList);
    const batchBtn = document.getElementById('batchModeCategoriesBtn');
    const batchBar = document.getElementById('batchActionsCategoriesBar');
    const renameBtn = document.getElementById('batchRenameCategoriesBtn');
    const cancelBtn = document.getElementById('batchCancelCategoriesBtn');
    batchBtn?.addEventListener('click', ()=>{
        batchMode = !batchMode;
        if(batchMode){ batchBar.style.display='flex'; batchBtn.innerText='إلغاء التحديد'; batchBtn.style.background='var(--success)'; renderCategoriesInBatchMode(cats, catsMap); }
        else { batchBar.style.display='none'; batchBtn.innerText='تحديد متعدد'; batchBtn.style.background='var(--warning)'; selectedCategories.clear(); renderCategoriesPage(); }
    });
    renameBtn?.addEventListener('click', batchRenameCategories);
    cancelBtn?.addEventListener('click', ()=>{ selectedCategories.clear(); renameBtn.innerText='تعديل جماعي (0)'; renderCategoriesPage(); });
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = cats.map(c => `<div class="category-card" data-category="${escapeHtml(c)}"><div>${escapeHtml(c)}</div><div>${t('medicine_count')}: ${catsMap.get(c)}</div></div>`).join('');
    grid.querySelectorAll('.category-card').forEach(card => card.addEventListener('click', async () => {
        if(batchMode){ const cat = card.getAttribute('data-category'); toggleSelectCategory(cat); renameBtn.innerText = `تعديل جماعي (${selectedCategories.size})`; }
        else { const cat = card.getAttribute('data-category'); const filtered = (await db.meds.toArray()).filter(m=>m.category===cat); renderMedicationsInList(filtered); }
    }));
}
function renderCategoriesInBatchMode(cats, catsMap) {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = cats.map(c => `<div class="category-card ${selectedCategories.has(c)?'selected':''}" data-category="${escapeHtml(c)}"><div>${escapeHtml(c)}</div><div>${t('medicine_count')}: ${catsMap.get(c)}</div><div class="checkbox"></div></div>`).join('');
    grid.querySelectorAll('.category-card').forEach(card => card.addEventListener('click', (e) => { e.stopPropagation(); const cat = card.getAttribute('data-category'); toggleSelectCategory(cat); document.getElementById('batchRenameCategoriesBtn').innerText = `تعديل جماعي (${selectedCategories.size})`; }));
}
function addNewCategoryForList() { const newCat = prompt('اسم التصنيف الجديد:'); if(newCat && newCat.trim()){ updateCategoriesDatalist('medCategoriesList'); updateCategoriesDatalist('genCategoriesList'); alert(`تمت إضافة "${newCat}"`); renderCategoriesPage(); } }
window.addNewCompany = async function() { const name = prompt('اسم الشركة:'); if(!name) return; const origin = prompt('المنشأ:'); showLoading('...'); try{ await db.meds.add({ name:'___temp___', company:name.trim(), origin:origin||'', type:MED_TYPES.GENERAL, expiry:'9999-12-31', createdAt:new Date().toISOString() }); await db.meds.where('name').equals('___temp___').delete(); alert('تمت الإضافة'); renderCompaniesPage(); } catch(e){ alert('خطأ'); } finally{ hideLoading(); } };
function renderMedicationsInList(list) {
    const container = document.getElementById('pageContent');
    container.innerHTML = `<div class="content-list" id="contentList"></div>`;
    const listDiv = document.getElementById('contentList');
    if(!list.length) { listDiv.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`; return; }
    list.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const card = document.createElement('div'); card.className = 'med-card';
        card.innerHTML = `<div class="med-info">${thumb}<div class="med-text"><div class="med-name">💊 ${escapeHtml(med.name)}</div></div></div>`;
        const delBtn = document.createElement('button'); delBtn.className = 'delete-button'; delBtn.innerHTML = `<div class="trash-bin-icon"><div class="bin-lid"></div><div class="bin-container"><div class="bin-line"></div><div class="bin-line"></div></div></div>`;
        delBtn.addEventListener('click', (e) => { e.stopPropagation(); if(confirm(t('delete_confirm'))) moveToDeleted(med.id); });
        card.appendChild(delBtn);
        card.addEventListener('click', () => showMedDetails(med));
        listDiv.appendChild(card);
    });
}
async function renderExpiringSoonPage() {
    const notificationDays = parseInt(localStorage.getItem('notificationDays')||'7');
    const list = (await db.meds.toArray()).filter(m => { const d=getDaysRemaining(m.expiry); return d>=0 && d<=notificationDays; });
    const container = document.getElementById('pageContent');
    container.innerHTML = `<div class="search-container"><div class="search-wrapper"><input type="text" id="search" placeholder="${t('search_placeholder')}"><button class="search-btn">${t('search_btn')}</button></div><div id="suggestionsBox" class="suggestions-list"></div></div><div class="content-list" id="contentList"></div>`;
    const searchInput = document.getElementById('search');
    if(searchInput) enhanceSearchInput(searchInput, 'expiring');
    await renderMedicationsWithPagination(list, true);
}
async function renderInbox() {
    const notifs = await db.notifications.orderBy('date').reverse().toArray();
    const container = document.getElementById('pageContent');
    if(!notifs.length) { container.innerHTML = `<div class="empty-state">${t('no_notifications')}</div>`; return; }
    container.innerHTML = notifs.map(n => `<div class="notification-item"><div>${escapeHtml(n.message)}</div><div class="notification-date">${new Date(n.date).toLocaleString()}</div></div>`).join('');
    await db.notifications.where('read').equals(false).modify({read:true});
    updateNotifBadge();
}
async function renderExplore() {
    const container = document.getElementById('pageContent');
    container.innerHTML = `<div class="explore-tabs"><button class="tab-btn active" data-tab="categories">${t('categories')}</button><button class="tab-btn" data-tab="companies">${t('companies')}</button><button class="tab-btn" data-tab="expiring">${t('expiring_soon')}</button></div><div id="tab-categories" class="tab-content active"></div><div id="tab-companies" class="tab-content"></div><div id="tab-expiring" class="tab-content"></div>`;
    const cats = [...new Set((await db.meds.toArray()).map(m=>m.category).filter(c=>c))];
    const catsDiv = document.getElementById('tab-categories');
    catsDiv.innerHTML = cats.length ? `<div class="categories-grid">${cats.map(c=>`<div class="category-card" data-category="${escapeHtml(c)}">${escapeHtml(c)}</div>`).join('')}</div>` : `<div class="empty-state">${t('no_categories')}</div>`;
    catsDiv.querySelectorAll('.category-card').forEach(card => card.addEventListener('click', async () => { const cat = card.getAttribute('data-category'); const filtered = (await db.meds.toArray()).filter(m=>m.category===cat); renderMedicationsInExplore(filtered, catsDiv); }));
    const comps = [...new Set((await db.meds.toArray()).map(m=>m.company).filter(c=>c&&c.trim()))];
    const compsDiv = document.getElementById('tab-companies');
    compsDiv.innerHTML = comps.length ? `<div class="companies-grid">${comps.map(c=>`<div class="company-card" data-company="${escapeHtml(c)}">${escapeHtml(c)}</div>`).join('')}</div>` : `<div class="empty-state">${t('no_companies')}</div>`;
    compsDiv.querySelectorAll('.company-card').forEach(card => card.addEventListener('click', async () => { const comp = card.getAttribute('data-company'); const filtered = (await db.meds.toArray()).filter(m=>m.company===comp); renderMedicationsInExplore(filtered, compsDiv); }));
    const soon = (await db.meds.toArray()).filter(m=>getDaysRemaining(m.expiry)<=7);
    const expDiv = document.getElementById('tab-expiring');
    expDiv.innerHTML = soon.length ? `<div class="content-list"></div>` : `<div class="empty-state">${t('no_meds')}</div>`;
    if(soon.length) renderMedicationsInExplore(soon, expDiv);
    document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', ()=>{
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(tc=>tc.classList.remove('active'));
        document.getElementById(`tab-${btn.dataset.tab}`)?.classList.add('active');
    }));
}
function renderMedicationsInExplore(list, parent) {
    const container = parent.querySelector('.content-list');
    if(!container) return;
    if(!list.length) { container.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`; return; }
    container.innerHTML = '';
    list.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const card = document.createElement('div'); card.className = 'med-card';
        card.innerHTML = `<div class="med-info">${thumb}<div class="med-text"><div class="med-name">💊 ${escapeHtml(med.name)}</div></div></div>`;
        const delBtn = document.createElement('button'); delBtn.className = 'delete-button'; delBtn.innerHTML = `<div class="trash-bin-icon"><div class="bin-lid"></div><div class="bin-container"><div class="bin-line"></div><div class="bin-line"></div></div></div>`;
        delBtn.addEventListener('click', (e) => { e.stopPropagation(); if(confirm(t('delete_confirm'))) moveToDeleted(med.id); });
        card.appendChild(delBtn);
        card.addEventListener('click', () => showMedDetails(med));
        container.appendChild(card);
    });
}

// Camera
async function requestCameraPermission() { try { const s = await navigator.mediaDevices.getUserMedia({video:true}); s.getTracks().forEach(t=>t.stop()); return true; } catch(e){ return false; } }
async function startBarcodeScanner(targetId) {
    const modal = document.getElementById('barcodeScannerModal');
    const video = document.getElementById('scannerVideo');
    const result = document.getElementById('scannerResult');
    if(!modal||!video) return;
    const ok = await requestCameraPermission();
    if(!ok){ alert('لا يمكن الوصول للكاميرا'); return; }
    modal.setAttribute('data-target', targetId);
    modal.style.display = 'flex';
    result.innerHTML = 'جاري تشغيل الكاميرا...';
    if(currentScanner) try{ currentScanner.stop(); }catch(e){}
    Quagga.init({ inputStream: { name:"Live", type:"LiveStream", target:video, constraints:{ facingMode:"environment" } }, decoder:{ readers:["ean_reader","ean_8_reader","code_128_reader","code_39_reader","upc_reader"] }, locate:true }, (err)=>{
        if(err){ result.innerHTML = 'خطأ في الكاميرا'; alert('تعذر فتح الكاميرا'); return; }
        Quagga.start(); currentScanner = Quagga; result.innerHTML = 'انتظر المسح...';
        document.getElementById('manualBarcodeBtn').style.display = 'inline-block';
    });
    Quagga.onDetected(data => { const code = data.codeResult.code; result.innerHTML = `تم مسح: ${code}`; Quagga.stop(); currentScanner = null; modal.style.display = 'none'; document.getElementById(targetId).value = code; });
}
async function startScannerForSearch() {
    const modal = document.getElementById('barcodeScannerModal');
    const video = document.getElementById('scannerVideo');
    const result = document.getElementById('scannerResult');
    if(!modal||!video) return;
    const ok = await requestCameraPermission();
    if(!ok){ alert('لا يمكن الوصول للكاميرا'); return; }
    modal.style.display = 'flex';
    result.innerHTML = 'جاري تشغيل الكاميرا...';
    if(currentScanner) try{ currentScanner.stop(); }catch(e){}
    Quagga.init({ inputStream: { name:"Live", type:"LiveStream", target:video, constraints:{ facingMode:"environment" } }, decoder:{ readers:["ean_reader","ean_8_reader","code_128_reader","code_39_reader","upc_reader"] }, locate:true }, (err)=>{
        if(err){ result.innerHTML = 'خطأ'; alert('تعذر فتح الكاميرا'); return; }
        Quagga.start(); currentScanner = Quagga; result.innerHTML = 'انتظر المسح...';
        document.getElementById('manualBarcodeBtn').style.display = 'inline-block';
    });
    Quagga.onDetected(async data => { const code = data.codeResult.code; result.innerHTML = `تم مسح: ${code}`; Quagga.stop(); currentScanner = null; modal.style.display = 'none'; const med = await db.meds.where('barcode').equals(code).first(); if(med) showMedDetails(med); else alert('لم يتم العثور على دواء'); });
}
function stopScannerAndClose() { if(currentScanner) try{ currentScanner.stop(); }catch(e){} currentScanner = null; document.getElementById('barcodeScannerModal').style.display = 'none'; }

async function addToPharmacy(med) {
    const exists = await db.meds.where('type').equals(MED_TYPES.PHARMACY).and(m=>m.name===med.name && m.company===med.company && m.dosageForm===med.dosageForm && m.dosage===med.dosage).count();
    if(exists && !confirm(t('medicine_exists_in_pharmacy'))) return;
    const expiry = prompt(t('add_expiry'), new Date(Date.now()+30*86400000).toISOString().slice(0,10));
    if(!expiry) return;
    const newMed = { name:med.name, expiry, scientificName:med.scientificName||'', company:med.company||'', origin:med.origin||'', type:MED_TYPES.PHARMACY, category:med.category||'', barcode:med.barcode||'', image:med.image||null, dosageForm:med.dosageForm||'', dosage:med.dosage||'', createdAt:new Date().toISOString() };
    await db.meds.add(newMed);
    await addMedicineToGeneralIfNotExists(newMed);
    const toast = document.createElement('div'); toast.className = 'offline-toast'; toast.innerText = t('added_to_pharmacy'); document.body.appendChild(toast); setTimeout(()=>toast.remove(),2000);
    refreshCurrentPage();
}

function showAddFormModal() {
    isEditing=false;
    document.getElementById('medFormTitle').innerText = t('add_med');
    document.getElementById('submitMedBtn').innerText = t('save_med');
    document.getElementById('medName').value = '';
    document.getElementById('scientificName').value = '';
    document.getElementById('company').value = '';
    document.getElementById('origin').value = '';
    document.getElementById('medCategory').value = '';
    document.getElementById('dosageForm').value = '';
    document.getElementById('dosage').value = '';
    document.getElementById('medBarcode').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('medImage').value = '';
    const def = parseInt(localStorage.getItem('defaultExpiryPeriod')||'365');
    const e1 = document.getElementById('medExpiry1');
    const e2 = document.getElementById('medExpiry2');
    const e3 = document.getElementById('medExpiry3');
    if(def>0){ const d = new Date(); d.setDate(d.getDate()+def); const ds = d.toISOString().slice(0,10); e1.value = ds; e2.value = ''; e3.value = ''; }
    else { e1.value = ''; e2.value = ''; e3.value = ''; }
    updateCategoriesDatalist('medCategoriesList');
    openModal('medFormModal');
}
function showEditFormModal(med) {
    isEditing=true; currentMed=med;
    document.getElementById('medFormTitle').innerText = t('edit_med');
    document.getElementById('submitMedBtn').innerText = t('save_med');
    document.getElementById('medName').value = med.name;
    document.getElementById('scientificName').value = med.scientificName||'';
    document.getElementById('company').value = med.company||'';
    document.getElementById('origin').value = med.origin||'';
    document.getElementById('medCategory').value = med.category||'';
    document.getElementById('dosageForm').value = med.dosageForm||'';
    document.getElementById('dosage').value = med.dosage||'';
    document.getElementById('medExpiry1').value = med.expiry;
    document.getElementById('medExpiry2').value = '';
    document.getElementById('medExpiry3').value = '';
    document.getElementById('medBarcode').value = med.barcode||'';
    const prev = document.getElementById('imagePreview');
    if(prev) prev.innerHTML = med.image ? `<img src="${med.image}" style="max-width:100%">` : '';
    updateCategoriesDatalist('medCategoriesList');
    openModal('medFormModal');
}
async function saveMedFromForm() {
    showLoading('جاري الحفظ...');
    try{
        const name = document.getElementById('medName').value.trim();
        const e1 = document.getElementById('medExpiry1').value;
        const e2 = document.getElementById('medExpiry2').value;
        const e3 = document.getElementById('medExpiry3').value;
        const expiries = [e1,e2,e3].filter(e=>e&&e.trim());
        if(!name || !expiries.length){ alert('الاسم وتاريخ الانتهاء مطلوبان'); return; }
        const base = { name, scientificName: document.getElementById('scientificName').value.trim(), company: document.getElementById('company').value.trim(), origin: document.getElementById('origin').value.trim(), type: MED_TYPES.PHARMACY, category: document.getElementById('medCategory').value, dosageForm: document.getElementById('dosageForm').value.trim(), dosage: document.getElementById('dosage').value.trim(), barcode: document.getElementById('medBarcode').value.trim(), image: null, createdAt: new Date().toISOString() };
        const file = document.getElementById('medImage').files[0];
        const saveOrUpdate = async (data) => {
            if(isEditing){ delete data.createdAt; data.id = currentMed.id; await db.meds.update(currentMed.id, data); closeMedFormModal(); refreshCurrentPage(); updateBarChart(); alert('تم التعديل'); }
            else { for(let ex of expiries){ const m = {...data, expiry:ex}; await db.meds.add(m); await addMedicineToGeneralIfNotExists(m); } closeMedFormModal(); refreshCurrentPage(); updateBarChart(); alert('تمت الإضافة'); }
        };
        if(file){ const reader = new FileReader(); reader.onload = async e=>{ base.image = e.target.result; await saveOrUpdate(base); }; reader.readAsDataURL(file); }
        else { if(isEditing && currentMed.image) base.image = currentMed.image; await saveOrUpdate(base); }
    }catch(e){ console.error(e); alert('خطأ'); } finally{ hideLoading(); }
}
function closeMedFormModal() { closeModal('medFormModal'); }
function showAddGeneralFormModal() {
    document.getElementById('generalFormTitle').innerText = t('add_med');
    document.getElementById('submitGeneralBtn').innerText = t('save_med');
    document.getElementById('genName').value = '';
    document.getElementById('genScientificName').value = '';
    document.getElementById('genCompany').value = '';
    document.getElementById('genOrigin').value = '';
    document.getElementById('genCategory').value = '';
    document.getElementById('genDosageForm').value = '';
    document.getElementById('genDosage').value = '';
    document.getElementById('genBarcode').value = '';
    document.getElementById('genImagePreview').innerHTML = '';
    document.getElementById('genImage').value = '';
    updateCategoriesDatalist('genCategoriesList');
    openModal('generalFormModal');
}
async function saveGeneralMedFromForm() {
    showLoading('جاري الحفظ...');
    try{
        const name = document.getElementById('genName').value.trim();
        if(!name){ alert('الاسم مطلوب'); return; }
        const data = { name, scientificName: document.getElementById('genScientificName').value.trim(), company: document.getElementById('genCompany').value.trim(), origin: document.getElementById('genOrigin').value.trim(), type: MED_TYPES.GENERAL, category: document.getElementById('genCategory').value, dosageForm: document.getElementById('genDosageForm').value.trim(), dosage: document.getElementById('genDosage').value.trim(), barcode: document.getElementById('genBarcode').value.trim(), expiry: '9999-12-31', image: null, createdAt: new Date().toISOString() };
        const file = document.getElementById('genImage').files[0];
        const save = async (d) => { await db.meds.add(d); closeGeneralFormModal(); refreshCurrentPage(); updateBarChart(); alert('تمت الإضافة'); };
        if(file){ const reader = new FileReader(); reader.onload = e=>{ data.image = e.target.result; save(data); }; reader.readAsDataURL(file); }
        else await save(data);
    }catch(e){ console.error(e); alert('خطأ'); } finally{ hideLoading(); }
}
function closeGeneralFormModal() { closeModal('generalFormModal'); }
async function updateCategoriesDatalist(id) {
    const datalist = document.getElementById(id);
    if(!datalist) return;
    const meds = await db.meds.toArray();
    const cats = new Set(meds.map(m=>m.category).filter(c=>c));
    ['مضادات حيوية','مسكنات','أدوية الضغط','فيتامينات','أخرى'].forEach(c=>cats.add(c));
    datalist.innerHTML = Array.from(cats).map(c=>`<option value="${escapeHtml(c)}">`).join('');
}
window.addNewCategory = function(inputId) {
    const newCat = prompt('اسم التصنيف الجديد:');
    if(newCat && newCat.trim()){ document.getElementById(inputId).value = newCat.trim(); updateCategoriesDatalist('medCategoriesList'); updateCategoriesDatalist('genCategoriesList'); }
};

// Settings
function openSettingsModal() { renderSettingsMainMenu(); openModal('settingsModal'); }
function renderSettingsMainMenu() {
    const container = document.getElementById('settingsContent');
    container.innerHTML = `<div class="settings-menu">${['language','darkmode','notify','defaultExpiry','searchHistory','backupRestore','exportCSVPDF','about'].map(p=>`<div class="settings-menu-item" data-page="${p}"><div class="settings-menu-icon">${p==='language'?'🌐':p==='darkmode'?'🌙':p==='notify'?'⏰':p==='defaultExpiry'?'📅':p==='searchHistory'?'🔍':p==='backupRestore'?'💾':p==='exportCSVPDF'?'📄':'ℹ️'}</div><div class="settings-menu-text">${t(p==='exportCSVPDF'?'export_csv':p)}</div><div class="settings-menu-arrow">→</div></div>`).join('')}</div>`;
    container.querySelectorAll('.settings-menu-item').forEach(item => item.addEventListener('click', () => renderSettingsPage(item.dataset.page)));
}
function renderSettingsPage(page) {
    const container = document.getElementById('settingsContent');
    let html = `<div class="settings-page"><div class="settings-page-header"><button class="settings-back-btn">←</button><div class="settings-page-title">${t(page==='exportCSVPDF'?'export_csv':page)}</div></div><div class="settings-page-content">`;
    if(page==='language') html += `<select id="langSelectSettings"><option value="ar" ${currentLang==='ar'?'selected':''}>العربية</option><option value="en" ${currentLang==='en'?'selected':''}>English</option></select><button id="applyLangSettingsBtn" class="small-btn">${t('save')}</button>`;
    else if(page==='darkmode') html += `<button id="darkModeSettingsBtn" class="small-btn">${document.body.classList.contains('dark')?'إيقاف':'تشغيل'}</button>`;
    else if(page==='notify') html += `<input type="number" id="notificationDaysSettings" min="1" max="90" value="${localStorage.getItem('notificationDays')||'7'}"><button id="saveNotificationDaysSettingsBtn" class="small-btn">${t('save')}</button>`;
    else if(page==='defaultExpiry') html += `<select id="defaultExpiryPeriodSettings"><option value="365">${t('one_year')}</option><option value="730">${t('two_years')}</option><option value="1095">${t('three_years')}</option><option value="1825">${t('five_years')}</option><option value="0">${t('manual')}</option></select><button id="saveDefaultExpirySettingsBtn" class="small-btn">${t('save')}</button>`;
    else if(page==='searchHistory') html += `<div id="searchHistoryPageContent"></div>`;
    else if(page==='backupRestore') html += `<div><button id="exportGeneralSettingsBtn" class="small-btn">${t('export_db')} (عام)</button><label class="small-btn">${t('import_db')}<input type="file" id="importGeneralSettingsInput" accept=".json" style="display:none"></label><button id="exportPharmacySettingsBtn" class="small-btn">${t('export_db')} (صيدلية)</button><label class="small-btn">${t('import_db')}<input type="file" id="importPharmacySettingsInput" accept=".json" style="display:none"></label></div>`;
    else if(page==='exportCSVPDF') html += `<button id="exportCsvSettingsBtn" class="small-btn">CSV</button><button id="exportPdfSettingsBtn" class="small-btn">PDF</button>`;
    else if(page==='about') html += `<p>${t('about_text')}</p>`;
    html += `</div></div>`;
    container.innerHTML = html;
    container.querySelector('.settings-back-btn')?.addEventListener('click', renderSettingsMainMenu);
    if(page==='language') document.getElementById('applyLangSettingsBtn')?.addEventListener('click',()=>{ changeLanguage(document.getElementById('langSelectSettings').value); renderSettingsPage('language'); });
    else if(page==='darkmode') document.getElementById('darkModeSettingsBtn')?.addEventListener('click',()=>{ toggleDarkMode(); renderSettingsPage('darkmode'); });
    else if(page==='notify') document.getElementById('saveNotificationDaysSettingsBtn')?.addEventListener('click',()=>{ const v=parseInt(document.getElementById('notificationDaysSettings').value); if(v>=1&&v<=90){ localStorage.setItem('notificationDays',v); alert(t('notification_set')); } });
    else if(page==='defaultExpiry') document.getElementById('saveDefaultExpirySettingsBtn')?.addEventListener('click',()=>{ localStorage.setItem('defaultExpiryPeriod', document.getElementById('defaultExpiryPeriodSettings').value); alert(t('default_expiry_set')); });
    else if(page==='searchHistory') renderSearchHistoryInSettingsPage();
    else if(page==='backupRestore'){
        document.getElementById('exportGeneralSettingsBtn')?.addEventListener('click', exportGeneral);
        document.getElementById('importGeneralSettingsInput')?.addEventListener('change', e => importGeneral(e.target.files[0]));
        document.getElementById('exportPharmacySettingsBtn')?.addEventListener('click', exportPharmacy);
        document.getElementById('importPharmacySettingsInput')?.addEventListener('change', e => importPharmacy(e.target.files[0]));
    }
    else if(page==='exportCSVPDF'){
        document.getElementById('exportCsvSettingsBtn')?.addEventListener('click', exportCSV);
        document.getElementById('exportPdfSettingsBtn')?.addEventListener('click', exportPDF);
    }
}
function renderSearchHistoryInSettingsPage() {
    const container = document.getElementById('searchHistoryPageContent');
    if(!container) return;
    const cats = [{key:'all',label:'كل الأدوية'},{key:'pharmacy',label:'أدوية الصيدلية'},{key:'companies',label:'الشركات'},{key:'expiring',label:'المنتهية قريباً'}];
    container.innerHTML = cats.map(c=>`<div><div>${c.label}</div><div>${recentSearches[c.key].map(s=>`<span>${escapeHtml(s)}</span><button data-category="${c.key}" data-term="${escapeHtml(s)}">✖</button>`).join('')||'لا توجد'}</div><button data-clear="${c.key}">مسح الكل</button></div>`).join('');
    container.querySelectorAll('[data-clear]').forEach(btn=>btn.addEventListener('click',()=>{ clearSearchHistory(btn.dataset.clear); renderSearchHistoryInSettingsPage(); }));
    container.querySelectorAll('.delete-history').forEach(btn=>btn.addEventListener('click',()=>{ const cat=btn.dataset.category, term=btn.dataset.term; recentSearches[cat]=recentSearches[cat].filter(s=>s!==term); localStorage.setItem(`recentSearches_${cat}`,JSON.stringify(recentSearches[cat])); renderSearchHistoryInSettingsPage(); refreshCurrentPage(); }));
}

async function exportGeneral() { await exportByType(MED_TYPES.GENERAL, 'general_medicines', true); }
async function exportPharmacy() { await exportByType(MED_TYPES.PHARMACY, 'pharmacy_medicines', false); }
async function exportByType(type, filename, orig=false) {
    showLoading('جاري التصدير...');
    try{
        const meds = await db.meds.where('type').equals(type).toArray();
        let data = orig ? meds.map(m=>({ scientific_name:m.scientificName||'', trade_name:m.name, manufacturer_name:m.company||'', manufacturer_nationality:m.origin||'', Dose:m.dosage||'', "Dosage form":m.dosageForm||'' })) : { meds, type };
        const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
        saveAs(blob, `${filename}_${new Date().toISOString().slice(0,10)}.json`);
    }finally{ hideLoading(); }
}
async function importGeneral(file) { if(!file) return; showLoading('جاري الاستيراد...'); try{ const text=await file.text(); let data = JSON.parse(text); let meds=[]; if(data.meds) meds=data.meds; else if(Array.isArray(data)) meds=data.map(i=>({ name:i.trade_name, scientificName:i.scientific_name||'', company:i.manufacturer_name||'', origin:i.manufacturer_nationality||'', dosageForm:i['Dosage form']||'', dosage:i.Dose||'', category:i.category||'', type:MED_TYPES.GENERAL, expiry:'9999-12-31', createdAt:new Date().toISOString() })); else throw new Error(); meds=meds.filter(m=>!m.type||m.type===MED_TYPES.GENERAL).map(m=>({...m,type:MED_TYPES.GENERAL})); await db.transaction('rw',db.meds,async()=>{ await db.meds.bulkPut(meds); }); alert('تم الاستيراد'); refreshCurrentPage(); updateCategoriesDatalist('medCategoriesList'); updateCategoriesDatalist('genCategoriesList'); }catch(e){ alert('ملف غير صالح'); } finally{ hideLoading(); } }
async function importPharmacy(file) { if(!file) return; showLoading('جاري الاستيراد...'); try{ const text=await file.text(); let data=JSON.parse(text); let meds=data.meds||data; meds=meds.filter(m=>!m.type||m.type===MED_TYPES.PHARMACY).map(m=>({...m,type:MED_TYPES.PHARMACY})); await db.transaction('rw',db.meds,async()=>{ await db.meds.bulkPut(meds); }); alert('تم الاستيراد'); refreshCurrentPage(); }catch(e){ alert('ملف غير صالح'); } finally{ hideLoading(); } }
async function exportCSV() {
    showLoading('جاري تصدير CSV...');
    try{
        const meds=await db.meds.toArray();
        const headers=['الاسم','العلمي','الشركة','المنشأ','النوع','التصنيف','الشكل الدوائي','الجرعة','تاريخ الانتهاء','الباركود','تاريخ الإضافة'];
        const rows=meds.map(m=>[m.name,m.scientificName||'',m.company||'',m.origin||'',m.type===MED_TYPES.PHARMACY?'صيدلية':'عام',m.category||'',m.dosageForm||'',m.dosage||'',m.expiry,m.barcode||'',m.createdAt?new Date(m.createdAt).toLocaleDateString():'']);
        let csv=headers.join(',')+'\n'+rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
        const blob=new Blob(["\uFEFF"+csv],{type:'text/csv;charset=utf-8'});
        saveAs(blob,'pharmacy_export.csv');
    }finally{ hideLoading(); }
}
async function exportPDF() {
    showLoading('جاري تصدير PDF...');
    try{
        const {jsPDF}=window.jspdf;
        const doc=new jsPDF({orientation:'landscape'});
        const meds=await db.meds.toArray();
        const data=meds.map(m=>[m.name,m.scientificName||'',m.company||'',m.dosageForm||'',m.dosage||'',m.expiry,m.barcode||'',m.createdAt?new Date(m.createdAt).toLocaleDateString():'']);
        doc.autoTable({ head:[[t('name'),t('scientific_name'),t('company'),t('dosage_form'),t('dosage'),t('expiry_date'),t('barcode_label'),'تاريخ الإضافة']], body:data, styles:{font:'helvetica',halign:'right'}, startY:20 });
        doc.save('pharmacy_export.pdf');
    }finally{ hideLoading(); }
}

async function checkAndSendExpiryNotifications() {
    const days=parseInt(localStorage.getItem('notificationDays')||'7');
    const meds=await db.meds.toArray();
    const soon=meds.filter(m=>{const d=getDaysRemaining(m.expiry); return d>=0&&d<=days;});
    if(!soon.length) return;
    const now=new Date();
    const toSend=[];
    for(let m of soon){
        const log=await db.notificationLog.where('medId').equals(m.id).first();
        if(!log) toSend.push(m);
        else if((now-new Date(log.lastNotified))/(86400000)>=1) toSend.push(m);
    }
    if(toSend.length && Notification.permission==='granted')
        toSend.forEach(m=>new Notification(`⚠️ ${m.name}`,{body:`ينتهي خلال ${getDaysRemaining(m.expiry)} أيام`}));
    for(let m of toSend){
        const d=getDaysRemaining(m.expiry);
        await db.notifications.add({message:`${m.name} ينتهي خلال ${d} أيام`, date:now, read:false});
        await db.notificationLog.put({medId:m.id, lastNotified:now, count:1});
    }
    updateNotifBadge();
}
async function updateNotifBadge() {
    const cnt=await db.notifications.where('read').equals(false).count();
    const badge=document.getElementById('notifBadge');
    if(badge) badge.style.display=cnt?'flex':'none', badge.innerText=cnt||'';
}

async function showMedDetails(med) {
    currentMed=med;
    const detail=document.getElementById('medDetail');
    // الترتيب: الاسم العلمي، الاسم التجاري، المنشأ، الشركة، الشكل الدوائي، التصنيف، تاريخ الانتهاء (إذا لم تكن كل الأدوية)، الجرعة، الباركود
    detail.innerHTML = `
        <div class="med-detail-item"><div class="med-detail-label">${t('scientific_name')}</div><div class="med-detail-value">${escapeHtml(med.scientificName||'-')}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('name')}</div><div class="med-detail-value">${escapeHtml(med.name)}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('origin')}</div><div class="med-detail-value">${escapeHtml(med.origin||'-')}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('company')}</div><div class="med-detail-value">${escapeHtml(med.company||'-')}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('dosage_form')}</div><div class="med-detail-value">${escapeHtml(med.dosageForm||'-')}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('category')}</div><div class="med-detail-value">${escapeHtml(med.category||'-')}</div></div>
    `;
    if(currentPage !== 'all') detail.insertAdjacentHTML('beforeend', `<div class="med-detail-item"><div class="med-detail-label">${t('expiry_date')}</div><div class="med-detail-value">${escapeHtml(med.expiry)}</div></div>`);
    detail.insertAdjacentHTML('beforeend', `
        <div class="med-detail-item"><div class="med-detail-label">${t('dosage')}</div><div class="med-detail-value">${escapeHtml(med.dosage||'-')}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('barcode_label')}</div><div class="med-detail-value">${escapeHtml(med.barcode||'-')}</div></div>
        ${med.image ? `<div class="med-image"><img src="${med.image}"></div>` : ''}
    `);
    const addBtn=document.getElementById('addToPharmacyBtn');
    if(addBtn) addBtn.style.display = (currentPage==='pharmacy'||currentPage==='companies')?'none':'inline-flex';
    document.getElementById('editMedBtn').onclick = ()=>{ closeModal('medModal'); showEditFormModal(med); };
    document.getElementById('addToPharmacyBtn').onclick = async ()=>{ await addToPharmacy(med); closeModal('medModal'); };
    document.getElementById('deleteMedBtn').onclick = ()=>{ if(confirm(t('delete_confirm'))) moveToDeleted(med.id); closeModal('medModal'); };
    openModal('medModal');
}

function showFirstTimeGuidance() { if(!localStorage.getItem('firstVisit')){ setTimeout(()=>{ const t=document.createElement('div'); t.className='offline-toast'; t.innerText=t('long_press_guide'); document.body.appendChild(t); setTimeout(()=>t.remove(),5000); localStorage.setItem('firstVisit','true'); },1000); } }
function changeLanguage(lang) { currentLang=lang; localStorage.setItem('appLang',lang); updateAllText(); if(currentPage==='home') updateBarChart(); }
function toggleDarkMode() { document.body.classList.toggle('dark'); localStorage.setItem('darkMode',document.body.classList.contains('dark')); if(currentPage==='home') updateBarChart(); }
function clearSearchHistory(key) { recentSearches[key]=[]; localStorage.setItem(`recentSearches_${key}`,'[]'); refreshCurrentPage(); }
function openModal(id) { document.getElementById(id).style.display='flex'; }
function closeModal(id) { document.getElementById(id).style.display='none'; }
function setupModalBackdropClose() { document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{ if(e.target===m) m.style.display='none'; })); }

// Bind globals
window.goHome=goHome; window.switchPage=switchPage; window.openSettingsModal=openSettingsModal; window.closeModal=closeModal;
window.editCurrentMed=function(){ if(currentMed) showEditFormModal(currentMed); };
window.addCurrentToPharmacy=function(){ if(currentMed) addToPharmacy(currentMed); };
window.saveMedFromForm=saveMedFromForm; window.closeMedFormModal=closeMedFormModal;
window.saveGeneralMedFromForm=saveGeneralMedFromForm; window.closeGeneralFormModal=closeGeneralFormModal;
window.startBarcodeScanner=startBarcodeScanner; window.stopScannerAndClose=stopScannerAndClose;
window.showMedDetails=showMedDetails; window.deleteCurrentMed=function(){ if(currentMed && confirm(t('delete_confirm'))) moveToDeleted(currentMed.id); };
window.renderAllMedicines=renderAllMedicines; window.renderPharmacyMedicines=renderPharmacyMedicines; window.renderHome=renderHome;
window.exportCSV=exportCSV; window.exportPDF=exportPDF; window.exportGeneral=exportGeneral; window.exportPharmacy=exportPharmacy;
window.importGeneral=importGeneral; window.importPharmacy=importPharmacy;
window.toggleDarkMode=toggleDarkMode; window.changeLanguage=changeLanguage;
window.selectAllMeds=selectAllMeds; window.deselectAllMeds=deselectAllMeds; window.batchDelete=batchDelete; window.batchAddToPharmacy=batchAddToPharmacy;
window.addNewCategory=addNewCategory; window.addNewCompany=addNewCompany; window.addNewCategoryForList=addNewCategoryForList;
window.handleBackButton=handleBackButton; window.toggleSelectCompany=toggleSelectCompany; window.toggleSelectCategory=toggleSelectCategory;
window.batchRenameCompanies=batchRenameCompanies; window.batchRenameCategories=batchRenameCategories;

setTimeout(()=>{ const ov=document.getElementById('loadingOverlay'); if(ov && ov.style.display==='flex'){ ov.style.display='none'; const pc=document.getElementById('pageContent'); if(pc && !pc.innerHTML.trim()) pc.innerHTML='<div class="empty-state">خطأ، يرجى التحديث</div>'; } },4000);
window.addEventListener('error',()=>hideLoading());
window.addEventListener('unhandledrejection',()=>hideLoading());

document.getElementById('confirmExitBtn')?.addEventListener('click',()=>{ hideExitConfirmation(); if(window.close) window.close(); else alert('لا يمكن الإغلاق'); });
document.getElementById('cancelExitBtn')?.addEventListener('click',hideExitConfirmation);
window.addEventListener('popstate',e=>{ e.preventDefault(); handleBackButton(); });

document.addEventListener('DOMContentLoaded', async()=>{
    await initDemoData();
    if(localStorage.getItem('darkMode')==='true') document.body.classList.add('dark');
    currentLang = localStorage.getItem('appLang')||'ar';
    updateAllText();
    if(Notification.permission==='default') Notification.requestPermission();
    document.getElementById('notifBtn').onclick=()=>switchPage('inbox');
    document.getElementById('settingsHeaderBtn').onclick=openSettingsModal;
    document.getElementById('backBtn').onclick=()=>window.handleBackButton();
    document.getElementById('appTitle').onclick=()=>window.goHome();
    document.getElementById('submitMedBtn').onclick=saveMedFromForm;
    document.getElementById('scanBarcodeBtn').onclick=()=>startBarcodeScanner('medBarcode');
    document.getElementById('medImage').onchange=e=>{ const f=e.target.files[0]; if(f){ const r=new FileReader(); r.onload=ev=>{ const p=document.getElementById('imagePreview'); if(p) p.innerHTML=`<img src="${ev.target.result}" style="max-width:100%">`; }; r.readAsDataURL(f); } };
    document.getElementById('submitGeneralBtn').onclick=saveGeneralMedFromForm;
    document.getElementById('scanBarcodeGenBtn').onclick=()=>startBarcodeScanner('genBarcode');
    document.getElementById('genImage').onchange=e=>{ const f=e.target.files[0]; if(f){ const r=new FileReader(); r.onload=ev=>{ const p=document.getElementById('genImagePreview'); if(p) p.innerHTML=`<img src="${ev.target.result}" style="max-width:100%">`; }; r.readAsDataURL(f); } };
    document.getElementById('closeMedModal').onclick=()=>closeModal('medModal');
    document.getElementById('closeMedFormModal').onclick=closeMedFormModal;
    document.getElementById('closeGeneralFormModal').onclick=closeGeneralFormModal;
    document.getElementById('closeScannerModal').onclick=stopScannerAndClose;
    document.getElementById('closeSettingsModal').onclick=()=>closeModal('settingsModal');
    document.getElementById('cancelMedFormBtn').onclick=closeMedFormModal;
    document.getElementById('cancelGeneralFormBtn').onclick=closeGeneralFormModal;
    document.getElementById('cancelScannerBtn').onclick=stopScannerAndClose;
    document.getElementById('cancelMedBtn').onclick=()=>closeModal('medModal');
    setupModalBackdropClose();
    document.getElementById('manualBarcodeBtn')?.addEventListener('click',()=>{ const bc=prompt('أدخل الباركود يدوياً:'); if(bc){ const target=document.querySelector('#barcodeScannerModal').getAttribute('data-target'); if(target) document.getElementById(target).value=bc; stopScannerAndClose(); } });
    await updateCategoriesDatalist('medCategoriesList');
    await updateCategoriesDatalist('genCategoriesList');
    history.pushState({page:currentPage},'');
    switchPage('home');
    checkAndSendExpiryNotifications();
});
