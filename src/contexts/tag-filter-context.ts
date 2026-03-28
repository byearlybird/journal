import { createContext } from "react";

export const TagFilterContext = createContext<[string[], (ids: string[]) => void]>([[], () => {}]);
