import { forwardRef } from "react";
import { isNil } from "lodash";

import { hooks } from "store";

import { framework } from "components/tabling/generic";
import { ChoiceEditor } from "components/tabling/generic/framework/editors";

const SubAccountUnitEditor = (
  props: Omit<
    framework.editors.ChoiceEditorProps<Tables.SubAccountRow, Model.SubAccount, Model.Tag>,
    "models" | "searchIndices"
  >,
  ref: any
) => {
  const units = hooks.useSubAccountUnits();
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
