import { Download, Upload } from "lucide-react";
import { Page } from "@/components/layout";
import { useExportData, useImportData } from "@/features/data";

export const SettingsPage = () => {
	const handleExport = useExportData();
	const importData = useImportData();

	const handleImport = async () => {
		const result = await importData();

		if (!result) {
			// User cancelled file selection
			return;
		}

		if (result.success) {
			if (result.imported > 0) {
				alert(
					`Successfully imported ${result.imported} items${result.errors > 0 ? ` (${result.errors} errors)` : ""}`,
				);
			} else if (result.errors > 0) {
				alert(`Import failed: ${result.errors} errors`);
			} else {
				alert("No valid data found to import");
			}
		} else {
			alert(`Failed to import data: ${result.error}`);
		}
	};

	return (
		<Page>
			<div className="pt-[var(--safe-top)] rounded-xl bg-white/10 p-2 flex flex-col divide-y">
				<button
					type="button"
					className="p-2 flex items-center gap-3"
					onClick={handleExport}
				>
					<Download className="size-4" />
					Export data
				</button>
				<button
					type="button"
					className="p-2 flex items-center gap-3"
					onClick={handleImport}
				>
					<Upload className="size-4" />
					Import data
				</button>
			</div>
		</Page>
	);
};

export default SettingsPage;
