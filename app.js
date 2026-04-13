// ========== فحص وجود Dexie ==========
if (typeof Dexie === 'undefined') {
    alert('خطأ: مكتبة Dexie لم يتم تحميلها. يرجى التحقق من اتصال الإنترنت وإعادة تحميل الصفحة.');
    console.error('Dexie is not defined - check network connection');
    throw new Error('Dexie not loaded');
}

// ---------- IndexedDB Setup ----------
const db = new Dexie('PharmacyDB');
db.version(1).stores({
    meds: '++id, name, expiry, type, category, company, scientificName, origin, image, barcode, dosageForm, dosage, createdAt',
    deletedMeds: '++id, name, expiry, type, category, company, scientificName, origin, image, barcode, dosageForm, dosage, createdAt',
    notifications: '++id, message, date, read',
    notificationLog: '++id, medId, lastNotified, count'
});

// ---------- Types ----------
const MED_TYPES = {
    GENERAL: 'general',
    PHARMACY: 'pharmacy'
};

// ---------- Loading (مع حل المشكلة) ----------
function showLoading(message = 'جاري التحميل...') {
    console.log('🔵 showLoading:', message);
    const loadingText = document.getElementById('loadingText');
    if (loadingText) loadingText.innerText = message;
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
    
    if (window._loadingTimeout) clearTimeout(window._loadingTimeout);
    window._loadingTimeout = setTimeout(() => {
        console.warn('⚠️ Loading timeout - forcing hide');
        hideLoading();
    }, 5000);
}

function hideLoading() {
    console.log('🟢 hideLoading');
    if (window._loadingTimeout) clearTimeout(window._loadingTimeout);
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

// ---------- Translations ----------
const translations = {
    ar: {
        home_title: 'إدارة صيدليتي',
        inbox_title: 'صندوق الوارد',
        explore_title: 'استكشف',
        settings_title: 'الإعدادات',
        about_app: 'حول التطبيق',
        language: 'اللغة',
        dark_mode: 'الوضع المظلم',
        backup_restore: 'النسخ الاحتياطي والاستعادة',
        export_db: 'تصدير JSON',
        import_db: 'استيراد JSON',
        export_csv: 'تصدير CSV',
        export_pdf: 'تصدير PDF',
        about_text: 'Pharmacy Manager Pro\nنسخة متطورة مع دعم قاعدة بيانات متقدمة، تصدير، إشعارات، وحذف مجمع.',
        save: 'حفظ',
        cancel: 'إلغاء',
        name: 'الاسم',
        search_placeholder: 'بحث...',
        filter_company: 'اسم الشركة',
        sort_by: 'ترتيب حسب',
        closest_expiry: 'الأقرب انتهاء أولاً',
        farthest_expiry: 'الأبعد انتهاء أولاً',
        name_asc: 'اسم (أ-ي)',
        name_desc: 'اسم (ي-أ)',
        newest_first: 'الأحدث أولاً',
        type_all: 'الكل',
        type_pharmacy: 'صيدلية',
        batch_delete: '🗑️ حذف المحدد',
        batch_add_to_pharmacy: 'إضافة المحدد إلى الصيدلية',
        add_med: 'إضافة دواء',
        add_general_med: 'إضافة دواء',
        trade_name: 'الاسم التجاري *',
        scientific_name: 'الاسم العلمي',
        company: 'الشركة',
        origin: 'المنشأ',
        category: 'التصنيف',
        expiry_date: 'تاريخ الانتهاء *',
        save_med: 'حفظ',
        no_meds: 'لا توجد أدوية',
        total: 'إجمالي',
        pharmacy_count: 'صيدلية',
        expired: 'منتهية',
        expiring_30: 'تنتهي خلال 30 يوم',
        categories: 'التصنيفات',
        companies: 'الشركات',
        expiring_soon: 'القريبة',
        no_notifications: 'لا توجد إشعارات',
        no_categories: 'لا توجد تصنيفات',
        no_companies: 'لا توجد شركات',
        delete_confirm: 'تأكيد الحذف؟',
        batch_delete_confirm: n => `حذف ${n} دواء؟`,
        med_details: 'تفاصيل',
        edit_med: 'تعديل',
        delete_med: 'حذف',
        all_medicines: 'كل الأدوية',
        pharmacy_medicines: 'أدوية الصيدلية',
        therapeutic_categories: 'التصنيفات العلاجية',
        international_companies: 'شركات الأدوية',
        search_btn: 'بحث',
        company_search_btn: 'بحث',
        barcode_search: 'بحث بالباركود',
        scan_barcode: 'مسح باركود',
        companies_sort: 'ترتيب الشركات',
        alphabetical: 'أبجدي',
        by_med_count: 'حسب عدد الأدوية',
        popular: 'الأكثر شيوعاً',
        medicine_count: 'عدد الأدوية',
        barcode_label: 'الباركود (اختياري)',
        back_to_companies: 'العودة إلى الشركات',
        add_to_pharmacy: '➕ إضافة إلى الصيدلية',
        add_expiry: 'أدخل تاريخ الانتهاء للدواء الجديد',
        added_to_pharmacy: 'تمت إضافة الدواء إلى الصيدلية',
        select_all: 'تحديد الكل',
        deselect_all: 'إلغاء الكل',
        long_press_guide: 'لتحديد دواء: اضغط مطولاً على أي دواء (0.8 ثانية) ثم اسحب إصبعك لأعلى/أسفل لتحديد عدة أدوية.',
        first_visit_welcome: 'مرحباً بك في مدير الصيدلية',
        dosage_form: 'الشكل الدوائي',
        dosage: 'الجرعة',
        deleted_items: 'سلة المحذوفات',
        restore: 'استعادة',
        delete_permanently: 'حذف نهائي',
        empty_trash: 'تفريغ السلة',
        restore_confirm: 'استعادة الدواء؟',
        delete_permanently_confirm: 'حذف نهائي للدواء؟',
        empty_trash_confirm: 'تفريغ سلة المحذوفات بالكامل؟',
        expiry1: 'تاريخ الانتهاء 1',
        expiry2: 'تاريخ الانتهاء 2',
        expiry3: 'تاريخ الانتهاء 3',
        medicine_exists_in_pharmacy: 'هذا الدواء موجود بالفعل في أدوية الصيدلية. هل تريد إضافته بصلاحية جديدة؟',
        yes: 'نعم',
        no: 'لا',
        notification_days: 'تنبيه قبل (أيام)',
        default_expiry: 'الصلاحية الافتراضية للإضافة',
        one_year: 'سنة واحدة',
        two_years: 'سنتان',
        three_years: '3 سنوات',
        five_years: '5 سنوات',
        manual: 'يدوي (بدون تعبئة)',
        notification_set: 'تم حفظ إعدادات التنبيه',
        default_expiry_set: 'تم حفظ الصلاحية الافتراضية',
        add_selected_to_pharmacy: 'إضافة الأدوية المحددة إلى الصيدلية',
        please_enter_expiry: 'أدخل تاريخ الانتهاء للدواء: ',
        batch_add_success: 'تمت إضافة الأدوية إلى الصيدلية',
        search_history: 'سجل البحث'
    },
    en: {
        home_title: 'Pharmacy Manager',
        inbox_title: 'Inbox',
        explore_title: 'Explore',
        settings_title: 'Settings',
        about_app: 'About App',
        language: 'Language',
        dark_mode: 'Dark Mode',
        backup_restore: 'Backup & Restore',
        export_db: 'Export JSON',
        import_db: 'Import JSON',
        export_csv: 'Export CSV',
        export_pdf: 'Export PDF',
        about_text: 'Pharmacy Manager Pro\nAdvanced version with database support, export, notifications, and batch delete.',
        save: 'Save',
        cancel: 'Cancel',
        name: 'Name',
        search_placeholder: 'Search...',
        filter_company: 'Company Name',
        sort_by: 'Sort by',
        closest_expiry: 'Closest expiry',
        farthest_expiry: 'Farthest expiry',
        name_asc: 'Name A-Z',
        name_desc: 'Name Z-A',
        newest_first: 'Newest first',
        type_all: 'All',
        type_pharmacy: 'Pharmacy',
        batch_delete: '🗑️ Delete Selected',
        batch_add_to_pharmacy: 'Add Selected to Pharmacy',
        add_med: 'Add Medicine',
        add_general_med: 'Add Medicine',
        trade_name: 'Trade Name *',
        scientific_name: 'Scientific Name',
        company: 'Company',
        origin: 'Origin',
        category: 'Category',
        expiry_date: 'Expiry Date *',
        save_med: 'Save',
        no_meds: 'No medicines',
        total: 'Total',
        pharmacy_count: 'Pharmacy',
        expired: 'Expired',
        expiring_30: 'Expiring in 30d',
        categories: 'Categories',
        companies: 'Companies',
        expiring_soon: 'Expiring Soon',
        no_notifications: 'No notifications',
        no_categories: 'No categories',
        no_companies: 'No companies',
        delete_confirm: 'Delete?',
        batch_delete_confirm: n => `Delete ${n} medicine(s)?`,
        med_details: 'Details',
        edit_med: 'Edit',
        delete_med: 'Delete',
        all_medicines: 'All Medicines',
        pharmacy_medicines: 'Pharmacy Medicines',
        therapeutic_categories: 'Categories',
        international_companies: 'Companies',
        search_btn: 'Search',
        company_search_btn: 'Search',
        barcode_search: 'Search by Barcode',
        scan_barcode: 'Scan Barcode',
        companies_sort: 'Sort Companies',
        alphabetical: 'Alphabetical',
        by_med_count: 'By Medicine Count',
        popular: 'Popular',
        medicine_count: 'Medicine Count',
        barcode_label: 'Barcode (optional)',
        back_to_companies: 'Back to Companies',
        add_to_pharmacy: '➕ Add to Pharmacy',
        add_expiry: 'Enter expiry date for the new medicine',
        added_to_pharmacy: 'Medicine added to pharmacy',
        select_all: 'Select All',
        deselect_all: 'Deselect All',
        long_press_guide: 'To select medicine: press and hold any medicine (0.8 sec), then drag up/down to select multiple.',
        first_visit_welcome: 'Welcome to Pharmacy Manager',
        dosage_form: 'Dosage Form',
        dosage: 'Dosage',
        deleted_items: 'Deleted Items',
        restore: 'Restore',
        delete_permanently: 'Delete Permanently',
        empty_trash: 'Empty Trash',
        restore_confirm: 'Restore medicine?',
        delete_permanently_confirm: 'Permanently delete medicine?',
        empty_trash_confirm: 'Empty trash completely?',
        expiry1: 'Expiry Date 1',
        expiry2: 'Expiry Date 2',
        expiry3: 'Expiry Date 3',
        medicine_exists_in_pharmacy: 'This medicine already exists in pharmacy. Do you want to add it with a new expiry date?',
        yes: 'Yes',
        no: 'No',
        notification_days: 'Notify before (days)',
        default_expiry: 'Default expiry for addition',
        one_year: 'One year',
        two_years: 'Two years',
        three_years: '3 years',
        five_years: '5 years',
        manual: 'Manual (no auto-fill)',
        notification_set: 'Notification settings saved',
        default_expiry_set: 'Default expiry saved',
        add_selected_to_pharmacy: 'Add selected medicines to pharmacy',
        please_enter_expiry: 'Enter expiry date for medicine: ',
        batch_add_success: 'Medicines added to pharmacy',
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
let lastTouchY = 0;
let touchStartTime = 0;
let currentScanner = null;

let currentPageNumber = 1;
let itemsPerPage = 50;
let totalFilteredItems = 0;
let currentFilteredList = [];

let allCategories = new Set();

let pageHistoryStack = [];
let originalPageState = null;
let isInEditMode = false;

let selectedCompanies = new Set();
let selectedCategories = new Set();
let batchMode = false;

// ========== دوال مساعدة ==========
function t(key, ...args) {
    let text = translations[currentLang][key] || key;
    if (args.length) {
        if (typeof text === 'function') text = text(...args);
        else text = text.replace(/\{(\d+)\}/g, (_, i) => args[parseInt(i)]);
    }
    return text;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
}

function getDaysRemaining(expiryDateStr) {
    const today = new Date(); today.setHours(0,0,0,0);
    const expiry = new Date(expiryDateStr); expiry.setHours(0,0,0,0);
    return Math.ceil((expiry - today) / (1000*60*60*24));
}

// ========== ترحيل البيانات ==========
async function migrateData() {
    const meds = await db.meds.toArray();
    for (let med of meds) {
        let changed = false;
        if (!med.createdAt) {
            med.createdAt = new Date().toISOString();
            changed = true;
        }
        if (!med.type) {
            med.type = MED_TYPES.GENERAL;
            changed = true;
        }
        if (changed) {
            await db.meds.update(med.id, { createdAt: med.createdAt, type: med.type });
        }
    }
    const deleted = await db.deletedMeds.toArray();
    for (let med of deleted) {
        let changed = false;
        if (!med.createdAt) {
            med.createdAt = new Date().toISOString();
            changed = true;
        }
        if (!med.type) {
            med.type = MED_TYPES.GENERAL;
            changed = true;
        }
        if (changed) {
            await db.deletedMeds.update(med.id, { createdAt: med.createdAt, type: med.type });
        }
    }
}

async function initDemoData() {
    try {
        const count = await db.meds.count();
        if (count === 0) {
            const now = new Date();
            const generalMeds = [
                { name: "GENTAGUT DROP", scientificName: "Gentamicin sulfate", company: "Billim", origin: "Turkey", type: MED_TYPES.GENERAL, category: "مضادات حيوية", expiry: "9999-12-31", barcode: "6294015001234", dosageForm: "قطرة", dosage: "0.3%", createdAt: new Date(now - 10*86400000).toISOString() },
                { name: "Paracetamol 500mg", company: "DemoPharma", origin: "Iraq", type: MED_TYPES.GENERAL, category: "مسكنات", expiry: "9999-12-31", barcode: "6294015005678", dosageForm: "أقراص", dosage: "500mg", createdAt: new Date(now - 5*86400000).toISOString() },
                { name: "Ibuprofen 400mg", company: "DemoPharma", origin: "Iraq", type: MED_TYPES.GENERAL, category: "مسكنات", expiry: "9999-12-31", dosageForm: "أقراص", dosage: "400mg", createdAt: new Date(now - 3*86400000).toISOString() }
            ];
            const pharmacyMeds = [
                { name: "Aspirin 100mg", company: "Bayer", origin: "Germany", type: MED_TYPES.PHARMACY, category: "مسكنات", expiry: new Date(Date.now() + 10*86400000).toISOString().split('T')[0], dosageForm: "أقراص", dosage: "100mg", createdAt: new Date(now - 12*86400000).toISOString() }
            ];
            await db.meds.bulkAdd([...generalMeds, ...pharmacyMeds]);
        }
        await migrateData();
    } catch (err) {
        console.error('Error in initDemoData:', err);
    } finally {
        hideLoading();
    }
}

async function addMedicineToGeneralIfNotExists(medData) {
    const existing = await db.meds.where('type').equals(MED_TYPES.GENERAL)
        .and(m => m.name === medData.name &&
                 m.company === medData.company &&
                 m.dosageForm === medData.dosageForm &&
                 m.dosage === medData.dosage).first();
    if (!existing) {
        const generalMed = {
            name: medData.name,
            scientificName: medData.scientificName,
            company: medData.company,
            origin: medData.origin,
            type: MED_TYPES.GENERAL,
            category: medData.category,
            expiry: '9999-12-31',
            barcode: medData.barcode,
            image: medData.image,
            dosageForm: medData.dosageForm,
            dosage: medData.dosage,
            createdAt: new Date().toISOString()
        };
        await db.meds.add(generalMed);
    }
}

// ========== التنقل وزر الرجوع الذكي ==========
function pushPageToHistory(page) {
    if (pageHistoryStack.length === 0 || pageHistoryStack[pageHistoryStack.length-1] !== page) {
        pageHistoryStack.push(page);
    }
    if (pageHistoryStack.length > 10) pageHistoryStack.shift();
}

function switchPage(page) {
    pushPageToHistory(currentPage);
    currentPage = page;
    
    const backBtn = document.getElementById('backBtn');
    const settingsBtn = document.getElementById('settingsHeaderBtn');
    const notifBtn = document.getElementById('notifBtn');
    
    if (page === 'home') { 
        if (backBtn) backBtn.style.display = 'none'; 
        if (settingsBtn) settingsBtn.style.display = 'block';
        if (notifBtn) notifBtn.style.display = 'flex';
    } else { 
        if (backBtn) backBtn.style.display = 'block'; 
        if (settingsBtn) settingsBtn.style.display = 'none';
        if (notifBtn) notifBtn.style.display = 'none';
    }
    
    updateAllText();
}

function refreshCurrentPage() {
    if (currentPage === 'all') renderAllMedicines();
    else if (currentPage === 'pharmacy') renderPharmacyMedicines();
    else if (currentPage === 'categories') renderCategoriesPage();
    else if (currentPage === 'companies') renderCompaniesPage();
    else if (currentPage === 'expiring') renderExpiringSoonPage();
    else if (currentPage === 'inbox') renderInbox();
    else if (currentPage === 'explore') renderExplore();
    else if (currentPage === 'deleted') renderDeletedItems();
    else if (currentPage === 'home') renderHome();
}

window.handleBackButton = function() {
    // 1. إذا كان في وضع تعديل دواء
    if (isInEditMode && currentMed) {
        showSaveChangesModal(
            async () => {
                await saveMedFromForm();
                isInEditMode = false;
                currentMed = null;
                closeMedFormModal();
                refreshCurrentPage();
            },
            () => {
                isInEditMode = false;
                currentMed = null;
                closeMedFormModal();
                refreshCurrentPage();
            }
        );
        return;
    }
    
    // 2. إذا كان في صفحة شركة معينة (تفاصيل شركة)
    if (currentCompany !== null) {
        currentCompany = null;
        renderCompaniesPage();
        return;
    }
    
    // 3. إذا كان هناك بحث نشط (searchQuery غير فارغ)
    if (searchQuery !== '') {
        searchQuery = '';
        currentPageNumber = 1;
        refreshCurrentPage();
        return;
    }
    
    // 4. إذا كان في صفحة داخلية (ليست الرئيسية)
    if (currentPage !== 'home') {
        if (pageHistoryStack.length > 0) {
            const previousPage = pageHistoryStack.pop();
            switchPage(previousPage);
        } else {
            switchPage('home');
        }
        return;
    }
    
    // 5. الصفحة الرئيسية: عرض تأكيد الخروج
    showExitConfirmation();
};

function showSaveChangesModal(onSave, onDiscard) {
    const modal = document.getElementById('saveChangesModal');
    if (!modal) return;
    modal.style.display = 'flex';
    const saveBtn = document.getElementById('saveAndExitBtn');
    const discardBtn = document.getElementById('exitWithoutSaveBtn');
    const cancelBtn = document.getElementById('cancelSaveExitBtn');
    
    const handleSave = () => {
        modal.style.display = 'none';
        if (onSave) onSave();
        removeModalListeners();
    };
    const handleDiscard = () => {
        modal.style.display = 'none';
        if (onDiscard) onDiscard();
        removeModalListeners();
    };
    const handleCancel = () => {
        modal.style.display = 'none';
        removeModalListeners();
    };
    
    const removeModalListeners = () => {
        saveBtn.removeEventListener('click', handleSave);
        discardBtn.removeEventListener('click', handleDiscard);
        cancelBtn.removeEventListener('click', handleCancel);
    };
    
    saveBtn.addEventListener('click', handleSave);
    discardBtn.addEventListener('click', handleDiscard);
    cancelBtn.addEventListener('click', handleCancel);
}

function goHome() { 
    if (currentPage === 'home') {
        showExitConfirmation();
    } else {
        switchPage('home');
    }
}

function showExitConfirmation() {
    const modal = document.getElementById('exitConfirmModal');
    if (modal) modal.style.display = 'flex';
}

function hideExitConfirmation() {
    const modal = document.getElementById('exitConfirmModal');
    if (modal) modal.style.display = 'none';
}

function exitApp() {
    if (window.confirm('هل تريد إغلاق التطبيق؟')) {
        window.close();
    }
    hideExitConfirmation();
}

// ========== تحديث النصوص ==========
function updateAllText() {
    let titleKey = '';
    if (currentPage === 'home') titleKey = 'home_title';
    else if (currentPage === 'all') titleKey = 'all_medicines';
    else if (currentPage === 'pharmacy') titleKey = 'pharmacy_medicines';
    else if (currentPage === 'categories') titleKey = 'therapeutic_categories';
    else if (currentPage === 'companies') titleKey = 'international_companies';
    else if (currentPage === 'expiring') titleKey = 'expiring_soon';
    else if (currentPage === 'inbox') titleKey = 'inbox_title';
    else if (currentPage === 'explore') titleKey = 'explore_title';
    else if (currentPage === 'deleted') titleKey = 'deleted_items';
    const titleDiv = document.getElementById('appTitle');
    if (titleDiv) {
        titleDiv.innerHTML = `${t(titleKey)}`;
    }
    refreshCurrentPage();
}

// ========== البحث والاقتراحات ==========
function saveSearchQuery(pageKey, query) {
    if (!query.trim()) return;
    const arr = recentSearches[pageKey];
    const filtered = [query, ...arr.filter(s => s !== query)].slice(0,5);
    recentSearches[pageKey] = filtered;
    localStorage.setItem(`recentSearches_${pageKey}`, JSON.stringify(filtered));
}

function performSearch(query, pageKey) {
    searchQuery = query;
    saveSearchQuery(pageKey, query);
    currentPageNumber = 1;
    refreshCurrentPage();
}

async function updateSearchSuggestions(input, suggestionsBox, type = 'medicines') {
    const query = input.value.trim().toLowerCase();
    if (query.length === 0) {
        suggestionsBox.classList.remove('show');
        return;
    }
    let matches = [];
    if (type === 'medicines') {
        const allMeds = await db.meds.toArray();
        matches = allMeds.filter(med => med.name.toLowerCase().startsWith(query)).map(med => med.name).slice(0, 10);
    } else if (type === 'companies') {
        const allMeds = await db.meds.toArray();
        const companiesSet = new Set();
        allMeds.forEach(med => {
            if (med.company && med.company.toLowerCase().startsWith(query)) {
                companiesSet.add(med.company);
            }
        });
        matches = Array.from(companiesSet).slice(0, 10);
    }
    if (matches.length === 0) {
        suggestionsBox.classList.remove('show');
        return;
    }
    suggestionsBox.innerHTML = matches.map(name => `<div class="suggestion-item">${escapeHtml(name)}</div>`).join('');
    suggestionsBox.classList.add('show');
    suggestionsBox.querySelectorAll('.suggestion-item').forEach(el => {
        el.addEventListener('click', () => {
            input.value = el.innerText;
            suggestionsBox.classList.remove('show');
            if (type === 'medicines') {
                performSearch(input.value, 'all');
            } else if (type === 'companies') {
                filterCompanies(input.value);
            }
        });
    });
}

function enhanceSearchInput(input, pageKey) {
    if (!input) return;
    if (input.hasAttribute('data-enhanced')) return;
    input.setAttribute('data-enhanced', 'true');
    
    const wrapper = input.parentElement;
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'suggestions-list';
    wrapper.style.position = 'relative';
    wrapper.appendChild(suggestionsDiv);
    
    input.addEventListener('input', () => {
        updateSearchSuggestions(input, suggestionsDiv, pageKey === 'companies' ? 'companies' : 'medicines');
    });
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = input.value.trim();
            if (query) {
                performSearch(query, pageKey);
            }
            suggestionsDiv.classList.remove('show');
        }
    });
    input.addEventListener('blur', () => {
        setTimeout(() => suggestionsDiv.classList.remove('show'), 200);
    });
    const searchBtn = wrapper.querySelector('button');
    if (searchBtn && !searchBtn._bound) {
        searchBtn._bound = true;
        searchBtn.addEventListener('click', () => {
            const query = input.value.trim();
            if (query) {
                performSearch(query, pageKey);
            }
            suggestionsDiv.classList.remove('show');
        });
    }
}

