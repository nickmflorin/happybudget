import { useEffect, useState } from "react";
import { isNil } from "lodash";

import * as api from "api";

type ModelHookOptions = {
  readonly conditional?: () => boolean;
  readonly deps?: any[];
};

export const useModel = <M extends Model.Model>(
  id: number,
  options: ModelHookOptions & {
    readonly request: (i: number) => Promise<M>;
  }
): [M | null, boolean, Error | null] => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<M | null>(null);

  useEffect(() => {
    if (isNil(options?.conditional) || options?.conditional() === true) {
      setLoading(true);
      options
        .request(id)
        .then((response: M) => {
          setModel(response);
        })
        .catch((e: Error) => {
          setError(e);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, options?.deps || []);

  return [model, loading, error];
};

export const useMarkup = (id: number, options?: ModelHookOptions): [Model.Markup | null, boolean, Error | null] => {
  return useModel(id, { ...options, request: api.getMarkup });
};

export const useContact = (id: number, options?: ModelHookOptions): [Model.Contact | null, boolean, Error | null] => {
  return useModel(id, { ...options, request: api.getContact });
};

export const useGroup = (id: number, options?: ModelHookOptions): [Model.Group | null, boolean, Error | null] => {
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
