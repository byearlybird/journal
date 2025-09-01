import { Command } from "commander";
import { entryService } from "./services";

const program = new Command();

program
	.name("journal")
	.description("A simple journaling CLI application")
	.version("0.1.0");

program
	.command("list")
	.description("List all journal entries")
	.action(async () => {
		const entries = await entryService.getEntries();
		if (entries) {
			console.log("Entries:");
			Object.values(entries).forEach((entry) => console.log(entry));
		} else {
			console.log("No entries found.");
		}
	});

program
	.command("create")
	.description("Create a new journal entry")
	.argument("<content>", "Content of the journal entry")
	.action((content) => {
		const result = entryService.createEntry(content);
		if (result.ok) {
			console.log("Entry created successfully.");
		} else {
			console.error("Failed to create entry:", result.error);
		}
	});

program
	.command("comment")
	.description("Add a comment to a journal entry")
	.argument("<entryId>", "ID of the journal entry")
	.argument("<content>", "Content of the comment")
	.action(async (entryId, content) => {
		const result = await entryService.createComment(entryId, content);
		if (result.ok) {
			console.log("Comment added successfully.");
		} else {
			console.error("Failed to add comment:", result.error);
		}
	});

program.parse();
