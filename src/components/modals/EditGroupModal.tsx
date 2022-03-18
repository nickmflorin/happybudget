import { useEffect, useState } from "react";

import * as api from "api";
import { ui, http } from "lib";

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
  const [cancelToken] = http.useCancelToken();

  const [availableChildren, setAvailableChildren] = useState<MM[]>([]);
  const [availableChildrenLoading, setAvailableChildrenLoading] = useState(false);

  useEffect(() => {
    setAvailableChildrenLoading(true);
    api
      .getTableChildren<MM>(parentId, parentType, { simple: true }, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<MM>) => {
        setAvailableChildren(response.data);
      })
      .catch((e: Error) => {
        form.handleRequestError(e);
      })
      .finally(() => setAvailableChildrenLoading(false));
  }, [parentId]);

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
      {() => (
        <GroupForm
          form={form}
          availableChildren={availableChildren}
          availableChildrenLoading={availableChildrenLoading}
        />
      )}
    </EditModelModal>
  );
};

export default EditGroupModal;
