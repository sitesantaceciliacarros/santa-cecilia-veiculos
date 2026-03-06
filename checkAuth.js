/**
 * SANTA CECÍLIA VEÍCULOS — Security Audit Fix
 * Synchronous Session Validator (Route Guard)
 * 
 * This script runs BEFORE the DOM is fully interactive to prevent
 * FOUC (Flash of Unauthenticated Content) on the admin panel.
 */

(async function() {
    'use strict';

    // Wait for the Supabase library and the vault's global instance to initialize
    // This is typically synchronous if the scripts are loaded in order in the `<head>`
    let attempts = 0;
    const maxAttempts = 50; // max a few seconds

    async function checkSession() {
        if (!window.sb && attempts < maxAttempts) {
            attempts++;
            setTimeout(checkSession, 50);
            return;
        }

        if (!window.sb) {
            console.error("Supabase client not initialized. Redirecting to login...");
            window.location.replace('admin-login.html');
            return;
        }

        try {
            const { data: { session }, error } = await window.sb.auth.getSession();
            
            if (error || !session) {
                console.warn("🔐 Unauthorized access attempt blocked. Redeploying to login...");
                // Use replace() to avoid keeping the protected page in the browser history
                window.location.replace('admin-login.html');
                return;
            }

            // Session valid! Removing the full-screen blocker.
            const spinner = document.getElementById('auth-spinner');
            if (spinner) {
                spinner.style.opacity = '0';
                setTimeout(() => spinner.remove(), 300); // Wait for face fade out
            }
            
            console.log("🔐 Admin Session Validated.");

        } catch (err) {
            console.error("Session verification failed:", err);
            window.location.replace('admin-login.html');
        }
    }

    // Start checking
    checkSession();
})();
