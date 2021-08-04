import { ExpoConfig, ConfigContext } from "@expo/config";
import path from "path";
require("dotenv").config({
  path: path.resolve(__dirname, "../.env." + process.env.NODE_ENV),
});

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    name: "",
    slug: "",
    ...config,
    ios: {
      ...config.ios,
      bundleIdentifier: process.env.BUNDLE_IDENTIFIER,
      config: {
        ...config.ios.config,
        googleMobileAdsAppId: process.env.IOS_ADS_APPID,
      },
    },
    android: {
      ...config.android,
      package: process.env.BUNDLE_IDENTIFIER,
      config: {
        ...config.android.config,
        googleMobileAdsAppId: process.env.ANDROID_ADS_APPID,
      },
      googleServicesFile:
        process.env.NODE_ENV === "staging"
          ? "./google-services-staging.json"
          : "./google-services.json",
    },
    extra: {
      appEnv: process.env.APP_ENV,
      sentryDsn: process.env.SENTRY_DSN,
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      },
    },
    hooks: {
      ...config.hooks,
      postPublish: [
        {
          file: "sentry-expo/upload-sourcemaps",
          config: {
            organization: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            setCommits: true,
          },
        },
      ],
    },
  };
};
