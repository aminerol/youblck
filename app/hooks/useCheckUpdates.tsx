import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { differenceInMinutes } from "date-fns";
import { useCallback } from "react";
import { addBreadcrumb, captureException } from "../utils/sentry";

const LAST_UPDATE_KEY = "LAST_UPDATE";
const CHECK_UPDATE_INTERVAL_MINUTES = 30;

export type CheckUpdatesResult =
  | "TOO_RECENT_CHECK"
  | "NO_UPDATE"
  | "UPDATE_READY"
  | "UPDATE_ERROR";

export const useCheckUpdates = (): ((
  forceCheck?: boolean
) => Promise<CheckUpdatesResult>) => {
  const checkForUpdates = useCallback(async (forceCheck = false) => {
    if (__DEV__) {
      return "NO_UPDATE";
    }
    try {
      const lastUpdate = await AsyncStorage.getItem(LAST_UPDATE_KEY);
      if (
        forceCheck ||
        !lastUpdate ||
        differenceInMinutes(new Date(), Number(lastUpdate)) >
          CHECK_UPDATE_INTERVAL_MINUTES
      ) {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Promise.all([
            AsyncStorage.setItem(LAST_UPDATE_KEY, `${new Date().getTime()}`),
            Updates.fetchUpdateAsync(),
          ]);
          return "UPDATE_READY";
        } else {
          return "NO_UPDATE";
        }
      } else {
        return "TOO_RECENT_CHECK";
      }
    } catch (e) {
      addBreadcrumb({
        category: "action",
        message: "Check for updates",
      });
      captureException(e, "app");
      return "UPDATE_ERROR";
    }
  }, []);

  return checkForUpdates;
};
