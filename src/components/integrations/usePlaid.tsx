import { useEffect, useMemo, useState } from "react";

import { isNil, map } from "lodash";
import {
  usePlaidLink,
  PlaidAccount,
  PlaidLinkOptions,
  PlaidLinkOnSuccessMetadata,
} from "react-plaid-link";

export type UsePlaidSuccessParams = {
  readonly publicToken: string;
  readonly accountIds: string[];
};

type UsePlaidProps = {
  readonly onSuccess?: (params: UsePlaidSuccessParams) => void;
  readonly onError?: (message: string) => void;
};

type UsePlaidReturnType = {
  readonly open: (linkToken: string) => void;
};

const usePlaid = (props: UsePlaidProps): UsePlaidReturnType => {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const config = useMemo<PlaidLinkOptions>(
    () => ({
      onSuccess: (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
        setLinkToken(null);
        props.onSuccess?.({
          publicToken,
          accountIds: map(metadata.accounts, (account: PlaidAccount) => account.id),
        });
      },
      onExit: () => {
        setLinkToken(null);
      },
      token: linkToken,
    }),
    [linkToken, props.onSuccess],
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
    [],
  );

  return { open: _open };
};

export default usePlaid;
