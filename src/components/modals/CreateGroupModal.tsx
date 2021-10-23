import { useEffect, useState } from "react";

import * as api from "api";
import { ui } from "lib";
import { GroupForm } from "components/forms";

import { CreateModelModal, CreateModelModalProps } from "./generic";

interface CreateGroupModalProps extends CreateModelModalProps<Model.Group> {
  readonly id: number;
  readonly children: number[];
  readonly parentType: Model.ParentType | "template";
}

const CreateGroupModal = <M extends Model.SimpleAccount | Model.SimpleSubAccount>({
  id,
  children,
  parentType,
  ...props
}: CreateGroupModalProps): JSX.Element => {
  const form = ui.hooks.useForm<Http.GroupPayload>();
  const [cancelToken] = api.useCancelToken();

  const [availableChildren, setAvailableChildren] = useState<M[]>([]);
  const [availableChildrenLoading, setAvailableChildrenLoading] = useState(false);

  useEffect(() => {
    setAvailableChildrenLoading(true);
    api
      .getTableChildren<M>(id, parentType, { simple: true }, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<M>) => {
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
      title={"Group"}
      titleIcon={"folder"}
      form={form}
      create={(payload: Http.GroupPayload, options?: Http.RequestOptions) =>
        api.createTableGroup(id, parentType, payload, options)
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
