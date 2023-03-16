import { forwardRef, ForwardedRef } from "react";

import { isNil } from "lodash";
import { useSelector } from "react-redux";

import * as store from "store";
import { framework } from "tabling/generic";
import { ModelSelectEditor } from "tabling/generic/framework/editors";

const SubAccountUnitEditor = <
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount,
>(
  props: Omit<
    framework.editors.ModelSelectEditorProps<
      Model.Tag,
      Tables.SubAccountRowData,
      Model.SubAccount,
      SubAccountsTableContext<B, P, false>,
      Tables.SubAccountTableStore
    >,
    "models" | "searchIndices"
  >,
  ref: ForwardedRef<Table.AgEditorRef<Model.Tag>>,
) => {
  const units = useSelector(
    (s: Application.Store) => store.selectors.selectSubAccountUnitStore(s).data,
  );
  const unitsLoading = useSelector(
    (s: Application.Store) => store.selectors.selectSubAccountUnitStore(s).loading,
  );

  const row: Table.DataRow<Tables.SubAccountRowData> = props.node.data;
  return (
    <ModelSelectEditor<
      Model.Tag,
      Tables.SubAccountRowData,
      Model.SubAccount,
      SubAccountsTableContext<B, P, false>,
      Tables.SubAccountTableStore
    >
      style={{ maxHeight: 300 }}
      searchIndices={["title", "plural_title"]}
      models={units}
      ref={ref}
      loading={unitsLoading}
      tagProps={{ isPlural: !isNil(row.data.quantity) && row.data.quantity > 1 }}
      {...props}
    />
  );
};

export default forwardRef(SubAccountUnitEditor) as typeof SubAccountUnitEditor;
