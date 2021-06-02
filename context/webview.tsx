import React from "react";
import WebView from "react-native-webview";

interface PostMessageProps<T> {
  from: "YOUBLOCK";
  type: "storage" | "undo";
  payload: T;
}

const WebViewContext = React.createContext<{
  ref: React.MutableRefObject<WebView<{}>>;
  postMessage: (props: PostMessageProps<{}>) => void;
}>({ ref: null, postMessage: () => {} });

export const WebViewProvider: React.FC = ({ children }) => {
  const webView = React.useRef<WebView>();

  const postMessage = <T extends {}>({
    from = "YOUBLOCK",
    type,
    payload,
  }: PostMessageProps<T>) => {
    webView.current?.postMessage(
      JSON.stringify({
        from,
        type,
        payload,
      })
    );
  };

  return (
    <WebViewContext.Provider value={{ ref: webView, postMessage }}>
      {children}
    </WebViewContext.Provider>
  );
};

export const useWebView = () => React.useContext(WebViewContext);
