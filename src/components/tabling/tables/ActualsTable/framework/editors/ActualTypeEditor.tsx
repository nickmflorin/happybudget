import { forwardRef } from "react";
import { useSelector } from "react-redux";

import { framework } from "components/tabling/generic";
import { ModelSelectEditor } from "components/tabling/generic/framework/editors";

const ActualTypeEditor = (
  props: Omit<
    framework.editors.ModelSelectEditorProps<Model.Tag, Tables.ActualRowData, Model.Actual, Tables.ActualTableStore>,
    "models" | "searchIndices"
  >,
  ref: any
) => {
  const types = useSelector((state: Application.Store) => props.selector(state).actualTypes);
  return (
    <ModelSelectEditor<Model.Tag, Tables.ActualRowData, Model.Actual, Tables.ActualTableStore>
      style={{ maxHeight: 300 }}
      searchIndices={["title"]}
      models={types}
      ref={ref}
      {...props}
    />
  );
};

export default forwardRef(ActualTypeEditor);
