import { useState, useEffect, useRef } from "react";
import * as api from "api";

import { MarkupForm } from "components/forms";
import { IMarkupForm } from "components/forms/MarkupForm";

import { EditModelModal, EditModelModalProps } from "./generic";

interface EditMarkupModalProps extends EditModelModalProps<Model.Markup> {
  readonly id: number;
  readonly parentId: number;
  readonly parentType: Model.ParentType;
}

const EditMarkupModal = <M extends Model.SimpleAccount | Model.SimpleAccount>({
  id,
  parentId,
  parentType,
  ...props
}: EditMarkupModalProps): JSX.Element => {
  const cancelToken = api.useCancelToken();
  const formRef = useRef<FormInstance<Http.MarkupPayload>>(null);
  const markupRef = useRef<IMarkupForm>(null);

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
        formRef.current?.handleRequestError(e);
      })
      .finally(() => setAvailableChildrenLoading(false));
  }, [parentId]);

  return (
    <EditModelModal<Model.Markup, Http.MarkupPayload>
      {...props}
      id={id}
      title={"Markup"}
      request={api.getMarkup}
      update={api.updateMarkup}
      setFormData={(markup: Model.Markup, form: FormInstance<Http.MarkupPayload>) => {
        markupRef.current?.setUnitState(markup.unit?.id || null);
        form.setFields([
          { name: "identifier", value: markup.identifier },
          { name: "description", value: markup.description },
          { name: "unit", value: markup.unit?.id || null },
          { name: "rate", value: markup.rate },
          { name: "children", value: markup.children }
        ]);
      }}
    >
      {(m: Model.Markup | null, form: FormInstance<Http.MarkupPayload>) => (
        <MarkupForm
          ref={markupRef}
          form={form}
          availableChildren={availableChildren}
          availableChildrenLoading={availableChildrenLoading}
        />
      )}
    </EditModelModal>
  );
};

export default EditMarkupModal;
