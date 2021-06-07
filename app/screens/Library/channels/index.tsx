import React, { useEffect } from "react";
import { View } from "react-native";
import EmptyList from "../../../components/flatlist/empty";
import FlatListEx from "../../../components/flatlist";
import { RefreshState } from "../../../components/flatlist/types";
import ChannelItem from "./item";
import { useWebView } from "../../../context/webview";
import useStorage, { Channel } from "../../../storage";

const Channels = () => {
  const { postMessage, updateStorage } = useWebView();
  const { state, ready, unBlock, storage } = useStorage();
  const listState = ready
    ? state.filterData.channels.length === 0
      ? RefreshState.EmptyData
      : RefreshState.Idle
    : RefreshState.LoadingData;

  useEffect(() => {
    updateStorage(storage);
  }, [storage]);

  const renderItem = ({ item }: { item: Channel }) => (
    <ChannelItem
      unBlockChannel={() => {
        unBlock(item, "channels");
        postMessage({
          from: "YOUBLOCK",
          type: "undo",
          payload: { id: item.id },
        });
      }}
      channel={item}
    />
  );
  const renderEmptyList = () => (
    <EmptyList
      headLine="No Channel Blocked"
      subHeadLine="Go Ahead and Block some channels. dont be shy"
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatListEx<Channel>
        data={state.filterData.channels}
        renderItem={renderItem}
        refreshState={listState}
        loadingDataText="Loading blocked channels....."
        emptyDataComponent={renderEmptyList}
      />
    </View>
  );
};

export default Channels;
