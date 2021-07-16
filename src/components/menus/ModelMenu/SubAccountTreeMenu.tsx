import { isNil, filter } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltRight } from "@fortawesome/pro-light-svg-icons";

import { VerticalFlexCenter } from "components";
import { EntityText } from "components/typography";

import ExpandedModelMenu from "./ExpandedModelMenu";

import "./SubAccountTreeMenu.scss";

const SubAccountTreeMenu = ({ nodes, childrenDefaultVisible = true, ...props }: SubAccountTreeMenuProps) => {
  return (
    <ExpandedModelMenu<Model.SubAccountTreeNode>
      {...props}
      onChange={(model: Model.SubAccountTreeNode, e: Table.CellDoneEditingEvent) => {
        const { children, in_search_path, ...rest } = model;
        props.onChange(rest, e);
      }}
      getFirstSearchResult={(ms: Model.SubAccountTreeNode[]) => {
        const inSearchPath = filter(ms, (m: Model.SubAccountTreeNode) => m.in_search_path === true);
        if (!isNil(inSearchPath[0])) {
          return inSearchPath[0];
        }
        return null;
      }}
      models={nodes}
      selected={!isNil(props.selected) ? [`${props.selected.type}-${props.selected.id}`] : null}
      menuProps={{ className: "subaccount-item-tree-menu" }}
      itemProps={{ className: "subaccount-item-tree-menu-item" }}
      levelIndent={15}
      bordersForLevels={true}
      searchIndices={["description", "identifier"]}
      clientSearching={false}
      onNoData={{
        text: "No Sub-Accounts or Details"
      }}
      renderItem={(model: Model.SimpleSubAccount, context: { level: number; index: number }) => {
        if (context.level !== 0) {
          return (
            <div className={"with-neuter-wrapper"}>
              <VerticalFlexCenter>
                <FontAwesomeIcon className={"icon"} icon={faLongArrowAltRight} />
              </VerticalFlexCenter>
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
