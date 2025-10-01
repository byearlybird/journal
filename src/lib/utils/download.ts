/**
 * Downloads data as a JSON file to the user's device
 * Creates a temporary anchor element to trigger the download
 *
 * @param data - The data to be downloaded (will be JSON stringified)
 * @param filename - The name of the file to download
 *
 * @example
 * downloadJson({ entries: [...], comments: [...] }, "journal-data.json");
 */
export const downloadJson = (data: unknown, filename: string): void => {
	const dataStr =
		"data:text/json;charset=utf-8," +
		encodeURIComponent(JSON.stringify(data, null, 2));
	const downloadAnchorNode = document.createElement("a");
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute("download", filename);
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
};