// ========== عرض الأدوية مع Pagination ==========
async function getFilteredAndSorted() {
    let list = await db.meds.toArray();
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(m => 
            m.name.toLowerCase().includes(q) || 
            (m.scientificName && m.scientificName.toLowerCase().includes(q)) || 
            (m.company && m.company.toLowerCase().includes(q)) ||
            (m.barcode && m.barcode.toLowerCase().includes(q))
        );
    }
    if (typeFilter !== 'all') {
        list = list.filter(m => m.type === typeFilter);
    }
    if (sortBy === 'expiry_asc') list.sort((a,b) => getDaysRemaining(a.expiry) - getDaysRemaining(b.expiry));
    else if (sortBy === 'expiry_desc') list.sort((a,b) => getDaysRemaining(b.expiry) - getDaysRemaining(a.expiry));
    else if (sortBy === 'name_asc') list.sort((a,b) => a.name.localeCompare(b.name));
    else if (sortBy === 'name_desc') list.sort((a,b) => b.name.localeCompare(a.name));
    else if (sortBy === 'date_desc') list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
}

function renderMedications(list, showDeleteButton = true) {
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
        card.innerHTML = `
            <div class="checkbox"></div>
            ${thumb}
            <div class="med-text">
                <div class="med-name">💊 ${escapeHtml(med.name)}</div>
            </div>
        `;
        if (showDeleteButton) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-button';
            deleteBtn.innerHTML = `<div class="trash-bin-icon"><div class="bin-lid"></div><div class="bin-container"><div class="bin-line"></div><div class="bin-line"></div></div></div>`;
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(t('delete_confirm'))) {
                    moveToDeleted(med.id);
                }
            });
            card.appendChild(deleteBtn);
        }
        card.addEventListener('click', (e) => {
            if (selectionMode) {
                e.stopPropagation();
                toggleSelectMed(med.id);
            } else {
                showMedDetails(med);
            }
        });
        card.addEventListener('touchstart', (e) => handleTouchStart(e, med.id, card));
        card.addEventListener('touchmove', handleTouchMove);
        card.addEventListener('touchend', (e) => handleTouchEnd(e, med.id, card));
        container.appendChild(card);
    });
    updateBatchDeleteButton();
    updateSelectionButtons();
}

