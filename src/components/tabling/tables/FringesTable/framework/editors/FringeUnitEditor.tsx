import { ForwardedRef, forwardRef } from "react";

import { budgeting } from "lib";
import { framework } from "components/tabling/generic";
import { ChoiceSelectEditor } from "components/tabling/generic/framework/editors";

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
  ref: ForwardedRef<any>
) => {
  return (
    <ChoiceSelectEditor<Model.FringeUnit, Tables.FringeRowData, Model.Fringe, Tables.FringeTableStore>
      searchIndices={["name"]}
      ref={ref}
      models={budgeting.models.FringeUnits}
      {...props}
    />
  );
};

export default forwardRef(FringeUnitEditor);
