import { ReactNode, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
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
  const id = useMemo(() => uuidv4(), []);
  const dispatch: Dispatch = useDispatch();

  useEffect(() => {
    if (loading === true) {
      dispatch(setApplicationLoadingAction({ id, value: true }));
    } else {
      // if (includes(loadingState.elements, id)) {
      dispatch(setApplicationLoadingAction({ id, value: false }));
      // }
    }
  }, [loading, id]);

  if (hideWhileLoading && loading === false) {
    return <></>;
  }
  return <>{children}</>;
};

export default WrapInApplicationSpinner;