async function renderMedicationsWithPagination(list, showDeleteButton = true) {
    currentFilteredList = list;
    totalFilteredItems = list.length;
    const startIndex = (currentPageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = list.slice(startIndex, endIndex);
    renderMedications(pageItems, showDeleteButton);
    renderPaginationControls();
}

function renderPaginationControls() {
    const container = document.getElementById('contentList');
    if (!container) return;
    const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
    let paginationDiv = document.getElementById('paginationControls');
    if (!paginationDiv) {
        paginationDiv = document.createElement('div');
        paginationDiv.id = 'paginationControls';
        paginationDiv.className = 'pagination';
        container.parentNode.insertBefore(paginationDiv, container.nextSibling);
    }
    if (totalPages <= 1) {
        paginationDiv.style.display = 'none';
        return;
    }
    paginationDiv.style.display = 'flex';
    paginationDiv.innerHTML = `
        <button id="firstPageBtn" ${currentPageNumber === 1 ? 'disabled' : ''}>⏮ الأول</button>
        <button id="prevPageBtn" ${currentPageNumber === 1 ? 'disabled' : ''}>◀ السابق</button>
        <span class="page-info">الصفحة ${currentPageNumber} من ${totalPages}</span>
        <button id="nextPageBtn" ${currentPageNumber === totalPages ? 'disabled' : ''}>التالي ▶</button>
        <button id="lastPageBtn" ${currentPageNumber === totalPages ? 'disabled' : ''}>الأخير ⏭</button>
    `;
    const firstBtn = document.getElementById('firstPageBtn');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const lastBtn = document.getElementById('lastPageBtn');
    if (firstBtn) firstBtn.addEventListener('click', () => goToPage(1));
    if (prevBtn) prevBtn.addEventListener('click', () => goToPage(currentPageNumber - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToPage(currentPageNumber + 1));
    if (lastBtn) lastBtn.addEventListener('click', () => goToPage(totalPages));
}

function goToPage(page) {
    currentPageNumber = page;
    renderMedicationsWithPagination(currentFilteredList, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function refreshWithPagination(list, showDeleteButton = true) {
    currentPageNumber = 1;
    await renderMedicationsWithPagination(list, showDeleteButton);
}

// ========== عمليات الحذف والاستعادة ==========
async function moveToDeleted(medId) {
    try {
        const med = await db.meds.get(medId);
        if (med) {
            await db.deletedMeds.add(med);
            await db.meds.delete(medId);
            selectedMeds.delete(medId);
            refreshCurrentPage();
            updateBarChart();
        }
    } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء الحذف');
    }
}

async function restoreFromDeleted(medId) {
    try {
        const med = await db.deletedMeds.get(medId);
        if (med) {
            await db.meds.add(med);
            await db.deletedMeds.delete(medId);
            renderDeletedItems();
        }
    } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء الاستعادة');
    }
}

async function permanentlyDelete(medId) {
    if (confirm(t('delete_permanently_confirm'))) {
        try {
            await db.deletedMeds.delete(medId);
            renderDeletedItems();
        } catch (err) {
            console.error(err);
            alert('حدث خطأ');
        }
    }
}

async function emptyTrash() {
    if (confirm(t('empty_trash_confirm'))) {
        try {
            await db.deletedMeds.clear();
            renderDeletedItems();
        } catch (err) {
            console.error(err);
            alert('حدث خطأ');
        }
    }
}

async function renderDeletedItems() {
    const deletedList = await db.deletedMeds.toArray();
    const container = document.getElementById('pageContent');
    container.innerHTML = `
        <div class="filters-bar">
            <button id="emptyTrashBtn" class="empty-trash-btn">🗑️ ${t('empty_trash')}</button>
        </div>
        <div class="content-list" id="contentList"></div>
    `;
    const emptyBtn = document.getElementById('emptyTrashBtn');
    if (emptyBtn) emptyBtn.addEventListener('click', emptyTrash);
    const listDiv = document.getElementById('contentList');
    if (!deletedList.length) { listDiv.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`; return; }
    deletedList.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const card = document.createElement('div');
        card.className = 'med-card';
        card.innerHTML = `
            <div class="med-info">
                ${thumb}
                <div class="med-text">
                    <div class="med-name">💊 ${escapeHtml(med.name)}</div>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="restore-btn small-btn" data-id="${med.id}">↩️ ${t('restore')}</button>
                <button class="delete-permanently-btn small-btn" style="background: var(--danger);" data-id="${med.id}">🗑️ ${t('delete_permanently')}</button>
            </div>
        `;
        const restoreBtn = card.querySelector('.restore-btn');
        const permDeleteBtn = card.querySelector('.delete-permanently-btn');
        if (restoreBtn) restoreBtn.addEventListener('click', (e) => { e.stopPropagation(); restoreFromDeleted(med.id); });
        if (permDeleteBtn) permDeleteBtn.addEventListener('click', (e) => { e.stopPropagation(); permanentlyDelete(med.id); });
        listDiv.appendChild(card);
    });
}

// ========== تحديد متعدد ==========
function handleTouchStart(e, id, card) {
    if (selectionMode) return;
    touchStartTime = Date.now();
    lastTouchY = e.touches[0].clientY;
    longPressTimer = setTimeout(() => {
        selectionMode = true;
        touchSelectionActive = true;
        document.querySelectorAll('.med-card .checkbox').forEach(cb => cb.style.display = 'flex');
        document.querySelectorAll('.med-card').forEach(c => c.classList.add('selection-mode'));
        toggleSelectMed(id);
        updateSelectionButtons();
    }, 800);
}

function handleTouchMove(e) {
    if (!touchSelectionActive) return;
    e.preventDefault();
    const elementUnder = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    const cardUnder = elementUnder?.closest('.med-card');
    if (cardUnder) {
        const id = parseInt(cardUnder.getAttribute('data-id'));
        if (!selectedMeds.has(id)) toggleSelectMed(id);
    }
    lastTouchY = e.touches[0].clientY;
}

function handleTouchEnd(e, id, card) {
    clearTimeout(longPressTimer);
    if (touchSelectionActive) touchSelectionActive = false;
}

function toggleSelectMed(id) {
    if (selectedMeds.has(id)) selectedMeds.delete(id);
    else selectedMeds.add(id);
    const card = document.querySelector(`.med-card[data-id="${id}"]`);
    if (card) card.classList.toggle('selected', selectedMeds.has(id));
    updateBatchDeleteButton();
    updateSelectionButtons();
    if (selectedMeds.size === 0) {
        selectionMode = false;
        document.querySelectorAll('.med-card .checkbox').forEach(cb => cb.style.display = 'none');
        document.querySelectorAll('.med-card').forEach(c => c.classList.remove('selection-mode'));
    }
}

function updateBatchDeleteButton() {
    const batchBtn = document.getElementById('batchDeleteBtn');
    if (batchBtn) batchBtn.style.display = selectedMeds.size > 0 ? 'inline-flex' : 'none';
    const batchAddBtn = document.getElementById('batchAddToPharmacyBtn');
    if (batchAddBtn) batchAddBtn.style.display = selectedMeds.size > 0 ? 'inline-flex' : 'none';
}

function updateSelectionButtons() {
    const selectAllBtn = document.getElementById('selectAllBtn');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    const hasMeds = document.querySelectorAll('.med-card').length > 0;
    const anySelected = selectedMeds.size > 0;
    if (selectAllBtn) selectAllBtn.style.display = hasMeds && selectionMode ? 'inline-flex' : 'none';
    if (deselectAllBtn) deselectAllBtn.style.display = hasMeds && anySelected ? 'inline-flex' : 'none';
}

function selectAllMeds() {
    const cards = document.querySelectorAll('.med-card');
    cards.forEach(card => {
        const id = parseInt(card.getAttribute('data-id'));
        if (!selectedMeds.has(id)) toggleSelectMed(id);
    });
}

function deselectAllMeds() {
    const cards = document.querySelectorAll('.med-card');
    cards.forEach(card => {
        const id = parseInt(card.getAttribute('data-id'));
        if (selectedMeds.has(id)) toggleSelectMed(id);
    });
}

async function batchDelete() {
    if (selectedMeds.size === 0) return alert(t('batch_delete_confirm', 0));
    if (confirm(t('batch_delete_confirm', selectedMeds.size))) {
        showLoading('جاري حذف الأدوية...');
        try {
            for (let id of selectedMeds) {
                const med = await db.meds.get(id);
                if (med) await db.deletedMeds.add(med);
                await db.meds.delete(id);
            }
            selectedMeds.clear();
            selectionMode = false;
            document.querySelectorAll('.med-card .checkbox').forEach(cb => cb.style.display = 'none');
            refreshCurrentPage();
            updateBarChart();
        } finally { hideLoading(); }
    }
}

// ========== إضافة متعددة إلى الصيدلية (مودال واحد) ==========
async function batchAddToPharmacy() {
    if (selectedMeds.size === 0) return;
    const medicines = [];
    for (let id of selectedMeds) {
        const med = await db.meds.get(id);
        if (med) medicines.push(med);
    }
    if (medicines.length === 0) return;
    
    // إنشاء مودال لإدخال تواريخ الانتهاء
    const modalHtml = `
        <div id="batchExpiryModal" class="modal" style="display:flex;">
            <div class="modal-content">
                <h3>${t('add_selected_to_pharmacy')}</h3>
                <div id="batchExpiryList" style="max-height: 300px; overflow-y: auto;"></div>
                <div class="buttons" style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                    <button id="batchExpiryConfirmBtn" class="save-btn">${t('save')}</button>
                    <button id="batchExpiryCancelBtn" class="cancel-btn">${t('cancel')}</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const listDiv = document.getElementById('batchExpiryList');
    medicines.forEach(med => {
        listDiv.innerHTML += `
            <div class="batch-expiry-item" style="margin-bottom: 10px;">
                <span style="display: inline-block; width: 150px;">${escapeHtml(med.name)}</span>
                <input type="date" class="batch-expiry-date" data-name="${escapeHtml(med.name)}" value="${new Date(Date.now() + 30*86400000).toISOString().split('T')[0]}">
            </div>
        `;
    });
    
    const confirmBtn = document.getElementById('batchExpiryConfirmBtn');
    const cancelBtn = document.getElementById('batchExpiryCancelBtn');
    
    const closeModal = () => {
        document.getElementById('batchExpiryModal')?.remove();
    };
    
    confirmBtn.addEventListener('click', async () => {
        showLoading('جاري إضافة الأدوية إلى الصيدلية...');
        try {
            let addedCount = 0;
            for (let i = 0; i < medicines.length; i++) {
                const med = medicines[i];
                const expiryInput = document.querySelectorAll('.batch-expiry-date')[i];
                const newExpiry = expiryInput.value;
                if (!newExpiry) continue;
                const newMed = {
                    name: med.name,
                    expiry: newExpiry,
                    scientificName: med.scientificName || '',
                    company: med.company || '',
                    origin: med.origin || '',
                    type: MED_TYPES.PHARMACY,
                    category: med.category || '',
                    barcode: med.barcode || '',
                    image: med.image || null,
                    dosageForm: med.dosageForm || '',
                    dosage: med.dosage || '',
                    createdAt: new Date().toISOString()
                };
                await db.meds.add(newMed);
                await addMedicineToGeneralIfNotExists(newMed);
                addedCount++;
            }
            if (addedCount > 0) {
                const toast = document.createElement('div');
                toast.className = 'offline-toast';
                toast.innerText = t('batch_add_success') + ` (${addedCount})`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);
                refreshCurrentPage();
            } else {
                alert('لم يتم إضافة أي دواء');
            }
        } finally {
            hideLoading();
            closeModal();
        }
    });
    
    cancelBtn.addEventListener('click', closeModal);
}

// ========== الصفحة الرئيسية ==========
function renderHome() {
    const container = document.getElementById('pageContent');
    if (!container) return;
    container.innerHTML = `
        <div class="dashboard-search">
            <div class="search-wrapper">
                <input type="text" id="dashboardSearch" placeholder="${t('search_placeholder')}">
                <button class="search-btn"><span class="search-btn-text">${t('search_btn')}</span></button>
            </div>
            <div id="suggestionsBox" class="suggestions-list"></div>
        </div>
        <div class="chart-container" id="chartContainer">
            <canvas id="expiryBarChart" width="400" height="200"></canvas>
        </div>
        <div class="main-buttons">
            <button class="main-btn" data-page="all">${t('all_medicines')}</button>
            <button class="main-btn" data-page="pharmacy">${t('pharmacy_medicines')}</button>
            <button class="main-btn" data-page="categories">${t('therapeutic_categories')}</button>
            <button class="main-btn" data-page="companies">${t('international_companies')}</button>
            <button class="main-btn" data-page="expiring">${t('expiring_soon')}</button>
        </div>
        <div id="stats"></div>
    `;
    document.querySelectorAll('.main-btn').forEach(btn => {
        btn.addEventListener('click', () => switchPage(btn.dataset.page));
    });
    const searchInput = document.getElementById('dashboardSearch');
    const suggestionsBox = document.getElementById('suggestionsBox');
    if (searchInput) {
        enhanceSearchInput(searchInput, 'all');
    }
    updateBarChart();
    showStats();
    showFirstTimeGuidance();
}

async function updateBarChart() {
    const ctx = document.getElementById('expiryBarChart')?.getContext('2d');
    if (!ctx) return;
    const medsArr = await db.meds.toArray();
    const expired = medsArr.filter(m => getDaysRemaining(m.expiry) < 0).length;
    const soon = medsArr.filter(m => { const d = getDaysRemaining(m.expiry); return d >= 0 && d <= 30; }).length;
    const later = medsArr.length - expired - soon;
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [t('expired'), t('expiring_30'), (currentLang === 'ar' ? 'أكثر من 30 يوم' : 'More than 30 days')],
            datasets: [{
                label: t('total'),
                data: [expired, soon, later],
                backgroundColor: ['#e76f51', '#f4a261', '#2a9d8f'],
                borderRadius: 8
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
    });
}

async function showStats() {
    const medsArr = await db.meds.toArray();
    const total = medsArr.length;
    const expired = medsArr.filter(m => getDaysRemaining(m.expiry) < 0).length;
    const expiring30 = medsArr.filter(m => { const d = getDaysRemaining(m.expiry); return d >= 0 && d <= 30; }).length;
    const pharmacyCount = medsArr.filter(m => m.type === MED_TYPES.PHARMACY).length;
    const statsDiv = document.getElementById('stats');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <div class="stats-box">
                <div>${t('total')}: <strong>${total}</strong></div>
                <div>${t('pharmacy_count')}: <strong>${pharmacyCount}</strong></div>
                <div>${t('expired')}: <strong style="color:var(--danger)">${expired}</strong></div>
                <div>${t('expiring_30')}: <strong style="color:var(--warning)">${expiring30}</strong></div>
            </div>
        `;
    }
}

// ========== صفحة كل الأدوية ==========
async function renderAllMedicines() {
    typeFilter = MED_TYPES.GENERAL;
    const container = document.getElementById('pageContent');
    if (!container) return;
    container.innerHTML = `
        <div class="search-container">
            <div class="search-wrapper">
                <input type="text" id="search" placeholder="${t('search_placeholder')}">
                <button class="search-btn">${t('search_btn')}</button>
            </div>
            <div id="suggestionsBox" class="suggestions-list"></div>
        </div>
        <div class="filters-bar">
            <select id="sortBy">
                <option value="expiry_asc">${t('closest_expiry')}</option>
                <option value="expiry_desc">${t('farthest_expiry')}</option>
                <option value="name_asc">${t('name_asc')}</option>
                <option value="name_desc">${t('name_desc')}</option>
                <option value="date_desc">${t('newest_first')}</option>
            </select>
            <button id="barcodeSearchBtn" class="small-btn">🔍 ${t('barcode_search')}</button>
            <button id="selectAllBtn" class="select-all-btn" style="display: none;">${t('select_all')}</button>
            <button id="deselectAllBtn" class="deselect-all-btn" style="display: none;">${t('deselect_all')}</button>
            <button id="batchAddToPharmacyBtn" class="plus-icon-btn" style="display: none;"><span class="plus-sign">➕</span> ${t('batch_add_to_pharmacy')}</button>
            <button id="batchDeleteBtn" class="batch-delete-btn" style="display: none;">${t('batch_delete')}</button>
            <button id="addGeneralMedBtn" class="plus-icon-btn" style="background: var(--primary);"><span class="plus-sign">➕</span> ${t('add_med')}</button>
        </div>
        <div class="content-list" id="contentList"></div>
        <div id="stats"></div>
    `;
    
    const searchInput = document.getElementById('search');
    const suggestionsBox = document.getElementById('suggestionsBox');
    const barcodeBtn = document.getElementById('barcodeSearchBtn');
    const sortSelect = document.getElementById('sortBy');
    const batchBtn = document.getElementById('batchDeleteBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    const batchAddBtn = document.getElementById('batchAddToPharmacyBtn');
    const addGeneralBtn = document.getElementById('addGeneralMedBtn');
    
    if (batchBtn) batchBtn.addEventListener('click', batchDelete);
    if (selectAllBtn) selectAllBtn.addEventListener('click', selectAllMeds);
    if (deselectAllBtn) deselectAllBtn.addEventListener('click', deselectAllMeds);
    if (batchAddBtn) batchAddBtn.addEventListener('click', batchAddToPharmacy);
    if (addGeneralBtn) addGeneralBtn.addEventListener('click', showAddGeneralFormModal);
    if (barcodeBtn) barcodeBtn.addEventListener('click', () => startScannerForSearch());
    if (sortSelect) {
        sortSelect.value = sortBy;
        sortSelect.addEventListener('change', () => { sortBy = sortSelect.value; refreshCurrentPage(); });
    }
    if (searchInput) {
        enhanceSearchInput(searchInput, 'all');
    }
    
    const list = await getFilteredAndSorted();
    await refreshWithPagination(list, true);
    showStats();
}

// ========== صفحة أدوية الصيدلية ==========
async function renderPharmacyMedicines() {
    typeFilter = MED_TYPES.PHARMACY;
    const container = document.getElementById('pageContent');
    if (!container) return;
    container.innerHTML = `
        <div class="search-container">
            <div class="search-wrapper">
                <input type="text" id="search" placeholder="${t('search_placeholder')}">
                <button class="search-btn">${t('search_btn')}</button>
            </div>
            <div id="suggestionsBox" class="suggestions-list"></div>
        </div>
        <div class="filters-bar">
            <select id="sortBy">
                <option value="expiry_asc">${t('closest_expiry')}</option>
                <option value="expiry_desc">${t('farthest_expiry')}</option>
                <option value="name_asc">${t('name_asc')}</option>
                <option value="name_desc">${t('name_desc')}</option>
                <option value="date_desc">${t('newest_first')}</option>
            </select>
            <button id="barcodeSearchBtn" class="small-btn">🔍 ${t('barcode_search')}</button>
            <button id="selectAllBtn" class="select-all-btn" style="display: none;">${t('select_all')}</button>
            <button id="deselectAllBtn" class="deselect-all-btn" style="display: none;">${t('deselect_all')}</button>
            <button id="batchDeleteBtn" class="batch-delete-btn" style="display: none;">${t('batch_delete')}</button>
            <button id="addMedBtn" class="plus-icon-btn"><span class="plus-sign">➕</span> ${t('add_med')}</button>
            <button id="recycleBinBtn" class="recycle-bin-btn">🗑️ سلة المحذوفات</button>
        </div>
        <div class="content-list" id="contentList"></div>
        <div id="stats"></div>
    `;
    
    const addMedBtn = document.getElementById('addMedBtn');
    if (addMedBtn) addMedBtn.addEventListener('click', showAddFormModal);
    const recycleBtn = document.getElementById('recycleBinBtn');
    if (recycleBtn) recycleBtn.addEventListener('click', () => switchPage('deleted'));
    
    const searchInput = document.getElementById('search');
    const suggestionsBox = document.getElementById('suggestionsBox');
    const barcodeBtn = document.getElementById('barcodeSearchBtn');
    const sortSelect = document.getElementById('sortBy');
    const batchBtn = document.getElementById('batchDeleteBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    
    if (batchBtn) batchBtn.addEventListener('click', batchDelete);
    if (selectAllBtn) selectAllBtn.addEventListener('click', selectAllMeds);
    if (deselectAllBtn) deselectAllBtn.addEventListener('click', deselectAllMeds);
    if (barcodeBtn) barcodeBtn.addEventListener('click', () => startScannerForSearch());
    if (sortSelect) {
        sortSelect.value = sortBy;
        sortSelect.addEventListener('change', () => { sortBy = sortSelect.value; refreshCurrentPage(); });
    }
    if (searchInput) {
        enhanceSearchInput(searchInput, 'pharmacy');
    }
    
    const list = await getFilteredAndSorted();
    await refreshWithPagination(list, true);
    showStats();
}

// ========== صفحات الشركات والتصنيفات مع التعديل الجماعي ==========
function toggleBatchMode() {
    batchMode = !batchMode;
    if (batchMode) {
        document.querySelectorAll('.company-card, .category-card').forEach(card => {
            const checkbox = document.createElement('div');
            checkbox.className = 'checkbox';
            checkbox.style.display = 'flex';
            card.style.position = 'relative';
            card.appendChild(checkbox);
            card.classList.add('batch-selectable');
        });
    } else {
        document.querySelectorAll('.company-card, .category-card').forEach(card => {
            const cb = card.querySelector('.checkbox');
            if (cb) cb.remove();
            card.classList.remove('batch-selectable', 'selected');
        });
        selectedCompanies.clear();
        selectedCategories.clear();
    }
    const batchBar = document.querySelector('.batch-actions-bar');
    if (batchBar) batchBar.style.display = batchMode ? 'flex' : 'none';
}

function toggleSelectCompany(companyName) {
    if (selectedCompanies.has(companyName)) {
        selectedCompanies.delete(companyName);
    } else {
        selectedCompanies.add(companyName);
    }
    const card = document.querySelector(`.company-card[data-company="${escapeHtml(companyName)}"]`);
    if (card) card.classList.toggle('selected', selectedCompanies.has(companyName));
}

function toggleSelectCategory(categoryName) {
    if (selectedCategories.has(categoryName)) {
        selectedCategories.delete(categoryName);
    } else {
        selectedCategories.add(categoryName);
    }
    const card = document.querySelector(`.category-card[data-category="${escapeHtml(categoryName)}"]`);
    if (card) card.classList.toggle('selected', selectedCategories.has(categoryName));
}

async function batchRenameCompanies() {
    if (selectedCompanies.size === 0) {
        alert('لم يتم تحديد أي شركة');
        return;
    }
    const newName = prompt('أدخل الاسم الجديد للشركات المحددة:', '');
    if (!newName || !newName.trim()) return;
    showLoading(`جاري تغيير اسم ${selectedCompanies.size} شركة إلى "${newName}"...`);
    try {
        await db.transaction('rw', db.meds, db.deletedMeds, async () => {
            for (let oldName of selectedCompanies) {
                const medsToUpdate = await db.meds.where('company').equals(oldName).toArray();
                for (let med of medsToUpdate) {
                    await db.meds.update(med.id, { company: newName });
                }
                const deletedToUpdate = await db.deletedMeds.where('company').equals(oldName).toArray();
                for (let med of deletedToUpdate) {
                    await db.deletedMeds.update(med.id, { company: newName });
                }
            }
        });
        alert(`تم تحديث ${selectedCompanies.size} شركة إلى "${newName}"`);
        selectedCompanies.clear();
        batchMode = false;
        renderCompaniesPage();
    } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء التعديل الجماعي');
    } finally {
        hideLoading();
    }
}

async function batchRenameCategories() {
    if (selectedCategories.size === 0) {
        alert('لم يتم تحديد أي تصنيف');
        return;
    }
    const newName = prompt('أدخل الاسم الجديد للتصنيفات المحددة:', '');
    if (!newName || !newName.trim()) return;
    showLoading(`جاري تغيير اسم ${selectedCategories.size} تصنيف إلى "${newName}"...`);
    try {
        await db.transaction('rw', db.meds, db.deletedMeds, async () => {
            for (let oldName of selectedCategories) {
                const medsToUpdate = await db.meds.where('category').equals(oldName).toArray();
                for (let med of medsToUpdate) {
                    await db.meds.update(med.id, { category: newName });
                }
                const deletedToUpdate = await db.deletedMeds.where('category').equals(oldName).toArray();
                for (let med of deletedToUpdate) {
                    await db.deletedMeds.update(med.id, { category: newName });
                }
            }
        });
        alert(`تم تحديث ${selectedCategories.size} تصنيف إلى "${newName}"`);
        selectedCategories.clear();
        batchMode = false;
        renderCategoriesPage();
    } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء التعديل الجماعي');
    } finally {
        hideLoading();
    }
}

async function renderCompaniesPage() {
    if (currentCompany) {
        await showMedicinesByCompany(currentCompany);
        return;
    }
    batchMode = false;
    selectedCompanies.clear();
    
    const meds = await db.meds.toArray();
    const companyMap = new Map();
    meds.forEach(m => {
        if (m.company && m.company.trim()) {
            if (!companyMap.has(m.company)) companyMap.set(m.company, { origin: m.origin || 'غير معروف', count: 1 });
            else companyMap.get(m.company).count++;
        }
    });
    let companies = Array.from(companyMap.entries()).map(([name, data]) => ({ name, origin: data.origin, count: data.count }));
    companies.sort((a,b) => a.name.localeCompare(b.name));
    
    const container = document.getElementById('pageContent');
    if (!container) return;
    if (!companies.length) { 
        container.innerHTML = `<div class="empty-state">${t('no_companies')}</div>`; 
        return; 
    }
    container.innerHTML = `
        <div class="search-container">
            <div class="search-wrapper">
                <input type="text" id="companySearch" placeholder="🔍 بحث عن شركة...">
                <button id="searchCompanyBtn" class="search-btn">${t('search_btn')}</button>
            </div>
            <div id="suggestionsBox" class="suggestions-list"></div>
        </div>
        <div class="filters-bar">
            <label>${t('companies_sort')}</label>
            <select id="companiesSort">
                <option value="alpha">${t('alphabetical')}</option>
                <option value="count_desc">${t('by_med_count')} (تنازلي)</option>
                <option value="count_asc">${t('by_med_count')} (تصاعدي)</option>
                <option value="popular">${t('popular')}</option>
            </select>
            <button id="addCompanyBtn" class="main-btn" style="margin-right: auto;">➕ إضافة شركة جديدة</button>
            <button id="batchModeBtn" class="main-btn" style="background: var(--warning);">📌 تحديد متعدد</button>
        </div>
        <div id="batchActionsBar" class="batch-actions-bar" style="display: none;">
            <button id="batchRenameBtn" class="batch-rename-btn">✏️ تعديل جماعي (${selectedCompanies.size})</button>
            <button id="batchCancelBtn" class="batch-cancel-btn">إلغاء التحديد</button>
        </div>
        <div id="companiesList"></div>
    `;
    const searchInput = document.getElementById('companySearch');
    const searchBtn = document.getElementById('searchCompanyBtn');
    const suggestionsBox = document.getElementById('suggestionsBox');
    const sortSelect = document.getElementById('companiesSort');
    const addCompanyBtn = document.getElementById('addCompanyBtn');
    const batchModeBtn = document.getElementById('batchModeBtn');
    const batchActionsBar = document.getElementById('batchActionsBar');
    const batchRenameBtn = document.getElementById('batchRenameBtn');
    const batchCancelBtn = document.getElementById('batchCancelBtn');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                saveSearchQuery('companies', query);
                filterCompanies(query);
            }
            suggestionsBox.classList.remove('show');
        });
    }
    if (searchInput) {
        enhanceSearchInput(searchInput, 'companies');
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const searchTerm = document.getElementById('companySearch')?.value || '';
            filterCompanies(searchTerm);
        });
    }
    if (addCompanyBtn) {
        addCompanyBtn.addEventListener('click', () => window.addNewCompany());
    }
    if (batchModeBtn) {
        batchModeBtn.addEventListener('click', () => {
            batchMode = !batchMode;
            if (batchMode) {
                batchActionsBar.style.display = 'flex';
                batchModeBtn.style.background = 'var(--success)';
                batchModeBtn.innerText = '❌ إلغاء التحديد';
                renderCompaniesInBatchMode();
            } else {
                batchActionsBar.style.display = 'none';
                batchModeBtn.style.background = 'var(--warning)';
                batchModeBtn.innerText = '📌 تحديد متعدد';
                selectedCompanies.clear();
                renderCompaniesPage();
            }
        });
    }
    if (batchRenameBtn) {
        batchRenameBtn.addEventListener('click', batchRenameCompanies);
    }
    if (batchCancelBtn) {
        batchCancelBtn.addEventListener('click', () => {
            selectedCompanies.clear();
            batchRenameBtn.innerText = `✏️ تعديل جماعي (0)`;
            renderCompaniesPage();
        });
    }
    await displayCompanies('', 'alpha');
}

async function renderCompaniesInBatchMode() {
    const meds = await db.meds.toArray();
    const companyMap = new Map();
    meds.forEach(m => {
        if (m.company && m.company.trim()) {
            if (!companyMap.has(m.company)) companyMap.set(m.company, { origin: m.origin || 'غير معروف', count: 1 });
            else companyMap.get(m.company).count++;
        }
    });
    let companies = Array.from(companyMap.entries()).map(([name, data]) => ({ name, origin: data.origin, count: data.count }));
    companies.sort((a,b) => a.name.localeCompare(b.name));
    const container = document.getElementById('companiesList');
    if (!container) return;
    container.innerHTML = `<div class="companies-grid">${companies.map(c => `
        <div class="company-card ${selectedCompanies.has(c.name) ? 'selected' : ''}" data-company="${escapeHtml(c.name)}" onclick="event.stopPropagation(); toggleSelectCompany('${escapeHtml(c.name)}'); updateBatchRenameBtnCount();">
            <div>🏭 ${escapeHtml(c.name)}</div>
            <div class="company-origin">📍 ${escapeHtml(c.origin)}</div>
            <div class="medicine-count">📊 ${t('medicine_count')}: ${c.count}</div>
            <div class="checkbox" style="display: flex;"></div>
        </div>
    `).join('')}</div>`;
    document.querySelectorAll('.company-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const company = card.getAttribute('data-company');
            if (batchMode) {
                toggleSelectCompany(company);
                updateBatchRenameBtnCount();
            } else {
                showCompanyMedicines(company);
            }
        });
    });
}

function updateBatchRenameBtnCount() {
    const btn = document.getElementById('batchRenameBtn');
    if (btn) btn.innerText = `✏️ تعديل جماعي (${selectedCompanies.size})`;
}

async function displayCompanies(searchTerm, sortType) {
    const meds = await db.meds.toArray();
    const companyMap = new Map();
    meds.forEach(m => {
        if (m.company && m.company.trim()) {
            if (!companyMap.has(m.company)) companyMap.set(m.company, { origin: m.origin || 'غير معروف', count: 1 });
            else companyMap.get(m.company).count++;
        }
    });
    let companies = Array.from(companyMap.entries()).map(([name, data]) => ({ name, origin: data.origin, count: data.count }));
    if (searchTerm.trim()) companies = companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (sortType === 'alpha') companies.sort((a,b) => a.name.localeCompare(b.name));
    else if (sortType === 'count_desc') companies.sort((a,b) => b.count - a.count);
    else if (sortType === 'count_asc') companies.sort((a,b) => a.count - b.count);
    else if (sortType === 'popular') companies.sort((a,b) => b.count - a.count);
    
    const container = document.getElementById('companiesList');
    if (!container) return;
    if (!companies.length) { container.innerHTML = `<div class="empty-state">${t('no_companies')}</div>`; return; }
    container.innerHTML = `<div class="companies-grid">${companies.map(c => `
        <div class="company-card" data-company="${escapeHtml(c.name)}">
            <div>🏭 ${escapeHtml(c.name)}</div>
            <div class="company-origin">📍 ${escapeHtml(c.origin)}</div>
            <div class="medicine-count">📊 ${t('medicine_count')}: ${c.count}</div>
        </div>
    `).join('')}</div>`;
    
    document.querySelectorAll('.company-card').forEach(card => {
        card.addEventListener('click', () => {
            showCompanyMedicines(card.getAttribute('data-company'));
        });
    });
}

function filterCompanies(searchTerm) {
    const sortType = document.getElementById('companiesSort')?.value || 'alpha';
    displayCompanies(searchTerm, sortType);
}

function showCompanyMedicines(companyName) {
    currentCompany = companyName;
    showMedicinesByCompany(companyName);
}

async function showMedicinesByCompany(companyName) {
    const medsList = await db.meds.where('company').equals(companyName).toArray();
    const container = document.getElementById('pageContent');
    if (!container) return;
    container.innerHTML = `
        <div class="company-header">
            <button id="backToCompaniesBtn" class="back-to-companies-btn">← ${t('back_to_companies')}</button>
            <h3 style="margin: 16px 0;">🏭 ${escapeHtml(companyName)}</h3>
        </div>
        <div class="content-list" id="companyMedsList"></div>
    `;
    const backBtn = document.getElementById('backToCompaniesBtn');
    if (backBtn) backBtn.addEventListener('click', () => {
        currentCompany = null;
        renderCompaniesPage();
    });
    const listDiv = document.getElementById('companyMedsList');
    if (!medsList.length) { listDiv.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`; return; }
    medsList.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const card = document.createElement('div');
        card.className = 'med-card';
        card.innerHTML = `<div class="med-info">${thumb}<div class="med-text"><div class="med-name">💊 ${escapeHtml(med.name)}</div></div></div>`;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button';
        deleteBtn.innerHTML = `<div class="trash-bin-icon"><div class="bin-lid"></div><div class="bin-container"><div class="bin-line"></div><div class="bin-line"></div></div></div>`;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(t('delete_confirm'))) {
                moveToDeleted(med.id);
            }
        });
        card.appendChild(deleteBtn);
        card.addEventListener('click', () => showMedDetails(med));
        listDiv.appendChild(card);
    });
}

