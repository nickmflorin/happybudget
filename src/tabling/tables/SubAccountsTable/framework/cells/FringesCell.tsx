import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { filter } from "lodash";

import { hooks, models, tabling } from "lib";

import { MultipleTags } from "components/tagging";
import { Cell } from "tabling/generic/framework/cells";

export type FringesCellProps = Table.CellProps<Tables.SubAccountRowData, Model.SubAccount, Tables.SubAccountTableStore>;

const FringesCell = ({ value, ...props }: FringesCellProps): JSX.Element => {
  const fringes: Table.BodyRow<Tables.FringeRowData>[] = useSelector(
    (state: Application.Store) => props.selector(state).fringes.data
  );

  const applicableFringes: Tables.FringeRow[] = useMemo(() => {
    return models.getModelsByIds(
      filter(fringes, (r: Table.BodyRow<Tables.FringeRowData>) =>
        tabling.typeguards.isModelRow(r)
      ) as Tables.FringeRow[],
      value
    );
  }, [hooks.useDeepEqualMemo(fringes), value]);

  return (
    <Cell<Tables.SubAccountRowData, Model.SubAccount, Tables.SubAccountTableStore> {...props}>
      <MultipleTags<Tables.FringeRow> models={applicableFringes} />
    </Cell>
  );
};

export default React.memo(FringesCell);
