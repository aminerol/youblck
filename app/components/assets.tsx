import React, { useEffect, useState } from "react";
import { useAssets } from "expo-asset";
import { readAsStringAsync } from "expo-file-system";

export const useLoadAssets = (assets: number) => {
  const [ready, setReady] = useState<string | undefined>(undefined);

  const [files] = useAssets(assets);

  useEffect(() => {
    if (files) {
      files.map(async (asset) => {
        const downloaded = await asset.downloadAsync();
        const string = await readAsStringAsync(downloaded.localUri);
        setReady(string);
      });
    }
  }, [files]);

  return ready;
};
