import { useContext, useMemo } from "react";
import {
  usePersistStorage,
  createPersistContext,
} from "react-native-use-persist-storage";

export interface IStorageItem {
  id: string;
  thumbnail?: string;
  name?: string;
}

export interface Channel extends IStorageItem {
  username: string;
  subscriberCount: string;
  videoCount: number;
}

export interface Video extends IStorageItem {
  duration: string;
  publishedTime: string;
  views: string;
  owner: Channel;
}

export interface Keyword extends IStorageItem {
  keyword: string;
}

interface Storage {
  filterData: {
    keywords: Keyword[];
    channels: Channel[];
    videos: Video[];
    comments: string[];
  };
  options: {
    trending: boolean;
    mixes: boolean;
    suggestions_only: boolean;
  };
}

const { Context: StateContext, Provider: StateProvider } = createPersistContext(
  {
    storageKey: "@State",
    defaultData: {
      filterData: {
        keywords: [],
        channels: [],
        videos: [],
        comments: [],
      },
      options: {
        trending: false,
        mixes: false,
        suggestions_only: false,
      },
    },
  }
);

const useStorage = () => {
  const [state, setState, isStateReady] = useContext(StateContext);

  const block = async (
    item: IStorageItem,
    type: "videos" | "channels" | "keywords"
  ) => {
    await setState((state) => ({
      ...state,
      filterData: {
        ...state.filterData,
        [type]: [...state.filterData[type], item],
      },
    }));
  };

  const unBlock = async (
    item: IStorageItem,
    type: "videos" | "channels" | "keywords"
  ) => {
    await setState((state) => ({
      ...state,
      filterData: {
        ...state.filterData,
        [type]: (state.filterData[type] as IStorageItem[]).filter(
          (obj) => obj.id !== item.id
        ),
      },
    }));
  };

  const unBlockAll = async (type: "videos" | "channels" | "keywords") => {
    await setState((state) => ({
      ...state,
      filterData: {
        ...state.filterData,
        [type]: [],
      },
    }));
  };

  const setOptions = async (value: boolean, type: "trending" | "mixes" | "suggestions_only") => {
    await setState((state) => ({
      ...state,
      options: {
        ...state.options,
        [type]: value,
      },
    }));
  };

  const storage = useMemo(
    () => ({
      ...state,
      filterData: {
        videoId: state.filterData.videos.map((item) => item.id),
        channelId: state.filterData.channels.map((item) => item.id),
        channelName: state.filterData.channels.map((item) => item.name),
        title: state.filterData.keywords.map((item) => item.keyword),
        comment: state.filterData.comments,
      },
    }),
    [state]
  );

  return {
    block,
    unBlock,
    unBlockAll,
    state,
    storage,
    ready: isStateReady,
    setOptions
  };
};

export default useStorage;
export { StateProvider };
