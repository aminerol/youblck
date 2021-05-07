export function matchFilterData(filters, obj, objectType) {
  let doBlock = Object.keys(filters).some((h) => {
    const filterPath = filters[h];
    if (filterPath === undefined) return false;

    const properties = this.storageData.filterData[h];
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
      this.regexProps.includes(h) &&
      properties.some((prop) => prop && prop.test(value))
    ) {
      return true;
    }
    return false;
  });

  return doBlock;
}

export function matchFilterRule(obj) {
  if (isDataEmpty()) return [];

  return Object.keys(this.filterRules).reduce((res, h) => {
    let properties;
    let customFunc;
    let related;
    const filteredObject = obj[h];

    if (filteredObject) {
      const filterRule = this.filterRules[h];
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
        (this.storageData.options.mixes && h === "radioRenderer") ||
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

export function filter(obj = this.object) {
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
    } else if (childDel && this.deleteAllowed.includes(idx)) {
      // special childs that needs removing if they're empty
      delete obj[idx];
      deletePrev = true;
    }
  }

  if (this.contextMenus) addContextMenus(obj);
  return deletePrev;
}

export function ObjectFilter(
  _object,
  _filterRules,
  postActions = [],
  _contextMenus = false
) {
  this.object = _object;
  this.filterRules = _filterRules;
  this.contextMenus = _contextMenus;
  filter();
  postActions.forEach((x) => x.call(this));
}
