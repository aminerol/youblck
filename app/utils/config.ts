import Constants from "expo-constants";

export const config = {
  appEnv: Constants.manifest.extra.appEnv,
  sentryDsn: Constants.manifest.extra.sentryDsn,
  firebase: Constants.manifest.extra.firebase,
};
