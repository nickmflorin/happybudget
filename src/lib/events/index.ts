import { useEffect } from "react";

export const createRowsAddedEvent = (params: Events.RowsAddedParams) => {
  return new CustomEvent<Events.RowsAddedParams>("rowsAdded", { detail: params });
};

export const dispatchRowsAddedEvent = (params: Events.RowsAddedParams) => {
  const evt = createRowsAddedEvent(params);
  window.dispatchEvent(evt);
};

export const useEvent = <P>(id: Events.Id, callback: (params: P) => void, deps: any[]) => {
  useEffect(() => {
    const listener = (event: Event) => {
      callback((event as CustomEvent<P>).detail);
    };
    window.addEventListener(id, listener);
    return () => {
      window.removeEventListener(id, listener);
    };
  }, [deps]);
};
