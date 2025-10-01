import { useEffect, useMemo } from "react";

type KeyboardHeightCallback = (height: number) => void;

/**
 * Hook that listens to Visual Viewport API changes and calls a callback with the keyboard height.
 *
 * Uses window.innerHeight - window.visualViewport.height to detect keyboard height.
 * Listens to resize and scroll events on window.visualViewport.
 *
 * The callback is memoized based on the provided dependency array,
 * so you can pass inline functions without causing infinite re-renders.
 *
 * @param callback - Function called with the keyboard height (in pixels) whenever it changes
 * @param deps - Dependency array for memoizing the callback function
 *
 * @example
 * ```ts
 * // Basic usage
 * useKeyboardHeight((height) => {
 *   console.log('Keyboard height:', height);
 * }, []);
 *
 * // With dependencies
 * const [offset, setOffset] = useState(0);
 * useKeyboardHeight((height) => {
 *   setPosition(height + offset);
 * }, [offset]);
 * ```
 */
export const useKeyboardHeight = (
	callback: KeyboardHeightCallback,
	deps: unknown[],
) => {
	// Memoize the callback based on the provided dependencies
	// biome-ignore lint/correctness/useExhaustiveDependencies: deps is the user-provided dependency array
	const memoizedCallback = useMemo(() => callback, deps);

	useEffect(() => {
		if (!window.visualViewport) {
			// Fallback: if Visual Viewport API is not supported, report 0
			memoizedCallback(0);
			return;
		}

		const updateKeyboardHeight = () => {
			if (!window.visualViewport) return;

			const keyboardHeight = Math.max(
				0,
				window.innerHeight - window.visualViewport.height,
			);

			memoizedCallback(keyboardHeight);
		};

		// Call with initial height
		updateKeyboardHeight();

		// Listen to visualViewport resize events
		window.visualViewport.addEventListener("resize", updateKeyboardHeight);
		window.visualViewport.addEventListener("scroll", updateKeyboardHeight);

		return () => {
			if (!window.visualViewport) return;

			window.visualViewport.removeEventListener("resize", updateKeyboardHeight);
			window.visualViewport.removeEventListener("scroll", updateKeyboardHeight);
		};
	}, [memoizedCallback]);
};

/**
 * Hook that sets a CSS variable based on keyboard height.
 *
 * Uses the Visual Viewport API to detect keyboard presence and height.
 * Sets the CSS variable to `defaultValue` when keyboard is not visible,
 * or to the keyboard height in pixels when visible.
 *
 * @param variableName - CSS variable name (without the -- prefix)
 * @param defaultValue - Value to use when keyboard is not visible (e.g., "66vh")
 *
 * @example
 * ```ts
 * // In your app root or layout component
 * useKeyboardHeightCssVar("floating-input-height", "66vh");
 *
 * // Then use in CSS
 * .floating-input {
 *   bottom: var(--floating-input-height);
 * }
 * ```
 */
export const useKeyboardHeightCssVar = (
	variableName: string,
	defaultValue: string,
) => {
	useKeyboardHeight(
		(height) => {
			document.documentElement.style.setProperty(
				`--${variableName}`,
				height > 0 ? `${height}px` : defaultValue,
			);
		},
		[variableName, defaultValue],
	);
};
