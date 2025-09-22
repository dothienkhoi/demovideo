"use client";

import { useEffect } from "react";

export const PreloadOptimizer = () => {
    useEffect(() => {
        // Remove unused preload links to reduce warnings
        const removeUnusedPreloads = () => {
            const preloadLinks = document.querySelectorAll('link[rel="preload"]');
            const usedResources = new Set<string>();

            // Track which resources are actually used
            const trackResourceUsage = () => {
                // Check for script usage
                const scripts = document.querySelectorAll('script[src]');
                scripts.forEach(script => {
                    const src = script.getAttribute('src');
                    if (src) {
                        usedResources.add(src);
                    }
                });

                // Check for stylesheet usage
                const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
                stylesheets.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href) {
                        usedResources.add(href);
                    }
                });
            };

            // Remove unused preload links after a delay
            const cleanupUnusedPreloads = () => {
                preloadLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && !usedResources.has(href)) {
                        // Check if the resource is actually needed
                        const isNeeded = href.includes('onesignal') ||
                            href.includes('livekit') ||
                            href.includes('_next/static');

                        if (!isNeeded) {
                            link.remove();
                        }
                    }
                });
            };

            // Track usage and cleanup
            trackResourceUsage();
            setTimeout(cleanupUnusedPreloads, 2000); // Clean up after 2 seconds
        };

        // Run cleanup after component mounts
        const timer = setTimeout(removeUnusedPreloads, 1000);

        return () => clearTimeout(timer);
    }, []);

    return null; // This component doesn't render anything
};
