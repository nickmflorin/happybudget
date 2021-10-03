import { useMemo } from "react";
import { useSelector } from "react-redux";

import { hooks, model } from "lib";

import { Tag } from "components/tagging";
import { Cell } from "components/tabling/generic/framework/cells";

export interface FringesCellProps
  extends Table.CellProps<Tables.SubAccountRowData, Model.SubAccount, Tables.SubAccountTableStore> {
  readonly onAddFringes: () => void;
}

const FringesCell = ({ value, onAddFringes, ...props }: FringesCellProps): JSX.Element => {
  const fringes: Tables.FringeRow[] = useSelector((state: Application.Store) => props.selector(state).fringes.data);

  const applicableFringes: Tables.FringeRow[] = useMemo(() => {
    return model.util.getModelsByIds(fringes, value);
  }, [hooks.useDeepEqualMemo(fringes), value]);

  return (
    <Cell<Tables.SubAccountRowData, Model.SubAccount, Tables.SubAccountTableStore> {...props}>
      <div style={{ display: "flex", justifyContent: "left" }}>
        <Tag.Multiple<Tables.FringeRow> models={applicableFringes} />
      </div>
    </Cell>
  );
};

export default FringesCell;
