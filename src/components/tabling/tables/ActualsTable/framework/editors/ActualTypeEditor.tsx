import { forwardRef, ForwardedRef } from "react";

import { useSelector } from "react-redux";

import { framework } from "components/tabling/generic";
import { ModelSelectEditor } from "components/tabling/generic/framework/editors";
import * as store from "application/store";

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
  ref: ForwardedRef<Table.AgEditorRef<Model.Tag>>,
) => {
  const types = useSelector(store.selectors.selectActualTypes);

  return (
    <ModelSelectEditor<
      Model.Tag,
      Tables.ActualRowData,
      Model.Actual,
      ActualsTableContext,
      Tables.ActualTableStore
    >
      style={{ maxHeight: 300 }}
      searchIndices={["title"]}
      models={types}
      ref={ref}
      {...props}
    />
  );
};

export default forwardRef(ActualTypeEditor);
