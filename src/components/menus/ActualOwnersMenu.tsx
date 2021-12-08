import classNames from "classnames";

import { EntityText } from "components/typography";

import ModelMenu from "./ModelMenu";

export type ActualOwnersMenuProps = Omit<IMenu<Model.ActualOwner>, "renderItemContent" | "onChange"> & {
  readonly menu?: NonNullRef<IMenuRef<Model.ActualOwner>>;
} & {
  readonly onChange: (m: Model.ActualOwner, e: Table.CellDoneEditingEvent) => void;
  readonly onSearch: (value: string) => void;
  readonly search: string;
  readonly childrenDefaultVisible?: boolean;
};

const ActualOwnersMenu = ({ childrenDefaultVisible = true, ...props }: ActualOwnersMenuProps) => {
  return (
    <ModelMenu<Model.ActualOwner>
      {...props}
      className={classNames("table-menu", "actual-owner-menu", props.className)}
      getModelIdentifier={(m: Model.ActualOwner) => `${m.type}-${m.id}`}
      onChange={(params: MenuChangeEvent<Model.ActualOwner>) => props.onChange(params.model, params.event)}
      itemProps={{ className: "actual-owner-menu-item" }}
      searchIndices={["description", "identifier"]}
      clientSearching={false}
      extra={[
        {
          id: "no-data",
          label: "No Sub-Accounts, Details or Markups",
          showOnNoData: true
        }
      ]}
      renderItemContent={(model: Model.ActualOwner) => <EntityText fillEmpty={"---------"}>{model}</EntityText>}
    />
  );
};

export default ActualOwnersMenu;
