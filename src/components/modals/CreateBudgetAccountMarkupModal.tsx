import * as api from "api";

import { Form } from "components";
import { MarkupForm } from "components/forms";

import { Modal } from "./generic";

interface CreateBudgetAccountMarkupModalProps {
  readonly onSuccess: (markup: Model.Markup) => void;
  readonly onCancel: () => void;
  readonly budgetId: number;
  readonly accounts: number[];
  readonly open: boolean;
}

const CreateBudgetAccountMarkupModal = ({
  budgetId,
  accounts,
  open,
  onSuccess,
  onCancel
}: CreateBudgetAccountMarkupModalProps): JSX.Element => {
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
            form.setLoading(true);
            api
              .createBudgetAccountMarkup(
                budgetId,
                {
                  identifier: values.identifier,
                  children: accounts,
                  description: values.description,
                  unit: values.unit,
                  rate: values.rate
                },
                { cancelToken: cancelToken() }
              )
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

export default CreateBudgetAccountMarkupModal;
