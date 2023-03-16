import { useRef, useMemo } from "react";

import { isNil } from "lodash";

export const InitialLayoutRef: ILayoutRef = {
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  setSidebarVisible: () => {},
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  toggleSidebar: () => {},
  sidebarVisible: true,
};

export const useLayout = (): NonNullRef<ILayoutRef> => useRef<ILayoutRef>(InitialLayoutRef);

export const useLayoutIfNotDefined = (layout?: NonNullRef<ILayoutRef>): NonNullRef<ILayoutRef> => {
  const ref = useRef<ILayoutRef>(InitialLayoutRef);
  const returnRef = useMemo(() => (!isNil(layout) ? layout : ref), [layout, ref.current]);
  return returnRef;
};
