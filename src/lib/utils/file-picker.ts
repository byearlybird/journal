/**
 * Opens a file picker dialog for selecting a JSON file
 * Creates a temporary file input element to trigger the native file picker
 *
 * @returns Promise that resolves to the selected File, or null if cancelled
 *
 * @example
 * const file = await pickJsonFile();
 * if (file) {
 *   const text = await file.text();
 *   // Process file...
 * }
 */
export const pickJsonFile = (): Promise<File | null> => {
	return new Promise((resolve) => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";

		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			resolve(file ?? null);
		};

		input.click();
	});
};
