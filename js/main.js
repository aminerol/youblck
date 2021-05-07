export function injectXHR(resp, url) {
  let ytDataArr = resp.part || resp.response.parts || resp.response;
  ytDataArr = ytDataArr instanceof Array ? ytDataArr : [ytDataArr];

  ytDataArr.forEach((obj) => {
    if (Object.prototype.hasOwnProperty.call(obj, "player")) {
      try {
        const player_resp = getObjectByPath(obj.player, "args.player_response");
        obj.player.args.raw_player_response = JSON.parse(player_resp);
      } catch (e) {}
      ObjectFilter(obj.player, this.filterRulesYtPlayer);
    }

    if (Object.prototype.hasOwnProperty.call(obj, "playerResponse")) {
      ObjectFilter(obj.playerResponse, this.filterRulesYtPlayer);
    }

    if (
      Object.prototype.hasOwnProperty.call(obj, "contents") ||
      Object.prototype.hasOwnProperty.call(obj, "data")
    ) {
      let rules;
      let postActions = [];
      switch (url.pathname) {
        case "/guide_ajax":
          rules = this.filterRulesGuide;
          break;
        case "/comment_service_ajax":
        case "/live_chat/get_live_chat":
          rules = this.filterRulesCmnts;
          break;
        case "/watch":
          postActions = [removeRvs, fixAutoplay];
          if (this.currentBlock) postActions.push(redirectToNext);
        default:
          rules = this.filterRulesMain;
      }
      ObjectFilter(obj.contents || obj.data, rules, postActions, true);
    }
  }, this);
}

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
      if (type === "loadEnd") {
        let videos = document.getElementsByTagName(
          "ytm-video-with-context-renderer"
        );
        videos = Array.from(videos).map((video) => ({
          videoWithContextRenderer: video.data,
        }));
        const postActions = [removeRvs, fixAutoplay];
        ObjectFilter(
          videos,
          this.filterRulesMain,
          this.currentBlock ? postActions.concat(redirectToNext) : postActions,
          true
        );
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
  startInterceptXHR({
    //whiteList: ["/results", "/playlist", "/c", "/channel", "/feed/trending"],
    whiteList: "*",
    interceptor: {
      response: function (response, url) {
        injectXHR(response, url);
        return response;
      },
    },
  });

  window.postMessage("youblock ready");
}
