import React, { useMemo } from "react";
import { isNil, filter, map } from "lodash";
import classNames from "classnames";

import { tabling } from "lib";

import { ShowHide, SavingChanges } from "components";
import { SearchInput } from "components/fields";
import { Portal } from "components/layout";

import "./index.scss";

export type Toolbar<
  T extends Table.MenuActionParams<R, M>,
  R extends Table.RowData,
  M extends Model.RowHttpModel
> = React.ComponentType<T & { readonly actions: Table.MenuActions<R, M, T> }>;

export type MenuProps<T extends Table.MenuActionParams<R, M>, R extends Table.RowData, M extends Model.RowHttpModel> = {
  readonly search?: string;
  readonly menuPortalId?: string;
  readonly prefixLeft?: JSX.Element[];
  readonly actions?: Table.MenuActions<R, M, T>;
  readonly savingChangesPortalId?: string;
  readonly saving?: boolean;
  readonly savingVisible?: boolean;
  readonly onSearch: (v: string) => void;
};

export type InternalMenuProps<
  T extends Table.MenuActionParams<R, M>,
  R extends Table.RowData,
  M extends Model.RowHttpModel
> = MenuProps<T, R, M> & {
  readonly hasEditColumn?: boolean;
  readonly hasDragColumn?: boolean;
  readonly menuActionParams: T;
  readonly toolbar: Toolbar<T, R, M>;
};

const TableMenu = <
  T extends Table.MenuActionParams<R, M>,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
>(
  props: Omit<InternalMenuProps<T, R, M>, "menuPortalId"> & { readonly detached: boolean }
) => {
  const ToolbarComponent = props.toolbar;

  const leftActions = useMemo(
    () =>
      !isNil(props.actions) && !isNil(props.menuActionParams.apis)
        ? filter(
            tabling.menu.evaluateActions<R, M, T>(props.actions, props.menuActionParams),
            (a: Table.MenuActionObj) => a.location !== "right"
          )
        : [],
    [props.menuActionParams]
  );
  const rightActions = useMemo(
    () =>
      !isNil(props.actions) && !isNil(props.menuActionParams.apis)
        ? filter(
            tabling.menu.evaluateActions<R, M, T>(props.actions, props.menuActionParams),
            (a: Table.MenuActionObj) => a.location === "right"
          )
        : [],
    [props.menuActionParams]
  );
  return (
    <div
      className={classNames(
        "table-action-menu",
        { detached: props.detached },
        { "has-expand-column": props.hasEditColumn },
        { "has-drag-column": props.hasDragColumn }
      )}
    >
      <Portal id={props.savingChangesPortalId}>
        {props.savingVisible !== false && <SavingChanges saving={props.saving} />}
      </Portal>
      <div className={"table-menu-left"}>
        {map(props.prefixLeft, (element: JSX.Element, i: number) => (
          <React.Fragment key={i}>{element}</React.Fragment>
        ))}
        {leftActions.length !== 0 && <ToolbarComponent actions={leftActions} {...props.menuActionParams} />}
      </div>
      <div className={"table-menu-right"}>
        {/* Reserved for cases where the table is not a full page table and thus
				  the Saving Changes in the page header is not visible. */}
        {!isNil(props.saving) && isNil(props.savingChangesPortalId) && <SavingChanges saving={props.saving} />}
        {rightActions.length !== 0 && <ToolbarComponent actions={rightActions} {...props.menuActionParams} />}
        <ShowHide show={!isNil(props.search)}>
          <SearchInput
            className={"input--small"}
            placeholder={"Search Rows"}
            value={props.search}
            style={{ maxWidth: 350, minWidth: 220 }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.onSearch(event.target.value)}
          />
        </ShowHide>
      </div>
    </div>
  );
};

const Menu = <
  T extends Table.MenuActionParams<R, M>,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
>({
  menuPortalId,
  ...props
}: InternalMenuProps<T, R, M>) =>
  !isNil(menuPortalId) ? (
    <Portal id={menuPortalId}>
      <TableMenu {...props} detached={false} />
    </Portal>
  ) : (
    <TableMenu {...props} detached={true} />
  );

export default React.memo(Menu) as typeof Menu;
