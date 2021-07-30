import { useEffect, useState } from "react";
import { useAppState } from "./useAppState";
import { CheckUpdatesResult, useCheckUpdates } from "./useCheckUpdates";
import * as Updates from "expo-updates";

export default function useUpdate() {
  const [updateState, setUpdateState] =
    useState<CheckUpdatesResult>("NO_UPDATE");
  const appState = useAppState();
  const checkUpdates = useCheckUpdates();

  useEffect(() => {
    if (appState === "active") {
      checkUpdates()
        .then(async (results) => {
          if (results === "UPDATE_READY") {
            await Updates.reloadAsync();
          } else {
            setUpdateState(results);
          }
        })
        .catch(setUpdateState);
    }
  }, [appState, checkUpdates]);

  return updateState;
}
