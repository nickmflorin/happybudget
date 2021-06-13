import { useMemo } from "react";
import { find, includes, map, isNil, filter, groupBy, forEach } from "lodash";

import { useDynamicCallback } from "lib/hooks";
import Table from "./Table";
import { BodyRow, GroupRow, HeaderRow, FooterRow } from "../Rows";

type ColumnType = Table.PdfColumn<BudgetPdf.AccountRow, Model.PdfAccount, Model.PdfSubAccount>;

const AccountsTable = ({
  /* eslint-disable indent */
  columns,
  data,
  groups,
  manager
}: BudgetPdf.AccountsTableProps): JSX.Element => {
  const showFooterRow = useMemo(() => {
    return filter(columns, (column: ColumnType) => !isNil(column.footer)).length !== 0;
  }, [columns]);

  const table: BudgetPdf.AccountRowGroup[] = useMemo(() => {
    const getGroupForModel = (model: Model.PdfAccount): number | null => {
      const group: Model.BudgetGroup | undefined = find(groups, (g: Model.BudgetGroup) =>
        includes(
          map(g.children, (child: number) => child),
          model.id
        )
      );
      return !isNil(group) ? group.id : null;
    };
    const modelsWithGroup: Model.PdfAccount[] = filter(data, (m: Model.PdfAccount) => !isNil(getGroupForModel(m)));
    let modelsWithoutGroup: Model.PdfAccount[] = filter(data, (m: Model.PdfAccount) => isNil(getGroupForModel(m)));

    let newTable: BudgetPdf.AccountRowGroup[] = [];

    let groupWithoutGroup: BudgetPdf.AccountRowGroup = {
      group: null,
      rows: map(modelsWithoutGroup, (m: Model.PdfAccount) => manager.modelToRow(m))
    };

    const groupedModels: { [key: number]: Model.PdfAccount[] } = groupBy(modelsWithGroup, (model: Model.PdfAccount) =>
      getGroupForModel(model)
    );
    forEach(groupedModels, (models: Model.PdfAccount[], groupId: string) => {
      const group: Model.BudgetGroup | undefined = find(groups, { id: parseInt(groupId) } as any);
      if (!isNil(group)) {
        newTable.push({
          group,
          rows: map(models, (m: Model.PdfAccount) => manager.modelToRow(m))
        });
      } else {
        // In the case that the group no longer exists, that means the group was removed from the
        // state.  In this case, we want to disassociate the rows with the group.
        groupWithoutGroup = {
          ...groupWithoutGroup,
          rows: [...groupWithoutGroup.rows, ...map(models, (m: Model.PdfAccount) => manager.modelToRow(m))]
        };
      }
    });
    return [...newTable, groupWithoutGroup];
  }, []);

  const generateRows = useDynamicCallback((): JSX.Element[] => {
    let rows: JSX.Element[] = [<HeaderRow columns={columns} index={0} key={0} />];
    let runningIndex = 1;
    for (let i = 0; i < table.length; i++) {
      const group: BudgetPdf.AccountRowGroup = table[i];
      for (let j = 0; j < group.rows.length; j++) {
        const row: BudgetPdf.AccountRow = group.rows[j];
        rows.push(<BodyRow key={runningIndex} index={runningIndex} columns={columns} row={row} />);
        runningIndex = runningIndex + 1;
      }
      if (!isNil(group.group)) {
        rows.push(<GroupRow group={group.group} index={runningIndex} key={runningIndex} columns={columns} />);
        runningIndex = runningIndex + 1;
      }
    }
    if (showFooterRow === true) {
      rows.push(<FooterRow index={runningIndex} key={runningIndex} columns={columns} />);
    }
    return rows;
  });

  return <Table>{generateRows()}</Table>;
};

export default AccountsTable;
