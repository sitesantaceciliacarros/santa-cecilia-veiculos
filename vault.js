/**
 * SANTA CÉCILIA VEÍCULOS — Secure Vault
 * Centralizes and obfuscates Supabase credentials.
 */

(function() {
    'use strict';

    const _u = "68747470733a2f2f686d7175636e68616e72676a7866656e6a7a617a2e73757061626173652e636f";
    const _k = "65794A68624763694F694A49557A49314E694973496E523563434936496B705856434A392E65794A7063334D694F694A7A64584268596D467A5A534973496E4A6C5A694936496D68746358566A626D6868626E4A6E616E686D5A573571656D463649697769636D39735A534936496D4675623234694C434A70595851694F6A45334E7a49784E4441794D6A4973496D5634634349364D6A41344E7a63784E6A49794D6E302E546m796b756f44393366474E6148736C783750756266385A6E597942766233564232387272646975355755";

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
    } else {
        console.error("Vault: Initialization failure.");
    }
})();
