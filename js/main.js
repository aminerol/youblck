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
    },
  });

  window.addEventListener("state-navigateend", (e) =>
    ObjectFilter(
      e.detail.data.response.response,
      this.filterRulesMain,
      [],
      true
    )
  );

  window.postMessage("youblock ready");
}
