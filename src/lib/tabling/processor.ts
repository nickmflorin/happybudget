import { filter, includes, isNil, forEach, find } from "lodash";
import { ColDef, ProcessCellForExportParams } from "ag-grid-community";
import { includesAnyIn, getKeyValue } from "lib/util";

export type ProcessorLookup<R extends Table.Row<G, C>, G extends IGroup<any>, C extends Model = UnknownModel> = {
  field: keyof R;
  type?: CellProcessorType | CellProcessorType[];
};

export type CellProcessorType = "clipboard" | "http";

export type CellProcessor<R extends Table.Row<G, C>, G extends IGroup<any>, C extends Model = UnknownModel> = {
  func: (value: any, row: R, col: ColDef) => any;
  type: CellProcessorType | CellProcessorType[];
  field: keyof R | (keyof R)[];
};

export type CellProcessors<
  R extends Table.Row<G, C>,
  G extends IGroup<any>,
  C extends Model = UnknownModel
> = CellProcessor<R, G, C>[];

export const findProcessors = <R extends Table.Row<G, C>, G extends IGroup<any>, C extends Model = UnknownModel>(
  processors: CellProcessors<R, G, C>,
  lookup: ProcessorLookup<R, G, C>
): CellProcessors<R, G, C> => {
  return filter(processors, (processor: CellProcessor<R, G, C>) => {
    if (Array.isArray(processor.field) && !includes(processor.field, lookup.field)) {
      return false;
    } else if (!Array.isArray(processor.field) && processor.field !== lookup.field) {
      return false;
    } else if (!isNil(lookup.type)) {
      if (Array.isArray(lookup.type)) {
        if (Array.isArray(processor.type)) {
          return includesAnyIn(processor.type, lookup.type);
        } else {
          return includes(lookup.type, processor.type);
        }
      } else {
        if (Array.isArray(processor.type)) {
          return includes(processor.type, lookup.type);
        } else {
          return lookup.type === processor.type;
        }
      }
    }
    return true;
  });
};

export const processCell = <R extends Table.Row<G, C>, G extends IGroup<any>, C extends Model = UnknownModel>(
  processors: CellProcessors<R, G, C>,
  lookup: ProcessorLookup<R, G, C>,
  value: any,
  row: R,
  colDef: ColDef
): any => {
  const cellProcessors = findProcessors<R, G, C>(processors, lookup);
  forEach(cellProcessors, (processor: CellProcessor<R, G, C>) => {
    value = processor.func(value, row, colDef);
  });
  return value;
};

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
