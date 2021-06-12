import { GlobalVars } from "./globals";
import { regexProps, baseRules, contextMenuObjects } from "./constants";
import { deepGetFirst, getObjectByPath } from "./utils";
import { redirectToIndex } from "./post-actions";

export function blockTrending() {
  redirectToIndex();
  GlobalVars.storageData.filterData.channelId.push(/^FEtrending$/);
  GlobalVars.storageData.filterData.channelId.push(/^FEexplore$/);
}

export function isDataEmpty() {
  for (let idx = 0; idx < regexProps.length; idx += 1) {
    if (GlobalVars.storageData.filterData[regexProps[idx]].length > 0) {
      return false;
    }
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

function parseVideoDetails(video) {
  const data = {
    id: deepGetFirst(["videoId"], video),
    title: deepGetFirst(baseRules.title, video),
    thumbnail: `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
    publishedTime: video.publishedTimeText
      ? video.publishedTimeText.runs[0].text
      : "LIVE",
    owner: JSON.stringify({
      name: deepGetFirst(baseRules.channelName, video),
      id: deepGetFirst(baseRules.channelId, video),
      username: deepGetFirst(baseRules.channelUsername, video),
      thumbnail: deepGetFirst(baseRules.channelThumbnail, video),
    }),
    views: video.shortViewCountText
      ? video.shortViewCountText.runs[0].text
      : "",
    duration: deepGetFirst(baseRules.vidLength, video),
  };
  return Object.keys(data)
    .map((key) => `${key}=${encodeURIComponent(data[key])}`)
    .join("&");
}

function buildContextMenu(id, block, unblock) {
  return {
    menuServiceItemRenderer: {
      text: {
        runs: [
          {
            text: block.text,
          },
        ],
      },
      serviceEndpoint: {
        commandMetadata: {
          webCommandMetadata: {
            sendPost: true,
            apiUrl: `/youblock?action=${block.action}&${block.item}`,
          },
        },
        feedbackEndpoint: {
          uiActions: {
            hideEnclosingContainer: true,
          },
          actions: [
            {
              replaceEnclosingAction: {
                item: {
                  notificationMultiActionRenderer: {
                    responseText: {
                      runs: [
                        {
                          text: unblock.text,
                        },
                      ],
                    },
                    buttons: [
                      {
                        buttonRenderer: {
                          style: "STYLE_BLUE_TEXT",
                          text: {
                            runs: [
                              {
                                text: "Undo",
                              },
                            ],
                          },
                          serviceEndpoint: {
                            commandMetadata: {
                              webCommandMetadata: {
                                sendPost: true,
                                apiUrl: `/youblock?action=${unblock.action}&${unblock.item}`,
                              },
                            },
                            undoFeedbackEndpoint: {
                              actions: [
                                {
                                  undoFeedbackAction: {
                                    hack: true,
                                  },
                                },
                              ],
                            },
                          },
                        },
                      },
                    ],
                    data: { id },
                  },
                },
              },
            },
          ],
        },
      },
    },
  };
}

export function addContextMenus(obj) {
  const attr = contextMenuObjects.find((e) =>
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
    const blockedItem = parseVideoDetails(obj[attr]);

    if (hasChannel) {
      items.push(
        buildContextMenu(
          deepGetFirst(baseRules.channelId, obj[attr]),
          { text: "Block Channel", action: "BLOCK_CHANNEL", item: blockedItem },
          {
            text: "Channel Blocked",
            action: "UNBLOCK_CHANNEL",
            item: blockedItem,
          }
        )
      );
    }
    if (hasVideo) {
      items.push(
        buildContextMenu(
          deepGetFirst(["videoId"], obj[attr]),
          { text: "Block Video", action: "BLOCK_VIDEO", item: blockedItem },
          { text: "Video Blocked", action: "UNBLOCK_VIDEO", item: blockedItem }
        )
      );
    }
  }
}
