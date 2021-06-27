import { isNil, map } from "lodash";
import classNames from "classnames";

import { Input, Checkbox, Tooltip } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/pro-light-svg-icons";

import { ColDef, RowNode } from "@ag-grid-community/core";

import { SavingChanges, ShowHide } from "components";
import { IconButton } from "components/buttons";
import { FieldsDropdown } from "components/dropdowns";
import { FieldMenuField } from "components/menus/FieldsMenu";
import { PortalOrRender } from "components/layout";

const BudgetTableMenu = <R extends Table.Row>({
  apis,
  actions,
  search,
  saving = false,
  canSearch = true,
  canExport = true,
  canToggleColumns = true,
  detached = false,
  columns,
  onSearch,
  onColumnsChange,
  onExport
}: BudgetTable.MenuProps<R>) => {
  return (
    <PortalOrRender id={"supplementary-header"} portal={!detached}>
      <div className={classNames("table-header", { detached })}>
        <div className={"table-header-left"}>
          <Tooltip title={"Select All"} placement={"bottom"}>
            <Checkbox
              onChange={(e: CheckboxChangeEvent) => {
                apis.grid.forEachNode((node: RowNode) => {
                  const row: R = node.data;
                  if (
                    row.meta.isGroupFooter === false &&
                    row.meta.isTableFooter === false &&
                    row.meta.isBudgetFooter === false
                  ) {
                    node.setSelected(e.target.checked);
                  }
                });
              }}
            />
          </Tooltip>
          {!isNil(actions) && (
            <div className={"toolbar-buttons"}>
              {map(
                Array.isArray(actions) ? actions : actions({ apis, columns }),
                (action: BudgetTable.MenuAction, index: number) => {
                  return (
                    <IconButton
                      key={index}
                      className={"dark"}
                      size={"large"}
                      onClick={() => !isNil(action.onClick) && action.onClick()}
                      disabled={action.disabled}
                      icon={action.icon}
                      tooltip={
                        /* eslint-disable indent */
                        !isNil(action.tooltip)
                          ? typeof action.tooltip === "string"
                            ? {
                                title: action.tooltip,
                                placement: "bottom",
                                overlayClassName: classNames({ disabled: action.disabled === true })
                              }
                            : {
                                placement: "bottom",
                                ...action.tooltip,
                                overlayClassName: classNames(
                                  { disabled: action.disabled === true },
                                  action.tooltip.overlayClassName
                                )
                              }
                          : {}
                      }
                    />
                  );
                }
              )}
            </div>
          )}
          <ShowHide show={canSearch}>
            <Input
              placeholder={"Search Rows"}
              value={search}
              allowClear={true}
              prefix={<FontAwesomeIcon className={"icon"} icon={faSearch} />}
              style={{ maxWidth: 300, minWidth: 100 }}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                !isNil(onSearch) && onSearch(event.target.value)
              }
            />
          </ShowHide>
        </div>
        <div className={"table-header-right"}>
          {!isNil(saving) && <SavingChanges saving={saving} />}
          <ShowHide show={canToggleColumns}>
            <FieldsDropdown
              fields={map(columns, (col: ColDef): FieldMenuField => {
                return {
                  id: col.field as string,
                  label: col.headerName as string,
                  defaultChecked: true
                };
              })}
              buttonProps={{ style: { minWidth: 90 } }}
              onChange={(fields: Field[]) => onColumnsChange(fields)}
            >
              {"Columns"}
            </FieldsDropdown>
          </ShowHide>
          <ShowHide show={canExport}>
            <FieldsDropdown
              fields={map(columns, (col: ColDef): FieldMenuField => {
                return {
                  id: col.field as string,
                  label: col.headerName as string,
                  defaultChecked: true
                };
              })}
              buttons={[
                {
                  onClick: (fields: Field[]) => onExport(fields),
                  text: "Download",
                  className: "btn--primary"
                }
              ]}
              buttonProps={{ style: { minWidth: 90 } }}
            >
              {"Export"}
            </FieldsDropdown>
          </ShowHide>
        </div>
      </div>
    </PortalOrRender>
  );
};

export default BudgetTableMenu;
