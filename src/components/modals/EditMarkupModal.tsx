import { useRef } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { model } from "lib";

import { MarkupForm } from "components/forms";
import { IMarkupForm } from "components/forms/MarkupForm";

import { EditModelModal, EditModelModalProps, UpdateModelCallbacks } from "./generic";

type MarkupFormValues = Omit<Http.MarkupPayload, "rate"> & { readonly rate: string };

interface EditMarkupModalProps<
  B extends Model.Budget | Model.Template,
  PARENT extends Model.Account | Model.SubAccount,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  RSP extends Http.MarkupResponseTypes<B, PARENT> = Http.MarkupResponseTypes<B, PARENT>
> extends EditModelModalProps<Model.Markup, RSP> {
  readonly parentId: PARENT["id"];
  readonly parentType: PARENT["type"] | "budget";
  readonly table: Table.TableInstance<R, M>;
}

const EditMarkupModal = <
  MM extends Model.SimpleAccount | Model.SimpleSubAccount,
  B extends Model.Budget | Model.Template,
  PARENT extends Model.Account | Model.SubAccount,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  RSP extends Http.MarkupResponseTypes<B, PARENT> = Http.MarkupResponseTypes<B, PARENT>
>({
  parentId,
  parentType,
  table,
  ...props
}: EditMarkupModalProps<B, PARENT, R, M, RSP>): JSX.Element => {
  const markupRef = useRef<IMarkupForm>(null);

  return (
    <EditModelModal<Model.Markup, Http.MarkupPayload, MarkupFormValues, RSP>
      {...props}
      title={"Markup"}
      request={api.getMarkup}
      updateSync={(payload: Partial<Http.MarkupPayload>, callbacks: UpdateModelCallbacks<RSP>) =>
        table.dispatchEvent({ type: "markupUpdate", payload: { id: props.modelId, data: payload }, ...callbacks })
      }
      interceptPayload={(p: MarkupFormValues) => {
        const { rate, children, ...payload } = p;
        let mutated = { ...payload } as Http.MarkupPayload;
        // FLAT Markups do not have any children.
        if (mutated.unit === model.budgeting.MarkupUnits.percent.id) {
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
      setFormData={(markup: Model.Markup, form: FormInstance<MarkupFormValues>) => {
        // Because AntD sucks and form.setFields does not trigger onValuesChanged.
        markupRef.current?.setUnitState(markup.unit?.id === undefined ? null : markup.unit?.id);
        let fields: (FormField<Model.FlatMarkup> | FormField<Model.PercentMarkup>)[] = [
          { name: "identifier", value: markup.identifier },
          { name: "description", value: markup.description },
          { name: "unit", value: markup.unit?.id === undefined ? null : markup.unit.id }
        ];
        if (model.budgeting.isPercentMarkup(markup)) {
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
      {(m: Model.Markup | null, form: FormInstance<MarkupFormValues>) => (
        <MarkupForm<MM, PARENT> ref={markupRef} form={form} parentId={parentId} parentType={parentType} />
      )}
    </EditModelModal>
  );
};

export default EditMarkupModal;
