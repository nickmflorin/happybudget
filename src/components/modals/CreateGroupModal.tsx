import * as api from "api";
import { GroupForm } from "components/forms";

import { CreateModelModal, CreateModelModalProps } from "./generic";

interface CreateGroupModalProps extends CreateModelModalProps<Model.Group> {
  readonly id: number;
  readonly children: number[];
  readonly parentType: Model.ParentType | "template";
}

const CreateGroupModal = ({ id, children, parentType, ...props }: CreateGroupModalProps): JSX.Element => {
  return (
    <CreateModelModal<Model.Group, Http.GroupPayload>
      {...props}
      title={"Create Sub-Total"}
      create={(payload: Http.GroupPayload, options?: Http.RequestOptions) =>
        api.createTableGroup(id, parentType, payload, options)
      }
    >
      {(form: FormInstance<Http.GroupPayload>) => <GroupForm form={form} />}
    </CreateModelModal>
  );
};

export default CreateGroupModal;
