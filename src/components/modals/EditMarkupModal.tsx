import { useState, useEffect, useRef } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { ui, model } from "lib";

import { MarkupForm } from "components/forms";
import { IMarkupForm } from "components/forms/MarkupForm";

import { EditModelModal, EditModelModalProps } from "./generic";

type MarkupFormValues = Omit<Http.MarkupPayload, "rate"> & { readonly rate: string };

interface EditMarkupModalProps<
  B extends Model.Budget | Model.Template,
  R extends Http.MarkupResponseTypes<B> = Http.MarkupResponseTypes<B>
> extends EditModelModalProps<Model.Markup, R> {
  readonly parentId: number;
  readonly parentType: Model.ParentType | "template";
}

/* eslint-disable indent */
const EditMarkupModal = <
  M extends Model.SimpleAccount | Model.SimpleSubAccount,
  B extends Model.Budget | Model.Template,
  R extends Http.MarkupResponseTypes<B> = Http.MarkupResponseTypes<B>
>({
  parentId,
  parentType,
  ...props
}: EditMarkupModalProps<B, R>): JSX.Element => {
  const form = ui.hooks.useFormIfNotDefined<MarkupFormValues>({ isInModal: true });
  const [cancelToken] = api.useCancelToken();
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
        form.handleRequestError(e);
      })
      .finally(() => setAvailableChildrenLoading(false));
  }, [parentId]);

  return (
    <EditModelModal<Model.Markup, Http.MarkupPayload, MarkupFormValues, R>
      {...props}
      title={"Markup"}
      form={form}
      request={api.getMarkup}
      update={api.updateMarkup}
      interceptPayload={(p: MarkupFormValues) => {
        let { rate, children, ...payload } = p;
        let mutated = { ...payload } as Http.MarkupPayload;
        // FLAT Markups do not have any children.
        if (mutated.unit === model.models.MarkupUnitModels.PERCENT.id) {
          /* The children should not be an empty list as the Form should have
						 already validated that. */
          mutated = { ...mutated, children };
          if (!isNaN(parseFloat(rate))) {
            mutated = {
              ...mutated,
              rate: parseFloat((parseFloat(rate) / 100.0).toFixed(2))
            };
          }
        } else {
          if (!isNaN(parseFloat(rate))) {
            mutated = { ...mutated, rate: parseFloat(parseFloat(rate).toFixed(2)) };
          }
        }
        return mutated;
      }}
      setFormData={(markup: Model.Markup) => {
        // Because AntD sucks and form.setFields does not trigger onValuesChanged.
        markupRef.current?.setUnitState(markup.unit?.id === undefined ? null : markup.unit?.id);
        let fields: (FormField<Model.FlatMarkup> | FormField<Model.PercentMarkup>)[] = [
          { name: "identifier", value: markup.identifier },
          { name: "description", value: markup.description },
          { name: "unit", value: markup.unit?.id === undefined ? null : markup.unit.id }
        ];
        if (model.typeguards.isPercentMarkup(markup)) {
          fields = [
            ...fields,
            { name: "children", value: markup.children },
            { name: "rate", value: !isNil(markup.rate) ? (100.0 * markup.rate).toFixed(2) : null }
          ];
        } else {
          fields = [...fields, { name: "rate", value: markup.rate }];
        }
        form.setFields(fields);
      }}
    >
      {(m: Model.Markup | null) => (
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
