import { useState } from "react";
import {
  DownloadSimpleIcon,
  ExportIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { ExportDialog } from "@/components/entries/export-dialog";
import { ImportDialog } from "@/components/entries/import-dialog";
import { MenuButton, MenuContent, MenuItem, MenuRoot } from "@/components";
import { tagService } from "@/app";
import { allTagsQueryOptions } from "@/queries";
import { useMutation } from "@/utils/use-mutation";
import { Dialog } from "@capacitor/dialog";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { Tag } from "@/models";

export const Route = createFileRoute("/app/settings")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(allTagsQueryOptions());
  },
});

function RouteComponent() {
  const { data: tags } = useSuspenseQuery(allTagsQueryOptions());

  return (
    <div className="px-4 py-2 space-y-4">
      <header className="sticky top-0 backdrop-blur-md bg-slate-medium py-1">
        <span className="text-2xl font-extrabold">Settings</span>
      </header>
      <DataSection />
      <TagsSection tags={tags} />
    </div>
  );
}

function DataSection() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  return (
    <section className="space-y-1">
      <h2 className="font-medium px-2">Data</h2>
      <div className="flex flex-col divide-y items-center rounded-lg border border-slate-light bg-slate-medium">
        <button
          type="button"
          onClick={() => setIsExportDialogOpen(true)}
          className="flex items-center justify-between w-full p-4 transition-transform active:scale-[0.99]"
        >
          <span>Export data</span>
          <ExportIcon className="size-4 text-cloud-medium" />
        </button>
        <button
          type="button"
          onClick={() => setIsImportDialogOpen(true)}
          className="flex items-center justify-between w-full p-4 transition-transform active:scale-[0.99]"
        >
          <span>Import data</span>
          <DownloadSimpleIcon className="size-4 text-cloud-medium" />
        </button>
      </div>
      <ExportDialog open={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)} />
      <ImportDialog open={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} />
    </section>
  );
}

function TagsSection({ tags }: { tags: Tag[] }) {
  const mutate = useMutation();

  const handleCreate = async () => {
    const { value, cancelled } = await Dialog.prompt({
      title: "New Tag",
      message: "Enter a name for the tag",
      inputPlaceholder: "Tag name",
      okButtonTitle: "Save",
    });
    if (cancelled || !value.trim()) return;
    await mutate(() => tagService.create(value.trim()));
  };

  const handleEdit = async (tag: Tag) => {
    const { value, cancelled } = await Dialog.prompt({
      title: "Rename Tag",
      message: "Enter a new name for the tag",
      inputPlaceholder: "Tag name",
      inputText: tag.name,
      okButtonTitle: "Save",
    });
    if (cancelled || !value.trim()) return;
    await mutate(() => tagService.update(tag.id, value.trim()));
  };

  const handleDelete = async (tag: Tag) => {
    await mutate(() => tagService.delete(tag.id));
  };

  return (
    <section className="space-y-1">
      <div className="flex items-center justify-between px-2">
        <h2 className="font-medium">Tags</h2>
        <button
          type="button"
          onClick={handleCreate}
          className="flex size-8 items-center justify-center rounded-md transition-transform active:scale-105"
          aria-label="Create tag"
        >
          <PlusIcon className="size-4" />
        </button>
      </div>
      {tags.length === 0 ? (
        <div className="rounded-lg border border-slate-light bg-slate-medium p-4 text-center text-sm text-cloud-medium">
          No tags yet
        </div>
      ) : (
        <div className="flex flex-col divide-y rounded-lg border border-slate-light bg-slate-medium">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between p-4">
              <span>{tag.name}</span>
              <MenuRoot>
                <MenuButton />
                <MenuContent>
                  <MenuItem onClick={() => handleEdit(tag)}>
                    <PencilSimpleIcon className="size-4" />
                    Edit
                  </MenuItem>
                  <MenuItem variant="destructive" onClick={() => handleDelete(tag)}>
                    <TrashIcon className="size-4" />
                    Delete
                  </MenuItem>
                </MenuContent>
              </MenuRoot>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
