import { useMemo } from "react";
import {
  usePersistStorage,
  createPersistContext,
} from "react-native-use-persist-storage";

export interface StorageItem {
  id: string;
  duration: string;
  owner: {
    id: string;
    thumbnail: string;
    name: string;
    username: string;
  };
  publishedTime: string;
  thumbnail: string;
  title: string;
  views: string;
}

interface Storage {
  filterData: {
    keywords: StorageItem[];
    channelNames: StorageItem[];
    channels: StorageItem[];
    videos: StorageItem[];
    comments: StorageItem[];
  };
  options: {
    trending: boolean;
    mixes: boolean;
    suggestions_only: boolean;
  };
}

const useStorage = () => {
  const [state, setState, isStateReady] = usePersistStorage<Storage>("@State", {
    filterData: {
      keywords: [],
      channelNames: [],
      channels: [],
      videos: [],
      comments: [],
    },
    options: {
      trending: false,
      mixes: false,
      suggestions_only: false,
    },
  });

  const blockVideo = async (video: StorageItem) => {
    await setState((state) => ({
      ...state,
      filterData: {
        ...state.filterData,
        videos: [...state.filterData.videos, video],
      },
    }));
  };

  const unBlockVideo = async (video: StorageItem) => {
    await setState((state) => ({
      ...state,
      filterData: {
        ...state.filterData,
        videos: state.filterData.videos.filter((item) => item.id !== video.id),
      },
    }));
  };

  const unBlockAllVideo = async () => {
    await setState((state) => ({
      ...state,
      filterData: {
        ...state.filterData,
        videos: [],
      },
    }));
  };

  const blockChannel = async (channel: StorageItem) => {
    await setState((state) => ({
      ...state,
      filterData: {
        ...state.filterData,
        channels: [...state.filterData.channels, channel],
      },
    }));
  };

  const unBlockChannel = async (channel: StorageItem) => {
    await setState((state) => ({
      ...state,
      filterData: {
        ...state.filterData,
        channels: state.filterData.channels.filter(
          (item) => item.id !== channel.id
        ),
      },
    }));
  };

  const unBlockAllChannels = async () => {
    await setState((state) => ({
      ...state,
      filterData: {
        ...state.filterData,
        channels: [],
      },
    }));
  };

  const storage = useMemo(
    () => ({
      ...state,
      filterData: {
        videoId: state.filterData.videos.map((item) => item.id),
        channelId: state.filterData.channels.map((item) => item.id),
        channelName: state.filterData.channelNames.map((item) => item.id),
        title: state.filterData.keywords.map((item) => item.id),
        comment: state.filterData.comments.map((item) => item.id),
      },
    }),
    [state]
  );

  return {
    blockVideo,
    unBlockVideo,
    unBlockAllVideo,
    blockChannel,
    unBlockChannel,
    unBlockAllChannels,
    state,
    storage,
    ready: isStateReady,
  };
};
export default useStorage;
