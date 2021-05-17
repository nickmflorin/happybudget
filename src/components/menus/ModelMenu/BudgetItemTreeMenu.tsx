import { useMemo } from "react";
import { map } from "lodash";

import { useDeepEqualMemo } from "lib/hooks";

import { EntityText } from "components/typography";

import ExpandedModelMenu from "./ExpandedModelMenu";
import { BudgetItemTreeMenuProps, StringSubAccountNode, StringAccountNode } from "./model";

import "./BudgetItemTreeMenu.scss";

const convertSubAccountNodeToStringIdForm = (node: Model.SubAccountTreeNode): StringSubAccountNode => {
  const { id, children, ...rest } = node;
  const m: Omit<Model.SimpleSubAccount, "id"> = rest;
  return {
    ...m,
    originalId: id,
    children: map(children, (child: Model.SubAccountTreeNode) => convertSubAccountNodeToStringIdForm(child)),
    id: `${node.type}-${id}`
  };
};

const convertAccountNodeToStringIdForm = (node: Model.AccountTreeNode): StringAccountNode => {
  const { id, children, ...rest } = node;
  const m: Omit<Model.SimpleAccount, "id"> = rest;
  return {
    ...m,
    originalId: id,
    children: map(children, (child: Model.SubAccountTreeNode) => convertSubAccountNodeToStringIdForm(child)),
    id: `${node.type}-${id}`
  };
};

const BudgetItemTreeMenu = ({ nodes, childrenDefaultVisible = true, ...props }: BudgetItemTreeMenuProps) => {
  const models: (StringAccountNode | StringSubAccountNode)[] = useMemo(() => {
    return map(nodes, (node: Model.AccountTreeNode) => convertAccountNodeToStringIdForm(node));
  }, [useDeepEqualMemo(nodes)]);

  return (
    <ExpandedModelMenu<StringSubAccountNode | StringAccountNode>
      {...props}
      onChange={(model: Omit<StringSubAccountNode, "children"> | Omit<StringAccountNode, "children">) => {
        const { originalId, ...rest } = model;
        props.onChange({ ...rest, id: originalId });
      }}
      models={models}
      menuProps={{ className: "budget-item-tree-menu" }}
      itemProps={{ className: "budget-item-tree-menu-item" }}
      levelIndent={10}
      searchIndices={["description", "identifier"]}
      clientSearching={false}
      renderItem={(
        model: Omit<StringSubAccountNode, "children"> | Omit<StringAccountNode, "children">,
        context: { level: number; index: number }
      ) => {
        const { originalId, ...rest } = model;
        const simpleModel: Model.SimpleAccount | Model.SimpleSubAccount = { ...rest, id: originalId };
        return <EntityText fillEmpty={"---------"}>{simpleModel}</EntityText>;
      }}
    />
  );
};

export default BudgetItemTreeMenu;
