import { useEffect, useState } from "react";

import * as api from "api";
import { ui } from "lib";

import { GroupForm } from "components/forms";

import { EditModelModal, EditModelModalProps } from "./generic";

interface EditGroupModalProps extends EditModelModalProps<Model.Group> {
  readonly parentId: number;
  readonly parentType: Model.ParentType | "template";
}

const EditGroupModal = <M extends Model.SimpleAccount | Model.SimpleSubAccount>({
  parentId,
  parentType,
  ...props
}: EditGroupModalProps): JSX.Element => {
  const form = ui.hooks.useForm<Http.GroupPayload>();
  const [cancelToken] = api.useCancelToken();

  const [availableChildren, setAvailableChildren] = useState<M[]>([]);
  const [availableChildrenLoading, setAvailableChildrenLoading] = useState(false);

  useEffect(() => {
    setAvailableChildrenLoading(true);
    api
      .getTableChildren<M>(parentId, parentType, { simple: true }, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<M>) => {
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
      title={"Group"}
      titleIcon={"folder"}
      request={api.getGroup}
      update={api.updateGroup}
      setFormData={(group: Model.Group) => {
        form.setFields([
          { name: "name", value: group.name },
          { name: "color", value: group.color },
          { name: "children", value: group.children }
        ]);
      }}
    >
      {(m: Model.Group | null) => (
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
