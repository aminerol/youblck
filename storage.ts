import {
  usePersistStorage,
  createPersistContext,
} from "react-native-use-persist-storage";

interface Storage {
  filterData: {
    keywords: [];
    channelNames: [];
    channels: [];
    videos: [];
    comments: [];
  };
  options: {
    trending: boolean;
    mixes: boolean;
    suggestions_only: boolean;
  };
}

const useStorage = () => {
  const [videos, setVideos, isVideosReady] = usePersistStorage("@Videos", []);
  const [channels, setChannels, isChannelsReady] = usePersistStorage(
    "@Channels",
    []
  );
  const [keywords, setKeywords, isKeywordsReady] = usePersistStorage(
    "@Keywords",
    []
  );
  const [options, setOptions, isOptionsReady] = usePersistStorage("@Options", {
    trending: false,
    mixes: false,
    suggestions_only: false,
  });

  const blockVideo = async (video) => {
    await setVideos((videos) => [...videos, video]);
  };

  const blockChannel = async (channel) => {
    await setChannels((channels) => [...channels, channel]);
  };

  return {
    videos,
    blockVideo,
    channels,
    blockChannel,
    storage: {
      filterData: {
        videos: videos.map((item) => item.id),
        channels: channels.map((item) => item.id),
        keywords: keywords.map((item) => item.id),
        channelNames: [],
        comments: [],
      },
      options,
    },
    ready:
      isVideosReady && isChannelsReady && isKeywordsReady && isOptionsReady,
  };
};
export default useStorage;
