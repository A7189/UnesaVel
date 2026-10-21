function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'id',
        includedLanguages: 'id,en,ja,ko',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}

function changeAppLanguage(langCode) {
    const gTransCookie = `/id/${langCode}`;
    
    document.cookie = `googtrans=${gTransCookie}; path=/`;
    document.cookie = `googtrans=${gTransCookie}; domain=${window.location.hostname}; path=/`;
    
    localStorage.setItem('custom_app_lang', langCode);
    window.location.reload();
}

function updateActiveLanguageUI(langCode) {
    document.querySelectorAll('.lang-option').forEach(btn => {
        if (btn.getAttribute('data-lang') === langCode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        body { top: 0px !important; position: static !important; }
        iframe.goog-te-banner-frame, 
        .goog-te-banner-frame, 
        .skiptranslate iframe, 
        #goog-gt-tt, 
        .goog-te-balloon-frame, 
        .VIpgJd-Zvi9od-aZ2wEe-wOHMyf, 
        #google_translate_element { 
            display: none !important; 
        }
    `;
    document.head.appendChild(style);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    document.addEventListener('DOMContentLoaded', () => {
        let savedLang = localStorage.getItem('custom_app_lang');
        if (!savedLang) {
            const match = document.cookie.match(/googtrans=\/id\/([a-z]{2})/);
            savedLang = match ? match[1] : 'id';
            localStorage.setItem('custom_app_lang', savedLang);
        }
        setTimeout(() => updateActiveLanguageUI(savedLang), 300);
    });
})();