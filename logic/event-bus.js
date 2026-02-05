// logic/event-bus.js
// Einfacher EventBus für lose Kopplung zwischen Modulen

(function () {
    const listeners = {};

    window.ToniEvents = {
        on(event, cb) {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(cb);
        },
        off(event, cb) {
            if (!listeners[event]) return;
            listeners[event] = listeners[event].filter(fn => fn !== cb);
        },
        emit(event, payload) {
            if (!listeners[event]) return;
            listeners[event].forEach(fn => {
                try { fn(payload); } catch (e) { console.error('[ToniEvents] handler error', e); }
            });
        },
        clear() {
            Object.keys(listeners).forEach(k => delete listeners[k]);
        }
    };
})();
