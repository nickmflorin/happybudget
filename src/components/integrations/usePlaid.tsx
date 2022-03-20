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
      onSuccess: (publicToken: string) => {
        setLinkToken(null);
        props.onSuccess?.(publicToken);
      },
      onExit: () => {
        setLinkToken(null);
      },
      token: linkToken
    }),
    [linkToken, props.onSuccess]
  );

  const { open, ready, error } = usePlaidLink(config);

  useEffect(() => {
    if (!isNil(error)) {
      props.onError?.(error.message);
    }
    if (linkToken && ready) {
      open();
    }
  }, [error, props.onError]);

  const _open = useMemo(
    () => (token: string) => {
      setLinkToken(token);
    },
    []
  );

  return { open: _open };
};

export default usePlaid;
