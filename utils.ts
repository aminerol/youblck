import { filter, isEmpty } from "lodash";

export function buildInjectedJavascript(jsCode: string, storage): string {
  // Keep compatibility with old code that uses window.postMessage. For more information,
  // see https://github.com/react-native-community/react-native-webview/releases/tag/v5.0.0
  let injectedJavascript = `
        (function() {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.postMessage = function(data) {
                window.ReactNativeWebView.postMessage(data);
            };
            window.onerror = function(message, sourcefile, lineno, colno, error) {
              window.ReactNativeWebView.postMessage("Message: " + message + " - Source: " + sourcefile + " Line: " + lineno + ":" + colno);
              return true;
            };
          }
        })();`;

  if (jsCode !== undefined) {
    injectedJavascript += jsCode;
  }

  // End the injectedJavascript with 'true;' or else you'll sometimes get silent failures
  const safeData = JSON.stringify(storage);
  injectedJavascript += `
    main();
    this.storageData = ${safeData}; 
    this.storageData = compileAll(this.storageData); 
    transformToRegExp(this.storageData);
    true;
  `;

  return injectedJavascript;
}

export const serialzeJSObj = (theModule) => {
  const serialized = Object.keys(theModule).reduce((acc, fnName) => {
    const type = typeof theModule[fnName];
    if (type === "function" || type === "boolean" || type === "number") {
      return `${acc}${fnName}: ${theModule[fnName]},\n`;
    }
    if (type === "string") {
      return `${acc}${fnName}: '${theModule[fnName]}',\n`;
    }
    if (type === "object") {
      return serialzeJSObj(theModule[fnName]);
    }
  }, "");

  return serialized;
};

export const serialzeJS = (theModule) => {
  const serialized = Object.keys(theModule).reduce((acc, fnName) => {
    if (typeof theModule[fnName] === "object") {
      const objSerialized = serialzeJSObj(theModule[fnName]);
      return `${acc}const ${fnName} = {${objSerialized}}\n`;
    } else if (typeof theModule[fnName] === "function") {
      return `${acc}${theModule[fnName]}\n`;
    } else {
      return `${acc}var ${fnName} = ${JSON.stringify(theModule[fnName])}\n`;
    }
  }, "");
  return `${serialized};`;
};

export async function getChannelInfo(channelId) {
  try {
    const response = await fetch(
      `https://m.youtube.com/results?sp=mAEA&search_query=${channelId}&pbj=1`,
      {
        method: "POST",
      }
    );
    var json = await response.json();
    if (json != null) {
      const contents =
        json.response.contents.sectionListRenderer.contents[0]
          .itemSectionRenderer.contents;
      let channel = filter(contents, "compactChannelRenderer")[0];
      if (!isEmpty(channel)) {
        channel = channel.compactChannelRenderer;
        return Promise.resolve({
          videoCount: channel.videoCountText.runs[0].text,
          subscriberCount: channel.subscriberCountText.runs[0].text,
        });
      } else return Promise.resolve({});
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
