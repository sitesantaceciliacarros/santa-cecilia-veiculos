/**
 * SANTA CÉCILIA VEÍCULOS — Security Deterrents
 * Deter common ways to view source code (Right-click, F12, Ctrl+U, etc.)
 */

(function() {
    'use strict';

    let isLocked = false;

    const blockEvents = (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
    };

    const lockScreen = () => {
        if (isLocked) return;
        isLocked = true;
        document.body.innerHTML = `
            <div style="background:#000;color:#f00;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:20px;position:fixed;top:0;left:0;width:100%;z-index:999999;">
                <h1 style="font-size:48px;margin-bottom:10px;">🛡️ AMBIENTE PROTEGIDO</h1>
                <p style="font-size:20px;">O acesso ao código-fonte ou ferramentas de inspeção foi detectado e bloqueado.</p>
                <button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;background:#f00;color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">VOLTAR AO SITE</button>
            </div>
        `;
    };

    const applyProtections = () => {
        document.addEventListener('contextmenu', blockEvents, true);
        document.addEventListener('selectstart', blockEvents, true);
        document.addEventListener('dragstart', blockEvents, true);
        document.addEventListener('keydown', function(e) {
            if (
                e.keyCode === 123 || 
                (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 80 || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
                (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
                (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67))
            ) {
                blockEvents(e);
                return false;
            }
        }, true);
    };

    setInterval(applyProtections, 200);
    applyProtections();

    // 4. Detecção de DevTools via Resize (Menos sensível)
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    
    window.addEventListener('resize', () => {
        // Ignora mundanças pequenas (como barra de endereço mobile)
        const threshold = 200; 
        const widthDiff = Math.abs(window.innerWidth - lastWidth);
        const heightDiff = Math.abs(window.innerHeight - lastHeight);
        
        if (widthDiff > threshold || heightDiff > threshold) {
            // Só bloqueia se não for um redimensionamento "natural" lento
            // (DevTools abre instantaneamente)
            lockScreen();
        }
        lastWidth = window.innerWidth;
        lastHeight = window.innerHeight;
    });

    // 5. MutationObserver (Detecta remoção do script de guarda)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.removedNodes.length) {
                mutation.removedNodes.forEach((node) => {
                    if (node.id === 'security-script') {
                        lockScreen();
                    }
                });
            }
        });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // 6. Debugger Trap
    const trap = function() {
        const start = Date.now();
        debugger;
        if (Date.now() - start > 100) {
            lockScreen();
        }
    };
    setInterval(trap, 1000);

    // 7. Desativar Console
    if (window.console) {
        const methods = ['log', 'warn', 'info', 'debug', 'dir', 'table'];
        methods.forEach(method => {
            try {
                Object.defineProperty(console, method, {
                    value: () => {},
                    writable: false,
                    configurable: false
                });
            } catch(e) {}
        });
    }

    // Identificador
    if (document.currentScript) {
        document.currentScript.id = 'security-script';
    }
})();
