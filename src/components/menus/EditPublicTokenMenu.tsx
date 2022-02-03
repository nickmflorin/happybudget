import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { EditPublicTokenForm } from "components/forms";
import { EditPublicTokenFormValues } from "components/forms/EditPublicTokenForm";

import * as api from "api";
import { ui } from "lib";

import ContentMenu from "./ContentMenu";
import "./PublicTokenMenu.scss";

export type EditPublicTokenMenuProps = StandardComponentProps & {
  readonly publicTokenId: number;
  readonly urlFormatter: (tokenId: string) => string;
  readonly onSuccess?: (token: Model.PublicToken) => void;
  readonly onDeleted?: () => void;
};

const EditPublicTokenMenu = ({
  publicTokenId,
  urlFormatter,
  onSuccess,
  onDeleted,
  ...props
}: EditPublicTokenMenuProps): JSX.Element => {
  const form = ui.hooks.useForm<EditPublicTokenFormValues>();
  const [publicToken, setPublicToken] = useState<Model.PublicToken | null>(null);
  const [cancelToken] = api.useCancelToken();

  useEffect(() => {
    form.setLoading(true);
    api
      .getPublicToken(publicTokenId)
      .then((token: Model.PublicToken) => {
        setPublicToken(token);
        form.setFields([
          { name: "public_id", value: token.public_id },
          { name: "expires_at", value: token.expires_at }
        ]);
      })
      .catch((e: Error) => form.handleRequestError(e))
      .finally(() => form.setLoading(false));
  }, [publicTokenId]);

  return (
    <ContentMenu {...props} className={classNames("public-token-menu", props.className)}>
      <EditPublicTokenForm
        form={form}
        urlFormatter={urlFormatter}
        disabled={isNil(publicToken)}
        onDelete={() => {
          /* Even though we have access to publicTokenId, accessing the ID on the
             retrieved model instance guarantees that it exists - and prevents
             users from submitting these actions after an error retrieving it. */
          if (!isNil(publicToken)) {
            form.setLoading(true);
            api
              .deletePublicToken(publicToken.id, { cancelToken: cancelToken() })
              .then(() => onDeleted?.())
              .catch((e: Error) => form.handleRequestError(e))
              .finally(() => form.setLoading(false));
          }
        }}
        onFinish={(values: EditPublicTokenFormValues) => {
          /* Even though we have access to publicTokenId, accessing the ID on the
             retrieved model instance guarantees that it exists - and prevents
             users from submitting these actions after an error retrieving it. */
          if (!isNil(publicToken)) {
            form.setLoading(true);
            api
              .updatePublicToken(publicToken.id, values, { cancelToken: cancelToken() })
              .then((token: Model.PublicToken) => onSuccess?.(token))
              .catch((e: Error) => form.handleRequestError(e))
              .finally(() => form.setLoading(false));
          }
        }}
      />
    </ContentMenu>
  );
};

export default React.memo(EditPublicTokenMenu) as typeof EditPublicTokenMenu;
