import { GlobalVars } from "./globals";
import { regexProps, deleteAllowed } from "./constants";
import { addContextMenus, flattenRuns, isDataEmpty } from "./filter-utils";
import { getObjectByPath } from "./utils";

let filterRules: any;
let contextMenus: any;

function matchFilterData(filters, obj) {
  let doBlock = Object.keys(filters).some((h) => {
    const filterPath = filters[h];
    if (filterPath === undefined) return false;

    const properties = GlobalVars.storageData.filterData[h];
    if (properties === undefined || properties.length === 0) return false;

    const filterPathArr =
      filterPath instanceof Array ? filterPath : [filterPath];
    let value;
    for (let idx = 0; idx < filterPathArr.length; idx += 1) {
      value = getObjectByPath(obj, filterPathArr[idx]);
      if (value !== undefined) break;
    }

    if (value === undefined) return false;

    if (value instanceof Array) {
      value = flattenRuns(value);
    }

    if (
      //@ts-ignore
      regexProps.includes(h) &&
      properties.some((prop) => prop && prop.test(value))
    ) {
      return true;
    }
    return false;
  });

  return doBlock;
}

function matchFilterRule(obj) {
  if (isDataEmpty()) return [];

  return Object.keys(filterRules).reduce((res, h) => {
    let properties;
    let customFunc;
    let related;
    const filteredObject = obj[h];

    if (filteredObject) {
      const filterRule = filterRules[h];
      if (Object.prototype.hasOwnProperty.call(filterRule, "properties")) {
        properties = filterRule.properties;
        customFunc = filterRule.customFunc;
        related = filterRule.related;
      } else {
        properties = filterRule;
        customFunc = undefined;
        related = undefined;
      }

      const isMatch =
        (GlobalVars.storageData.options.mixes &&
          h === "compactRadioRenderer") ||
        h === "watchMetadataAppPromoRenderer" ||
        //@ts-ignore
        matchFilterData(properties, filteredObject, h);
      if (isMatch) {
        res.push({
          name: h,
          customFunc,
          related,
        });
      }
    }
    return res;
  }, []);
}

function filter(obj = GlobalVars.currentItem) {
  let deletePrev = false;

  // we reached the end of the object
  if (typeof obj !== "object" || obj === null) {
    return deletePrev;
  }

  // object filtering
  const matchedRules = matchFilterRule(obj);
  matchedRules.forEach((r) => {
    let customRet = true;
    if (r.customFunc !== undefined) {
      customRet = r.customFunc.call(this, obj, r.name);
    }
    if (customRet) {
      delete obj[r.name];
      deletePrev = r.related || true;
    }
  });

  let len = 0;
  let keys;

  // If object is an array len is the number of it's members
  if (obj instanceof Array) {
    len = obj.length;
    // otherwise, this is a plain object, len is number of keys
  } else {
    keys = Object.keys(obj);
    len = keys.length;
  }

  // loop backwards for easier splice
  for (let i = len - 1; i >= 0; i -= 1) {
    const idx = keys ? keys[i] : i;
    if (obj[idx] === undefined) continue;

    // filter next child
    // also if current object is an array, splice child
    const childDel = filter(obj[idx]);
    if (childDel && keys === undefined) {
      deletePrev = true;
      obj.splice(idx, 1);
      // Hack for deleting related objects with missing data
      if (
        typeof childDel === "string" &&
        obj.length > 0 &&
        obj[idx] &&
        obj[idx][childDel]
      ) {
        obj.splice(idx, 1);
      }
    }

    // if next child is an empty array that we filtered, mark parent for removal.
    if (obj[idx] instanceof Array && obj[idx].length === 0 && childDel) {
      deletePrev = true;
    } else if (childDel && deleteAllowed.includes(idx)) {
      // special childs that needs removing if they're empty
      delete obj[idx];
      deletePrev = true;
    }
  }

  if (contextMenus) addContextMenus(obj);
  return deletePrev;
}

export function ObjectFilter(
  _currentItem: any,
  _filterRules: any,
  postActions = [],
  _contextMenus = false
) {
  GlobalVars.currentItem = _currentItem;
  filterRules = _filterRules;
  contextMenus = _contextMenus;
  filter();
  postActions.forEach((x) => x.call(this));
}
