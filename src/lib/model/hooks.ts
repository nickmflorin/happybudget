import { CancelToken } from "axios";

import { http } from "lib";

export type ModelHookOptions<M extends Model.Model> = Omit<http.ApiHookOptions<M>, "request"> & {
  readonly request: (i: number, opts?: Http.RequestOptions) => Promise<M>;
};

export const useModel = <M extends Model.Model>(
  id: number,
  options: ModelHookOptions<M>,
): [M | null, boolean, Error | null] =>
  http.useApiHook<M>({
    ...options,
    request: (token: CancelToken | undefined) => {
      const response = options.request(id, { cancelToken: token });
      return response;
    },
  });
