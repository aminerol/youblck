import { GlobalVars } from "./globals";
import { getObjectByPath } from "./utils";

function censorTitle() {
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
  const message = GlobalVars.storageData.options.block_message || "";

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

export function disableEmbedPlayer(ytData) {
  if (GlobalVars.storageData.options.suggestions_only) {
    return false;
  }

  censorTitle();
  return true;
}

export function disablePlayer(ytData) {
  if (GlobalVars.storageData.options.suggestions_only) {
    return false;
  }

  const message = GlobalVars.storageData.options.block_message || "";
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

  GlobalVars.currentBlock = true;
}

export function redirectToIndex() {
  if (
    GlobalVars.storageData &&
    GlobalVars.storageData.options.suggestions_only
  ) {
    return false;
  }

  if (this && GlobalVars.currentItem) GlobalVars.currentItem = undefined;
  document.location.href = "/";
}

export function redirectToNext() {
  GlobalVars.currentBlock = false;

  if (GlobalVars.storageData.options.suggestions_only) {
    return false;
  }

  censorTitle();

  const twoColumn = getObjectByPath(
    GlobalVars.currentItem,
    "contents.twoColumnWatchNextResults"
  );
  if (twoColumn === undefined) return;

  const primary = getObjectByPath(twoColumn, "results.results");
  if (primary === undefined) return;
  primary.contents = [];

  if (Object.prototype.hasOwnProperty.call(twoColumn, "conversationBar"))
    delete twoColumn.conversationBar;

  const isPlaylist = new URL(document.location.href).searchParams.has("list");
  if (isPlaylist) return;

  const secondary = getObjectByPath(twoColumn, "secondaryResults");
  if (GlobalVars.storageData.options.autoplay !== true) {
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
      document.location.href = `watch?v=${checkedObj[prop].videoId}`;
    return true;
  });

  secondary.secondaryResults = undefined;
}
