import { forEach, isNil, filter, reduce, find } from "lodash";
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

export const fringeValue = (value: number, fringes: IFringe[]): number => {
  const additionalValues: number[] = [];
  forEach(
    filter(fringes, (fringe: IFringe) => !isNil(fringe.rate)),
    (fringe: IFringe) => {
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

export const findChoiceModelForName = <M extends ChoiceModel<number, string>>(models: M[], name: string): M | null => {
  return find(models, { name } as any) || null;
};

export const findChoiceModelForId = <M extends ChoiceModel<number, string>>(models: M[], id: number): M | null => {
  return find(models, { id } as any) || null;
};
