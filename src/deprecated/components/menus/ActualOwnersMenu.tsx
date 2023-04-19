import React from "react";

import classNames from "classnames";

import { EntityText } from "components/typography";

import TableModelMenu from "./TableModelMenu";

export type ActualOwnersMenuProps = Omit<
  IMenu<MenuItemSelectedState, Model.ActualOwner>,
  "renderItemContent" | "onChange"
> & {
  readonly onChange: (m: Model.ActualOwner, e: Table.CellDoneEditingEvent) => void;
  readonly onSearch: (value: string) => void;
  readonly search: string;
};

const ActualOwnersMenu = (props: ActualOwnersMenuProps) => (
  <TableModelMenu<Model.ActualOwner>
    {...props}
    className={classNames("actual-owner-menu", props.className)}
    getModelIdentifier={(m: Model.ActualOwner) => `${m.type}-${m.id}`}
    onChange={(e: MenuChangeEvent<MenuItemSelectedState, Model.ActualOwner>) =>
      props.onChange(e.model, e.event)
    }
    itemProps={{ className: "actual-owner-menu-item" }}
    searchIndices={["description", "identifier"]}
    clientSearching={false}
    extra={[
      {
        id: "no-data",
        label: "No Sub-Accounts, Details or Markups",
        showOnNoData: true,
      },
    ]}
    renderItemContent={(model: Model.ActualOwner) => (
      <EntityText fillEmpty="---------">{model}</EntityText>
    )}
  />
);

export default React.memo(ActualOwnersMenu);
