import { isEmpty } from "lodash";
import React from "react";
import { View } from "react-native";
import EmptyList from "../../../components/flatlist/empty";
import FlatListEx from "../../../components/flatlist";
import { RefreshState } from "../../../components/flatlist/types";
import TextInputEx from "../../../components/textinput";
import KeywordItem from "./item";
import useStorage, { Keyword } from "../../../storage";

const Keywords = () => {
  const { state, ready, unBlock, block, storage } = useStorage();
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

  return (
    <View style={{ flex: 1 }}>
      <View style={{ marginBottom: 10 }}>
        <TextInputEx
          placeholderText="Add keyword"
          onSubmit={(query) => {
            if (!isEmpty(query)) {
              const title: Keyword = { keyword: query, id: query };
              block(title, "keywords");
            }
          }}
        />
      </View>
      <FlatListEx<Keyword>
        data={state.filterData.keywords}
        renderItem={renderItem}
        refreshState={listState}
        loadingDataText="Loading blocked keywords....."
        emptyDataComponent={renderEmptyList}
      />
    </View>
  );
};

export default Keywords;
