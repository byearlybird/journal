import { useEffect } from "react";

/**
 * Hook that sets up floating input height detection using the Visual Viewport API.
 *
 * Uses window.innerHeight - window.visualViewport.height to detect keyboard height
 * and positions the floating input accordingly.
 * Listens to resize and scroll events on window.visualViewport.
 *
 * Sets the --floating-input-height CSS variable on document.documentElement.
 * Defaults to 66vh for desktop/non-keyboard scenarios.
 */
export const useKeyboardHeight = () => {
	useEffect(() => {
		if (!window.visualViewport) {
			// Fallback: if Visual Viewport API is not supported, use default height
			document.documentElement.style.setProperty(
				"--floating-input-height",
				"66vh",
			);
			return;
		}

		const updateKeyboardHeight = () => {
			if (!window.visualViewport) return;

			const keyboardHeight = Math.max(
				0,
				window.innerHeight - window.visualViewport.height,
			);

			document.documentElement.style.setProperty(
				"--floating-input-height",
				`${keyboardHeight}px`,
			);
		};

		// Set initial height
		updateKeyboardHeight();

		// Listen to visualViewport resize events
		window.visualViewport.addEventListener("resize", updateKeyboardHeight);
		window.visualViewport.addEventListener("scroll", updateKeyboardHeight);

		return () => {
			if (!window.visualViewport) return;

			window.visualViewport.removeEventListener("resize", updateKeyboardHeight);
			window.visualViewport.removeEventListener("scroll", updateKeyboardHeight);
		};
	}, []); // Empty deps - run once on mount
};
