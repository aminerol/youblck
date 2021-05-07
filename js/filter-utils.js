export function isDataEmpty() {
  for (let idx = 0; idx < this.regexProps.length; idx += 1) {
    if (this.storageData.filterData[this.regexProps[idx]].length > 0)
      return false;
  }
  return true;
}

export function flattenRuns(arr) {
  return arr
    .reduce((res, v) => {
      if (Object.prototype.hasOwnProperty.call(v, "text")) {
        res.push(v.text);
      }
      return res;
    }, [])
    .join(" ");
}

export function disableEmbedPlayer(ytData) {
  if (this.storageData.options.suggestions_only) {
    return false;
  }

  censorTitle();
  return true;
}

export function disablePlayer(ytData) {
  if (this.storageData.options.suggestions_only) {
    return false;
  }

  const message = this.storageData.options.block_message || "";
  for (const prop of Object.getOwnPropertyNames(ytData)) {
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

export function redirectToNext() {
  this.currentBlock = false;

  if (this.storageData.options.suggestions_only) {
    return false;
  }

  censorTitle();

  const twoColumn = getObjectByPath(
    this.object,
    "contents.twoColumnWatchNextResults"
  );
  if (twoColumn === undefined) return;

  const primary = getObjectByPath(twoColumn, "results.results");
  if (primary === undefined) return;
  primary.contents = [];

  if (Object.prototype.hasOwnProperty.call(twoColumn, "conversationBar"))
    delete twoColumn.conversationBar;

  const isPlaylist = new URL(document.location).searchParams.has("list");
  if (isPlaylist) return;

  const secondary = getObjectByPath(twoColumn, "secondaryResults");
  if (this.storageData.options.autoplay !== true) {
    secondary.secondaryResults = undefined;
    return;
  }

  const nextVids = getObjectByPath(secondary, "secondaryResults.results");
  if (nextVids === undefined) return;

  const prop = "compactVideoRenderer";
  nextVids.some((vid) => {
    const checkedObj = Object.prototype.hasOwnProperty.call(
      vid,
      "compactAutoplayRenderer"
    )
      ? getObjectByPath(vid, "compactAutoplayRenderer.contents", [])[0]
      : vid;
    if (!checkedObj) return;
    if (!Object.prototype.hasOwnProperty.call(checkedObj, prop)) return false;
    if (checkedObj[prop] && checkedObj[prop].videoId)
      document.location = `watch?v=${checkedObj[prop].videoId}`;
    return true;
  });

  secondary.secondaryResults = undefined;
}

export function censorTitle() {
  const listener = function () {
    document.title = "YouTube";
    window.removeEventListener("yt-update-title", listener);
  };
  window.addEventListener("yt-update-title", listener);

  window.addEventListener("load", () => {
    document.title = "YouTube";
  });
}

export function blockPlaylistVid(pl) {
  const vid = pl.playlistPanelVideoRenderer;
  const message = this.storageData.options.block_message || "";

  vid.videoId = "undefined";

  vid.unplayableText = {
    simpleText: `${message}`,
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

export function redirectToIndex() {
  if (this.storageData && this.storageData.options.suggestions_only) {
    return false;
  }

  if (this && this.object) this.object = undefined;
  document.location = "/";
  // TODO: Hack for stoping execution
  throw 0;
}

export function addContextMenus(obj) {
  const attr = this.contextMenuObjects.find((e) =>
    Object.prototype.hasOwnProperty.call(obj, e)
  );
  if (attr === undefined) return;

  let items;
  let hasChannel = false;
  let hasVideo = false;
  if (Object.prototype.hasOwnProperty.call(obj[attr], "videoActions")) {
    items = obj[attr].videoActions.menuRenderer.items;
    hasChannel = true;
    hasVideo = true;
  } else if (Object.prototype.hasOwnProperty.call(obj[attr], "actionMenu")) {
    items = obj[attr].actionMenu.menuRenderer.items;
    hasChannel = true;
  } else if (attr === "commentRenderer") {
    obj[attr].actionMenu = { menuRenderer: { items: [] } };
    items = obj[attr].actionMenu.menuRenderer.items;
    hasChannel = true;
  } else {
    // if (!Object.prototype.hasOwnProperty.call(obj[attr], "shortBylineText"))
    //   return;
    const isAdded = getObjectByPath(obj[attr], "menu.menuRenderer.isAdded");
    if (isAdded) {
      return;
    }

    items = getObjectByPath(obj[attr], "menu.menuRenderer.items");
    const topLevel = getObjectByPath(
      obj[attr],
      "menu.menuRenderer.topLevelButtons"
    );
    if (!items && !topLevel) {
      obj[attr].menu = { menuRenderer: { items: [] } };
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
    if (hasChannel) {
      items.push({
        menuNavigationItemRenderer: {
          text: { runs: [{ text: "Block Channel" }] },
          navigationEndpoint: {
            urlEndpoint: {
              url: "/youblock?action=BLOCK_CHANNEL&id=fQoRfieZJxI",
            },
          },
        },
      });
    }
    if (hasVideo) {
      items.push({
        menuNavigationItemRenderer: {
          text: { runs: [{ text: "Block Video" }] },
          navigationEndpoint: {
            urlEndpoint: {
              url: "/youblock?action=BLOCK_VIDEO&id=fQoRfieZJxI",
            },
          },
        },
      });
    }
  }
}
