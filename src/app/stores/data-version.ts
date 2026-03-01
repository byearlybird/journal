import { atom } from "nanostores";

export const $dataVersion = atom(0);

export function invalidateData() {
  $dataVersion.set($dataVersion.get() + 1);
}
