import { ForwardedRef, forwardRef } from "react";

import { model } from "lib";
import { framework } from "tabling/generic";
import { ChoiceSelectEditor } from "tabling/generic/framework/editors";

const FringeUnitEditor = (
  props: Omit<
    framework.editors.ChoiceSelectEditorProps<
      Model.FringeUnit,
      Tables.FringeRowData,
      Model.Fringe,
      Tables.FringeTableStore
    >,
    "models" | "searchIndices"
  >,
  ref: ForwardedRef<Table.AgEditorRef<Model.FringeUnit>>
) => {
  return (
    <ChoiceSelectEditor<Model.FringeUnit, Tables.FringeRowData, Model.Fringe, Tables.FringeTableStore>
      searchIndices={["name"]}
      ref={ref}
      models={model.budgeting.FringeUnits.choices}
      {...props}
    />
  );
};

export default forwardRef(FringeUnitEditor);
