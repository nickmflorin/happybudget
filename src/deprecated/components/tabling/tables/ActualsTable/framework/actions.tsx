import * as api from "api";
import * as config from "application/config";
import { model } from "lib";
import { Icon } from "components";
import { ImportActualsDropdownMenu } from "deprecated/components/dropdowns";
import { ImportActualsMenuItemModel } from "deprecated/components/dropdowns/ImportActualsDropdownMenu";

type ImportActualsActionProps<
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = {
  readonly table: Table.TableInstance<R, M>;
  readonly onLinkToken: (linkToken: string) => void;
};

export const ImportActualsAction = <
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
>(
  props: ImportActualsActionProps<R, M>,
): Table.MenuActionObj => ({
  label: "Sources",
  icon: <Icon icon="infinity" weight="solid" />,
  hidden: !config.env.PLAID_ENABLED,
  wrapInDropdown: (children: React.ReactChild | React.ReactChild[]) => (
    <ImportActualsDropdownMenu
      onChange={(
        m: Model.ActualImportSource,
        menu: IMenuRef<MenuItemSelectedState, ImportActualsMenuItemModel>,
      ) => {
        if (m.id === model.budgeting.ActualImportSources.bank_account.id) {
          menu.setItemLoading(m.id, true);
          api
            .createPlaidLinkToken()
            .then((response: { link_token: string }) => {
              menu.setItemLoading(m.id, false);
              props.onLinkToken(response.link_token);
            })
            .catch((e: Error) => {
              menu.setItemLoading(m.id, false);
              props.table.handleRequestError(e);
            });
        } else {
          console.warn(`Detected unconfigured import source ${String(m.id)}.`);
        }
      }}
    >
      {children}
    </ImportActualsDropdownMenu>
  ),
});
