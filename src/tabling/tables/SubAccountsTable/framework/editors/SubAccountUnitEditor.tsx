import { forwardRef, ForwardedRef } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { framework } from "tabling/generic";
import { ModelSelectEditor } from "tabling/generic/framework/editors";

const SubAccountUnitEditor = (
  props: Omit<
    framework.editors.ModelSelectEditorProps<
      Model.Tag,
      Tables.SubAccountRowData,
      Model.SubAccount,
      Tables.SubAccountTableStore
    >,
    "models" | "searchIndices"
  >,
  ref: ForwardedRef<Table.AgEditorRef<Model.Tag>>
) => {
  const units = useSelector((state: Application.Store) => props.selector(state).subaccountUnits);
  const row: Table.DataRow<Tables.SubAccountRowData> = props.node.data;
  return (
    <ModelSelectEditor<Model.Tag, Tables.SubAccountRowData, Model.SubAccount, Tables.SubAccountTableStore>
      style={{ maxHeight: 300 }}
      searchIndices={["title", "plural_title"]}
      models={units}
      ref={ref}
      tagProps={{ isPlural: !isNil(row.data.quantity) && row.data.quantity > 1 }}
      {...props}
    />
  );
};

export default forwardRef(SubAccountUnitEditor);
