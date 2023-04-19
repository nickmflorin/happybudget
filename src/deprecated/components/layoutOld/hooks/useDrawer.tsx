import { useMemo } from "react";

import { useSelector, useDispatch } from "react-redux";

import * as store from "application/store";
import { Drawer } from "deprecated/components/layoutOld";

type UseDrawerConfig = {
  readonly render: () => JSX.Element;
};

type UseDrawerReturnType = {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly toggle: () => void;
  readonly drawer: JSX.Element;
};

const useDrawer = (config: UseDrawerConfig): UseDrawerReturnType => {
  const dispatch = useDispatch();
  const isOpen = useSelector(store.selectors.selectApplicationDrawerOpen);

  const drawer = useMemo(() => <Drawer>{config.render()}</Drawer>, [config.render]);

  return {
    drawer,
    isOpen,
    open: () => dispatch(store.actions.setApplicationDrawerAction(true, {})),
    close: () => dispatch(store.actions.setApplicationDrawerAction(false, {})),
    toggle: () => dispatch(store.actions.setApplicationDrawerAction("TOGGLE", {})),
  };
};

export default useDrawer;
