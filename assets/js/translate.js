// File: assets/js/translate.js

// 1. Inisialisasi Google Translate secara sembunyi-sembunyi
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'id',
        includedLanguages: 'en,ja,ko', // Sesuai daftar tombol custom
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}

// 2. Fungsi gaib buat maksa ganti bahasa dari tombol custom
function changeAppLanguage(langCode) {
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
        
        // Simpan status bahasa aktif biar UI Pop-Up kita ga salah nampilin tanda centang (check)
        localStorage.setItem('custom_app_lang', langCode);
        updateActiveLanguageUI(langCode);
    } else {
        // Tunggu bentar kalo Google belum kelar loading
        setTimeout(() => changeAppLanguage(langCode), 150);
    }
}

// 3. Update Visual Tanda Centang (Checkmark) di pop-up
function updateActiveLanguageUI(langCode) {
    document.querySelectorAll('.lang-option').forEach(btn => {
        if (btn.getAttribute('data-lang') === langCode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 4. Inject script Google Translate
(function() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    // Otomatis tandai bahasa aktif pas pertama kali buka pop-up
    document.addEventListener('DOMContentLoaded', () => {
        const savedLang = localStorage.getItem('custom_app_lang') || 'id';
        setTimeout(() => updateActiveLanguageUI(savedLang), 300);
    });
})();