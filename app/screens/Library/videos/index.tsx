import React, { useMemo } from "react";
import { View } from "react-native";
import EmptyList from "../../../components/flatlist/empty";
import FlatListEx from "../../../components/flatlist";
import { RefreshState } from "../../../components/flatlist/types";
import VideoItem from "./item";
import { useWebView } from "../../../context/webview";
import useStorage, { Video } from "../../../utils/storage";
import { isEmpty } from "lodash";

const Videos = ({
  scrollHandler,
  searchValue,
}: {
  scrollHandler: {
    onScroll: (...args: any[]) => void;
    scrollEventThrottle: number;
  };
  searchValue: string;
}) => {
  const { postMessage } = useWebView();
  const { state, ready, unBlock, storage } = useStorage();
  const listState = ready
    ? state.filterData.videos.length === 0
      ? RefreshState.EmptyData
      : RefreshState.Idle
    : RefreshState.LoadingData;

  const renderItem = ({ item }: { item: Video }) => (
    <VideoItem
      unBlockVideo={() => {
        unBlock(item, "videos");
        postMessage({
          from: "YOUBLOCK",
          type: "undo",
          payload: { id: item.id },
        });
      }}
      video={item}
    />
  );
  const renderEmptyList = () => (
    <EmptyList
      headLine="No Videos Blocked"
      subHeadLine="Go Ahead and Block some videos. dont be shy"
    />
  );

  const data = useMemo(() => {
    const filtredItems = state.filterData.videos.filter((item: Video) => {
      return item.name.toLowerCase().indexOf(searchValue) !== -1;
    });
    return isEmpty(searchValue) ? state.filterData.videos : filtredItems;
  }, [searchValue, state.filterData.videos]);

  return (
    <View style={{ flex: 1, backgroundColor: "white", marginTop: 8 }}>
      <FlatListEx<Video>
        data={data}
        renderItem={renderItem}
        refreshState={listState}
        loadingDataText="Loading blocked videos....."
        emptyDataComponent={renderEmptyList}
        {...scrollHandler}
      />
    </View>
  );
};

export default Videos;
