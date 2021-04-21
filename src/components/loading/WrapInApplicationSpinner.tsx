import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";

import { setApplicationLoadingAction } from "store/actions";

interface WrapInApplicationSpinnerProps {
  loading?: boolean;
  children: ReactNode;
  hideWhileLoading?: boolean;
}

const WrapInApplicationSpinner: React.FC<WrapInApplicationSpinnerProps> = ({
  loading,
  children,
  hideWhileLoading = false
}) => {
  const dispatch: Dispatch = useDispatch();

  useEffect(() => {
    if (loading === true) {
      dispatch(setApplicationLoadingAction(true));
    } else {
      dispatch(setApplicationLoadingAction(false));
    }
  }, [loading]);

  if (hideWhileLoading && loading === false) {
    return <></>;
  }
  return <>{children}</>;
};

export default WrapInApplicationSpinner;
