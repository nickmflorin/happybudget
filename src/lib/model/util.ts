import { forEach, isNil, filter, reduce, find } from "lodash";
import { FringeUnitModels } from ".";

export const flattenBudgetItemNodes = (nodes: Model.BudgetItemNode[]): Model.BudgetItem[] => {
  const flattened: Model.BudgetItem[] = [];

  const addNode = (node: Model.BudgetItemNode): void => {
    const { children, ...withoutChildren } = node;
    flattened.push(withoutChildren);
    if (node.children.length !== 0) {
      forEach(node.children, (child: Model.BudgetItemNode) => {
        addNode(child);
      });
    }
  };
  forEach(nodes, (node: Model.BudgetItemNode) => {
    addNode(node);
  });
  return flattened;
};

export const fringeValue = (value: number, fringes: Model.Fringe[]): number => {
  const additionalValues: number[] = [];
  forEach(
    filter(fringes, (fringe: Model.Fringe) => !isNil(fringe.rate)),
    (fringe: Model.Fringe) => {
      if (fringe.unit.id === FringeUnitModels.FLAT.id) {
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

export const findChoiceForName = <M extends Model.Choice<number, string>>(
  models: M[],
  name: string,
  caseSensitive = true
): M | null => {
  return caseSensitive
    ? find(models, { name } as any) || null
    : find(models, (model: M) => model.name.toLowerCase() === name.toLowerCase()) || null;
};

export const findChoiceForId = <M extends Model.Choice<number, string>>(models: M[], id: number): M | null => {
  return find(models, { id } as any) || null;
};
