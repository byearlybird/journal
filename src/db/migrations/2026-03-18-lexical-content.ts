import { type Kysely, type Migration, sql } from "kysely";
import { createEditor, $getRoot, $createParagraphNode, $createTextNode } from "lexical";

function textToLexicalJSON(text: string): string {
  const editor = createEditor({
    namespace: "migration",
    onError: console.error,
  });

  let json = "";

  editor.update(
    () => {
      const root = $getRoot();
      root.clear();
      const lines = text.split("\n");
      for (const line of lines) {
        const paragraph = $createParagraphNode();
        if (line) {
          paragraph.append($createTextNode(line));
        }
        root.append(paragraph);
      }
    },
    {
      onUpdate: () => {
        json = JSON.stringify(editor.getEditorState().toJSON());
      },
      discrete: true,
    },
  );

  return json;
}

function isLexicalJSON(content: string): boolean {
  try {
    const parsed = JSON.parse(content);
    return parsed?.root?.type === "root";
  } catch {
    return false;
  }
}

export const Migration20260318LexicalContent: Migration = {
  async up(db: Kysely<any>) {
    const notes = await sql<{
      id: string;
      content: string;
    }>`SELECT id, content FROM notes`.execute(db);

    for (const note of notes.rows) {
      if (isLexicalJSON(note.content)) continue;
      const lexicalContent = textToLexicalJSON(note.content);
      await sql`UPDATE notes SET content = ${lexicalContent} WHERE id = ${note.id}`.execute(db);
    }

    const tasks = await sql<{
      id: string;
      content: string;
    }>`SELECT id, content FROM tasks`.execute(db);

    for (const task of tasks.rows) {
      if (isLexicalJSON(task.content)) continue;
      const lexicalContent = textToLexicalJSON(task.content);
      await sql`UPDATE tasks SET content = ${lexicalContent} WHERE id = ${task.id}`.execute(db);
    }
  },
  async down() {
    // One-way migration: can't losslessly convert back
  },
};
