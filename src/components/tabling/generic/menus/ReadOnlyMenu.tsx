import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { ShowHide } from "components";
import { SearchInput } from "components/fields";
import { Portal } from "components/layout";

import ReadOnlyToolbar from "./ReadOnlyToolbar";

import "./index.scss";

export interface ReadOnlyMenuProps<R extends Table.Row, M extends Model.Model> {
  readonly columns: Table.Column<R, M>[];
  readonly search?: string;
  readonly menuPortalId?: string;
  readonly actions?: Table.ReadOnlyMenuActions<R, M>;
  readonly onSearch?: (value: string) => void;
}

type InternalReadOnlyMenuProps<R extends Table.Row, M extends Model.Model> = ReadOnlyMenuProps<R, M> & {
  readonly apis: Table.GridApis | null;
  readonly hiddenColumns: Table.Field<R, M>[];
};

const ReadOnlyMenu = <R extends Table.Row, M extends Model.Model>(
  props: Omit<InternalReadOnlyMenuProps<R, M>, "menuPortalId"> & { readonly detached: boolean }
) => (
  /* eslint-disable indent */
  <div className={classNames("table-action-menu", { detached: props.detached })}>
    <div className={"table-menu-left"}>
      {!isNil(props.actions) && (
        <ReadOnlyToolbar
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
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            !isNil(props.onSearch) && props.onSearch(event.target.value)
          }
        />
      </ShowHide>
    </div>
  </div>
);

const Menu = <R extends Table.Row, M extends Model.Model>({
  menuPortalId,
  ...props
}: InternalReadOnlyMenuProps<R, M>) =>
  !isNil(menuPortalId) ? (
    <Portal id={menuPortalId}>
      <ReadOnlyMenu {...props} detached={false} />
    </Portal>
  ) : (
    <ReadOnlyMenu {...props} detached={true} />
  );

export default React.memo(Menu) as typeof Menu;
