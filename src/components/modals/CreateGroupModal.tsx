import { useEffect, useState } from "react";

import * as api from "api";
import { ui } from "lib";
import { GroupForm } from "components/forms";

import { CreateModelModal, CreateModelModalProps, CreateModelCallbacks } from "./generic";

interface CreateGroupModalProps<R extends Table.RowData, M extends Model.RowHttpModel>
  extends CreateModelModalProps<Model.Group> {
  readonly id: number;
  readonly children: number[];
  readonly table: Table.TableInstance<R, M>;
  readonly parentType: Model.ParentType;
}

const CreateGroupModal = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  MM extends Model.SimpleAccount | Model.SimpleSubAccount
>({
  id,
  children,
  parentType,
  table,
  ...props
}: CreateGroupModalProps<R, M>): JSX.Element => {
  const form = ui.hooks.useForm<Http.GroupPayload>();
  const [cancelToken] = api.useCancelToken();

  const [availableChildren, setAvailableChildren] = useState<MM[]>([]);
  const [availableChildrenLoading, setAvailableChildrenLoading] = useState(false);

  useEffect(() => {
    setAvailableChildrenLoading(true);
    api
      .getTableChildren<MM>(id, parentType, { simple: true }, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<MM>) => {
        setAvailableChildren(response.data);
        form.setFields([{ name: "children", value: children }]);
      })
      .catch((e: Error) => {
        form.handleRequestError(e);
      })
      .finally(() => setAvailableChildrenLoading(false));
  }, [id]);

  return (
    <CreateModelModal<Model.Group, Http.GroupPayload>
      {...props}
      title={"Subtotal"}
      titleIcon={"folder"}
      form={form}
      createSync={(payload: Http.GroupPayload, callbacks: CreateModelCallbacks<Model.Group>) =>
        table.dispatchEvent({ type: "groupAdd", payload, ...callbacks })
      }
    >
      {() => (
        <GroupForm
          form={form}
          availableChildren={availableChildren}
          availableChildrenLoading={availableChildrenLoading}
        />
      )}
    </CreateModelModal>
  );
};

export default CreateGroupModal;
