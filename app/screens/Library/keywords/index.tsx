import { isEmpty, some } from "lodash";
import React, { useMemo } from "react";
import { View } from "react-native";
import EmptyList from "../../../components/flatlist/empty";
import FlatListEx from "../../../components/flatlist";
import { RefreshState } from "../../../components/flatlist/types";
import TextInputEx from "../../../components/textinput";
import KeywordItem from "./item";
import useStorage, { Keyword } from "../../../utils/storage";

const Keywords = ({
  scrollHandler,
  searchValue,
}: {
  scrollHandler: {
    onScroll: (...args: any[]) => void;
    scrollEventThrottle: number;
  };
  searchValue: string;
}) => {
  const { state, ready, unBlock, block } = useStorage();
  const listState = ready
    ? state.filterData.keywords.length === 0
      ? RefreshState.EmptyData
      : RefreshState.Idle
    : RefreshState.LoadingData;

  const renderItem = ({ item }: { item: Keyword }) => (
    <KeywordItem
      unBlockKeyword={() => {
        unBlock(item, "keywords");
      }}
      keyword={item.keyword}
    />
  );
  const renderEmptyList = () => (
    <EmptyList
      headLine="No Keywords Blocked"
      subHeadLine="Go Ahead and Block some keywords. dont be shy"
    />
  );

  const data = useMemo(() => {
    const filtredItems = state.filterData.keywords.filter((item: Keyword) => {
      return item.keyword.toLowerCase().indexOf(searchValue) !== -1;
    });
    return isEmpty(searchValue) ? state.filterData.keywords : filtredItems;
  }, [searchValue, state.filterData.keywords]);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ marginBottom: 10 }}>
        <TextInputEx
          placeholderText="Add keyword"
          onSubmit={(query) => {
            if (
              !isEmpty(query) &&
              !some(state.filterData.keywords, ["keyword", query])
            ) {
              const title: Keyword = { keyword: query, id: query };
              block(title, "keywords");
            }
          }}
        />
      </View>
      <FlatListEx<Keyword>
        data={data}
        renderItem={renderItem}
        refreshState={listState}
        loadingDataText="Loading blocked keywords....."
        emptyDataComponent={renderEmptyList}
        {...scrollHandler}
      />
    </View>
  );
};

export default Keywords;
