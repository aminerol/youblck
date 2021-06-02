import { TextStyle, ViewStyle } from "react-native";

export const RefreshState = {
  Idle: 0,
  HeaderRefreshing: 1,
  FooterRefreshing: 2,
  NoMoreData: 3,
  Failure: 4,
  EmptyData: 5,
  LoadingData: 6,
};

export interface FlatListExProps {
  refreshState: number;
  onHeaderRefresh?: (state: number) => void;
  onFooterRefresh?: (state: number) => void;

  footerContainerStyle?: ViewStyle;
  footerTextStyle?: TextStyle;

  footerRefreshingText?: string;
  footerFailureText?: string;
  footerNoMoreDataText?: string;
  emptyDataText?: string;
  loadingDataText?: string;

  footerRefreshingComponent?: () => JSX.Element;
  footerFailureComponent?: () => JSX.Element;
  footerNoMoreDataComponent?: () => JSX.Element;
  emptyDataComponent?: () => JSX.Element;
  loadingDataComponent?: () => JSX.Element;
}
