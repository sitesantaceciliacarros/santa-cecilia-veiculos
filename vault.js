/**
 * SANTA CÉCILIA VEÍCULOS — Secure Vault
 * Centralizes and obfuscates Supabase credentials.
 */

(function() {
    'use strict';

    // Hex-encoded values (Safest method)
    const _u = "68747470733a2f2f686d7175636e68616e72676a7866656e6a7a617a2e73757061626173652e636f";
    const _k = "65794a68624763694f694a49557a49314e694973496e523563434936496b705856434a392e65794a7063334d694f694a7a64584268596d467a5a534973496e4a6l5a694936496d68746358566j626d6868626e4a6e616e686m5a573571656m463649697769636d39735a534936496d4675623234694c434a70595851694f6a45334n7a49784e4441794d6a4973496d5634634349364d6a41344e7a63784e6j49794d6e302e546d796b756f44393366474e6148736c783750756266385a6e597942766233564232387272646975355755";

    const hexDecode = (hex) => {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    };

    const url = hexDecode(_u);
    const key = hexDecode(_k);

    if (url && key && window.supabase) {
        window.sb = window.supabase.createClient(url, key);
        console.log("🛡️ Vault: Connectivity established.");
    } else {
        console.error("Vault: Initialization failure.");
    }
})();
