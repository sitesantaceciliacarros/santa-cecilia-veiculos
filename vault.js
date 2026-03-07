/**
 * SANTA CÉCILIA VEÍCULOS — Secure Vault
 * Centralizes and obfuscates Supabase credentials.
 */

(function() {
    'use strict';

    const _u = "aHR0cHM6Ly9obXF1Y25oYW5yZ2p4ZmVuanphei5zdXBhYmFzZS5jbw==";
    const _k = "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1odGNYVmpibWhoYm5KbmFuaG1aVzVxZW1GNklpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTnpJeE5EQXlNaklzSW1WNGNDSTZNakE0TnpjeE5qSXlNbjAuVG15a3VvRDkzZkdOYUhzbHg3UHViZjhabll5QnZiM1ZCMjhycmRpdTVXVQ==";

    const b64Decode = (str) => {
        try {
            return atob(str);
        } catch (e) {
            console.error("Vault: Decode failure.");
            return null;
        }
    };

    const url = b64Decode(_u);
    const key = b64Decode(_k);

    if (url && key && window.supabase) {
        window.sb = window.supabase.createClient(url, key);
    } else {
        console.error("Vault: Initialization failure.");
    }
})();
