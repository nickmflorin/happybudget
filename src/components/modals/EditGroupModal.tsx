import * as api from "api";

import { GroupForm } from "components/forms";

import { EditModelModal, EditModelModalProps } from "./generic";

const EditGroupModal = (props: EditModelModalProps<Model.Group>): JSX.Element => {
  return (
    <EditModelModal<Model.Group, Http.GroupPayload>
      {...props}
      title={"Edit Sub-Total"}
      request={api.getGroup}
      update={api.updateGroup}
      setFormData={(group: Model.Group, form: FormInstance<Http.GroupPayload>) =>
        form.setFields([
          { name: "name", value: group.name },
          { name: "color", value: group.color }
        ])
      }
    >
      {(form: FormInstance<Http.GroupPayload>) => <GroupForm form={form} />}
    </EditModelModal>
  );
};

export default EditGroupModal;
