import { isNil, find } from "lodash";
import { ProcessCellForExportParams } from "ag-grid-community";
import { getKeyValue } from "lib/util";

export const processOptionModelCellForClipboard = <
  R extends Table.Row<any, any>,
  M extends ChoiceModel<number, string>
>(
  /* eslint-disable indent */
  field: keyof R,
  models: M[]
) => (params: ProcessCellForExportParams) => {
  /* eslint-disable indent */
  if (!isNil(params.node)) {
    const row: R = params.node.data;
    const colDef = params.column.getColDef();
    if (!isNil(colDef.field)) {
      if (colDef.field === field && !isNil(row[field])) {
        const choiceModel: M | undefined = find(models, {
          id: row[field]
        } as any);
        if (!isNil(choiceModel)) {
          return choiceModel.name;
        } else {
          /* eslint-disable no-console */
          console.error(
            `Corrupted Cell Found! Could not convert model value ${row[field]} for field ${field}
            to a name.`
          );
          return "";
        }
      } else {
        return getKeyValue<R, keyof R>(colDef.field as keyof R)(row);
      }
    }
  }
};