async function renderCategoriesPage() {
    const meds = await db.meds.toArray();
    const catsMap = new Map();
    meds.forEach(m => {
        if (m.category && m.category.trim()) {
            catsMap.set(m.category, (catsMap.get(m.category) || 0) + 1);
        }
    });
    const cats = Array.from(catsMap.keys()).sort((a,b) => a.localeCompare(b));
    const container = document.getElementById('pageContent');
    if (!container) return;
    if (!cats.length) { 
        container.innerHTML = `<div class="empty-state">${t('no_categories')}</div>`; 
        return; 
    }
    container.innerHTML = `
        <div class="filters-bar">
            <button class="main-btn" id="addCategoryBtn">➕ إضافة تصنيف جديد</button>
            <button id="batchModeCategoriesBtn" class="main-btn" style="background: var(--warning);">📌 تحديد متعدد</button>
        </div>
        <div id="batchActionsCategoriesBar" class="batch-actions-bar" style="display: none;">
            <button id="batchRenameCategoriesBtn" class="batch-rename-btn">✏️ تعديل جماعي (0)</button>
            <button id="batchCancelCategoriesBtn" class="batch-cancel-btn">إلغاء التحديد</button>
        </div>
        <div class="categories-grid" id="categoriesGrid"></div>
    `;
    const addBtn = document.getElementById('addCategoryBtn');
    if (addBtn) addBtn.addEventListener('click', () => addNewCategoryForList());
    const batchModeBtn = document.getElementById('batchModeCategoriesBtn');
    const batchActionsBar = document.getElementById('batchActionsCategoriesBar');
    const batchRenameBtn = document.getElementById('batchRenameCategoriesBtn');
    const batchCancelBtn = document.getElementById('batchCancelCategoriesBtn');
    
    if (batchModeBtn) {
        batchModeBtn.addEventListener('click', () => {
            batchMode = !batchMode;
            if (batchMode) {
                batchActionsBar.style.display = 'flex';
                batchModeBtn.style.background = 'var(--success)';
                batchModeBtn.innerText = '❌ إلغاء التحديد';
                renderCategoriesInBatchMode(cats, catsMap);
            } else {
                batchActionsBar.style.display = 'none';
                batchModeBtn.style.background = 'var(--warning)';
                batchModeBtn.innerText = '📌 تحديد متعدد';
                selectedCategories.clear();
                renderCategoriesPage();
            }
        });
    }
    if (batchRenameBtn) {
        batchRenameBtn.addEventListener('click', batchRenameCategories);
    }
    if (batchCancelBtn) {
        batchCancelBtn.addEventListener('click', () => {
            selectedCategories.clear();
            batchRenameBtn.innerText = `✏️ تعديل جماعي (0)`;
            renderCategoriesPage();
        });
    }
    
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = cats.map(c => `
        <div class="category-card" data-category="${escapeHtml(c)}">
            <div>📂 ${escapeHtml(c)}</div>
            <div class="medicine-count">📊 ${t('medicine_count')}: ${catsMap.get(c)}</div>
        </div>
    `).join('');
    
    grid.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', async () => {
            if (batchMode) {
                const cat = card.getAttribute('data-category');
                toggleSelectCategory(cat);
                updateBatchRenameCategoriesCount();
            } else {
                const cat = card.getAttribute('data-category');
                const filtered = (await db.meds.toArray()).filter(m => m.category === cat);
                renderMedicationsInList(filtered);
            }
        });
    });
}

