/**
 * SANTA CÉCILIA VEÍCULOS — Security Deterrents
 * Deter common ways to view source code (Right-click, F12, Ctrl+U, etc.)
 */

(function() {
    'use strict';

    const blockEvents = (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
    };

    const applyProtections = () => {
        // 1. Bloqueio de Clique Direito
        document.addEventListener('contextmenu', blockEvents, true);

        // 2. Bloqueio de Seleção e Arrastar
        document.addEventListener('selectstart', blockEvents, true);
        document.addEventListener('dragstart', blockEvents, true);

        // 3. Bloqueio de Teclas de Atalho
        document.addEventListener('keydown', function(e) {
            if (
                e.keyCode === 123 || // F12
                (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 80 || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
                (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
                (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) // Mac
            ) {
                blockEvents(e);
                return false;
            }
        }, true);
    };

    // Re-aplica as proteções periodicamente para anular extensões
    setInterval(applyProtections, 100);
    applyProtections();

    // 4. Detecção de DevTools via Resize (Se não estiver no mobile)
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    
    window.addEventListener('resize', () => {
        const threshold = 160;
        const widthDiff = Math.abs(window.innerWidth - lastWidth);
        const heightDiff = Math.abs(window.innerHeight - lastHeight);
        
        if (widthDiff > threshold || heightDiff > threshold) {
            // Provável abertura de DevTools acoplado
            location.reload(); 
        }
        lastWidth = window.innerWidth;
        lastHeight = window.innerHeight;
    });

    // 5. MutationObserver para impedir remoção de scripts ou manipulação do DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.removedNodes.length) {
                mutation.removedNodes.forEach((node) => {
                    if (node.nodeName === 'SCRIPT' || node.id === 'security-script') {
                        location.reload(); // Se tentarem remover o script, recarrega
                    }
                });
            }
        });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // 6. Debugger Trap Agressivo
    const trap = function() {
        const start = Date.now();
        debugger;
        if (Date.now() - start > 100) {
            document.body.innerHTML = `
                <div style="background:#000;color:#f00;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:20px;">
                    <h1 style="font-size:48px;margin-bottom:10px;">🛡️ AMBIENTE PROTEGIDO</h1>
                    <p style="font-size:20px;">O acesso ao código-fonte ou ferramentas de inspeção foi detectado e bloqueado.</p>
                    <button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;background:#f00;color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">VOLTAR AO SITE</button>
                </div>
            `;
        }
    };
    setInterval(trap, 500);

    // 7. Desativar Console permanentemente
    if (window.console) {
        const methods = ['log', 'warn', 'error', 'info', 'debug', 'dir', 'table'];
        methods.forEach(method => {
            Object.defineProperty(console, method, {
                value: () => {},
                writable: false,
                configurable: false
            });
        });
    }

    // Identificador para o MutationObserver
    document.currentScript.id = 'security-script';
})();
