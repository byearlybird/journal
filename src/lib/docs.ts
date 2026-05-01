import {
  CircleIcon,
  CompassIcon,
  DatabaseIcon,
  DiamondIcon,
  EnvelopeIcon,
  NotebookIcon,
  SquareIcon,
  StarIcon,
  TagSimpleIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

import contact from "../docs/contact.md?raw";
import data from "../docs/data.md?raw";
import entries from "../docs/entries.md?raw";
import intentions from "../docs/intentions.md?raw";
import labels from "../docs/labels.md?raw";
import moods from "../docs/moods.md?raw";
import notes from "../docs/notes.md?raw";
import philosophy from "../docs/philosophy.md?raw";
import tasks from "../docs/tasks.md?raw";

export type Doc = {
  slug: string;
  title: string;
  Icon: Icon;
  content: string;
};

export const docs: Doc[] = [
  { slug: "philosophy", title: "Philosophy", Icon: CompassIcon, content: philosophy },
  { slug: "entries", title: "Entries", Icon: NotebookIcon, content: entries },
  { slug: "notes", title: "Notes", Icon: CircleIcon, content: notes },
  { slug: "tasks", title: "Tasks", Icon: SquareIcon, content: tasks },
  { slug: "moods", title: "Moods", Icon: DiamondIcon, content: moods },
  { slug: "intentions", title: "Intentions", Icon: StarIcon, content: intentions },
  { slug: "labels", title: "Labels", Icon: TagSimpleIcon, content: labels },
  { slug: "data", title: "Data", Icon: DatabaseIcon, content: data },
  { slug: "contact", title: "Contact", Icon: EnvelopeIcon, content: contact },
];

export function getDoc(slug: string) {
  return docs.find((d) => d.slug === slug);
}
