import { useEffect, useState } from "react";
import { isNil } from "lodash";
import { CancelToken } from "axios";

import * as api from "api";

type ModelHookOptions<M extends Model.Model> = {
  readonly onModelLoaded?: (m: M) => void;
  readonly conditional?: () => boolean;
  readonly deps?: any[];
  readonly cancelToken?: CancelToken | null;
};

export const useModel = <M extends Model.Model>(
  id: number,
  options: ModelHookOptions<M> & {
    readonly request: (i: number, opts?: Http.RequestOptions) => Promise<M>;
  }
): [M | null, boolean, Error | null] => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<M | null>(null);
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  const [cancelToken, cancel] = api.useCancel();

  useEffect(() => {
    const token = options.cancelToken || cancelToken;
    if (!isNil(token)) {
      if (isNil(options?.conditional) || options?.conditional() === true) {
        setLoading(true);
        options
          .request(id, { cancelToken: token })
          .then((response: M) => {
            setModel(response);
            options?.onModelLoaded?.(response);
          })
          .catch((e: Error) => {
            setError(e);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [...(options?.deps || []), cancelToken, options.cancelToken]);

  return [model, loading, error];
};

export const useMarkup = (
  id: number,
  options?: ModelHookOptions<Model.Markup>
): [Model.Markup | null, boolean, Error | null] => {
  return useModel(id, { ...options, request: api.getMarkup });
};

export const useContact = (
  id: number,
  options?: ModelHookOptions<Model.Contact>
): [Model.Contact | null, boolean, Error | null] => {
  return useModel(id, { ...options, request: api.getContact });
};

export const useGroup = (
  id: number,
  options?: ModelHookOptions<Model.Group>
): [Model.Group | null, boolean, Error | null] => {
  return useModel(id, { ...options, request: api.getGroup });
};

export const useGroupColors = (): [string[], boolean, Error | null] => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    api
      .getGroupColors()
      .then((response: Http.ListResponse<string>) => {
        setColors(response.data);
      })
      .catch((e: Error) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return [colors, loading, error];
};

export const useFringeColors = (): [string[], boolean, Error | null] => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    api
      .getFringeColors()
      .then((response: Http.ListResponse<string>) => {
        setColors(response.data);
      })
      .catch((e: Error) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return [colors, loading, error];
};
