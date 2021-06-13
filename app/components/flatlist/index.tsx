import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatListProps,
} from "react-native";
import { FlatListExProps, RefreshState } from "./types";

export default class FlatListEx<T extends { id: string }> extends PureComponent<
  FlatListExProps & FlatListProps<T>
> {
  onEndReachedCalledDuringMomentum: boolean;
  isResponder: boolean;
  nativeEvent: NativeScrollEvent;

  onHeaderRefresh = () => {
    if (this.shouldStartHeaderRefreshing()) {
      this.props.onHeaderRefresh?.(RefreshState.HeaderRefreshing);
    }
  };

  onFooterRefresh = () => {
    if (!this.onEndReachedCalledDuringMomentum) {
      this.props.onFooterRefresh &&
        this.props.onFooterRefresh(RefreshState.FooterRefreshing);
      this.onEndReachedCalledDuringMomentum = true;
    }
  };

  onScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    let previousOffsetY = 0;
    if (this.nativeEvent) {
      previousOffsetY = this.nativeEvent.contentOffset.y;
    }
    const offsetY = nativeEvent.contentOffset.y;

    if (
      offsetY - previousOffsetY > 0 &&
      offsetY >=
        nativeEvent.contentSize.height +
          nativeEvent.contentInset.bottom -
          nativeEvent.layoutMeasurement.height
    ) {
      if (this.shouldStartFooterRefreshing()) {
        this.props.onFooterRefresh &&
          this.props.onFooterRefresh(RefreshState.FooterRefreshing);
      }
    }
    this.nativeEvent = nativeEvent;
  };

  shouldStartHeaderRefreshing = () => {
    if (
      this.props.refreshState === RefreshState.HeaderRefreshing ||
      this.props.refreshState === RefreshState.FooterRefreshing
    ) {
      return false;
    }

    return true;
  };

  shouldStartFooterRefreshing = () => {
    let { refreshState, data } = this.props;
    if (data.length === 0) {
      return false;
    }

    return refreshState === RefreshState.Idle;
  };

  render() {
    this.nativeEvent = null;
    this.isResponder = false;
    let {
      loadingDataText,
      loadingDataComponent,
      emptyDataText,
      emptyDataComponent,
      ...rest
    } = this.props;
    let footerContainerStyle = [
      styles.footerContainer,
      this.props.footerContainerStyle,
    ];
    let footerTextStyle = [styles.footerText, this.props.footerTextStyle];

    let body = null;
    if (this.props.refreshState === RefreshState.LoadingData) {
      body = loadingDataComponent ? (
        loadingDataComponent()
      ) : (
        <View style={footerContainerStyle}>
          <ActivityIndicator size="large" color="#888888" />
          <Text style={footerTextStyle}>{loadingDataText}</Text>
        </View>
      );
    } else if (this.props.refreshState === RefreshState.EmptyData) {
      body = (
        <TouchableOpacity
          activeOpacity={1}
          style={footerContainerStyle}
          onPress={() => {
            this.props.onHeaderRefresh &&
              this.props.onHeaderRefresh(RefreshState.HeaderRefreshing);
          }}
        >
          {emptyDataComponent ? (
            emptyDataComponent()
          ) : (
            <Text style={footerTextStyle}>{emptyDataText}</Text>
          )}
        </TouchableOpacity>
      );
    } else {
      body = (
        <FlatList<T>
          onScroll={this.onScroll}
          onRefresh={this.onHeaderRefresh}
          refreshing={this.props.refreshState === RefreshState.HeaderRefreshing}
          ListFooterComponent={this.renderFooter}
          onScrollBeginDrag={() => {
            this.onEndReachedCalledDuringMomentum = false;
          }}
          onMomentumScrollBegin={() => {
            this.onEndReachedCalledDuringMomentum = false;
          }}
          onEndReached={this.onFooterRefresh}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          {...rest}
        />
      );
    }
    return body;
  }

  renderFooter = () => {
    let footer = null;

    let footerContainerStyle = [
      styles.footerContainer,
      this.props.footerContainerStyle,
    ];
    let footerTextStyle = [styles.footerText, this.props.footerTextStyle];

    let {
      footerRefreshingText,
      footerFailureText,
      footerNoMoreDataText,

      footerRefreshingComponent,
      footerFailureComponent,
      footerNoMoreDataComponent,
    } = this.props;

    switch (this.props.refreshState) {
      case RefreshState.Idle:
        footer = <View style={footerContainerStyle} />;
        break;
      case RefreshState.Failure: {
        footer = (
          <TouchableOpacity
            onPress={() => {
              if (this.props.data.length == 0) {
                this.props.onHeaderRefresh &&
                  this.props.onHeaderRefresh(RefreshState.HeaderRefreshing);
              } else {
                this.props.onFooterRefresh &&
                  this.props.onFooterRefresh(RefreshState.FooterRefreshing);
              }
            }}
          >
            {footerFailureComponent ? (
              footerFailureComponent()
            ) : (
              <View style={footerContainerStyle}>
                <Text style={footerTextStyle}>{footerFailureText}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
        break;
      }
      case RefreshState.FooterRefreshing: {
        footer = footerRefreshingComponent ? (
          footerRefreshingComponent()
        ) : (
          <View style={footerContainerStyle}>
            <ActivityIndicator size="small" color="#888888" />
            <Text style={[footerTextStyle, { marginLeft: 7 }]}>
              {footerRefreshingText}
            </Text>
          </View>
        );
        break;
      }
      case RefreshState.NoMoreData: {
        footer = footerNoMoreDataComponent ? (
          footerNoMoreDataComponent()
        ) : (
          <View style={footerContainerStyle}>
            <Text style={footerTextStyle}>{footerNoMoreDataText}</Text>
          </View>
        );
        break;
      }
    }

    return footer;
  };
}

const styles = StyleSheet.create({
  footerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#555555",
    margin: 8,
  },
});
