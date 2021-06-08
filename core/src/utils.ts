export function getObjectByPath(
  obj: any,
  path: string | Array<any>,
  def = undefined
) {
  const paths = path instanceof Array ? path : path.split(".");
  let nextObj = obj;

  const exist = paths.every((v) => {
    if (nextObj instanceof Array) {
      const found = nextObj.find((o) =>
        Object.prototype.hasOwnProperty.call(o, v)
      );
      if (found === undefined) return false;
      nextObj = found[v];
    } else {
      if (!nextObj || !Object.prototype.hasOwnProperty.call(nextObj, v))
        return false;
      nextObj = nextObj[v];
    }
    return true;
  });

  return exist ? nextObj : def;
}

export function deepGetFirst(paths, o) {
  for (let i = 0; i < paths.length; i++) {
    const value = getObjectByPath(o, paths[i]);
    if (value) {
      return value;
    }
  }
}
