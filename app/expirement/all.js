(function () {
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.postMessage = function (data) {
      window.ReactNativeWebView.postMessage(data);
    };
    window.onerror = function (message, sourcefile, lineno, colno, error) {
      window.ReactNativeWebView.postMessage(
        "Message: " +
          message +
          " - Source: " +
          sourcefile +
          " Line: " +
          lineno +
          ":" +
          colno
      );
      return true;
    };
  }
})();
function initVars() {
  this.currentBlock = false;
  this.regexProps = ["videoId", "channelId", "channelName", "title", "comment"];
  this.deleteAllowed = [
    "richItemRenderer",
    "content",
    "horizontalListRenderer",
    "verticalListRenderer",
    "shelfRenderer",
    "gridRenderer",
    "expandedShelfContentsRenderer",
    "comment",
    "commentThreadRenderer",
  ];
  this.contextMenuObjects = [
    "videoWithContextRenderer",
    "compactVideoRenderer",
    "playlistVideoRenderer",
    "compactChannelRenderer",
    "backstagePostRenderer",
    "postRenderer",
    "movieRenderer",
    "gridVideoRenderer",
    "videoPrimaryInfoRenderer",
    "commentRenderer",
  ];
  this.baseRules = {
    videoId: "videoId",
    channelId: [
      "shortBylineText.runs.navigationEndpoint.browseEndpoint.browseId",
      "channelId",
    ],
    channelName: [
      "shortBylineText.runs",
      "shortBylineText.simpleText",
      "longBylineText.simpleText",
      "displayName.runs",
      "title.runs",
    ],
    title: ["title.runs", "title.simpleText"],
    vidLength:
      "thumbnailOverlays.thumbnailOverlayTimeStatusRenderer.text.simpleText",
    viewCount: ["viewCountText.simpleText", "viewCountText.runs"],
    publishTimeText: "publishedTimeText.simpleText",
  };
  this.filterRulesMain = {
    videoWithContextRenderer: baseRules,
    compactVideoRenderer: baseRules,
    playlistVideoRenderer: baseRules,
    compactChannelRenderer: baseRules,
    movieRenderer: baseRules,
    gridVideoRenderer: baseRules,
    radioRenderer: baseRules,
    gridRadioRenderer: baseRules,
    compactRadioRenderer: baseRules,
    endScreenVideoRenderer: baseRules,
    endScreenPlaylistRenderer: baseRules,
    gridPlaylistRenderer: baseRules,
    postRenderer: {
      channelId: "navigationEndpoint.browseEndpoint.browseId",
      channelName: ["authorText.runs", "authorText.simpleText"],
    },
    backstagePostRenderer: {
      channelId: "navigationEndpoint.browseEndpoint.browseId",
      channelName: ["authorText.runs", "authorText.simpleText"],
    },
    watchCardCompactVideoRenderer: {
      title: "title.runs",
      channelId: "subtitles.runs.navigationEndpoint.browseEndpoint.browseId",
      channelName: "subtitles.runs",
      videoId: "navigationEndpoint.watchEndpoint.videoId",
    },
    shelfRenderer: {
      channelId: "endpoint.browseEndpoint.browseId",
    },
    channelVideoPlayerRenderer: {
      title: "title.runs",
    },
    playlistPanelVideoRenderer: {
      properties: baseRules,
      customFunc: blockPlaylistVid,
    },
    videoPrimaryInfoRenderer: {
      properties: {
        title: "title.simpleText",
      },
      customFunc: redirectToNext,
    },
    videoSecondaryInfoRenderer: {
      properties: {
        channelId:
          "owner.videoOwnerRenderer.navigationEndpoint.browseEndpoint.browseId",
        channelName: "owner.videoOwnerRenderer.title.runs",
      },
      customFunc: redirectToNext,
    },
    c4TabbedHeaderRenderer: {
      properties: {
        channelId: "channelId",
        channelName: "title",
      },
      customFunc: redirectToIndex,
    },
    gridChannelRenderer: {
      channelId: "channelId",
      channelName: "title.simpleText",
    },
    miniChannelRenderer: {
      channelId: "channelId",
      channelName: "title.runs",
    },
    guideEntryRenderer: {
      channelId: "navigationEndpoint.browseEndpoint.browseId",
      channelName: ["title", "formattedTitle.simpleText"],
    },
    universalWatchCardRenderer: {
      properties: {
        channelId:
          "header.watchCardRichHeaderRenderer.titleNavigationEndpoint.browseEndpoint.browseId",
        channelName: "header.watchCardRichHeaderRenderer.title.simpleText",
      },
    },
    playlist: {
      properties: {
        channelId:
          "shortBylineText.runs.navigationEndpoint.browseEndpoint.browseId",
        channelName: ["shortBylineText.runs", "shortBylineText.simpleText"],
        title: "title",
      },
      customFunc: redirectToIndex,
    },
    compactChannelRecommendationCardRenderer: {
      properties: {
        channelId: "channelEndpoint.browseEndpoint.browseId",
        channelName: ["channelTitle.simpleText", "channelTitle.runs"],
      },
    },
  };
  this.filterRulesYtPlayer = {
    args: {
      properties: {
        videoId: ["video_id", "raw_player_response.videoDetails.videoId"],
        channelId: ["ucid", "raw_player_response.videoDetails.channelId"],
        channelName: ["author", "raw_player_response.videoDetails.author"],
        title: ["title", "raw_player_response.videoDetails.title"],
        vidLength: [
          "length_seconds",
          "raw_player_response.videoDetails.lengthSeconds",
        ],
      },
      customFunc: disableEmbedPlayer,
    },
    videoDetails: {
      properties: {
        videoId: "videoId",
        channelId: "channelId",
        channelName: "author",
        title: "title",
        vidLength: "lengthSeconds",
      },
      customFunc: disablePlayer,
    },
    PLAYER_VARS: {
      properties: {
        videoId: ["video_id"],
        channelId: [
          "embedded_player_response_parsed.embedPreview.thumbnailPreviewRenderer.videoDetails.embeddedPlayerOverlayVideoDetailsRenderer.expandedRenderer.embeddedPlayerOverlayVideoDetailsExpandedRenderer.subscribeButton.subscribeButtonRenderer.channelId",
        ],
        channelName: [
          "embedded_player_response_parsed.embedPreview.thumbnailPreviewRenderer.videoDetails.embeddedPlayerOverlayVideoDetailsRenderer.expandedRenderer.embeddedPlayerOverlayVideoDetailsExpandedRenderer.title.runs",
        ],
        title: [
          "embedded_player_response_parsed.embedPreview.thumbnailPreviewRenderer.title.runs",
        ],
        vidLength: [
          "embedded_player_response_parsed.embedPreview.thumbnailPreviewRenderer.videoDurationSeconds",
        ],
      },
      customFunc: disableEmbedPlayer,
    },
  };
  this.filterRulesGuide = {
    guideEntryRenderer: {
      properties: {
        channelId: "navigationEndpoint.browseEndpoint.browseId",
        channelName: ["title", "formattedTitle.simpleText"],
      },
    },
  };
  this.filterRulesCmnts = {
    commentRenderer: {
      channelId: "authorEndpoint.browseEndpoint.browseId",
      channelName: "authorText.simpleText",
      comment: ["contentText.runs", "contentText.simpleText"],
    },
    liveChatTextMessageRenderer: {
      channelId: "authorExternalChannelId",
      channelName: "authorName.simpleText",
      comment: "message.runs",
    },
  };
}
function compileRegex(entriesArr, type) {
  if (!(entriesArr instanceof Array)) {
    return undefined;
  }

  if (entriesArr.length === 1 && entriesArr[0] === "") return [];
  var unicodeBoundry =
    "[ \n\r\t!@#$%^&*()_\\-=+\\[\\]\\\\\\|;:'\",\\.\\/<>\\?`~:]+";
  return entriesArr.map(function (v) {
    v = v.trim();

    if (["channelId", "videoId"].includes(type)) {
      return ["^" + v + "$", ""];
    }

    var parts = /^\/(.*)\/(.*)$/.exec(v);

    if (parts !== null) {
      return [parts[1], parts[2]];
    }

    return [
      "(^|" +
        unicodeBoundry +
        ")(" +
        v.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&") +
        ")(" +
        unicodeBoundry +
        "|$)",
      "i",
    ];
  });
}
function compileAll(data) {
  var sendData = {
    filterData: {},
    options: data.options,
  };
  this.regexProps.forEach(function (p) {
    var dataArr = compileRegex(data.filterData[p], p);

    if (dataArr) {
      sendData.filterData[p] = dataArr;
    }
  });
  return sendData;
}
function startInterceptFetch(_ref) {
  var whiteList = _ref.whiteList,
    interceptor = _ref.interceptor;
  var interceptors = [interceptor];

  if (!window.fetch) {
    try {
      _$$_REQUIRE(_dependencyMap[0], "whatwg-fetch");
    } catch (err) {
      throw Error("No fetch available. Unable to register fetch-intercept");
    }
  }

  window.fetch = (function (fetch) {
    return function (resource) {
      var init =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : undefined;

      if (
        !(resource instanceof Request) ||
        !whiteList.some(function (u) {
          return resource.url.includes(u);
        })
      ) {
        return fetch(resource, init);
      }

      var reversedInterceptors = interceptors.reduce(function (
        array,
        interceptor
      ) {
        return [interceptor].concat(array);
      },
      []);

      var onResponseError = function onResponseError(err, reject) {
        reversedInterceptors.forEach(function (_ref2) {
          var responseError = _ref2.responseError;

          if (responseError) {
            err = responseError(err);
          }

          reject(err);
        });
      };

      return new Promise(function (resolve, reject) {
        fetch(resource, (init = init))
          .then(function (resp) {
            var url = new URL(resource.url);
            resp
              .json()
              .then(function (jsonResp) {
                reversedInterceptors.forEach(function (_ref3) {
                  var response = _ref3.response;

                  if (response) {
                    jsonResp = response(jsonResp, url);
                  }
                });
                resolve(new Response(JSON.stringify(jsonResp)));
              })
              .catch(function (err) {
                return onResponseError(err, reject);
              });
          })
          .catch(function (err) {
            return onResponseError(err, reject);
          });
      });
    };
  })(window.fetch);
}
function getObjectByPath(obj, path) {
  var def =
    arguments.length > 2 && arguments[2] !== undefined
      ? arguments[2]
      : undefined;
  var paths = path instanceof Array ? path : path.split(".");
  var nextObj = obj;
  var exist = paths.every(function (v) {
    if (nextObj instanceof Array) {
      var found = nextObj.find(function (o) {
        return Object.prototype.hasOwnProperty.call(o, v);
      });
      if (found === undefined) return false;
      nextObj = found[v];
    } else {
      if (!nextObj || !Object.prototype.hasOwnProperty.call(nextObj, v))
        return false;
      nextObj = nextObj[v];
    }

    return true;
  });
  return exist ? nextObj : def;
}
function removeRvs() {
  if (
    Object.prototype.hasOwnProperty.call(
      this.object,
      "webWatchNextResponseExtensionData"
    )
  ) {
    delete this.object.webWatchNextResponseExtensionData;
  }
}
function fixOverlay(index) {
  var overlays = getObjectByPath(
    this.object,
    "playerOverlays.playerOverlayRenderer.endScreen.watchNextEndScreenRenderer.results"
  );
  if (overlays === undefined) return;
  overlays.splice(0, 0, overlays.splice(index, 1)[0]);
}
function fixAutoplay() {
  var secondaryResults = getObjectByPath(
    this.object,
    "contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results"
  );
  if (secondaryResults === undefined) return;
  var autoPlay = getObjectByPath(secondaryResults, "compactAutoplayRenderer");
  if (autoPlay === undefined) return;

  if (autoPlay.contents.length === 0) {
    var chipSection = secondaryResults.findIndex(function (x) {
      return Object.prototype.hasOwnProperty.call(x, "itemSectionRenderer");
    });

    if (chipSection !== -1) {
      secondaryResults = getObjectByPath(
        secondaryResults[chipSection],
        "itemSectionRenderer.contents"
      );
    }

    if (secondaryResults === undefined) return;
    var regularVid = secondaryResults.findIndex(function (x) {
      return Object.prototype.hasOwnProperty.call(x, "compactVideoRenderer");
    });
    if (regularVid === undefined) return;
    autoPlay.contents.push(secondaryResults[regularVid]);
    secondaryResults.splice(regularVid, 1);
    fixOverlay.call(this, regularVid);
  }
}
function transformToRegExp(data) {
  if (!Object.prototype.hasOwnProperty.call(data, "filterData")) return;
  this.regexProps.forEach(function (p) {
    if (Object.prototype.hasOwnProperty.call(data.filterData, p)) {
      data.filterData[p] = data.filterData[p].map(function (v) {
        try {
          return RegExp(v[0], v[1].replace("g", ""));
        } catch (e) {
          window.postMessage("RegExp parsing error: /" + v[0] + "/" + v[1]);
          return undefined;
        }
      });
    }
  });
}
function blockTrending(data) {
  if (
    document.location.pathname === "/feed/trending" ||
    document.location.pathname === "/feed/explore"
  ) {
    redirectToIndex();
  }

  data.filterData.channelId.push(/^FEtrending$/);
  data.filterData.channelId.push(/^FEexplore$/);
}
function isDataEmpty() {
  for (var idx = 0; idx < this.regexProps.length; idx += 1) {
    if (this.storageData.filterData[this.regexProps[idx]].length > 0)
      return false;
  }

  return true;
}
function flattenRuns(arr) {
  return arr
    .reduce(function (res, v) {
      if (Object.prototype.hasOwnProperty.call(v, "text")) {
        res.push(v.text);
      }

      return res;
    }, [])
    .join(" ");
}
function disableEmbedPlayer(ytData) {
  if (this.storageData.options.suggestions_only) {
    return false;
  }

  censorTitle();
  return true;
}
function disablePlayer(ytData) {
  if (this.storageData.options.suggestions_only) {
    return false;
  }

  var message = this.storageData.options.block_message || "";

  for (
    var _iterator = _createForOfIteratorHelperLoose(
        Object.getOwnPropertyNames(ytData)
      ),
      _step;
    !(_step = _iterator()).done;

  ) {
    var prop = _step.value;

    try {
      delete ytData[prop];
    } catch (e) {}
  }

  ytData.playabilityStatus = {
    status: "ERROR",
    reason: message,
    errorScreen: {
      playerErrorMessageRenderer: {
        reason: {
          simpleText: message,
        },
        thumbnail: {
          thumbnails: [
            {
              url: "//s.ytimg.com/yts/img/meh7-vflGevej7.png",
              width: 140,
              height: 100,
            },
          ],
        },
        icon: {
          iconType: "ERROR_OUTLINE",
        },
      },
    },
  };
  this.currentBlock = true;
}
function redirectToNext() {
  this.currentBlock = false;

  if (this.storageData.options.suggestions_only) {
    return false;
  }

  censorTitle();
  var twoColumn = getObjectByPath(
    this.object,
    "contents.twoColumnWatchNextResults"
  );
  if (twoColumn === undefined) return;
  var primary = getObjectByPath(twoColumn, "results.results");
  if (primary === undefined) return;
  primary.contents = [];
  if (Object.prototype.hasOwnProperty.call(twoColumn, "conversationBar"))
    delete twoColumn.conversationBar;
  var isPlaylist = new URL(document.location).searchParams.has("list");
  if (isPlaylist) return;
  var secondary = getObjectByPath(twoColumn, "secondaryResults");

  if (this.storageData.options.autoplay !== true) {
    secondary.secondaryResults = undefined;
    return;
  }

  var nextVids = getObjectByPath(secondary, "secondaryResults.results");
  if (nextVids === undefined) return;
  var prop = "compactVideoRenderer";
  nextVids.some(function (vid) {
    var checkedObj = Object.prototype.hasOwnProperty.call(
      vid,
      "compactAutoplayRenderer"
    )
      ? getObjectByPath(vid, "compactAutoplayRenderer.contents", [])[0]
      : vid;
    if (!checkedObj) return;
    if (!Object.prototype.hasOwnProperty.call(checkedObj, prop)) return false;
    if (checkedObj[prop] && checkedObj[prop].videoId)
      document.location = "watch?v=" + checkedObj[prop].videoId;
    return true;
  });
  secondary.secondaryResults = undefined;
}
function censorTitle() {
  var listener = function listener() {
    document.title = "YouTube";
    window.removeEventListener("yt-update-title", listener);
  };

  window.addEventListener("yt-update-title", listener);
  window.addEventListener("load", function () {
    document.title = "YouTube";
  });
}
function blockPlaylistVid(pl) {
  var vid = pl.playlistPanelVideoRenderer;
  var message = this.storageData.options.block_message || "";
  vid.videoId = "undefined";
  vid.unplayableText = {
    simpleText: "" + message,
  };
  vid.thumbnail = {
    thumbnails: [
      {
        url: "https://s.ytimg.com/yts/img/meh_mini-vfl0Ugnu3.png",
      },
    ],
  };
  delete vid.title;
  delete vid.longBylineText;
  delete vid.shortBylineText;
  delete vid.thumbnailOverlays;
}
function redirectToIndex() {
  if (this.storageData && this.storageData.options.suggestions_only) {
    return false;
  }

  if (this && this.object) this.object = undefined;
  document.location = "/";
  throw 0;
}
function parseVideoDetails(video) {
  var shortBylineText = video.shortBylineText.runs[0];
  var data = {
    id: video.videoId,
    title: video.headline.runs[0].text,
    thumbnail: "https://i.ytimg.com/vi/" + video.videoId + "/mqdefault.jpg",
    publishedTime: video.publishedTimeText
      ? video.publishedTimeText.runs[0].text
      : "LIVE",
    owner: JSON.stringify({
      name: shortBylineText.text,
      id: shortBylineText.navigationEndpoint.browseEndpoint.browseId,
      username:
        shortBylineText.navigationEndpoint.browseEndpoint.canonicalBaseUrl,
      thumbnail: video.channelThumbnail.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].url.replace(
        "=s68",
        "=s480"
      ),
    }),
    views: video.shortViewCountText
      ? video.shortViewCountText.runs[0].text
      : "",
    duration:
      video.thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer.text.runs[0]
        .text,
  };
  return Object.keys(data)
    .map(function (key) {
      return key + "=" + encodeURIComponent(data[key]);
    })
    .join("&");
}
function addContextMenus(obj) {
  var attr = this.contextMenuObjects.find(function (e) {
    return Object.prototype.hasOwnProperty.call(obj, e);
  });
  if (attr === undefined) return;
  var items;
  var hasChannel = false;
  var hasVideo = false;

  if (Object.prototype.hasOwnProperty.call(obj[attr], "videoActions")) {
    items = obj[attr].videoActions.menuRenderer.items;
    hasChannel = true;
    hasVideo = true;
  } else if (Object.prototype.hasOwnProperty.call(obj[attr], "actionMenu")) {
    items = obj[attr].actionMenu.menuRenderer.items;
    hasChannel = true;
  } else if (attr === "commentRenderer") {
    obj[attr].actionMenu = {
      menuRenderer: {
        items: [],
      },
    };
    items = obj[attr].actionMenu.menuRenderer.items;
    hasChannel = true;
  } else {
    var isAdded = getObjectByPath(obj[attr], "menu.menuRenderer.isAdded");

    if (isAdded) {
      return;
    }

    items = getObjectByPath(obj[attr], "menu.menuRenderer.items");
    var topLevel = getObjectByPath(
      obj[attr],
      "menu.menuRenderer.topLevelButtons"
    );

    if (!items && !topLevel) {
      obj[attr].menu = {
        menuRenderer: {
          items: [],
        },
      };
      items = obj[attr].menu.menuRenderer.items;
    }

    if (topLevel) {
      obj[attr].menu.menuRenderer.items = [];
      items = obj[attr].menu.menuRenderer.items;
    }

    hasChannel = true;
    hasVideo = true;
  }

  if (items instanceof Array) {
    obj[attr].menu.menuRenderer.isAdded = true;
    //var blockedItem = parseVideoDetails(obj[attr]);

    if (hasChannel) {
      items.push({
        menuNavigationItemRenderer: {
          text: {
            runs: [
              {
                text: "Block Channel",
              },
            ],
          },
          navigationEndpoint: {
            urlEndpoint: {
              url: "/youblock?action=BLOCK_CHANNEL&",
            },
          },
        },
      });
    }

    if (hasVideo) {
      items.push({
        menuNavigationItemRenderer: {
          text: {
            runs: [
              {
                text: "Block Video",
              },
            ],
          },
          navigationEndpoint: {
            urlEndpoint: {
              url: "/youblock?action=BLOCK_VIDEO&",
            },
          },
        },
      });
    }
  }
}
function matchFilterData(filters, obj, objectType) {
  var _this = this;

  var doBlock = Object.keys(filters).some(function (h) {
    var filterPath = filters[h];
    if (filterPath === undefined) return false;
    var properties = _this.storageData.filterData[h];
    if (properties === undefined || properties.length === 0) return false;
    var filterPathArr = filterPath instanceof Array ? filterPath : [filterPath];
    var value;

    for (var idx = 0; idx < filterPathArr.length; idx += 1) {
      value = getObjectByPath(obj, filterPathArr[idx]);
      if (value !== undefined) break;
    }

    if (value === undefined) return false;

    if (value instanceof Array) {
      value = flattenRuns(value);
    }

    if (
      _this.regexProps.includes(h) &&
      properties.some(function (prop) {
        return prop && prop.test(value);
      })
    ) {
      return true;
    }

    return false;
  });
  return doBlock;
}
function matchFilterRule(obj) {
  var _this2 = this;

  if (isDataEmpty()) return [];
  return Object.keys(this.filterRules).reduce(function (res, h) {
    var properties;
    var customFunc;
    var related;
    var filteredObject = obj[h];

    if (filteredObject) {
      var filterRule = _this2.filterRules[h];

      if (Object.prototype.hasOwnProperty.call(filterRule, "properties")) {
        properties = filterRule.properties;
        customFunc = filterRule.customFunc;
        related = filterRule.related;
      } else {
        properties = filterRule;
        customFunc = undefined;
        related = undefined;
      }

      var isMatch =
        (_this2.storageData.options.mixes && h === "radioRenderer") ||
        matchFilterData(properties, filteredObject, h);

      if (isMatch) {
        res.push({
          name: h,
          customFunc: customFunc,
          related: related,
        });
      }
    }

    return res;
  }, []);
}
function filter() {
  var _this3 = this;

  var obj =
    arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : this.object;
  var deletePrev = false;

  if (typeof obj !== "object" || obj === null) {
    return deletePrev;
  }

  var matchedRules = matchFilterRule(obj);
  matchedRules.forEach(function (r) {
    var customRet = true;

    if (r.customFunc !== undefined) {
      customRet = r.customFunc.call(_this3, obj, r.name);
    }

    if (customRet) {
      delete obj[r.name];
      deletePrev = r.related || true;
    }
  });
  var len = 0;
  var keys;

  if (obj instanceof Array) {
    len = obj.length;
  } else {
    keys = Object.keys(obj);
    len = keys.length;
  }

  for (var i = len - 1; i >= 0; i -= 1) {
    var idx = keys ? keys[i] : i;
    if (obj[idx] === undefined) continue;
    var childDel = filter(obj[idx]);

    if (childDel && keys === undefined) {
      deletePrev = true;
      obj.splice(idx, 1);

      if (
        typeof childDel === "string" &&
        obj.length > 0 &&
        obj[idx] &&
        obj[idx][childDel]
      ) {
        obj.splice(idx, 1);
      }
    }

    if (obj[idx] instanceof Array && obj[idx].length === 0 && childDel) {
      deletePrev = true;
    } else if (childDel && this.deleteAllowed.includes(idx)) {
      delete obj[idx];
      deletePrev = true;
    }
  }

  if (this.contextMenus) addContextMenus(obj);
  return deletePrev;
}
function ObjectFilter(_object, _filterRules) {
  var _this4 = this;

  var postActions =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  var _contextMenus =
    arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  this.object = _object;
  this.filterRules = _filterRules;
  this.contextMenus = _contextMenus;
  filter();
  postActions.forEach(function (x) {
    return x.call(_this4);
  });
}
function injectFetch(resp, url) {
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
function listenToMessagesFromNative() {
  var _this = this;

  window.addEventListener(
    "message",
    function (event) {
      var data = JSON.parse(event.data);
      var from = data.from,
        type = data.type,
        payload = data.payload;
      if (!from || from !== "YOUBLOCK") return;

      if (type === "storage") {
        _this.storageData = payload;
        _this.storageData = compileAll(_this.storageData);
        transformToRegExp(_this.storageData);
      }
    },
    true
  );
}
function main() {
  var _this2 = this;

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
      response: function response(_response, url) {
        injectFetch(_response, url);
        return _response;
      },
    },
  });
  window.addEventListener("state-navigateend", function (e) {
    return ObjectFilter(
      e.detail.data.response.response,
      _this2.filterRulesMain,
      [],
      true
    );
  });
  console.log("youblock ready");
}
main();
this.storageData = {
  filterData: {
    videoId: [],
    channelId: [
      "UCdEEdJkYycZnKjKbLVQW6hw",
      "UCJkvje0QbiDx3Jxr0bbhfsA",
      "UC-do1UFNFVRhFA20k1izktQ",
    ],
    channelName: ["Salima سليمة", "Youssef Toufah", "Ramadan Al Aoula TV"],
    title: [],
    comment: [],
  },
  options: { trending: false, mixes: false, suggestions_only: false },
};
this.storageData = compileAll(this.storageData);
transformToRegExp(this.storageData);
true;
