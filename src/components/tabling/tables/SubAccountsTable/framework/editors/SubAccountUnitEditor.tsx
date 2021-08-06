import { forwardRef } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

// It is not ideal that we are importing part of the store in a generalized components
// directory.  We should consider alternate solutions to this or potentially moving the
// cell component into the app directory.
import { selectSubAccountUnits } from "app/Budgeting/store/selectors";
import { framework } from "components/tabling/generic";
import { ChoiceEditor } from "components/tabling/generic/framework/editors";

const SubAccountUnitEditor = (
  props: Omit<
    framework.editors.ChoiceEditorProps<Tables.SubAccountRow, Model.SubAccount, Model.Tag>,
    "models" | "searchIndices"
  >,
  ref: any
) => {
  const units = useSelector(selectSubAccountUnits);
  const row: Tables.SubAccountRow = props.node.data;
  return (
    <ChoiceEditor<Tables.SubAccountRow, Model.SubAccount, Model.Tag>
      style={{ maxHeight: 300 }}
      searchIndices={["title", "plural_title"]}
      models={units}
      forwardedRef={ref}
      tagProps={{ isPlural: !isNil(row.quantity) && row.quantity > 1 }}
      {...props}
    />
  );
};

export default forwardRef(SubAccountUnitEditor);
