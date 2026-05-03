import type { ReactNode, Ref } from "react";

export function Page({ children, ref }: { children: ReactNode; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="h-full flex flex-col px-1 pb-2 overflow-y-auto">
      {children}
    </div>
  );
}

