export function injectFetch(resp, url) {
  if (
    [
      "/youtubei/v1/search",
      "/youtubei/v1/browse",
      "/youtubei/v1/next",
    ].includes(url.pathname)
  ) {
    ObjectFilter(resp, this.filterRulesMain, [], true);
  } else if (url.pathname === "/youtubei/v1/guide") {
    ObjectFilter(resp, this.filterRulesGuide, [], true);
  }
}

export function listenToMessagesFromNative() {
  window.addEventListener(
    "message",
    (event) => {
      const data = JSON.parse(event.data);
      const { from, type, payload } = data;
      if (!from || from !== "YOUBLOCK") return;
      if (type === "storage") {
        this.storageData = payload;
        this.storageData = compileAll(this.storageData);
        transformToRegExp(this.storageData);
      }
    },
    true
  );
}

export function main() {
  initVars();
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
              payload: Object.fromEntries(url.searchParams),
            })
          );
          return false;
        }
        return true;
      },
    },
  });

  window.addEventListener("state-navigatestart", (e) => {
    if (
      (e.detail.href === "/feed/trending" ||
        e.detail.href === "/feed/explore") &&
      this.storageData.options.trending
    ) {
      blockTrending();
    }
  });

  window.addEventListener("state-navigateend", (e) => {
    try {
      ObjectFilter(
        e.detail.data.response.response,
        this.filterRulesMain,
        [],
        true
      );
    } catch (error) {
      window.postMessage(
        JSON.stringify({
          from: "YOUBLOCK",
          type: "error",
          payload: error,
        })
      );
    }
  });

  window.postMessage(
    JSON.stringify({
      from: "YOUBLOCK",
      type: "test",
      payload: "youblock ready",
    })
  );
}
