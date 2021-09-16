import { isNil } from "lodash";

import * as api from "api";

import { Form } from "components";
import { MarkupForm } from "components/forms";

import { Modal } from "./generic";

interface CreateBudgetSubAccountMarkupModalProps {
  readonly onSuccess: (markup: Model.Markup) => void;
  readonly onCancel: () => void;
  readonly accountId?: number;
  readonly subaccountId?: number;
  readonly subaccounts: number[];
  readonly open: boolean;
}

const CreateBudgetSubAccountMarkupModal = ({
  accountId,
  subaccountId,
  subaccounts,
  open,
  onSuccess,
  onCancel
}: CreateBudgetSubAccountMarkupModalProps): JSX.Element => {
  const [form] = Form.useForm<Http.MarkupPayload>({ isInModal: true });
  const cancelToken = api.useCancelToken();

  return (
    <Modal
      title={"Markup"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      okButtonProps={{ disabled: form.loading }}
      cancelText={"Cancel"}
      getContainer={false}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.MarkupPayload) => {
            const payload: Http.MarkupPayload = { ...values, children: subaccounts };
            form.setLoading(true);
            if (!isNil(accountId)) {
              api
                .createAccountSubAccountMarkup(accountId, payload, { cancelToken: cancelToken() })
                .then((markup: Model.Markup) => {
                  form.resetFields();
                  onSuccess(markup);
                })
                .catch((e: Error) => {
                  form.handleRequestError(e);
                })
                .finally(() => {
                  form.setLoading(false);
                });
            } else if (!isNil(subaccountId)) {
              api
                .createSubAccountSubAccountMarkup(subaccountId, payload)
                .then((markup: Model.Markup) => {
                  form.resetFields();
                  onSuccess(markup);
                })
                .catch((e: Error) => {
                  form.handleRequestError(e);
                })
                .finally(() => {
                  form.setLoading(false);
                });
            }
          })
          .catch(() => {
            return;
          });
      }}
    >
      <MarkupForm form={form} initialValues={{}} />
    </Modal>
  );
};

export default CreateBudgetSubAccountMarkupModal;
