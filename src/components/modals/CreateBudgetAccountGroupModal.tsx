import { isNil } from "lodash";

import * as api from "api";

import { Form } from "components";
import { GroupForm } from "components/forms";

import { Modal } from "./generic";

interface CreateBudgetAccountGroupModalProps {
  readonly onSuccess: (group: Model.Group) => void;
  readonly onCancel: () => void;
  readonly budgetId: number;
  readonly accounts: number[];
  readonly markups?: number[];
  readonly open: boolean;
}

const CreateBudgetAccountGroupModal = ({
  budgetId,
  accounts,
  markups,
  open,
  onSuccess,
  onCancel
}: CreateBudgetAccountGroupModalProps): JSX.Element => {
  const [form] = Form.useForm<Http.GroupPayload>({ isInModal: true });
  const cancelToken = api.useCancelToken();

  return (
    <Modal
      title={"Create Sub-Total"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      okButtonProps={{ disabled: form.loading }}
      cancelText={"Cancel"}
      getContainer={false}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.GroupPayload) => {
            let payload = { ...values, children: accounts };
            if (!isNil(markups)) {
              payload = { ...payload, children_markups: markups };
            }
            form.setLoading(true);
            api
              .createBudgetAccountGroup(budgetId, payload, { cancelToken: cancelToken() })
              .then((group: Model.Group) => {
                form.resetFields();
                onSuccess(group);
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
      <GroupForm form={form} initialValues={{}} />
    </Modal>
  );
};

export default CreateBudgetAccountGroupModal;
