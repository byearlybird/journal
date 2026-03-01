import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { $dataVersion } from "@/app/stores/data-version";

export function useLocalData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const dataVersion = useStore($dataVersion);
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetcher().then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [dataVersion, ...deps]);

  return data;
}
