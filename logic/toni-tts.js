// logic/toni-tts.js
// ToniTTS: einfacher TTS-Adapter mit Web Speech API Fallback

window.ToniTTS = {
    voice: null,
    rate: 1,
    pitch: 1,
    lang: 'de-DE',
    init() {
        try {
            if (!('speechSynthesis' in window)) {
                console.warn('[ToniTTS] Web Speech API not available');
                return;
            }
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                if (voices && voices.length) {
                    this.voice = voices.find(v => v.lang && v.lang.startsWith('de')) || voices[0];
                }
            };
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
            console.log('[ToniTTS] initialized');
        } catch (e) {
            console.warn('[ToniTTS] init failed', e);
        }
    },
    speak(text) {
        try {
            if (!text) return;
            if (!('speechSynthesis' in window)) {
                console.warn('[ToniTTS] speak requested but API not available');
                return;
            }
            const utter = new SpeechSynthesisUtterance(String(text));
            utter.lang = this.lang;
            utter.rate = this.rate;
            utter.pitch = this.pitch;
            if (this.voice) utter.voice = this.voice;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
        } catch (e) {
            console.warn('[ToniTTS] speak failed', e);
        }
    },
    isAvailable() {
        return !!(window.speechSynthesis && typeof window.speechSynthesis.speak === 'function');
    }
};

try { window.ToniTTS.init(); } catch (e) { /* ignore */ }
