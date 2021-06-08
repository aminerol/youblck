import { regexProps } from "./constants";
import { StorageInterface } from "./types";

function compileRegex(
  entriesArr: Array<any>,
  type: keyof StorageInterface["filterData"]
) {
  if (!(entriesArr instanceof Array)) {
    return undefined;
  }
  // empty dataset
  if (entriesArr.length === 1 && entriesArr[0] === "") return [];

  // skip empty and comments lines
  // const filtered = [
  //   ...new Set(entriesArr.filter((x) => !(x === "" || x.startsWith("//")))),
  // ];

  const unicodeBoundry =
    "[ \n\r\t!@#$%^&*()_\\-=+\\[\\]\\\\\\|;:'\",\\.\\/<>\\?`~:]+";
  return entriesArr.map((v) => {
    v = v.trim();

    // unique id
    if (["channelId", "videoId"].includes(type)) {
      return [`^${v}$`, ""];
    }

    // raw regex
    const parts = /^\/(.*)\/(.*)$/.exec(v);
    if (parts !== null) {
      return [parts[1], parts[2]];
    }

    // regular keyword
    return [
      "(^|" +
        unicodeBoundry +
        ")(" +
        v.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&") +
        ")(" +
        unicodeBoundry +
        "|$)",
      "i",
    ];
  });
}

export function compileAll(data: StorageInterface) {
  const sendData = { filterData: {}, options: data.options };

  // compile regex props
  regexProps.map((p) => {
    const dataArr = compileRegex(data.filterData[p], p);
    if (dataArr) {
      sendData.filterData[p] = dataArr;
    }
  });

  return sendData;
}

export function transformToRegExp(data) {
  if (!Object.prototype.hasOwnProperty.call(data, "filterData")) return;

  regexProps.forEach((p) => {
    if (Object.prototype.hasOwnProperty.call(data.filterData, p)) {
      data.filterData[p] = data.filterData[p].map((v) => {
        try {
          return RegExp(v[0], v[1].replace("g", ""));
        } catch (e) {
          window.postMessage(`RegExp parsing error: /${v[0]}/${v[1]}`, this);
          return undefined;
        }
      });
    }
  });
}
