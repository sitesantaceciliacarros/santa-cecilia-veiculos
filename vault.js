/**
 * SANTA CÉCILIA VEÍCULOS — Secure Vault (DEBUG MODE)
 * Centralizes Supabase credentials.
 */

(function() {
    'use strict';

    const URL = 'https://hmqucnhanrgjxfenjzaz.supabase.co';
    const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXVjbmhhbnJnanhmZW5qemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDAyMjIsImV4cCI6MjA4NzcxNjIyMn0.TmykuoD93fGNaHslx7Pubf8ZnYyBvb3VB28rrdiu5WU';

    if (window.supabase) {
        window.sb = window.supabase.createClient(URL, KEY);
        console.log("Vault: Supabase client initialized.");
    } else {
        console.error("Vault: Supabase library not found!");
    }
})();
