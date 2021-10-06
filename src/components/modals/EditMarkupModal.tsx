import { useState, useEffect, useRef } from "react";
import * as api from "api";

import { MarkupForm } from "components/forms";
import { IMarkupForm } from "components/forms/MarkupForm";

import { EditModelModal, EditModelModalProps } from "./generic";

type MarkupFormValues = Omit<Http.MarkupPayload, "rate"> & { readonly rate: string };

interface EditMarkupModalProps<R extends Http.MarkupResponseTypes = Http.MarkupResponseTypes>
  extends EditModelModalProps<Model.Markup, Http.MarkupPayload, R> {
  readonly id: number;
  readonly parentId: number;
  readonly parentType: Model.ParentType;
  readonly performUpdate?: boolean;
}

/* eslint-disable indent */
const EditMarkupModal = <
  M extends Model.SimpleAccount | Model.SimpleSubAccount,
  R extends Http.MarkupResponseTypes = Http.MarkupResponseTypes
>({
  id,
  parentId,
  performUpdate,
  parentType,
  ...props
}: EditMarkupModalProps<R>): JSX.Element => {
  const cancelToken = api.useCancelToken();
  const formRef = useRef<FormInstance<MarkupFormValues>>(null);
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
    <EditModelModal<Model.Markup, Http.MarkupPayload, MarkupFormValues, R>
      {...props}
      id={id}
      title={"Markup"}
      request={api.getMarkup}
      update={api.updateMarkup}
      interceptPayload={(p: MarkupFormValues) => {
        let { rate, ...payload } = p;
        if (!isNaN(parseFloat(rate))) {
          return {
            ...payload,
            rate: parseFloat((parseFloat(rate) / 100.0).toFixed(2))
          };
        }
        return payload;
      }}
      setFormData={(markup: Model.Markup, form: FormInstance<MarkupFormValues>) => {
        // Because AntD sucks and form.setFields does not trigger onValuesChanged.
        markupRef.current?.setUnitState(markup.unit?.id === undefined ? null : markup.unit?.id);
        form.setFields([
          { name: "identifier", value: markup.identifier },
          { name: "description", value: markup.description },
          { name: "unit", value: markup.unit?.id === undefined ? null : markup.unit?.id },
          { name: "rate", value: markup.rate },
          { name: "children", value: markup.children }
        ]);
      }}
    >
      {(m: Model.Markup | null, form: FormInstance<MarkupFormValues>) => (
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
