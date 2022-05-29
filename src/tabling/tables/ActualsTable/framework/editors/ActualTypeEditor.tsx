import { forwardRef, ForwardedRef } from "react";
import { useSelector } from "react-redux";

import * as store from "store";

import { framework } from "tabling/generic";
import { ModelSelectEditor } from "tabling/generic/framework/editors";

const ActualTypeEditor = (
  props: Omit<
    framework.editors.ModelSelectEditorProps<
      Model.Tag,
      Tables.ActualRowData,
      Model.Actual,
      ActualsTableContext,
      Tables.ActualTableStore
    >,
    "models" | "searchIndices"
  >,
  ref: ForwardedRef<Table.AgEditorRef<Model.Tag>>
) => {
  const types = useSelector(store.selectors.selectActualTypes);

  return (
    <ModelSelectEditor<Model.Tag, Tables.ActualRowData, Model.Actual, ActualsTableContext, Tables.ActualTableStore>
      style={{ maxHeight: 300 }}
      searchIndices={["title"]}
      models={types}
      ref={ref}
      {...props}
    />
  );
};

export default forwardRef(ActualTypeEditor);
