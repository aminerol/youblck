import React, { useState } from "react";
import WebView from "react-native-webview";

interface PostMessageProps<T> {
  from: "YOUBLOCK";
  type: "storage" | "undo";
  payload: T;
}

const WebViewContext = React.createContext<{
  ref: React.MutableRefObject<WebView<{}>>;
  postMessage: (props: PostMessageProps<{}>) => void;
  updateStorage: (storage: {}) => void;
  ytConfig?: any;
  setYtConfig?: (cfg: any) => void;
}>({ ref: null, postMessage: () => {}, updateStorage: () => {} });

export const WebViewProvider: React.FC = ({ children }) => {
  const webView = React.useRef<WebView>();
  const [ytConfig, setYtConfig] = useState({});

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

  const updateStorage = <T extends {}>(storage: T) => {
    postMessage({
      from: "YOUBLOCK",
      type: "storage",
      payload: storage,
    });
  };

  return (
    <WebViewContext.Provider
      value={{
        ref: webView,
        postMessage,
        updateStorage,
        ytConfig,
        setYtConfig,
      }}
    >
      {children}
    </WebViewContext.Provider>
  );
};

export const useWebView = () => React.useContext(WebViewContext);
