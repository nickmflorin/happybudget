import { useEffect, useState } from "react";
import { getGroupColors, getFringeColors } from "api/services";

export const useGroupColors = (): [string[], boolean, Error | null] => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    getGroupColors()
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
    getFringeColors()
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
