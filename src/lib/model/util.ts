import { forEach, uniq, map, isNil, filter, reduce } from "lodash";
import { FringeUnitModels } from ".";

export const flattenBudgetItemNodes = (nodes: IBudgetItemNode[]): IBudgetItem[] => {
  const flattened: IBudgetItem[] = [];

  const addNode = (node: IBudgetItemNode): void => {
    const { children, ...withoutChildren } = node;
    flattened.push(withoutChildren);
    if (node.children.length !== 0) {
      forEach(node.children, (child: IBudgetItemNode) => {
        addNode(child);
      });
    }
  };
  forEach(nodes, (node: IBudgetItemNode) => {
    addNode(node);
  });
  return flattened;
};

export const mergeRowChanges = (changes: Table.RowChange[]): Table.RowChange => {
  if (changes.length !== 0) {
    if (uniq(map(changes, (change: Table.RowChange) => change.id)).length !== 1) {
      throw new Error("Cannot merge row changes for different rows!");
    }
    const merged: Table.RowChange = { id: changes[0].id, data: {} };
    forEach(changes, (change: Table.RowChange) => {
      merged.data = { ...merged.data, ...change.data };
    });
    return merged;
  } else {
    throw new Error("Must provide at least 1 row change.");
  }
};

export const fringeValue = (value: number, fringes: IFringe[]): number => {
  const additionalValues: number[] = [];
  forEach(
    filter(fringes, (fringe: IFringe) => !isNil(fringe.rate)),
    (fringe: IFringe) => {
      if (fringe.unit === FringeUnitModels.FLAT.id) {
        additionalValues.push(fringe.rate);
      } else {
        if (fringe.cutoff === null || fringe.cutoff >= value) {
          additionalValues.push(fringe.rate * value);
        } else {
          additionalValues.push(fringe.rate * fringe.cutoff);
        }
      }
    }
  );
  return value + reduce(additionalValues, (sum: number, val: number) => sum + val, 0);
};
