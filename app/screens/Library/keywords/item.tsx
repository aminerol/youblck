import React, { PureComponent } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import ActionSheet from "../../../components/actionsheet";

class KeywordItem extends PureComponent<{
  keyword: string;
  unBlockKeyword: () => void;
}> {
  keyword: string;
  constructor(props) {
    super(props);

    this.keyword = props.keyword;
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.li}>
          <Text numberOfLines={1} style={styles.liText}>
            {this.keyword}
          </Text>
        </View>
        <View style={{ justifyContent: "center" }}>
          <ActionSheet
            cancelButtonIndex={1}
            options={["Remove keyword", "Cancel"]}
            childrens={[
              <MaterialIcons key={"lock"} name={"lock"} size={24} />,
              <MaterialIcons key={"close"} name="close" size={24} />,
            ]}
            actions={[this.props.unBlockKeyword]}
          />
        </View>
      </View>
    );
  }
}

export default KeywordItem;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 5,
    paddingHorizontal: 8,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  li: {
    backgroundColor: "#fff",
    paddingLeft: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  liText: {
    color: "#333333",
    fontSize: 16,
    textAlign: "left",
  },
});
