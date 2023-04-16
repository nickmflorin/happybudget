import React, { ReactNode, useEffect } from "react";

import { useDispatch } from "react-redux";

import { store } from "application";

export type LoadWithApplicationProps = {
  readonly loading?: boolean;
  readonly children: ReactNode;
  readonly hideWhileLoading?: boolean;
};

export const LoadWithApplication: React.FC<LoadWithApplicationProps> = ({
  loading,
  children,
  hideWhileLoading = false,
}) => {
  const dispatch: store.Dispatch = useDispatch();

  useEffect(() => {
    if (loading === true) {
      dispatch(store.actions.setApplicationLoadingAction(true, {}));
    } else {
      dispatch(store.actions.setApplicationLoadingAction(false, {}));
    }
  }, [loading, dispatch]);

  if (hideWhileLoading && loading === true) {
    return <></>;
  }
  return <>{children}</>;
};
