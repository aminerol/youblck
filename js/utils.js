export function getObjectByPath(obj, path, def = undefined) {
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
    value = getObjectByPath(o, paths[i]);
    if (value) {
      return value;
    }
  }
}

export function removeRvs() {
  if (
    Object.prototype.hasOwnProperty.call(
      this.object,
      "webWatchNextResponseExtensionData"
    )
  ) {
    delete this.object.webWatchNextResponseExtensionData;
  }
}

export function fixOverlay(index) {
  const overlays = getObjectByPath(
    this.object,
    "playerOverlays.playerOverlayRenderer.endScreen.watchNextEndScreenRenderer.results"
  );
  if (overlays === undefined) return;
  overlays.splice(0, 0, overlays.splice(index, 1)[0]);
}

export function fixAutoplay() {
  let secondaryResults = getObjectByPath(
    this.object,
    "contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results"
  );
  if (secondaryResults === undefined) return;

  const autoPlay = getObjectByPath(secondaryResults, "compactAutoplayRenderer");
  if (autoPlay === undefined) return;

  if (autoPlay.contents.length === 0) {
    const chipSection = secondaryResults.findIndex((x) =>
      Object.prototype.hasOwnProperty.call(x, "itemSectionRenderer")
    );
    if (chipSection !== -1) {
      secondaryResults = getObjectByPath(
        secondaryResults[chipSection],
        "itemSectionRenderer.contents"
      );
    }
    if (secondaryResults === undefined) return;

    const regularVid = secondaryResults.findIndex((x) =>
      Object.prototype.hasOwnProperty.call(x, "compactVideoRenderer")
    );
    if (regularVid === undefined) return;

    autoPlay.contents.push(secondaryResults[regularVid]);
    secondaryResults.splice(regularVid, 1);
    fixOverlay.call(this, regularVid);
  }
}

export function transformToRegExp(data) {
  if (!Object.prototype.hasOwnProperty.call(data, "filterData")) return;

  this.regexProps.forEach((p) => {
    if (Object.prototype.hasOwnProperty.call(data.filterData, p)) {
      data.filterData[p] = data.filterData[p].map((v) => {
        try {
          return RegExp(v[0], v[1].replace("g", ""));
        } catch (e) {
          window.postMessage(`RegExp parsing error: /${v[0]}/${v[1]}`);
          return undefined;
        }
      });
    }
  });
}

export function blockTrending(data) {
  if (
    document.location.pathname === "/feed/trending" ||
    document.location.pathname === "/feed/explore"
  ) {
    redirectToIndex();
  }

  data.filterData.channelId.push(/^FEtrending$/);
  data.filterData.channelId.push(/^FEexplore$/);
}
