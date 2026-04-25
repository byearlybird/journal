import { atom } from "nanostores";

export const $createLabelOpen = atom(false);

export function openCreateLabel() {
  $createLabelOpen.set(true);
}

export function closeCreateLabel() {
  $createLabelOpen.set(false);
}
