import React, { useEffect, useState, useRef } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { EditPublicTokenForm } from "components/forms";
import { EditPublicTokenFormValues, IEditPublicTokenFormRef } from "components/forms/EditPublicTokenForm";

import * as api from "api";
import { ui, http } from "lib";

import ContentMenu from "./ContentMenu";

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
  const form = ui.form.useForm<EditPublicTokenFormValues>();
  const [publicToken, setPublicToken] = useState<Model.PublicToken | null>(null);
  const [cancelToken] = http.useCancelToken();
  const formRef = useRef<IEditPublicTokenFormRef>(null);

  useEffect(() => {
    form.setLoading(true);
    api
      .getPublicToken(publicTokenId)
      .then((token: Model.PublicToken) => {
        setPublicToken(token);
        formRef.current?.setAutoExpire(!isNil(token.expires_at));
        form.setFields([
          { name: "public_id", value: token.public_id },
          { name: "expires_at", value: token.expires_at }
        ]);
      })
      .catch((e: Error) => form.handleRequestError(e))
      .finally(() => form.setLoading(false));
  }, [publicTokenId]);

  return (
    <ContentMenu
      {...props}
      className={classNames("public-token-menu", props.className)}
      style={{ ...props.style, minWidth: 400, padding: 10 }}
    >
      <div style={{ marginBottom: 12 }}>
        <h5 style={{ marginBottom: 6 }}>{"Share your budget with a private link."}</h5>
        <p>{"People with the private link can only see a read-only version of your budget."}</p>
      </div>
      <EditPublicTokenForm
        form={form}
        ref={formRef}
        autoSubmit={true}
        urlFormatter={urlFormatter}
        disabled={isNil(publicToken)}
        onValuesChange={(changedValues: Partial<EditPublicTokenFormValues>) => {
          /* Even though we have access to publicTokenId, accessing the ID on the
             retrieved model instance guarantees that it exists - and prevents
             users from submitting these actions after an error retrieving it. */
          if (!isNil(publicToken)) {
            form.setLoading(true);
            api
              .updatePublicToken(publicToken.id, changedValues, { cancelToken: cancelToken() })
              .then((token: Model.PublicToken) => onSuccess?.(token))
              .catch((e: Error) => form.handleRequestError(e))
              .finally(() => form.setLoading(false));
          }
        }}
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
      />
    </ContentMenu>
  );
};

export default React.memo(EditPublicTokenMenu) as typeof EditPublicTokenMenu;
