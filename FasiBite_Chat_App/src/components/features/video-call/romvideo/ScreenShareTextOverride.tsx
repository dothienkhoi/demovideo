"use client";

import { useEffect } from "react";

export function ScreenShareTextOverride() {
    useEffect(() => {
        const overrideScreenShareText = () => {
            // Find all screen share participant tiles
            const screenShareTiles = document.querySelectorAll('.lk-participant-tile[data-lk-source="screen_share"]');

            screenShareTiles.forEach((tile) => {
                const nameElement = tile.querySelector('.lk-participant-name');
                if (nameElement) {
                    // Get the original participant name
                    const originalName = nameElement.textContent || '';

                    // Only change if it contains "'s screen" pattern
                    if (originalName.includes("'s screen")) {
                        // Extract the name before "'s screen"
                        const participantName = originalName.replace("'s screen", "").trim();

                        // Update the text to "Màn hình của [name]"
                        nameElement.textContent = `Màn hình của ${participantName}`;
                    }
                }
            });
        };

        // Run immediately
        overrideScreenShareText();

        // Set up observer to watch for new screen share tiles
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as Element;
                            if (element.classList?.contains('lk-participant-tile') &&
                                element.getAttribute('data-lk-source') === 'screen_share') {
                                overrideScreenShareText();
                            }
                        }
                    });
                }
            });
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Cleanup
        return () => {
            observer.disconnect();
        };
    }, []);

    return null; // This component doesn't render anything
}
