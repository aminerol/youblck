import * as Sentry from "sentry-expo";

const SENTRY_DSN =
  "https://c7ed2926fa9646f2a02c9e3598ed3368@o935202.ingest.sentry.io/5884910";

export async function enableSentry() {
  Sentry.init({
    dsn: SENTRY_DSN,
    enableInExpoDevelopment: false,
    debug: __DEV__,
  });
}

export function captureException(payload: any, module: "app" | "core") {
  if (!__DEV__) {
    Sentry.Native.captureException(payload, { tags: { module } });
  } else {
    console.log(payload);
  }
}

export function addBreadcrumb(breadcrumb: Sentry.Native.Breadcrumb) {
  if (!__DEV__) {
    Sentry.Native.addBreadcrumb(breadcrumb);
  } else {
    console.log(breadcrumb);
  }
}

export const setJSExceptionHandler = (allowedInDevMode = false) => {
  if (typeof allowedInDevMode !== "boolean") {
    console.log(
      "setJSExceptionHandler is called with wrong argument types.. first argument should be callback function and second argument is optional should be a boolean"
    );
    console.log(
      "Not setting the JS handler .. please fix setJSExceptionHandler call"
    );
    return;
  }
  const allowed = allowedInDevMode ? true : !__DEV__;
  if (allowed) {
    ErrorUtils.setGlobalHandler((error) => captureException(error, "app"));
    const consoleError = console.error;
    console.error = (...args) => {
      //@ts-ignore
      ErrorUtils.reportError(...args);
      consoleError(...args);
    };
  } else {
    console.log(
      "Skipping setJSExceptionHandler: Reason: In DEV mode and allowedInDevMode = false"
    );
  }
};
