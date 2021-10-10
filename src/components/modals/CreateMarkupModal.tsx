import { useEffect, useState } from "react";

import * as api from "api";
import { ui } from "lib";
import { MarkupForm } from "components/forms";

import { CreateModelModal, CreateModelModalProps } from "./generic";

interface CreateMarkupModalProps<
  B extends Model.Budget | Model.Template,
  R extends Http.MarkupResponseTypes<B> = Http.MarkupResponseTypes<B>
> extends CreateModelModalProps<Model.Markup, R> {
  readonly id: number;
  readonly children: number[];
  readonly parentType: Model.ParentType | "template";
}

type MarkupFormValues = Omit<Http.MarkupPayload, "rate"> & { readonly rate: string };

/* eslint-disable indent */
const CreateMarkupModal = <
  M extends Model.SimpleAccount | Model.SimpleSubAccount,
  B extends Model.Budget | Model.Template,
  R extends Http.MarkupResponseTypes<B> = Http.MarkupResponseTypes<B>
>({
  id,
  parentType,
  ...props
}: CreateMarkupModalProps<B, R>): JSX.Element => {
  const form = ui.hooks.useForm<MarkupFormValues>();
  const cancelToken = api.useCancelToken();

  const [availableChildren, setAvailableChildren] = useState<M[]>([]);
  const [availableChildrenLoading, setAvailableChildrenLoading] = useState(false);

  useEffect(() => {
    setAvailableChildrenLoading(true);
    api
      .getTableChildren<M>(id, parentType, { simple: true }, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<M>) => {
        setAvailableChildren(response.data);
        form.setFields([{ name: "children", value: props.children }]);
      })
      .catch((e: Error) => {
        form.handleRequestError(e);
      })
      .finally(() => setAvailableChildrenLoading(false));
  }, [id]);

  return (
    <CreateModelModal<Model.Markup, Http.MarkupPayload, MarkupFormValues, R>
      {...props}
      title={"Markup"}
      titleIcon={"badge-percent"}
      form={form}
      create={(payload: Http.MarkupPayload, options?: Http.RequestOptions) =>
        api.createTableMarkup(id, parentType, payload, options)
      }
      interceptPayload={(p: MarkupFormValues) => {
        let { rate, ...payload } = p;
        if (!isNaN(parseFloat(rate))) {
          return {
            ...payload,
            rate: parseFloat((parseFloat(rate) / 100.0).toFixed(2))
          };
        }
        return payload;
      }}
    >
      {() => (
        <MarkupForm
          form={form}
          availableChildren={availableChildren}
          availableChildrenLoading={availableChildrenLoading}
        />
      )}
    </CreateModelModal>
  );
};

export default CreateMarkupModal;
