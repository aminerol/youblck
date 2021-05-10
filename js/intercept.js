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
      const reversedInterceptors = interceptors.reduce(
        (array, interceptor) => [interceptor].concat(array),
        []
      );

      let shouldContinue = true;
      reversedInterceptors.forEach(({ request }) => {
        if (request) {
          shouldContinue = request(resource);
        }
      });
      if (!shouldContinue)
        return Promise.resolve(new Response(JSON.stringify({})));

      if (
        !(resource instanceof Request) ||
        !whiteList.some((u) => resource.url.includes(u))
      ) {
        return fetch(resource, init);
      }

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
