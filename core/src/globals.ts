import { StorageInterface } from "./types";

export let GlobalVars = {
  currentItem: {} as any,
  currentBlock: false,
  tabAdded: false,
  storageData: {
    options: {
      mixes: false,
      suggestions_only: false,
      trending: true,
      autoplay: false,
      block_message: "whoa",
    },
    filterData: {
      channelId: [],
      channelName: [],
      comment: [],
      title: [],
      videoId: [],
    },
  } as StorageInterface,
  trendingTab: {} as any,
};
