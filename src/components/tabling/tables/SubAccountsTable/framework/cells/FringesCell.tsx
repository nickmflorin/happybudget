import { useMemo } from "react";
import { useSelector } from "react-redux";
import { filter } from "lodash";

import { hooks, model, tabling } from "lib";

import { MultipleTags } from "components/tagging";
import { Cell } from "components/tabling/generic/framework/cells";

export interface FringesCellProps
  extends Table.CellProps<Tables.SubAccountRowData, Model.SubAccount, Tables.SubAccountTableStore> {
  readonly onAddFringes: () => void;
}

const FringesCell = ({ value, onAddFringes, ...props }: FringesCellProps): JSX.Element => {
  const fringes: Table.BodyRow<Tables.FringeRowData>[] = useSelector(
    (state: Application.Store) => props.selector(state).fringes.data
  );

  const applicableFringes: Tables.FringeRow[] = useMemo(() => {
    return model.util.getModelsByIds(
      filter(fringes, (r: Table.BodyRow<Tables.FringeRowData>) =>
        tabling.typeguards.isModelRow(r)
      ) as Tables.FringeRow[],
      value
    );
  }, [hooks.useDeepEqualMemo(fringes), value]);

  return (
    <Cell<Tables.SubAccountRowData, Model.SubAccount, Tables.SubAccountTableStore> {...props}>
      <div style={{ display: "flex", justifyContent: "left" }}>
        <MultipleTags<Tables.FringeRow> models={applicableFringes} />
      </div>
    </Cell>
  );
};

export default FringesCell;
