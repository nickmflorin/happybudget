import { forEach } from "lodash";

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
