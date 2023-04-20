import { isNil } from "lodash";

import { util } from "lib";
import { DefaultButton } from "components/buttonsOld";
import {
  ExportCSVDropdownMenu,
  ToggleColumnsDropdownMenu,
  ShareDropdownMenu,
} from "deprecated/components/dropdowns";
import { ShareDropdownMenuProps } from "deprecated/components/dropdowns/ShareDropdownMenu";

export const ExportPdfAction = (onExport: () => void): Table.MenuActionObj => ({
  icon: "print",
  label: "Export PDF",
  onClick: () => onExport(),
});

export const ExportCSVAction = <
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
>(
  table: Table.TableInstance<R, M>,
  params: Table.PublicMenuActionParams<R, M>,
  exportFileName: string,
): Table.MenuActionObj => ({
  label: "Export CSV",
  icon: "file-csv",
  wrapInDropdown: (children: React.ReactChild | React.ReactChild[]) => (
    <ExportCSVDropdownMenu<R, M>
      columns={params.columns}
      hiddenColumns={params.hiddenColumns}
      onDownload={(ids: string[]) => {
        if (ids.length !== 0) {
          const csvData = table.getCSVData(ids);
          util.files.downloadAsCsvFile(exportFileName, csvData);
        }
      }}
    >
      {children}
    </ExportCSVDropdownMenu>
  ),
});

export const ToggleColumnAction = <
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
>(
  table: Table.TableInstance<R, M>,
  params: Table.PublicMenuActionParams<R, M>,
): Table.MenuActionObj => ({
  label: "Columns",
  icon: "line-columns",
  wrapInDropdown: (children: React.ReactChild | React.ReactChild[]) => (
    <ToggleColumnsDropdownMenu
      hiddenColumns={params.hiddenColumns}
      columns={params.columns}
      onChange={(field: string, visible: boolean) => {
        table.changeColumnVisibility({
          field,
          visible,
        });
      }}
    >
      {children}
    </ToggleColumnsDropdownMenu>
  ),
});

export const CollaboratorsAction = (
  action: Omit<Partial<Table.MenuActionObj>, "render">,
): Table.MenuActionObj => ({
  ...action,
  render: () => (
    <DefaultButton medium icon="user-group" onClick={action.onClick}>
      Collaborators
    </DefaultButton>
  ),
});

export const ShareAction = <
  B extends Model.PublicHttpModel,
  R extends Table.RowData,
  M extends model.RowTypedApiModel,
>(
  config: Table.ShareConfig<B, R, M>,
): Table.MenuActionObj => {
  const instance: B = config.instance;

  let props: Omit<ShareDropdownMenuProps<B, R, M>, "children"> = {
    urlFormatter: (tokenId: string) => `/pub/${tokenId}/budgets/${config.instance.id}`,
    instance: config.instance,
    onCreateTokenSuccess: config.onCreated,
    onEditTokenSuccess: config.onUpdated,
    onTokenDeleted: config.onDeleted,
    table: config.table,
    placement: "bottomRight",
    services: { create: config.create },
  };

  const publicToken = instance.public_token;
  if (!isNil(publicToken) && !publicToken.is_expired) {
    props = { ...props, publicToken };
  }
  return {
    label: "Share",
    icon: "cloud",
    active: !isNil(publicToken) && !publicToken.is_expired,
    wrapInDropdown: (children: React.ReactChild | React.ReactChild[]) => (
      <ShareDropdownMenu {...props}>{children}</ShareDropdownMenu>
    ),
  };
};
