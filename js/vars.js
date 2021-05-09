export function initVars() {
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
      "authorEndpoint.browseEndpoint.browseId",
      "channelId",
      "navigationEndpoint.browseEndpoint.browseId",
    ],
    channelUsername: [
      "shortBylineText.runs.navigationEndpoint.browseEndpoint.canonicalBaseUrl",
      "authorEndpoint.browseEndpoint.canonicalBaseUrl",
      "navigationEndpoint.browseEndpoint.canonicalBaseUrl",
    ],
    channelThumbnail: [
      "channelThumbnail.channelThumbnailWithLinkRenderer.thumbnail.thumbnails.url",
      "channelThumbnail.thumbnails.url",
    ],
    channelName: [
      "shortBylineText.runs.text",
      "shortBylineText.simpleText",
      "longBylineText.simpleText",
      "title.runs.text",
      "authorText.runs.text",
      "authorText.simpleText",
    ],
    title: ["title.runs.text", "title.simpleText", "headline.runs.text"],
    vidLength: [
      "thumbnailOverlays.thumbnailOverlayTimeStatusRenderer.text.simpleText",
      "thumbnailOverlays.thumbnailOverlayTimeStatusRenderer.text.runs.text",
    ],
    viewCount: ["viewCountText.simpleText", "viewCountText.runs"],
    publishTimeText: "publishedTimeText.simpleText",
  };
  this.filterRulesMain = {
    videoWithContextRenderer: baseRules,
    compactVideoRenderer: baseRules,
    playlistVideoRenderer: baseRules,
    compactChannelRenderer: {
      properties: baseRules,
      related: "shelfRenderer",
    },
    compactRadioRenderer: baseRules,
    compactPlaylistRenderer: baseRules,

    movieRenderer: baseRules,
    gridVideoRenderer: baseRules,
    radioRenderer: baseRules,
    gridRadioRenderer: baseRules,

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
