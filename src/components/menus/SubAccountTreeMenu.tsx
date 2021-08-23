import { isNil, filter } from "lodash";
import classNames from "classnames";

import { Icon } from "components";
import { EntityText } from "components/typography";

import ModelMenu from "./ModelMenu";

export type SubAccountTreeMenuProps = Omit<
  IMenu<Model.SubAccountTreeNode>,
  "renderItemContent" | "items" | "mode" | "onChange" | "models"
> & { readonly menu?: NonNullRef<IMenuRef<Model.SubAccountTreeNode>> } & {
  readonly nodes: Model.Tree;
  readonly onChange: (m: Model.SimpleSubAccount, e: Table.CellDoneEditingEvent) => void;
  readonly onSearch: (value: string) => void;
  readonly search: string;
  readonly childrenDefaultVisible?: boolean;
};

const SubAccountTreeMenu = ({ nodes, childrenDefaultVisible = true, ...props }: SubAccountTreeMenuProps) => {
  return (
    <ModelMenu<Model.SubAccountTreeNode>
      {...props}
      className={classNames("table-menu", "subaccount-item-tree-menu", props.className)}
      onChange={(params: MenuChangeEvent<Model.SubAccountTreeNode>) => {
        const { children, in_search_path, ...rest } = params.model;
        props.onChange(rest, params.event);
      }}
      getFirstSearchResult={(ms: Model.SubAccountTreeNode[]) => {
        const inSearchPath = filter(ms, (m: Model.SubAccountTreeNode) => m.in_search_path === true);
        if (!isNil(inSearchPath[0])) {
          return inSearchPath[0];
        }
        return null;
      }}
      models={nodes}
      itemProps={{ className: "subaccount-item-tree-menu-item" }}
      levelIndent={6}
      bordersForLevels={true}
      searchIndices={["description", "identifier"]}
      clientSearching={false}
      extra={[
        {
          id: "no-data",
          label: "No Sub-Accounts or Details",
          showOnNoData: true
        }
      ]}
      renderItemContent={(model: Model.SubAccountTreeNode, context: { level: number }) => {
        if (context.level !== 0) {
          return (
            <div className={"with-neuter-wrapper"}>
              <div className={"icon-wrapper"}>
                <Icon icon={"long-arrow-alt-right"} weight={"light"} />
              </div>
              <EntityText fillEmpty={"---------"}>{model}</EntityText>
            </div>
          );
        } else {
          return <EntityText fillEmpty={"---------"}>{model}</EntityText>;
        }
      }}
    />
  );
};

export default SubAccountTreeMenu;
