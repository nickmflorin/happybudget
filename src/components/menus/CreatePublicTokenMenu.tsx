import React from "react";
import classNames from "classnames";

import { CreatePublicTokenForm } from "components/forms";
import { CreatePublicTokenFormValues } from "components/forms/CreatePublicTokenForm";

import * as api from "api";
import { ui } from "lib";

import ContentMenu from "./ContentMenu";

export type CreatePublicTokenMenuProps<M extends Model.PublicHttpModel> = StandardComponentProps & {
  readonly instance: M;
  readonly urlFormatter: (tokenId: string) => string;
  readonly onSuccess?: (token: Model.PublicToken) => void;
  readonly services: {
    readonly create: (
      id: number,
      payload: Http.PublicTokenPayload,
      options: Http.RequestOptions
    ) => Promise<Model.PublicToken>;
  };
};

const CreatePublicTokenMenu = <M extends Model.PublicHttpModel>({
  instance,
  onSuccess,
  urlFormatter,
  services,
  ...props
}: CreatePublicTokenMenuProps<M>): JSX.Element => {
  const form = ui.hooks.useForm<CreatePublicTokenFormValues>();
  const [cancelToken] = api.useCancelToken();

  return (
    <ContentMenu
      {...props}
      className={classNames("public-token-menu", props.className)}
      style={{ ...props.style, minWidth: 400 }}
    >
      <CreatePublicTokenForm
        form={form}
        urlFormatter={urlFormatter}
        onFinish={(values: CreatePublicTokenFormValues) => {
          form.setLoading(true);
          services
            .create(instance.id, values, { cancelToken: cancelToken() })
            .then((token: Model.PublicToken) => {
              form.setLoading(false);
              onSuccess?.(token);
            })
            .catch((e: Error) => {
              form.setLoading(false);
              form.handleRequestError(e);
            });
        }}
      />
    </ContentMenu>
  );
};

export default React.memo(CreatePublicTokenMenu) as typeof CreatePublicTokenMenu;
