import React, { useMemo } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import EmptyList from "../../../components/flatlist/empty";
import FlatListEx from "../../../components/flatlist";
import { RefreshState } from "../../../components/flatlist/types";
import ChannelItem from "./item";
import { useWebView } from "../../../context/webview";
import useStorage, { Channel } from "../../../storage";
import { isEmpty } from "lodash";

const AnimatedFlatListEx = Animated.createAnimatedComponent(FlatListEx);

const Channels = ({
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
  const { state, ready, unBlock } = useStorage();
  const listState = ready
    ? state.filterData.channels.length === 0
      ? RefreshState.EmptyData
      : RefreshState.Idle
    : RefreshState.LoadingData;

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

  const data = useMemo(() => {
    const filtredItems = state.filterData.channels.filter((item: Channel) => {
      return item.name.toLowerCase().indexOf(searchValue) !== -1;
    });
    return isEmpty(searchValue) ? state.filterData.channels : filtredItems;
  }, [searchValue, state.filterData.channels]);

  return (
    <View style={{ flex: 1, backgroundColor: "white", marginTop: 8 }}>
      <AnimatedFlatListEx<Channel>
        data={data}
        renderItem={renderItem}
        refreshState={listState}
        loadingDataText="Loading blocked channels....."
        emptyDataComponent={renderEmptyList}
        {...scrollHandler}
      />
    </View>
  );
};

export default Channels;
