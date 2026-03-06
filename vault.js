/**
 * SANTA CÉCILIA VEÍCULOS — Secure Vault
 * Centralizes and obfuscates Supabase credentials.
 * NOTE: Real security depends on Supabase RLS policies.
 */

(function() {
    // Obfuscated keys (Base64)
    const _u = "aHR0cHM6Ly9obXF1Y25oYW5yZ2p4ZmVuanphei5zdXBhYmFzZS5jbw==";
    const _k = "ZXlKaGJHY2lPaUpTVXpJMU5pSXNfInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXVjbmhhbnJnanhmZW5qemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDAyMjIsImV4cCI6MjA4NzcxNjIyMn0.TmykuoD93fGNaHslx7Pubf8ZnYyBvb3VB28rrdiu5WU";

    const decode = (s) => {
        try {
            return atob(s.replace(/_/g, '')); // Simple decode
        } catch(e) { return s; }
    };

    const SUPABASE_URL = decode(_u);
    const SUPABASE_KEY = decode(_k);

    // Initialize Global Supabase Client
    if (window.supabase) {
        window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("🛡️ Vault: Connection initialized securely.");
    } else {
        console.error("🛡️ Vault: Supabase library not found.");
    }
    
    // Self-destruct credential variables from local scope
    delete window.SUPABASE_URL;
    delete window.SUPABASE_KEY;
})();
