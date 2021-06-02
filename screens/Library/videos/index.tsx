import React from "react";
import { View } from "react-native";
import EmptyList from "../../../components/flatlist/empty";
import FlatListEx from "../../../components/flatlist";
import { RefreshState } from "../../../components/flatlist/types";
import VideoItem from "./item";
import { useWebView } from "../../../context/webview";
import useStorage, { Video } from "../../../storage";

const Videos = () => {
  const { postMessage } = useWebView();
  const { state, ready, unBlock } = useStorage();
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

  return (
    <View style={{ flex: 1 }}>
      <FlatListEx<Video>
        data={state.filterData.videos}
        renderItem={renderItem}
        refreshState={listState}
        loadingDataText="Loading blocked videos....."
        emptyDataComponent={renderEmptyList}
      />
    </View>
  );
};

export default Videos;
