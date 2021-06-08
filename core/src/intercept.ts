interface Interceptor<T> {
  request?: (resource: Request) => boolean;
  response?: (response: T, url: URL) => T;
  responseError?: (err: Error) => Error;
}

export function startInterceptFetch<T extends unknown>({
  whiteList,
  interceptor,
}: {
  whiteList: string[];
  interceptor: Interceptor<T>;
}) {
  const interceptors = [interceptor];
  if (!window.fetch) {
    try {
      require("whatwg-fetch");
    } catch (err) {
      throw Error("No fetch available. Unable to register fetch-intercept");
    }
  }
  window.fetch = ((fetch) => {
    return (resource: Request, init?: RequestInit): Promise<Response> => {
      const reversedInterceptors = interceptors.reduce<Interceptor<T>[]>(
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

      const onResponseError = (err: Error, reject: (reason?: any) => void) => {
        reversedInterceptors.forEach(({ responseError }) => {
          if (responseError) {
            err = responseError(err);
          }
          reject(err);
        });
      };

      return new Promise((resolve, reject) => {
        fetch(resource, (init = init))
          .then((resp) => {
            const url = new URL(resource.url);
            resp
              .json()
              .then((jsonResp: T) => {
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
