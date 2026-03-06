/**
 * SANTA CÉCILIA VEÍCULOS — Security Deterrents
 * Deter common ways to view source code (Right-click, F12, Ctrl+U, etc.)
 */

(function() {
    // Disable Right-click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    }, false);

    // Disable keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+I (Inspect element)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            return false;
        }

        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }

        // Ctrl+S (Save Page)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
    }, false);

    // Anti-DevTools Debugger loop
    // Note: This can be annoying for legitimate debugging, but requested as "maximum security"
    setInterval(function() {
        debugger;
    }, 1000);
})();
