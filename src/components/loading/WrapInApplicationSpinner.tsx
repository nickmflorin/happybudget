import { ReactNode, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";
import { includes } from "lodash";
import { v4 as uuidv4 } from "uuid";

import { setApplicationLoadingAction } from "store/actions";

interface WrapInApplicationSpinnerProps {
  loading?: boolean;
  children: ReactNode;
  hideWhileLoading?: boolean;
}

const WrapInApplicationSpinner = ({
  loading,
  children,
  hideWhileLoading = false
}: WrapInApplicationSpinnerProps): JSX.Element => {
  const loadingState = useSelector((state: Redux.ApplicationStore) => state.loading);
  const id = useMemo(() => uuidv4(), []);
  const dispatch: Dispatch = useDispatch();

  useEffect(() => {
    if (loading === true) {
      dispatch(setApplicationLoadingAction({ id, value: true }));
    } else {
      if (includes(loadingState.elements, id)) {
        dispatch(setApplicationLoadingAction({ id, value: false }));
      }
    }
  }, [loading, id]);

  if (hideWhileLoading && loading === false) {
    return <></>;
  }
  return <>{children}</>;
};

export default WrapInApplicationSpinner;
