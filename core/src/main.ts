import { GlobalVars } from "./globals";
import { filterRulesGuide, filterRulesMain } from "./constants";
import { ObjectFilter } from "./filter";
import { startInterceptFetch } from "./intercept";
import { compileAll, transformToRegExp } from "./pre-main";
import { blockTrending, removeTrendingTab } from "./filter-utils";
import firebase from "@firebase/app";
import "@firebase/analytics";

function injectFetch(resp, url) {
  if (
    [
      "/youtubei/v1/search",
      "/youtubei/v1/browse",
      "/youtubei/v1/next",
    ].includes(url.pathname)
  ) {
    ObjectFilter(resp, filterRulesMain, [], true);
  } else if (url.pathname === "/youtubei/v1/guide") {
    ObjectFilter(resp, filterRulesGuide, [], true);
  }
}

function listenToMessagesFromNative() {
  window.addEventListener(
    "message",
    (event) => {
      const data = JSON.parse(event.data);
      const { from, type, payload } = data;
      if (!from || from !== "YOUBLOCK") return;
      if (type === "storage") {
        GlobalVars.storageData = payload;
        GlobalVars.storageData = compileAll(GlobalVars.storageData);
        transformToRegExp(GlobalVars.storageData);
      }
      if (type === "undo") {
        const { id } = payload;
        document.getElementsByTagName("ytm-notification-multi-action-renderer");
        Array.prototype.forEach.call(
          document.getElementsByTagName(
            "ytm-notification-multi-action-renderer"
          ),
          (el) => {
            if (el.data.data.id === id) {
              el.querySelector("button").click();
            }
          }
        );
      }
      if (type === "toggleTrending") {
        GlobalVars.storageData.options.trending = payload;
        if (GlobalVars.storageData.options.trending) {
          removeTrendingTab();
        } else {
          const tabs = document.getElementsByTagName(
            "ytm-pivot-bar-renderer"
          )[0];
          tabs.insertBefore(
            GlobalVars.trendingTab.item,
            tabs.children[GlobalVars.trendingTab.index]
          );
        }
      }
      if (type === "toggleMixes") {
        GlobalVars.storageData.options.mixes = payload;
      }
    },
    true
  );
}

function main() {
  //@ts-ignore
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.postMessage = function (data) {
      //@ts-ignore
      window.ReactNativeWebView.postMessage(data);
    };
    window.onerror = function (_, sourcefile, lineno, colno, error) {
      const { message, name, stack } = error as Error;
      window.postMessage(
        JSON.stringify({
          from: "YOUBLOCK",
          type: "error",
          payload: { message, name, stack },
        }),
        this
      );
      return true;
    };
  }

  window.onload = function () {
    window.postMessage(
      JSON.stringify({
        from: "YOUBLOCK",
        type: "config",
        //@ts-ignore
        payload: yt.config_.INNERTUBE_CONTEXT.client,
      }),
      this
    );

    setInterval(() => {
      if (!GlobalVars.tabAdded) {
        const tabs = document.getElementsByTagName("ytm-pivot-bar-renderer")[0] //@ts-ignore
          .data.items;
        tabs.splice(Math.round(tabs.length / 2), 0, {
          pivotBarItemRenderer: {
            navigationEndpoint: {
              commandMetadata: {
                webCommandMetadata: {
                  url: "/youblock?action=OPEN_LIBRARY",
                },
              },
            },
            title: {
              runs: [
                {
                  text: "Blocked",
                },
              ],
            },
            icon: {
              iconType: "SHIELD",
            },
          },
        });
        window.dispatchEvent(new CustomEvent("updateui"));
        GlobalVars.tabAdded = true;
      }
    }, 100);
  };

  listenToMessagesFromNative();
  startInterceptFetch({
    whiteList: [
      "/youtubei/v1/search",
      "/youtubei/v1/guide",
      "/youtubei/v1/browse",
      "/youtubei/v1/next",
    ],
    interceptor: {
      response: function (response, url) {
        injectFetch(response, url);
        return response;
      },
      request: function (resource) {
        const url = new URL(resource.url);
        if (url.pathname === "/youblock") {
          window.postMessage(
            JSON.stringify({
              from: "YOUBLOCK",
              type: "menu",
              //@ts-ignore
              payload: Object.fromEntries(url.searchParams),
            }),
            this
          );
          return false;
        }
        return true;
      },
    },
  });

  window.addEventListener("state-navigatestart", (e: any) => {
    if (
      (e.detail.href === "/feed/trending" ||
        e.detail.href === "/feed/explore") &&
      GlobalVars.storageData.options.trending
    ) {
      blockTrending();
    }
  });

  window.addEventListener("state-navigateend", (e: any) => {
    try {
      ObjectFilter(e.detail.data.response.response, filterRulesMain, [], true);
    } catch (error) {
      const { message, name, stack } = error as Error;
      window.postMessage(
        JSON.stringify({
          from: "YOUBLOCK",
          type: "error",
          payload: { message, name, stack },
        }),
        this
      );
    }
  });

  setInterval(function () {
    if (GlobalVars.storageData.options.trending) {
      removeTrendingTab();
    }
  }, 50);
  setInterval(function () {
    const openApp = document.getElementsByClassName("open-app-button");
    if (openApp && openApp[0]) {
      openApp[0].remove();
    }

    const openAppKids = document.getElementsByTagName(
      "ytm-watch-metadata-app-promo-renderer"
    );
    if (openAppKids && openAppKids[0]) {
      openAppKids[0].remove();
    }
  }, 200);

  window.postMessage(
    JSON.stringify({
      from: "YOUBLOCK",
      type: "loaded",
    }),
    this
  );

  firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  });
  firebase.analytics().setCurrentScreen("home");
}

main();
