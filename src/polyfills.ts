import 'zone.js';

// Polyfill for libraries that reference Node.js `global` (e.g. @stomp/stompjs)
(window as any).global = window;
