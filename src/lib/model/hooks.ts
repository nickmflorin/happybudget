import { useEffect, useState } from "react";
import { isNil } from "lodash";

import * as api from "api";

type ModelHookOptions = {
  readonly conditional?: () => boolean;
  readonly deps?: any[];
};

export const useGroup = (id: ID, options?: ModelHookOptions): [Model.BudgetGroup | null, boolean, Error | null] => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState<Model.BudgetGroup | null>(null);

  useEffect(() => {
    if (isNil(options?.conditional) || options?.conditional() === true) {
      setLoading(true);
      api
        .getGroup(id)
        .then((response: Model.BudgetGroup) => {
          setGroup(response);
        })
        .catch((e: Error) => {
          setError(e);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, options?.deps || []);

  return [group, loading, error];
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
