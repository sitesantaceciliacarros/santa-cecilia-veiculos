/**
 * SANTA CÉCILIA VEÍCULOS — Security Deterrents
 * Deter common ways to view source code (Right-click, F12, Ctrl+U, etc.)
 */

(function() {
    // 1. Bloqueio Completo de Clique Direito
    document.addEventListener('contextmenu', e => e.preventDefault(), false);

    // 2. Bloqueio de Seleção de Texto e Drag (Dificulta cópia)
    document.addEventListener('selectstart', e => e.preventDefault());
    document.addEventListener('dragstart', e => e.preventDefault());

    // 3. Bloqueio de Teclas de Atalho (Abrangente)
    document.addEventListener('keydown', function(e) {
        // F12, Ctrl+U, Ctrl+S, Ctrl+P, Ctrl+Shift+I/J/C
        if (
            e.keyCode === 123 || 
            (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 80 || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
            (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) // Mac shortcuts
        ) {
            e.preventDefault();
            return false;
        }
    }, false);

    // 4. Detecção Agressiva de DevTools (Loop de Debugger Oculto)
    // Se o DevTools abrir, o site "congela" a execução para o usuário
    const detectDevTools = function() {
        const start = new Date();
        debugger;
        const end = new Date();
        if (end - start > 100) {
            // Se demorar > 100ms para passar pelo debugger, o console está aberto
            document.body.innerHTML = '<div style="background:#000;color:#f00;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:20px;"><h1>ACESSO NEGADO</h1><p>O uso de ferramentas de desenvolvedor é proibido nesta página para sua segurança.</p></div>';
        }
    };

    // Executa a detecção continuamente
    setInterval(detectDevTools, 500);

    // 5. Proteção contra console.log (Limpa o rastro)
    if (typeof console !== "undefined") {
        Object.keys(console).forEach(method => {
            console[method] = function() {};
        });
    }
})();
