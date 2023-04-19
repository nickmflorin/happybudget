import { ForwardedRef, forwardRef } from "react";

import { model } from "lib";
import { framework } from "deprecated/components/tabling/generic";
import { ChoiceSelectEditor } from "deprecated/components/tabling/generic/framework/editors";

const FringeUnitEditor = <
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount,
>(
  props: Omit<
    framework.editors.ChoiceSelectEditorProps<
      Model.FringeUnit,
      Tables.FringeRowData,
      Model.Fringe,
      FringesTableContext<B, P, false>,
      Tables.FringeTableStore
    >,
    "models" | "searchIndices"
  >,
  ref: ForwardedRef<Table.AgEditorRef<Model.FringeUnit>>,
) => (
  <ChoiceSelectEditor<
    Model.FringeUnit,
    Tables.FringeRowData,
    Model.Fringe,
    FringesTableContext<B, P, false>,
    Tables.FringeTableStore
  >
    searchIndices={["name"]}
    ref={ref}
    models={model.budgeting.FringeUnits.choices}
    {...props}
  />
);

export default forwardRef(FringeUnitEditor) as typeof FringeUnitEditor;
