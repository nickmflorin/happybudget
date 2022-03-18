import { useEffect, useMemo, useState } from "react";
import { usePlaidLink, PlaidLinkOptions } from "react-plaid-link";
import { isNil } from "lodash";

type UsePlaidProps = {
  readonly onSuccess?: (publicToken: string) => void;
  readonly onError?: (message: string) => void;
};

type UsePlaidReturnType = {
  readonly open: (linkToken: string) => void;
};

const usePlaid = (props: UsePlaidProps): UsePlaidReturnType => {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const config = useMemo<PlaidLinkOptions>(
    () => ({
      onSuccess: (publicToken: string) => props.onSuccess?.(publicToken),
      token: linkToken
    }),
    [linkToken, props.onSuccess]
  );

  const { open, ready, error } = usePlaidLink(config);

  useEffect(() => {
    if (!isNil(error)) {
      props.onError?.(error.message);}
  }, [error, props.onError]);

  const _open = useMemo(
    () => (token: string) => {
      if (ready) {
        setLinkToken(token);
        open();
      }
    },
    [open, ready]
  );

  return { open: _open };
};
  
export default usePlaid;