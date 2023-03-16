import { model } from "lib";
import { MarkupForm } from "components/forms";

import { CreateModelModal, CreateModelModalProps, CreateModelCallbacks } from "./generic";

interface CreateMarkupModalProps<
  B extends Model.Budget | Model.Template,
  PARENT extends Model.Account | Model.SubAccount,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  RSP extends Http.MarkupResponseTypes<B, PARENT> = Http.MarkupResponseTypes<B, PARENT>,
> extends Omit<CreateModelModalProps<Model.Markup, RSP>, "children"> {
  readonly parentId: PARENT["id"];
  readonly children?: number[];
  readonly table: Table.TableInstance<R, M>;
  readonly parentType: PARENT["type"] | "budget";
}

type MarkupFormValues = Omit<Http.MarkupPayload, "rate"> & { readonly rate: string };

const CreateMarkupModal = <
  MM extends Model.SimpleAccount | Model.SimpleSubAccount,
  B extends Model.Budget | Model.Template,
  PARENT extends Model.Account | Model.SubAccount,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  RSP extends Http.MarkupResponseTypes<B, PARENT> = Http.MarkupResponseTypes<B, PARENT>,
>({
  parentId,
  parentType,
  children,
  table,
  ...props
}: CreateMarkupModalProps<B, PARENT, R, M, RSP>): JSX.Element => (
  <CreateModelModal<Model.Markup, Http.MarkupPayload, MarkupFormValues, RSP>
    {...props}
    title="Markup"
    titleIcon="badge-percent"
    createSync={(payload: Http.MarkupPayload, callbacks: CreateModelCallbacks<RSP>) =>
      table.dispatchEvent({ type: "markupAdd", payload, ...callbacks })
    }
    interceptPayload={(p: MarkupFormValues) => {
      const { rate, children: markupChildren, ...payload } = p;
      let mutated = { ...payload } as Http.MarkupPayload;
      // FLAT Markups do not have any children.
      if (mutated.unit === model.budgeting.MarkupUnits.percent.id) {
        /*
				The children should not be an empty list as the Form should have
				already validated that. */
        mutated = { ...mutated, children: markupChildren };
        if (!isNaN(parseFloat(rate))) {
          mutated = {
            ...mutated,
            rate: parseFloat((parseFloat(rate) / 100.0).toFixed(2)),
          };
        }
      } else {
        if (!isNaN(parseFloat(rate))) {
          mutated = { ...mutated, rate: parseFloat(parseFloat(rate).toFixed(2)) };
        }
      }
      return mutated;
    }}
  >
    {(form: FormInstance<MarkupFormValues>) => (
      <MarkupForm<MM, PARENT>
        form={form}
        parentId={parentId}
        parentType={parentType}
        initialValues={
          children === undefined
            ? { children: children || [], unit: model.budgeting.MarkupUnits.flat.id }
            : { children: children || [], unit: model.budgeting.MarkupUnits.percent.id }
        }
      />
    )}
  </CreateModelModal>
);

export default CreateMarkupModal;
