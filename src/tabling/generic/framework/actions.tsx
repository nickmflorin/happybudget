import { isNil } from "lodash";

import { util } from "lib";
import { ShareButton } from "components/buttons";
import {
  ExportCSVDropdownMenu,
  ToggleColumnsDropdownMenu,
  CreatePublicTokenDropdown,
  EditPublicTokenDropdown
} from "components/dropdowns";

export const ExportPdfAction = (onExport: () => void): Table.MenuActionObj => ({
  icon: "print",
  label: "Export PDF",
  onClick: () => onExport()
});

export const ExportCSVAction = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  table: Table.TableInstance<R, M>,
  params: Table.PublicMenuActionParams<R, M>,
  exportFileName: string
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
  )
});

export const ToggleColumnAction = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  table: Table.TableInstance<R, M>,
  params: Table.PublicMenuActionParams<R, M>
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
          visible
        });
      }}
    >
      {children}
    </ToggleColumnsDropdownMenu>
  )
});

export const ShareAction = <B extends Model.PublicHttpModel>(config: Table.ShareConfig<B>): Table.MenuActionObj => {
  const instance: B = config.instance;
  const publicToken = instance.public_token;
  if (isNil(publicToken) || publicToken.is_expired) {
    return {
      location: "right",
      render: (props: Table.MenuActionRenderProps) => (
        <ShareButton {...props} className={"budget-table-menu"} sharing={false} />
      ),
      wrapInDropdown: (children: React.ReactChild | React.ReactChild[]) => (
        <CreatePublicTokenDropdown
          urlFormatter={(tokenId: string) => `/pub/${tokenId}/budgets/${config.instance.id}`}
          instance={config.instance}
          onSuccess={config.onCreated}
          services={{ create: config.create }}
          placement={"bottomRight"}
        >
          {children}
        </CreatePublicTokenDropdown>
      )
    };
  }
  return {
    location: "right",
    render: (props: Table.MenuActionRenderProps) => (
      <ShareButton {...props} className={"budget-table-menu"} sharing={true} />
    ),
    wrapInDropdown: (children: React.ReactChild | React.ReactChild[]) => (
      <EditPublicTokenDropdown
        urlFormatter={(tokenId: string) => `/pub/${tokenId}/budgets/${config.instance.id}`}
        placement={"bottomRight"}
        publicTokenId={publicToken.id}
        onSuccess={config.onUpdated}
        onDeleted={config.onDeleted}
      >
        {children}
      </EditPublicTokenDropdown>
    )
  };
};