function renderCategoriesInBatchMode(cats, catsMap) {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    grid.innerHTML = cats.map(c => `
        <div class="category-card ${selectedCategories.has(c) ? 'selected' : ''}" data-category="${escapeHtml(c)}">
            <div>📂 ${escapeHtml(c)}</div>
            <div class="medicine-count">📊 ${t('medicine_count')}: ${catsMap.get(c)}</div>
            <div class="checkbox" style="display: flex;"></div>
        </div>
    `).join('');
    grid.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const cat = card.getAttribute('data-category');
            toggleSelectCategory(cat);
            updateBatchRenameCategoriesCount();
        });
    });
}

function updateBatchRenameCategoriesCount() {
    const btn = document.getElementById('batchRenameCategoriesBtn');
    if (btn) btn.innerText = `✏️ تعديل جماعي (${selectedCategories.size})`;
}

function addNewCategoryForList() {
    const newCategory = prompt('أدخل اسم التصنيف الجديد:');
    if (!newCategory || !newCategory.trim()) return;
    updateCategoriesDatalist('medCategoriesList');
    updateCategoriesDatalist('genCategoriesList');
    alert(`تمت إضافة التصنيف "${newCategory}" إلى القائمة. يمكنك الآن استخدامه عند إضافة أو تعديل دواء.`);
    renderCategoriesPage();
}

window.addNewCompany = async function() {
    const newCompany = prompt('أدخل اسم الشركة الجديدة:');
    if (!newCompany || !newCompany.trim()) return;
    const origin = prompt('أدخل المنشأ (الدولة) للشركة (اختياري):', '');
    showLoading('جاري إضافة الشركة...');
    try {
        const dummyMed = {
            name: '___temp___',
            company: newCompany.trim(),
            origin: origin || '',
            type: MED_TYPES.GENERAL,
            expiry: '9999-12-31',
            createdAt: new Date().toISOString(),
            scientificName: '',
            category: '',
            dosageForm: '',
            dosage: '',
            barcode: '',
            image: null
        };
        await db.meds.add(dummyMed);
        await db.meds.where('name').equals('___temp___').delete();
        alert(`تمت إضافة الشركة "${newCompany}" بنجاح`);
        renderCompaniesPage();
    } catch(err) {
        console.error(err);
        alert('حدث خطأ');
    } finally {
        hideLoading();
    }
};

