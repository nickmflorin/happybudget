import { useMemo } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { hooks, model } from "lib";

import { Tag } from "components/tagging";
import { Cell } from "components/tabling/generic/framework/cells";

export interface FringesCellProps
  extends Table.CellProps<Tables.SubAccountRowData, Model.SubAccount, Tables.SubAccountTableStore> {
  readonly onAddFringes: () => void;
}

const FringesCell = ({ value, onAddFringes, ...props }: FringesCellProps): JSX.Element => {
  const row: Tables.SubAccountRow = props.node.data;
  const fringes = useSelector((state: Application.Store) => props.selector(state).fringes.data);

  const models = useMemo(() => {
    return model.util.getModelsByIds(fringes, row.fringes);
  }, [hooks.useDeepEqualMemo(fringes), row.fringes]);

  return (
    <Cell<Tables.SubAccountRowData, Model.SubAccount, Tables.SubAccountTableStore>
      {...props}
      onClear={() => !isNil(props.setValue) && props.setValue([])}
      hideClear={models.length === 0}
    >
      <div style={{ display: "flex", justifyContent: "left" }}>
        <Tag.Multiple<Tables.FringeRow> models={models} />
      </div>
    </Cell>
  );
};

export default FringesCell;
