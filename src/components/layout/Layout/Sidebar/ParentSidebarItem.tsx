import React, { useState } from "react";
import { map } from "lodash";

import { ShowHide } from "components";

import GenericSidebarItem from "./GenericSidebarItem";
import ExpandedSidebarItem from "./ExpandedSidebarItem";

const ParentSidebarItem = (props: IExpandedParentSidebarItem): JSX.Element => {
  const [submenuVisible, setSubmenuVisible] = useState(false);

  const { submenu, ...item } = props;
  return (
    <React.Fragment>
      <ExpandedSidebarItem {...item} style={{ marginBottom: 10 }} onClick={() => setSubmenuVisible(!submenuVisible)} />
      <ShowHide show={submenuVisible}>
        <div className={"sidebar-sub-menu"}>
          {map(submenu, (subItem: IExpandedSingleSidebarItem, i: number) => {
            return (
              <GenericSidebarItem<IExpandedSingleSidebarItem> key={i} {...subItem}>
                <span className={"text-container"}>{subItem.label}</span>
              </GenericSidebarItem>
            );
          })}
        </div>
      </ShowHide>
    </React.Fragment>
  );
};

export default React.memo(ParentSidebarItem);