function renderMedicationsInList(list) {
    const container = document.getElementById('pageContent');
    if (!container) return;
    container.innerHTML = `<div class="content-list" id="contentList"></div>`;
    const listDiv = document.getElementById('contentList');
    if (!list.length) { listDiv.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`; return; }
    list.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const card = document.createElement('div');
        card.className = 'med-card';
        card.innerHTML = `<div class="med-info">${thumb}<div class="med-text"><div class="med-name">💊 ${escapeHtml(med.name)}</div></div></div>`;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button';
        deleteBtn.innerHTML = `<div class="trash-bin-icon"><div class="bin-lid"></div><div class="bin-container"><div class="bin-line"></div><div class="bin-line"></div></div></div>`;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(t('delete_confirm'))) {
                moveToDeleted(med.id);
            }
        });
        card.appendChild(deleteBtn);
        card.addEventListener('click', () => showMedDetails(med));
        listDiv.appendChild(card);
    });
}

async function renderExpiringSoonPage() {
    const list = await db.meds.toArray();
    const notificationDays = parseInt(localStorage.getItem('notificationDays') || '7');
    const soon = list.filter(m => { 
        const d = getDaysRemaining(m.expiry); 
        return d >= 0 && d <= notificationDays; 
    });
    const container = document.getElementById('pageContent');
    if (!container) return;
    container.innerHTML = `
        <div class="search-container">
            <div class="search-wrapper">
                <input type="text" id="search" placeholder="${t('search_placeholder')}">
                <button class="search-btn">${t('search_btn')}</button>
            </div>
            <div id="suggestionsBox" class="suggestions-list"></div>
        </div>
        <div class="content-list" id="contentList"></div>
    `;
    const searchInput = document.getElementById('search');
    const suggestionsBox = document.getElementById('suggestionsBox');
    if (searchInput) {
        enhanceSearchInput(searchInput, 'expiring');
    }
    await refreshWithPagination(soon, true);
}

async function renderInbox() {
    const notifs = await db.notifications.orderBy('date').reverse().toArray();
    const container = document.getElementById('pageContent');
    if (!container) return;
    if (!notifs.length) { container.innerHTML = `<div class="empty-state">${t('no_notifications')}</div>`; return; }
    container.innerHTML = notifs.map(n => `
        <div class="notification-item">
            <div>${escapeHtml(n.message)}</div>
            <div class="notification-date">${new Date(n.date).toLocaleString()}</div>
        </div>
    `).join('');
    await db.notifications.where('read').equals(false).modify({ read: true });
    updateNotifBadge();
}

async function renderExplore() {
    const container = document.getElementById('pageContent');
    if (!container) return;
    container.innerHTML = `
        <div class="explore-tabs">
            <button class="tab-btn active" data-tab="categories">${t('categories')}</button>
            <button class="tab-btn" data-tab="companies">${t('companies')}</button>
            <button class="tab-btn" data-tab="expiring">${t('expiring_soon')}</button>
        </div>
        <div id="tab-categories" class="tab-content active"></div>
        <div id="tab-companies" class="tab-content"></div>
        <div id="tab-expiring" class="tab-content"></div>
    `;
    const cats = await db.meds.toArray().then(m => [...new Set(m.map(x => x.category).filter(c => c))]);
    const catsDiv = document.getElementById('tab-categories');
    if (catsDiv) {
        catsDiv.innerHTML = cats.length ? `<div class="categories-grid">${cats.map(c => `<div class="category-card" data-category="${c}">${escapeHtml(c)}</div>`).join('')}</div>` : `<div class="empty-state">${t('no_categories')}</div>`;
        catsDiv.querySelectorAll('.category-card').forEach(card => card.addEventListener('click', async () => {
            const cat = card.getAttribute('data-category');
            const filtered = (await db.meds.toArray()).filter(m => m.category === cat);
            catsDiv.innerHTML = `<div class="content-list"></div>`;
            renderMedicationsInExplore(filtered, catsDiv);
        }));
    }
    const comps = await db.meds.toArray().then(m => [...new Set(m.map(x => x.company).filter(c => c && c.trim()))]);
    const compsDiv = document.getElementById('tab-companies');
    if (compsDiv) {
        compsDiv.innerHTML = comps.length ? `<div class="companies-grid">${comps.map(c => `<div class="company-card" data-company="${c}">${escapeHtml(c)}</div>`).join('')}</div>` : `<div class="empty-state">${t('no_companies')}</div>`;
        compsDiv.querySelectorAll('.company-card').forEach(card => card.addEventListener('click', async () => {
            const comp = card.getAttribute('data-company');
            const filtered = (await db.meds.toArray()).filter(m => m.company === comp);
            compsDiv.innerHTML = `<div class="content-list"></div>`;
            renderMedicationsInExplore(filtered, compsDiv);
        }));
    }
    const soon = (await db.meds.toArray()).filter(m => getDaysRemaining(m.expiry) <= 7);
    const expDiv = document.getElementById('tab-expiring');
    if (expDiv) {
        expDiv.innerHTML = soon.length ? `<div class="content-list"></div>` : `<div class="empty-state">${t('no_meds')}</div>`;
        if (soon.length) renderMedicationsInExplore(soon, expDiv);
    }
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            const activeTab = document.getElementById(`tab-${btn.dataset.tab}`);
            if (activeTab) activeTab.classList.add('active');
        });
    });
}

function renderMedicationsInExplore(list, parentDiv) {
    const container = parentDiv.querySelector('.content-list');
    if (!container) return;
    if (!list.length) { container.innerHTML = `<div class="empty-state">${t('no_meds')}</div>`; return; }
    container.innerHTML = '';
    list.forEach(med => {
        const thumb = med.image ? `<img src="${med.image}" class="med-image-thumb">` : '<div class="med-image-thumb">💊</div>';
        const card = document.createElement('div');
        card.className = 'med-card';
        card.innerHTML = `<div class="med-info">${thumb}<div class="med-text"><div class="med-name">💊 ${escapeHtml(med.name)}</div></div></div>`;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button';
        deleteBtn.innerHTML = `<div class="trash-bin-icon"><div class="bin-lid"></div><div class="bin-container"><div class="bin-line"></div><div class="bin-line"></div></div></div>`;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(t('delete_confirm'))) {
                moveToDeleted(med.id);
            }
        });
        card.appendChild(deleteBtn);
        card.addEventListener('click', () => showMedDetails(med));
        container.appendChild(card);
    });
}

// ========== كاميرا الباركود ==========
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
        resultDiv.innerHTML = '❌ لا يمكن الوصول إلى الكاميرا. يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح.';
        modal.style.display = 'flex';
        alert('لا يمكن الوصول إلى الكاميرا. يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح أو استخدم الإدخال اليدوي.');
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
        inputStream: { name: "Live", type: "LiveStream", target: video, constraints: { facingMode: "environment" } },
        decoder: { readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader"] },
        locate: true,
        numOfWorkers: 0
    }, (err) => {
        if (err) {
            resultDiv.innerHTML = '❌ تعذر فتح الكاميرا. يمكنك الإدخال يدويًا.';
            const manualBtn = document.getElementById('manualBarcodeBtn');
            if (manualBtn) manualBtn.style.display = 'inline-block';
            modal.style.display = 'flex';
            alert('تعذر الوصول إلى الكاميرا. استخدم الإدخال اليدوي.');
            return;
        }
        Quagga.start();
        currentScanner = Quagga;
        resultDiv.innerHTML = 'انتظر حتى يتم مسح الباركود...';
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
        resultDiv.innerHTML = '❌ لا يمكن الوصول إلى الكاميرا. يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح.';
        modal.style.display = 'flex';
        alert('لا يمكن الوصول إلى الكاميرا. يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح أو استخدم الإدخال اليدوي.');
        return;
    }
    
    modal.style.display = 'flex';
    resultDiv.innerHTML = 'جاري تشغيل الكاميرا...';
    if (currentScanner) {
        try { currentScanner.stop(); } catch(e) {}
        currentScanner = null;
    }
    Quagga.init({
        inputStream: { name: "Live", type: "LiveStream", target: video, constraints: { facingMode: "environment" } },
        decoder: { readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader"] },
        locate: true,
        numOfWorkers: 0
    }, (err) => {
        if (err) {
            resultDiv.innerHTML = '❌ تعذر فتح الكاميرا. يمكنك الإدخال يدويًا.';
            const manualBtn = document.getElementById('manualBarcodeBtn');
            if (manualBtn) manualBtn.style.display = 'inline-block';
            alert('تعذر الوصول إلى الكاميرا. استخدم الإدخال اليدوي.');
            return;
        }
        Quagga.start();
        currentScanner = Quagga;
        resultDiv.innerHTML = 'انتظر حتى يتم مسح الباركود...';
        const manualBtn = document.getElementById('manualBarcodeBtn');
        if (manualBtn) manualBtn.style.display = 'inline-block';
    });
    Quagga.onDetected(async (data) => {
        const code = data.codeResult.code;
        resultDiv.innerHTML = `✅ تم مسح: ${code}`;
        Quagga.stop();
        currentScanner = null;
        modal.style.display = 'none';
        const med = await db.meds.where('barcode').equals(code).first();
        if (med) showMedDetails(med);
        else alert('لم يتم العثور على دواء بهذا الباركود');
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

// ========== إضافة إلى الصيدلية ==========
async function addToPharmacy(originalMed) {
    const existingCount = await db.meds.where('type').equals(MED_TYPES.PHARMACY)
        .and(m => m.name === originalMed.name &&
                 m.company === originalMed.company &&
                 m.dosageForm === originalMed.dosageForm &&
                 m.dosage === originalMed.dosage).count();
    let proceed = true;
    if (existingCount > 0) {
        proceed = confirm(t('medicine_exists_in_pharmacy'));
    }
    if (!proceed) return;
    const newExpiry = prompt(t('add_expiry'), new Date(Date.now() + 30*86400000).toISOString().split('T')[0]);
    if (!newExpiry) return;
    const newMed = {
        name: originalMed.name,
        expiry: newExpiry,
        scientificName: originalMed.scientificName || '',
        company: originalMed.company || '',
        origin: originalMed.origin || '',
        type: MED_TYPES.PHARMACY,
        category: originalMed.category || '',
        barcode: originalMed.barcode || '',
        image: originalMed.image || null,
        dosageForm: originalMed.dosageForm || '',
        dosage: originalMed.dosage || '',
        createdAt: new Date().toISOString()
    };
    await db.meds.add(newMed);
    await addMedicineToGeneralIfNotExists(newMed);
    const toast = document.createElement('div');
    toast.className = 'offline-toast';
    toast.innerText = t('added_to_pharmacy');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
    refreshCurrentPage();
}

// ========== نماذج الإضافة والتعديل ==========
function showAddFormModal() {
    isEditing = false;
    const titleEl = document.getElementById('medFormTitle');
    if (titleEl) titleEl.innerText = t('add_med');
    const submitBtn = document.getElementById('submitMedBtn');
    if (submitBtn) submitBtn.innerText = t('save_med');
    const nameInput = document.getElementById('medName');
    if (nameInput) nameInput.value = '';
    const scientificInput = document.getElementById('scientificName');
    if (scientificInput) scientificInput.value = '';
    const companyInput = document.getElementById('company');
    if (companyInput) companyInput.value = '';
    const originInput = document.getElementById('origin');
    if (originInput) originInput.value = '';
    const typeSelect = document.getElementById('medType');
    if (typeSelect) typeSelect.value = MED_TYPES.PHARMACY;
    const categorySelect = document.getElementById('medCategory');
    if (categorySelect) categorySelect.value = '';
    const dosageFormInput = document.getElementById('dosageForm');
    if (dosageFormInput) dosageFormInput.value = '';
    const dosageInput = document.getElementById('dosage');
    if (dosageInput) dosageInput.value = '';
    const barcodeInput = document.getElementById('medBarcode');
    if (barcodeInput) barcodeInput.value = '';
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) imagePreview.innerHTML = '';
    const imageInput = document.getElementById('medImage');
    if (imageInput) imageInput.value = '';
    const defaultPeriod = parseInt(localStorage.getItem('defaultExpiryPeriod') || '365');
    const expiry1 = document.getElementById('medExpiry1');
    const expiry2 = document.getElementById('medExpiry2');
    const expiry3 = document.getElementById('medExpiry3');
    if (defaultPeriod > 0) {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + defaultPeriod);
        const defaultDateStr = defaultDate.toISOString().split('T')[0];
        if (expiry1) expiry1.value = defaultDateStr;
        if (expiry2) expiry2.value = '';
        if (expiry3) expiry3.value = '';
    } else {
        if (expiry1) expiry1.value = '';
        if (expiry2) expiry2.value = '';
        if (expiry3) expiry3.value = '';
    }
    updateCategoriesDatalist('medCategoriesList');
    openModal('medFormModal');
}

function showEditFormModal(med) {
    isEditing = true;
    currentMed = med;
    const titleEl = document.getElementById('medFormTitle');
    if (titleEl) titleEl.innerText = t('edit_med');
    const submitBtn = document.getElementById('submitMedBtn');
    if (submitBtn) submitBtn.innerText = t('save_med');
    const nameInput = document.getElementById('medName');
    if (nameInput) nameInput.value = med.name;
    const scientificInput = document.getElementById('scientificName');
    if (scientificInput) scientificInput.value = med.scientificName || '';
    const companyInput = document.getElementById('company');
    if (companyInput) companyInput.value = med.company || '';
    const originInput = document.getElementById('origin');
    if (originInput) originInput.value = med.origin || '';
    const typeSelect = document.getElementById('medType');
    if (typeSelect) typeSelect.value = med.type || MED_TYPES.PHARMACY;
    const categorySelect = document.getElementById('medCategory');
    if (categorySelect) categorySelect.value = med.category || '';
    const dosageFormInput = document.getElementById('dosageForm');
    if (dosageFormInput) dosageFormInput.value = med.dosageForm || '';
    const dosageInput = document.getElementById('dosage');
    if (dosageInput) dosageInput.value = med.dosage || '';
    const expiry1 = document.getElementById('medExpiry1');
    if (expiry1) expiry1.value = med.expiry;
    const expiry2 = document.getElementById('medExpiry2');
    if (expiry2) expiry2.value = '';
    const expiry3 = document.getElementById('medExpiry3');
    if (expiry3) expiry3.value = '';
    const barcodeInput = document.getElementById('medBarcode');
    if (barcodeInput) barcodeInput.value = med.barcode || '';
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        if (med.image) imagePreview.innerHTML = `<img src="${med.image}" style="max-width:100%; max-height:100%;">`;
        else imagePreview.innerHTML = '';
    }
    updateCategoriesDatalist('medCategoriesList');
    openModal('medFormModal');
}

async function saveMedFromForm() {
    showLoading('جاري حفظ الدواء...');
    try {
        const name = document.getElementById('medName')?.value.trim();
        const expiry1 = document.getElementById('medExpiry1')?.value;
        const expiry2 = document.getElementById('medExpiry2')?.value;
        const expiry3 = document.getElementById('medExpiry3')?.value;
        const expiries = [expiry1, expiry2, expiry3].filter(e => e && e.trim());
        if (!name || expiries.length === 0) {
            alert(t('trade_name') + ' و ' + t('expiry_date') + ' ' + (currentLang === 'ar' ? 'مطلوبان' : 'required'));
            return;
        }
        const baseData = {
            name,
            scientificName: document.getElementById('scientificName')?.value.trim() || '',
            company: document.getElementById('company')?.value.trim() || '',
            origin: document.getElementById('origin')?.value.trim() || '',
            type: MED_TYPES.PHARMACY,
            category: document.getElementById('medCategory')?.value || '',
            dosageForm: document.getElementById('dosageForm')?.value.trim() || '',
            dosage: document.getElementById('dosage')?.value.trim() || '',
            barcode: document.getElementById('medBarcode')?.value.trim() || '',
            image: null,
            createdAt: new Date().toISOString()
        };
        const imgFile = document.getElementById('medImage')?.files[0];
        const saveOrUpdate = async (data) => {
            if (isEditing) {
                delete data.createdAt;
                data.id = currentMed.id;
                await db.meds.update(currentMed.id, data);
                closeMedFormModal();
                refreshCurrentPage();
                updateBarChart();
                alert(currentLang === 'ar' ? 'تم التعديل بنجاح' : 'Updated successfully');
            } else {
                for (let expiry of expiries) {
                    const newMed = { ...data, expiry };
                    await db.meds.add(newMed);
                    await addMedicineToGeneralIfNotExists(newMed);
                }
                closeMedFormModal();
                refreshCurrentPage();
                updateBarChart();
                alert(currentLang === 'ar' ? 'تمت الإضافة بنجاح' : 'Added successfully');
            }
        };
        if (imgFile) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                baseData.image = e.target.result;
                await saveOrUpdate(baseData);
            };
            reader.readAsDataURL(imgFile);
        } else {
            if (isEditing && currentMed.image) baseData.image = currentMed.image;
            await saveOrUpdate(baseData);
        }
    } catch (err) {
        console.error(err);
        alert('حدث خطأ');
    } finally {
        hideLoading();
    }
}

function closeMedFormModal() { closeModal('medFormModal'); }

function showAddGeneralFormModal() {
    const titleEl = document.getElementById('generalFormTitle');
    if (titleEl) titleEl.innerText = t('add_med');
    const submitBtn = document.getElementById('submitGeneralBtn');
    if (submitBtn) submitBtn.innerText = t('save_med');
    const nameInput = document.getElementById('genName');
    if (nameInput) nameInput.value = '';
    const scientificInput = document.getElementById('genScientificName');
    if (scientificInput) scientificInput.value = '';
    const companyInput = document.getElementById('genCompany');
    if (companyInput) companyInput.value = '';
    const originInput = document.getElementById('genOrigin');
    if (originInput) originInput.value = '';
    const categorySelect = document.getElementById('genCategory');
    if (categorySelect) categorySelect.value = '';
    const dosageFormInput = document.getElementById('genDosageForm');
    if (dosageFormInput) dosageFormInput.value = '';
    const dosageInput = document.getElementById('genDosage');
    if (dosageInput) dosageInput.value = '';
    const barcodeInput = document.getElementById('genBarcode');
    if (barcodeInput) barcodeInput.value = '';
    const imagePreview = document.getElementById('genImagePreview');
    if (imagePreview) imagePreview.innerHTML = '';
    const imageInput = document.getElementById('genImage');
    if (imageInput) imageInput.value = '';
    updateCategoriesDatalist('genCategoriesList');
    openModal('generalFormModal');
}

async function saveGeneralMedFromForm() {
    showLoading('جاري حفظ الدواء...');
    try {
        const name = document.getElementById('genName')?.value.trim();
        if (!name) {
            alert(t('trade_name') + ' ' + (currentLang === 'ar' ? 'مطلوب' : 'required'));
            return;
        }
        const medData = {
            name,
            scientificName: document.getElementById('genScientificName')?.value.trim() || '',
            company: document.getElementById('genCompany')?.value.trim() || '',
            origin: document.getElementById('genOrigin')?.value.trim() || '',
            type: MED_TYPES.GENERAL,
            category: document.getElementById('genCategory')?.value || '',
            dosageForm: document.getElementById('genDosageForm')?.value.trim() || '',
            dosage: document.getElementById('genDosage')?.value.trim() || '',
            barcode: document.getElementById('genBarcode')?.value.trim() || '',
            expiry: '9999-12-31',
            image: null,
            createdAt: new Date().toISOString()
        };
        const imgFile = document.getElementById('genImage')?.files[0];
        const save = async (data) => {
            await db.meds.add(data);
            closeGeneralFormModal();
            refreshCurrentPage();
            updateBarChart();
            alert(currentLang === 'ar' ? 'تمت الإضافة بنجاح' : 'Added successfully');
        };
        if (imgFile) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                medData.image = e.target.result;
                await save(medData);
            };
            reader.readAsDataURL(imgFile);
        } else {
            await save(medData);
        }
    } catch (err) {
        console.error(err);
        alert('حدث خطأ');
    } finally {
        hideLoading();
    }
}

function closeGeneralFormModal() { closeModal('generalFormModal'); }

async function updateCategoriesDatalist(datalistId) {
    const datalist = document.getElementById(datalistId);
    if (!datalist) return;
    const meds = await db.meds.toArray();
    const categories = new Set();
    meds.forEach(med => {
        if (med.category && med.category.trim()) {
            categories.add(med.category);
        }
    });
    const defaultCategories = ['مضادات حيوية', 'مسكنات', 'أدوية الضغط والقلب', 'فيتامينات', 'أدوية الجهاز الهضمي', 'أدوية الجهاز التنفسي', 'أدوية السكري', 'أدوية موضعية', 'أخرى', 'Herbal medicines', 'ENT & Eye (Ophthalmological drugs)', 'Nervous system (Analgesics)', 'Cardiovascular system (Antihypertensives)', 'Infections & Antimicrobials (Antibiotics)', 'Endocrine system (Insulins & oral antidiabetics)', 'Respiratory system (Bronchodilators)'];
    defaultCategories.forEach(c => categories.add(c));
    datalist.innerHTML = Array.from(categories).map(c => `<option value="${escapeHtml(c)}">`).join('');
}

window.addNewCategory = function(inputId) {
    const newCategory = prompt('أدخل اسم التصنيف الجديد:');
    if (newCategory && newCategory.trim()) {
        const input = document.getElementById(inputId);
        if (input) input.value = newCategory.trim();
        updateCategoriesDatalist('medCategoriesList');
        updateCategoriesDatalist('genCategoriesList');
    }
};

// ========== الإعدادات ==========
function openSettingsModal() {
    renderSettingsMainMenu();
    openModal('settingsModal');
}

function renderSettingsMainMenu() {
    const container = document.getElementById('settingsContent');
    if (!container) return;
    container.innerHTML = `
        <div class="settings-menu">
            <div class="settings-menu-item" data-page="language"><div class="settings-menu-icon">🌐</div><div class="settings-menu-text">${t('language')}</div><div class="settings-menu-arrow">→</div></div>
            <div class="settings-menu-item" data-page="darkmode"><div class="settings-menu-icon">🌙</div><div class="settings-menu-text">${t('dark_mode')}</div><div class="settings-menu-arrow">→</div></div>
            <div class="settings-menu-item" data-page="notify"><div class="settings-menu-icon">⏰</div><div class="settings-menu-text">${t('notification_days')}</div><div class="settings-menu-arrow">→</div></div>
            <div class="settings-menu-item" data-page="defaultExpiry"><div class="settings-menu-icon">📅</div><div class="settings-menu-text">${t('default_expiry')}</div><div class="settings-menu-arrow">→</div></div>
            <div class="settings-menu-item" data-page="searchHistory"><div class="settings-menu-icon">🔍</div><div class="settings-menu-text">${t('search_history')}</div><div class="settings-menu-arrow">→</div></div>
            <div class="settings-menu-item" data-page="backupRestore"><div class="settings-menu-icon">💾</div><div class="settings-menu-text">${t('backup_restore')}</div><div class="settings-menu-arrow">→</div></div>
            <div class="settings-menu-item" data-page="exportCSVPDF"><div class="settings-menu-icon">📄</div><div class="settings-menu-text">${t('export_csv')} / PDF</div><div class="settings-menu-arrow">→</div></div>
            <div class="settings-menu-item" data-page="about"><div class="settings-menu-icon">ℹ️</div><div class="settings-menu-text">${t('about_app')}</div><div class="settings-menu-arrow">→</div></div>
        </div>
    `;
    container.querySelectorAll('.settings-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            renderSettingsPage(page);
        });
    });
}

function renderSettingsPage(page) {
    const container = document.getElementById('settingsContent');
    if (!container) return;
    let html = '';
    switch(page) {
        case 'language':
            html = `<div class="settings-page"><div class="settings-page-header"><button class="settings-back-btn">←</button><div class="settings-page-title">${t('language')}</div></div><div class="settings-page-content"><div class="settings-option"><label>${currentLang === 'ar' ? 'اختر اللغة' : 'Select Language'}</label><select id="langSelectSettings"><option value="ar" ${currentLang === 'ar' ? 'selected' : ''}>العربية</option><option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option></select><button id="applyLangSettingsBtn" class="small-btn">${t('save')}</button></div></div></div>`;
            break;
        case 'darkmode':
            html = `<div class="settings-page"><div class="settings-page-header"><button class="settings-back-btn">←</button><div class="settings-page-title">${t('dark_mode')}</div></div><div class="settings-page-content"><div class="settings-option"><label>${t('dark_mode')}</label><button id="darkModeSettingsBtn" class="small-btn">${document.body.classList.contains('dark') ? (currentLang === 'ar' ? 'إيقاف' : 'Disable') : (currentLang === 'ar' ? 'تشغيل' : 'Enable')}</button></div></div></div>`;
            break;
        case 'notify':
            html = `<div class="settings-page"><div class="settings-page-header"><button class="settings-back-btn">←</button><div class="settings-page-title">${t('notification_days')}</div></div><div class="settings-page-content"><div class="settings-option"><label>${t('notification_days')}</label><input type="number" id="notificationDaysSettings" min="1" max="90" value="${localStorage.getItem('notificationDays') || '7'}" style="width: 80px; text-align: center;"><button id="saveNotificationDaysSettingsBtn" class="small-btn">${t('save')}</button></div></div></div>`;
            break;
        case 'defaultExpiry':
            html = `<div class="settings-page"><div class="settings-page-header"><button class="settings-back-btn">←</button><div class="settings-page-title">${t('default_expiry')}</div></div><div class="settings-page-content"><div class="settings-option"><label>${t('default_expiry')}</label><select id="defaultExpiryPeriodSettings"><option value="365" ${(localStorage.getItem('defaultExpiryPeriod') || '365') === '365' ? 'selected' : ''}>${t('one_year')}</option><option value="730" ${localStorage.getItem('defaultExpiryPeriod') === '730' ? 'selected' : ''}>${t('two_years')}</option><option value="1095" ${localStorage.getItem('defaultExpiryPeriod') === '1095' ? 'selected' : ''}>${t('three_years')}</option><option value="1825" ${localStorage.getItem('defaultExpiryPeriod') === '1825' ? 'selected' : ''}>${t('five_years')}</option><option value="0" ${localStorage.getItem('defaultExpiryPeriod') === '0' ? 'selected' : ''}>${t('manual')}</option></select><button id="saveDefaultExpirySettingsBtn" class="small-btn">${t('save')}</button></div></div></div>`;
            break;
        case 'searchHistory':
            html = `<div class="settings-page"><div class="settings-page-header"><button class="settings-back-btn">←</button><div class="settings-page-title">${t('search_history')}</div></div><div class="settings-page-content" id="searchHistoryPageContent"></div></div>`;
            break;
        case 'backupRestore':
            html = `<div class="settings-page"><div class="settings-page-header"><button class="settings-back-btn">←</button><div class="settings-page-title">${t('backup_restore')}</div></div><div class="settings-page-content"><div class="import-export-grid"><div class="import-export-item"><span>${t('all_medicines')}</span><div class="import-export-buttons"><button id="exportGeneralSettingsBtn" class="small-btn">${t('export_db')}</button><label class="small-btn" style="background: var(--primary); cursor: pointer;">${t('import_db')}<input type="file" id="importGeneralSettingsInput" accept=".json" style="display: none;"></label></div></div><div class="import-export-item"><span>${t('pharmacy_medicines')}</span><div class="import-export-buttons"><button id="exportPharmacySettingsBtn" class="small-btn">${t('export_db')}</button><label class="small-btn" style="background: var(--primary); cursor: pointer;">${t('import_db')}<input type="file" id="importPharmacySettingsInput" accept=".json" style="display: none;"></label></div></div></div></div></div>`;
            break;
        case 'exportCSVPDF':
            html = `<div class="settings-page"><div class="settings-page-header"><button class="settings-back-btn">←</button><div class="settings-page-title">${t('export_csv')} / PDF</div></div><div class="settings-page-content"><div class="import-export-buttons"><button id="exportCsvSettingsBtn" class="small-btn">CSV</button><button id="exportPdfSettingsBtn" class="small-btn">PDF</button></div></div></div>`;
            break;
        case 'about':
            html = `<div class="settings-page"><div class="settings-page-header"><button class="settings-back-btn">←</button><div class="settings-page-title">${t('about_app')}</div></div><div class="settings-page-content"><div class="settings-option" style="justify-content: center;"><p>${t('about_text')}</p></div></div></div>`;
            break;
        default: return;
    }
    container.innerHTML = html;
    const backBtn = container.querySelector('.settings-back-btn');
    if (backBtn) backBtn.addEventListener('click', renderSettingsMainMenu);
    if (page === 'language') {
        const applyBtn = document.getElementById('applyLangSettingsBtn');
        if (applyBtn) applyBtn.addEventListener('click', () => {
            const newLang = document.getElementById('langSelectSettings').value;
            changeLanguage(newLang);
            renderSettingsPage('language');
        });
    } else if (page === 'darkmode') {
        const darkBtn = document.getElementById('darkModeSettingsBtn');
        if (darkBtn) darkBtn.addEventListener('click', () => {
            toggleDarkMode();
            renderSettingsPage('darkmode');
        });
    } else if (page === 'notify') {
        const saveBtn = document.getElementById('saveNotificationDaysSettingsBtn');
        if (saveBtn) saveBtn.addEventListener('click', () => {
            const days = parseInt(document.getElementById('notificationDaysSettings').value);
            if (days >= 1 && days <= 90) {
                localStorage.setItem('notificationDays', days);
                alert(t('notification_set'));
            } else {
                alert(currentLang === 'ar' ? 'يجب أن تكون القيمة بين 1 و 90' : 'Value must be between 1 and 90');
            }
        });
    } else if (page === 'defaultExpiry') {
        const saveBtn = document.getElementById('saveDefaultExpirySettingsBtn');
        if (saveBtn) saveBtn.addEventListener('click', () => {
            const period = parseInt(document.getElementById('defaultExpiryPeriodSettings').value);
            localStorage.setItem('defaultExpiryPeriod', period);
            alert(t('default_expiry_set'));
        });
    } else if (page === 'searchHistory') {
        renderSearchHistoryInSettingsPage();
    } else if (page === 'backupRestore') {
        const exportGeneralBtn = document.getElementById('exportGeneralSettingsBtn');
        if (exportGeneralBtn) exportGeneralBtn.addEventListener('click', exportGeneral);
        const importGeneralInput = document.getElementById('importGeneralSettingsInput');
        if (importGeneralInput) {
            importGeneralInput.addEventListener('change', e => importGeneral(e.target.files[0]));
        }
        const exportPharmacyBtn = document.getElementById('exportPharmacySettingsBtn');
        if (exportPharmacyBtn) exportPharmacyBtn.addEventListener('click', exportPharmacy);
        const importPharmacyInput = document.getElementById('importPharmacySettingsInput');
        if (importPharmacyInput) {
            importPharmacyInput.addEventListener('change', e => importPharmacy(e.target.files[0]));
        }
    } else if (page === 'exportCSVPDF') {
        const csvBtn = document.getElementById('exportCsvSettingsBtn');
        if (csvBtn) csvBtn.addEventListener('click', exportCSV);
        const pdfBtn = document.getElementById('exportPdfSettingsBtn');
        if (pdfBtn) pdfBtn.addEventListener('click', exportPDF);
    }
}

function renderSearchHistoryInSettingsPage() {
    const container = document.getElementById('searchHistoryPageContent');
    if (!container) return;
    const categories = [
        { key: 'all', label: 'كل الأدوية' },
        { key: 'pharmacy', label: 'أدوية الصيدلية' },
        { key: 'companies', label: 'الشركات' },
        { key: 'expiring', label: 'المنتهية قريباً' }
    ];
    let html = '';
    for (let cat of categories) {
        const searches = recentSearches[cat.key] || [];
        html += `
            <div class="history-category">
                <div class="history-category-title"><span>${cat.label}</span><button class="small-btn danger-btn" data-clear="${cat.key}">مسح الكل</button></div>
                <div class="history-items">
                    ${searches.map(s => `<div class="history-item"><span>${escapeHtml(s)}</span><button class="delete-history" data-category="${cat.key}" data-term="${escapeHtml(s)}">✖</button></div>`).join('')}
                    ${searches.length === 0 ? '<span class="empty-state" style="font-size:12px;">لا توجد عمليات بحث سابقة</span>' : ''}
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
    container.querySelectorAll('[data-clear]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-clear');
            clearSearchHistory(key);
            renderSearchHistoryInSettingsPage();
        });
    });
    container.querySelectorAll('.delete-history').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            const term = btn.getAttribute('data-term');
            const arr = recentSearches[category];
            const newArr = arr.filter(s => s !== term);
            recentSearches[category] = newArr;
            localStorage.setItem(`recentSearches_${category}`, JSON.stringify(newArr));
            renderSearchHistoryInSettingsPage();
            refreshCurrentPage();
        });
    });
}

