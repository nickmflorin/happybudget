import * as api from "api";
import { ui } from "lib";

import { GroupForm } from "components/forms";

import { EditModelModal, EditModelModalProps, UpdateModelCallbacks } from "./generic";

interface EditGroupModalProps<R extends Table.RowData, M extends Model.RowHttpModel>
  extends EditModelModalProps<Model.Group> {
  readonly table: Table.TableInstance<R, M>;
  readonly parentId: number;
  readonly parentType: Model.ParentType;
}

const EditGroupModal = <
  MM extends Model.SimpleAccount | Model.SimpleSubAccount,
  R extends Table.RowData,
  M extends Model.RowHttpModel
>({
  parentId,
  parentType,
  table,
  ...props
}: EditGroupModalProps<R, M>): JSX.Element => {
  const form = ui.useForm<Http.GroupPayload>();
  return (
    <EditModelModal<Model.Group, Http.GroupPayload>
      {...props}
      form={form}
      title={"Subtotal"}
      titleIcon={"folder"}
      request={api.getGroup}
      update={api.updateGroup}
      updateSync={(payload: Partial<Http.GroupPayload>, callbacks: UpdateModelCallbacks<Model.Group>) =>
        table.dispatchEvent({ type: "groupUpdate", payload: { id: props.id, data: payload }, ...callbacks })
      }
      setFormData={(group: Model.Group) => {
        form.setFields([
          { name: "name", value: group.name },
          { name: "color", value: group.color },
          { name: "children", value: group.children }
        ]);
      }}
    >
      {() => <GroupForm<MM> form={form} parentType={parentType} parentId={parentId} />}
    </EditModelModal>
  );
};

export default EditGroupModal;
