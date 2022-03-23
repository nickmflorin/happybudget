import { isNil } from "lodash";

import * as api from "api";
import { util, model } from "lib";

import {
  ExportCSVDropdownMenu,
  ToggleColumnsDropdownMenu,
  ShareDropdownMenu,
  ImportActualsDropdownMenu
} from "components/dropdowns";
import { ShareDropdownMenuProps } from "components/dropdowns/ShareDropdownMenu";

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

type ImportActualsActionProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly table: Table.TableInstance<R, M>;
  readonly onLinkToken: (linkToken: string) => void;
};

export const ImportActualsAction = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: ImportActualsActionProps<R, M>
): Table.MenuActionObj => ({
  label: "Sources",
  icon: "file-import",
  wrapInDropdown: (children: React.ReactChild | React.ReactChild[]) => (
    <ImportActualsDropdownMenu
      onChange={(m: Model.ActualImportSource) => {
        if (m.id === model.budgeting.ActualImportSources.Plaid.id) {
          /* NOTE: Ideally, we might want to show a loading indicator next to
					   the menu item in the menu - but we have not exposed functionality
						 on the menu to allow that yet. */
          props.table.notify({ message: "Connecting to Plaid.", closable: true, duration: 3000 });
          api
            .createPlaidLinkToken()
            .then((response: { link_token: string }) => {
              props.onLinkToken(response.link_token);
            })
            .catch((e: Error) => props.table.handleRequestError(e));
        } else {
          console.warn(`Detected unconfigured import source ${m.id}.`);
        }
      }}
    >
      {children}
    </ImportActualsDropdownMenu>
  )
});

export const ShareAction = <B extends Model.PublicHttpModel, R extends Table.RowData, M extends Model.RowHttpModel>(
  config: Table.ShareConfig<B, R, M>
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
    services: { create: config.create }
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
    )
  };
};
