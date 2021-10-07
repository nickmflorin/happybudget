import { useEffect, useState } from "react";

import * as api from "api";

import { Form } from "components";
import { MarkupForm } from "components/forms";

import { Modal } from "./generic";

interface CreateMarkupModalProps<
  B extends Model.Budget | Model.Template,
  R extends Http.MarkupResponseTypes<B> = Http.MarkupResponseTypes<B>
> {
  readonly onSuccess: (response: R) => void;
  readonly onCancel: () => void;
  readonly id: number;
  readonly children: number[];
  readonly open: boolean;
  readonly parentType: Model.ParentType | "template";
}

/* eslint-disable indent */
const CreateMarkupModal = <
  M extends Model.SimpleAccount | Model.SimpleSubAccount,
  B extends Model.Budget | Model.Template,
  R extends Http.MarkupResponseTypes<B> = Http.MarkupResponseTypes<B>
>({
  id,
  children,
  parentType,
  open,
  onSuccess,
  onCancel
}: CreateMarkupModalProps<B, R>): JSX.Element => {
  const [form] = Form.useForm<Omit<Http.MarkupPayload, "rate"> & { readonly rate: string }>({ isInModal: true });
  const cancelToken = api.useCancelToken();

  const [availableChildren, setAvailableChildren] = useState<M[]>([]);
  const [availableChildrenLoading, setAvailableChildrenLoading] = useState(false);

  useEffect(() => {
    setAvailableChildrenLoading(true);
    api
      .getTableChildren<M>(id, parentType, { simple: true }, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<M>) => {
        setAvailableChildren(response.data);
        form.setFields([{ name: "children", value: children }]);
      })
      .catch((e: Error) => {
        form.handleRequestError(e);
      })
      .finally(() => setAvailableChildrenLoading(false));
  }, [id]);

  return (
    <Modal
      title={"Markup"}
      titleIcon={"badge-percent"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      okButtonProps={{ disabled: form.loading }}
      cancelText={"Cancel"}
      getContainer={false}
      onOk={() => {
        form
          .validateFields()
          .then((values: Omit<Http.MarkupPayload, "rate"> & { readonly rate: string }) => {
            form.setLoading(true);
            let httpPayload: Http.MarkupPayload;
            let { rate, ...payload } = values;
            if (!isNaN(parseFloat(rate))) {
              httpPayload = {
                ...payload,
                rate: parseFloat((parseFloat(rate) / 100.0).toFixed(2))
              };
            } else {
              httpPayload = payload;
            }
            api
              .createTableMarkup<B, R>(id, parentType, httpPayload, { cancelToken: cancelToken() })
              .then((response: R) => {
                form.resetFields();
                onSuccess(response);
              })
              .catch((e: Error) => {
                form.handleRequestError(e);
              })
              .finally(() => {
                form.setLoading(false);
              });
          })
          .catch(() => {
            return;
          });
      }}
    >
      <MarkupForm
        form={form}
        availableChildren={availableChildren}
        availableChildrenLoading={availableChildrenLoading}
      />
    </Modal>
  );
};

export default CreateMarkupModal;
