export function startInterceptFetch({ whiteList, interceptor }) {
  const interceptors = [interceptor];
  if (!window.fetch) {
    try {
      require("whatwg-fetch");
    } catch (err) {
      throw Error("No fetch available. Unable to register fetch-intercept");
    }
  }
  window.fetch = (function (fetch) {
    return function (resource, init = undefined) {
      if (
        !(resource instanceof Request) ||
        !whiteList.some((u) => resource.url.includes(u))
      ) {
        return fetch(resource, init);
      }

      const reversedInterceptors = interceptors.reduce(
        (array, interceptor) => [interceptor].concat(array),
        []
      );

      const onResponseError = (err, reject) => {
        reversedInterceptors.forEach(({ responseError }) => {
          if (responseError) {
            err = responseError(err);
          }
          reject(err);
        });
      };

      return new Promise((resolve, reject) => {
        fetch(resource, (init = init))
          .then(function (resp) {
            const url = new URL(resource.url);
            resp
              .json()
              .then(function (jsonResp) {
                reversedInterceptors.forEach(({ response }) => {
                  if (response) {
                    jsonResp = response(jsonResp, url);
                  }
                });
                resolve(new Response(JSON.stringify(jsonResp)));
              })
              .catch((err) => onResponseError(err, reject));
          })
          .catch((err) => onResponseError(err, reject));
      });
    };
  })(window.fetch);
}

export function startInterceptXHR({ whiteList, interceptor }) {
  const { request, response } = interceptor;
  function isUrlMatch(url) {
    if (!(url instanceof URL)) url = new URL(url);
    if (whiteList === "*") return true;
    return whiteList.some((uri) => url.pathname.startsWith(uri));
  }

  const origSend = XMLHttpRequest.prototype.send;
  function hijackedSend(body) {
    const onreadystatechange = this.onreadystatechange;

    this.onreadystatechange = function (event) {
      let url;
      try {
        url = new URL(this.responseURL);
      } catch (e) {
        if (onreadystatechange) onreadystatechange.call(this, event);
        return;
      }

      if (!isUrlMatch(url)) {
        if (onreadystatechange) onreadystatechange.call(this, event);
        return;
      }

      if (this.readyState !== this.DONE) {
        return;
      }

      let ytDataArr;
      try {
        ytDataArr = JSON.parse(this.responseText);
      } catch (e) {
        if (onreadystatechange) onreadystatechange.call(this, event);
        return;
      }
      ytDataArr = response(ytDataArr, url);

      Object.defineProperty(this, "responseText", {
        value: JSON.stringify(ytDataArr),
      });

      if (onreadystatechange) onreadystatechange.call(this, event);
    };

    return origSend.call(this, body);
  }
  XMLHttpRequest.prototype.send = hijackedSend;
  Object.defineProperty(XMLHttpRequest.prototype, "resetSend", {
    value: () => (XMLHttpRequest.prototype.send = origSend),
  });
}
