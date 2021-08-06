import { forwardRef } from "react";
import { model } from "lib";
import { framework } from "components/tabling/generic";
import { ChoiceEditor } from "components/tabling/generic/framework/editors";

const FringeUnitEditor = (
  props: Omit<
    framework.editors.ChoiceEditorProps<Tables.FringeRow, Model.Fringe, Model.FringeUnit>,
    "models" | "searchIndices"
  >,
  ref: any
) => {
  return (
    <ChoiceEditor<Tables.FringeRow, Model.Fringe, Model.FringeUnit>
      searchIndices={["name"]}
      models={model.models.FringeUnits}
      forwardedRef={ref}
      {...props}
    />
  );
};

export default forwardRef(FringeUnitEditor);
