import { forEach, uniq, map } from "lodash";

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
