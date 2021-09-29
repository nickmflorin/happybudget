import * as api from "api";

import { Form } from "components";
import { GroupForm } from "components/forms";

import { Modal } from "./generic";

interface CreateGroupModalProps {
  readonly onSuccess: (group: Model.Group) => void;
  readonly onCancel: () => void;
  readonly id: number;
  readonly children: number[];
  readonly parentType: Model.ParentType | "template";
  readonly open: boolean;
}

const CreateGroupModal = ({
  id,
  children,
  parentType,
  open,
  onSuccess,
  onCancel
}: CreateGroupModalProps): JSX.Element => {
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
            form.setLoading(true);
            api
              .createTableGroup(id, parentType, { ...values, children }, { cancelToken: cancelToken() })
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

export default CreateGroupModal;
