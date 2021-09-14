import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { ShowHide } from "components";
import { SearchInput } from "components/fields";
import { Portal } from "components/layout";

import UnauthenticatedToolbar from "./UnauthenticatedToolbar";

import "./index.scss";

export interface UnauthenticatedMenuProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> {
  readonly columns: Table.Column<R, M, G>[];
  readonly search?: string;
  readonly menuPortalId?: string;
  readonly actions?: Table.UnauthenticatedMenuActions<R, M, G>;
  readonly onSearch: (v: string) => void;
}

type InternalUnauthenticatedMenuProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> = UnauthenticatedMenuProps<R, M, G> & {
  readonly apis: Table.GridApis | null;
  readonly hiddenColumns: (keyof R)[];
};

/* eslint-disable indent */
const UnauthenticatedMenu = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  props: Omit<InternalUnauthenticatedMenuProps<R, M, G>, "menuPortalId"> & { readonly detached: boolean }
) => (
  /* eslint-disable indent */
  <div className={classNames("table-action-menu", { detached: props.detached })}>
    <div className={"table-menu-left"}>
      {!isNil(props.actions) && (
        <UnauthenticatedToolbar<R, M, G>
          actions={props.actions}
          columns={props.columns}
          apis={props.apis}
          hiddenColumns={props.hiddenColumns}
        />
      )}
    </div>
    <div className={"table-menu-right"}>
      <ShowHide show={!isNil(props.search)}>
        <SearchInput
          className={"input--small"}
          placeholder={"Search Rows"}
          value={props.search}
          style={{ maxWidth: 300, minWidth: 100 }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.onSearch(event.target.value)}
        />
      </ShowHide>
    </div>
  </div>
);

const Menu = <R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group>({
  menuPortalId,
  ...props
}: InternalUnauthenticatedMenuProps<R, M, G>) =>
  !isNil(menuPortalId) ? (
    <Portal id={menuPortalId}>
      <UnauthenticatedMenu<R, M, G> {...props} detached={false} />
    </Portal>
  ) : (
    <UnauthenticatedMenu<R, M, G> {...props} detached={true} />
  );

export default Menu;