// ========== التصدير والاستيراد ==========
async function exportGeneral() {
    await exportByType(MED_TYPES.GENERAL, 'general_medicines', true);
}

async function exportPharmacy() {
    await exportByType(MED_TYPES.PHARMACY, 'pharmacy_medicines', false);
}

async function exportByType(type, filename, useOriginalFormat = false) {
    showLoading('جاري تصدير البيانات...');
    try {
        const meds = await db.meds.where('type').equals(type).toArray();
        let exportData;
        if (useOriginalFormat && type === MED_TYPES.GENERAL) {
            exportData = meds.map(m => ({
                scientific_name: m.scientificName || '',
                trade_name: m.name,
                manufacturer_name: m.company || '',
                manufacturer_nationality: m.origin || '',
                Dose: m.dosage || '',
                "Dosage form": m.dosageForm || ''
            }));
        } else {
            exportData = { meds, type };
        }
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        saveAs(blob, `${filename}_${new Date().toISOString().slice(0,10)}.json`);
    } finally { hideLoading(); }
}

async function importGeneral(file) {
    if (!file) return;
    showLoading('جاري استيراد البيانات...');
    try {
        const text = await file.text();
        let data = safeParseJSON(text);
        let meds = [];
        if (data.meds && Array.isArray(data.meds)) {
            meds = data.meds;
        } else if (Array.isArray(data)) {
            for (let item of data) {
                const tradeName = (item.trade_name || '').trim();
                if (!tradeName) continue;
                const scientificName = (item.scientific_name || '').trim();
                const company = (item.manufacturer_name || '').trim();
                const origin = (item.manufacturer_nationality || '').trim();
                const dosageForm = (item['Dosage form'] || '').trim();
                const dosage = (item.Dose || '').trim();
                const category = (item.category || '').trim();
                meds.push({
                    name: tradeName,
                    scientificName: scientificName,
                    company: company,
                    origin: origin,
                    dosageForm: dosageForm,
                    dosage: dosage,
                    category: category,
                    type: MED_TYPES.GENERAL,
                    expiry: '9999-12-31',
                    createdAt: new Date().toISOString(),
                    barcode: '',
                    image: null
                });
            }
        } else {
            throw new Error('تنسيق غير صحيح');
        }
        meds = meds.filter(m => !m.type || m.type === MED_TYPES.GENERAL).map(m => ({ ...m, type: MED_TYPES.GENERAL }));
        await db.transaction('rw', db.meds, async () => {
            await db.meds.bulkPut(meds);
        });
        alert(currentLang === 'ar' ? 'تم استيراد البيانات بنجاح' : 'Data imported successfully');
        refreshCurrentPage();
        updateCategoriesDatalist('medCategoriesList');
        updateCategoriesDatalist('genCategoriesList');
    } catch (err) {
        console.error(err);
        alert(currentLang === 'ar' ? 'خطأ في الملف' : 'Invalid file');
    } finally {
        hideLoading();
    }
}

async function importPharmacy(file) {
    if (!file) return;
    showLoading('جاري استيراد البيانات...');
    try {
        const text = await file.text();
        const data = safeParseJSON(text);
        let meds = [];
        if (data.meds && Array.isArray(data.meds)) meds = data.meds;
        else if (Array.isArray(data)) meds = data;
        else throw new Error('تنسيق غير صحيح');
        meds = meds.filter(m => !m.type || m.type === MED_TYPES.PHARMACY).map(m => ({ ...m, type: MED_TYPES.PHARMACY }));
        await db.transaction('rw', db.meds, async () => {
            await db.meds.bulkPut(meds);
        });
        alert(currentLang === 'ar' ? 'تم استيراد البيانات بنجاح' : 'Data imported successfully');
        refreshCurrentPage();
    } catch (err) {
        console.error(err);
        alert(currentLang === 'ar' ? 'خطأ في الملف' : 'Invalid file');
    } finally {
        hideLoading();
    }
}

