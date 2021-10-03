import { isNil, filter } from "lodash";
import classNames from "classnames";

import { Icon } from "components";
import { EntityText } from "components/typography";

import ModelMenu from "./ModelMenu";

export type OwnerTreeMenuProps = Omit<
  IMenu<Model.OwnerTreeNode>,
  "renderItemContent" | "items" | "mode" | "onChange" | "models"
> & { readonly menu?: NonNullRef<IMenuRef<Model.OwnerTreeNode>> } & {
  readonly nodes: Model.OwnerTreeNode[];
  readonly onChange: (m: Model.SimpleSubAccount | Model.SimpleMarkup, e: Table.CellDoneEditingEvent) => void;
  readonly onSearch: (value: string) => void;
  readonly search: string;
  readonly childrenDefaultVisible?: boolean;
};

const isSubAccountTreeNode = (node: Model.OwnerTreeNode): node is Model.SubAccountOwnerTreeNode =>
  (node as Model.SubAccountOwnerTreeNode).children !== undefined;

const OwnerTreeMenu = ({ nodes, childrenDefaultVisible = true, ...props }: OwnerTreeMenuProps) => {
  return (
    <ModelMenu<Model.OwnerTreeNode>
      {...props}
      className={classNames("table-menu", "owner-tree-menu", props.className)}
      onChange={(params: MenuChangeEvent<Model.OwnerTreeNode>) => {
        if (isSubAccountTreeNode(params.model)) {
          const { children, in_search_path, ...rest } = params.model;
          props.onChange(rest, params.event);
        } else {
          const { in_search_path, ...rest } = params.model;
          props.onChange(rest, params.event);
        }
      }}
      getFirstSearchResult={(ms: Model.OwnerTreeNode[]) => {
        const inSearchPath = filter(ms, (m: Model.OwnerTreeNode) => m.in_search_path === true);
        if (!isNil(inSearchPath[0])) {
          return inSearchPath[0];
        }
        return null;
      }}
      models={nodes}
      getModelIdentifier={(m: Model.OwnerTreeNode) => `${m.type}-${m.id}`}
      itemProps={{ className: "owner-tree-menu-item" }}
      levelIndent={6}
      bordersForLevels={true}
      searchIndices={["description", "identifier"]}
      clientSearching={false}
      extra={[
        {
          id: "no-data",
          label: "No Sub-Accounts, Details or Markups",
          showOnNoData: true
        }
      ]}
      renderItemContent={(model: Model.OwnerTreeNode, context: { level: number }) => {
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

export default OwnerTreeMenu;
