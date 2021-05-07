export function compileRegex(entriesArr, type) {
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
    if (["channels", "videos"].includes(type)) {
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

export function compileAll(data) {
  const sendData = { filterData: {}, options: data.options };

  // compile regex props
  this.regexProps.forEach((p) => {
    const dataArr = compileRegex(data.filterData[p], p);
    if (dataArr) {
      sendData.filterData[p] = dataArr;
    }
  });

  return sendData;
}