function safeParseJSON(content) {
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    content = content.replace(/,\s*([}\]])/g, '$1');
    try {
        return JSON.parse(content);
    } catch (e) {
        console.warn('فشل التحليل المباشر، محاولة إصلاح إضافي...');
        const items = [];
        const regex = /\{[^{}]*\}/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            try {
                const obj = JSON.parse(match[0]);
                items.push(obj);
            } catch (inner) { }
        }
        if (items.length > 0) {
            return items;
        }
        throw e;
    }
}

async function exportCSV() {
    showLoading('جاري تصدير CSV...');
    try {
        const medsArr = await db.meds.toArray();
        const headers = ['الاسم', 'العلمي', 'الشركة', 'المنشأ', 'النوع', 'التصنيف', 'الشكل الدوائي', 'الجرعة', 'تاريخ الانتهاء', 'الباركود', 'تاريخ الإضافة'];
        const rows = medsArr.map(m => [m.name, m.scientificName || '', m.company || '', m.origin || '', m.type === MED_TYPES.PHARMACY ? 'صيدلية' : 'عام', m.category || '', m.dosageForm || '', m.dosage || '', m.expiry, m.barcode || '', m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '']);
        let csv = headers.join(',') + '\n' + rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'pharmacy_export.csv');
    } finally {
        hideLoading();
    }
}

async function exportPDF() {
    showLoading('جاري تصدير PDF...');
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape' });
        const medsArr = await db.meds.toArray();
        const tableData = medsArr.map(m => [m.name, m.scientificName || '', m.company || '', m.dosageForm || '', m.dosage || '', m.expiry, m.barcode || '', m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '']);
        doc.autoTable({ head: [[t('name'), t('scientific_name'), t('company'), t('dosage_form'), t('dosage'), t('expiry_date'), t('barcode_label'), 'تاريخ الإضافة']], body: tableData, styles: { font: 'helvetica', halign: 'right' }, startY: 20 });
        doc.save('pharmacy_export.pdf');
    } finally {
        hideLoading();
    }
}

// ========== الإشعارات ==========
async function checkAndSendExpiryNotifications() {
    const notificationDays = parseInt(localStorage.getItem('notificationDays') || '7');
    const medsArr = await db.meds.toArray();
    const expiringSoon = medsArr.filter(m => {
        const d = getDaysRemaining(m.expiry);
        return d >= 0 && d <= notificationDays;
    });
    if (!expiringSoon.length) return;
    
    const now = new Date();
    const toSend = [];
    for (const med of expiringSoon) {
        const log = await db.notificationLog.where('medId').equals(med.id).first();
        if (!log) {
            toSend.push(med);
        } else {
            const lastNotified = new Date(log.lastNotified);
            const daysDiff = (now - lastNotified) / (1000*60*60*24);
            if (daysDiff >= 1) {
                toSend.push(med);
            }
        }
    }
    if (!toSend.length) return;
    
    if (Notification.permission === 'granted') {
        toSend.forEach(med => {
            const days = getDaysRemaining(med.expiry);
            new Notification(`⚠️ ${med.name}`, { body: currentLang === 'ar' ? `ينتهي خلال ${days} أيام` : `Expires in ${days} days` });
        });
    }
    for (const med of toSend) {
        const days = getDaysRemaining(med.expiry);
        await db.notifications.add({
            message: `${med.name} ${currentLang === 'ar' ? 'ينتهي خلال' : 'expires in'} ${days} ${currentLang === 'ar' ? 'أيام' : 'days'}`,
            date: now,
            read: false
        });
        await db.notificationLog.put({ medId: med.id, lastNotified: now, count: 1 });
    }
    updateNotifBadge();
}

async function updateNotifBadge() {
    const count = await db.notifications.where('read').equals(false).count();
    const badge = document.getElementById('notifBadge');
    if (badge) {
        if (count > 0) { badge.innerText = count; badge.style.display = 'flex'; }
        else badge.style.display = 'none';
    }
}

// ========== عرض تفاصيل الدواء ==========
async function showMedDetails(med) {
    currentMed = med;
    const detailDiv = document.getElementById('medDetail');
    if (!detailDiv) return;
    detailDiv.innerHTML = `
        <div class="med-detail-item"><div class="med-detail-label">${t('name')}</div><div class="med-detail-value">${escapeHtml(med.name)}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('scientific_name')}</div><div class="med-detail-value">${escapeHtml(med.scientificName || '-')}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('company')}</div><div class="med-detail-value">${escapeHtml(med.company || '-')}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('origin')}</div><div class="med-detail-value">${escapeHtml(med.origin || '-')}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('category')}</div><div class="med-detail-value">${escapeHtml(med.category || '-')}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('dosage_form')}</div><div class="med-detail-value">${escapeHtml(med.dosageForm || '-')}</div></div>
        <div class="med-detail-item"><div class="med-detail-label">${t('dosage')}</div><div class="med-detail-value">${escapeHtml(med.dosage || '-')}</div></div>
    `;
    // إظهار تاريخ الانتهاء فقط إذا لم تكن الصفحة "كل الأدوية"
    if (currentPage !== 'all') {
        const expiryHtml = `<div class="med-detail-item"><div class="med-detail-label">${t('expiry_date')}</div><div class="med-detail-value">${escapeHtml(med.expiry)}</div></div>`;
        detailDiv.insertAdjacentHTML('beforeend', expiryHtml);
    }
    detailDiv.insertAdjacentHTML('beforeend', `
        <div class="med-detail-item"><div class="med-detail-label">${t('barcode_label')}</div><div class="med-detail-value">${escapeHtml(med.barcode || '-')}</div></div>
        ${med.image ? `<div class="med-image"><img src="${med.image}" style="max-width:100%; border-radius:12px;"></div>` : ''}
    `);
    const addBtn = document.getElementById('addToPharmacyBtn');
    if (addBtn) {
        if (currentPage === 'pharmacy' || currentPage === 'companies') {
            addBtn.style.display = 'none';
        } else {
            addBtn.style.display = 'inline-flex';
        }
    }
    const editBtn = document.getElementById('editMedBtn');
    if (editBtn) editBtn.onclick = () => { closeModal('medModal'); showEditFormModal(med); };
    const addPharmacyBtn = document.getElementById('addToPharmacyBtn');
    if (addPharmacyBtn) addPharmacyBtn.onclick = async () => { await addToPharmacy(med); closeModal('medModal'); };
    openModal('medModal');
}

function showFirstTimeGuidance() {
    const firstVisit = localStorage.getItem('firstVisit');
    if (!firstVisit) {
        setTimeout(() => {
            const toast = document.createElement('div');
            toast.className = 'offline-toast';
            toast.style.backgroundColor = 'var(--primary)';
            toast.innerText = t('long_press_guide');
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
            localStorage.setItem('firstVisit', 'true');
        }, 1000);
    }
}

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    updateAllText();
    if (currentPage === 'home') updateBarChart();
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
    if (currentPage === 'home') updateBarChart();
}

function clearSearchHistory(pageKey) {
    recentSearches[pageKey] = [];
    localStorage.setItem(`recentSearches_${pageKey}`, '[]');
    refreshCurrentPage();
}

function openModal(id) { const modal = document.getElementById(id); if (modal) modal.style.display = 'flex'; }
function closeModal(id) { const modal = document.getElementById(id); if (modal) modal.style.display = 'none'; }
function setupModalBackdropClose() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// ========== ربط الدوال بالنافذة ==========
window.goHome = goHome;
window.switchPage = switchPage;
window.openSettingsModal = openSettingsModal;
window.closeModal = closeModal;
window.editCurrentMed = function() { if (currentMed) showEditFormModal(currentMed); };
window.addCurrentToPharmacy = function() { if (currentMed) addToPharmacy(currentMed); };
window.saveMedFromForm = saveMedFromForm;
window.closeMedFormModal = closeMedFormModal;
window.saveGeneralMedFromForm = saveGeneralMedFromForm;
window.closeGeneralFormModal = closeGeneralFormModal;
window.startBarcodeScanner = startBarcodeScanner;
window.stopScannerAndClose = stopScannerAndClose;
window.showMedDetails = showMedDetails;
window.deleteCurrentMed = function() { if (currentMed && confirm(t('delete_confirm'))) moveToDeleted(currentMed.id); };
window.renderAllMedicines = renderAllMedicines;
window.renderPharmacyMedicines = renderPharmacyMedicines;
window.renderHome = renderHome;
window.exportCSV = exportCSV;
window.exportPDF = exportPDF;
window.exportGeneral = exportGeneral;
window.exportPharmacy = exportPharmacy;
window.importGeneral = importGeneral;
window.importPharmacy = importPharmacy;
window.toggleDarkMode = toggleDarkMode;
window.changeLanguage = changeLanguage;
window.selectAllMeds = selectAllMeds;
window.deselectAllMeds = deselectAllMeds;
window.batchDelete = batchDelete;
window.batchAddToPharmacy = batchAddToPharmacy;
window.addNewCategory = addNewCategory;
window.addNewCompany = addNewCompany;
window.addNewCategoryForList = addNewCategoryForList;
window.handleBackButton = handleBackButton;
window.toggleSelectCompany = toggleSelectCompany;
window.toggleSelectCategory = toggleSelectCategory;
window.batchRenameCompanies = batchRenameCompanies;
window.batchRenameCategories = batchRenameCategories;

// ========== مهلة أمان لإخفاء التحميل ==========
setTimeout(() => {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay && overlay.style.display === 'flex') {
        console.warn('تم إخفاء التحميل تلقائياً بعد المهلة');
        overlay.style.display = 'none';
        const container = document.getElementById('pageContent');
        if (container && (!container.innerHTML || container.innerHTML.trim() === '')) {
            container.innerHTML = '<div class="empty-state">⚠️ حدث خطأ في تحميل التطبيق. يرجى تحديث الصفحة (F5).</div>';
        }
    }
}, 4000);

window.addEventListener('error', function(e) {
    console.error('خطأ عام:', e.error);
    hideLoading();
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise خطأ:', e.reason);
    hideLoading();
});

// ========== تهيئة الأزرار ==========
const confirmExitBtn = document.getElementById('confirmExitBtn');
const cancelExitBtn = document.getElementById('cancelExitBtn');
if (confirmExitBtn) confirmExitBtn.addEventListener('click', () => {
    hideExitConfirmation();
    if (window.close) window.close();
    else alert('لا يمكن إغلاق المتصفح برمجياً');
});
if (cancelExitBtn) cancelExitBtn.addEventListener('click', hideExitConfirmation);

window.addEventListener('popstate', (event) => {
    event.preventDefault();
    window.handleBackButton();
});

document.addEventListener('DOMContentLoaded', async () => {
    await initDemoData();
    if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
    if (localStorage.getItem('appLang')) currentLang = localStorage.getItem('appLang');
    else currentLang = 'ar';
    document.body.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    updateAllText();
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') Notification.requestPermission();

    const notifBtn = document.getElementById('notifBtn');
    const settingsBtn = document.getElementById('settingsHeaderBtn');
    const backButton = document.getElementById('backBtn');
    const appTitle = document.getElementById('appTitle');
    if (notifBtn) notifBtn.onclick = () => switchPage('inbox');
    if (settingsBtn) settingsBtn.onclick = () => openSettingsModal();
    if (backButton) backButton.onclick = () => window.handleBackButton();
    if (appTitle) appTitle.onclick = () => window.goHome();

    const submitMed = document.getElementById('submitMedBtn');
    if (submitMed) submitMed.onclick = saveMedFromForm;
    const scanBarcode = document.getElementById('scanBarcodeBtn');
    if (scanBarcode) scanBarcode.onclick = () => startBarcodeScanner('medBarcode');
    const medImage = document.getElementById('medImage');
    if (medImage) medImage.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const preview = document.getElementById('imagePreview');
                if (preview) preview.innerHTML = `<img src="${ev.target.result}" style="max-width:100%; max-height:100%;">`;
            };
            reader.readAsDataURL(file);
        }
    };
    const submitGeneral = document.getElementById('submitGeneralBtn');
    if (submitGeneral) submitGeneral.onclick = saveGeneralMedFromForm;
    const scanBarcodeGen = document.getElementById('scanBarcodeGenBtn');
    if (scanBarcodeGen) scanBarcodeGen.onclick = () => startBarcodeScanner('genBarcode');
    const genImage = document.getElementById('genImage');
    if (genImage) genImage.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const preview = document.getElementById('genImagePreview');
                if (preview) preview.innerHTML = `<img src="${ev.target.result}" style="max-width:100%; max-height:100%;">`;
            };
            reader.readAsDataURL(file);
        }
    };

    const closeMedModal = document.getElementById('closeMedModal');
    if (closeMedModal) closeMedModal.onclick = () => closeModal('medModal');
    const closeMedFormModalBtn = document.getElementById('closeMedFormModal');
    if (closeMedFormModalBtn) closeMedFormModalBtn.onclick = () => closeMedFormModal();
    const closeGeneralFormModalBtn = document.getElementById('closeGeneralFormModal');
    if (closeGeneralFormModalBtn) closeGeneralFormModalBtn.onclick = () => closeGeneralFormModal();
    const closeScannerModal = document.getElementById('closeScannerModal');
    if (closeScannerModal) closeScannerModal.onclick = () => stopScannerAndClose();
    const closeSettingsModalBtn = document.getElementById('closeSettingsModal');
    if (closeSettingsModalBtn) closeSettingsModalBtn.onclick = () => closeModal('settingsModal');
    const cancelMedForm = document.getElementById('cancelMedFormBtn');
    if (cancelMedForm) cancelMedForm.onclick = () => closeMedFormModal();
    const cancelGeneralForm = document.getElementById('cancelGeneralFormBtn');
    if (cancelGeneralForm) cancelGeneralForm.onclick = () => closeGeneralFormModal();
    const cancelScanner = document.getElementById('cancelScannerBtn');
    if (cancelScanner) cancelScanner.onclick = () => stopScannerAndClose();
    const cancelMed = document.getElementById('cancelMedBtn');
    if (cancelMed) cancelMed.onclick = () => closeModal('medModal');

    setupModalBackdropClose();

    const manualBtn = document.getElementById('manualBarcodeBtn');
    if (manualBtn) {
        manualBtn.addEventListener('click', () => {
            const barcode = prompt('أدخل الباركود يدويًا:');
            if (barcode && barcode.trim()) {
                const targetInputId = document.querySelector('#barcodeScannerModal').getAttribute('data-target');
                const targetInput = document.getElementById(targetInputId);
                if (targetInput) targetInput.value = barcode.trim();
                stopScannerAndClose();
            }
        });
    }

    updateCategoriesDatalist('medCategoriesList');
    updateCategoriesDatalist('genCategoriesList');

    history.pushState({ page: currentPage }, '');

    switchPage('home');
    checkAndSendExpiryNotifications();
});
