import React, { ReactNode, useEffect } from "react";

import { useDispatch } from "react-redux";

import { actions } from "application/store";
import { type Dispatch } from "application/store/types";

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
  const dispatch: Dispatch = useDispatch();

  useEffect(() => {
    if (loading === true) {
      dispatch(actions.setApplicationLoadingAction(true, {}));
    } else {
      dispatch(actions.setApplicationLoadingAction(false, {}));
    }
  }, [loading, dispatch]);

  if (hideWhileLoading && loading === true) {
    return <></>;
  }
  return <>{children}</>;
};
