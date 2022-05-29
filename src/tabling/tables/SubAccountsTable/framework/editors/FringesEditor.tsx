import { forwardRef, ForwardedRef } from "react";
import { useSelector } from "react-redux";
import { isNil, filter, map } from "lodash";

import * as selectors from "app/Budgeting/store/selectors";
import { tabling } from "lib";

import { Icon } from "components";
import { ModelTagsMenu } from "components/menus";
import { framework } from "tabling/generic";

export interface FringesEditorProps<B extends Model.Budget | Model.Template, P extends Model.Account | Model.SubAccount>
  extends Table.EditorProps<
    Tables.SubAccountRowData,
    Model.SubAccount,
    SubAccountsTableContext<B, P, false>,
    Tables.SubAccountTableStore
  > {
  readonly onAddFringes: () => void;
  readonly colId: keyof Tables.SubAccountRowData;
}

const FringesEditor = <B extends Model.Budget | Model.Template, P extends Model.Account | Model.SubAccount>(
  props: FringesEditorProps<B, P>,
  ref: ForwardedRef<Table.AgEditorRef<number[]>>
) => {
  const fringes: Table.BodyRow<Tables.FringeRowData>[] = useSelector((state: Application.Store) =>
    selectors.selectFringes(state, props.tableContext)
  );
  const [editor] = framework.editors.useModelMenuEditor<
    number[],
    Tables.FringeRow,
    Tables.SubAccountRowData,
    Model.SubAccount,
    SubAccountsTableContext<B, P, false>,
    Tables.SubAccountTableStore
  >({
    ...props,
    forwardedRef: ref
  });

  return (
    <ModelTagsMenu<Tables.FringeRow>
      style={{ minWidth: 220 }}
      checkbox={true}
      mode={"multiple"}
      menu={editor.menu}
      includeSearch={true}
      clientSearching={true}
      selected={editor.value}
      models={
        filter(
          fringes,
          (fringe: Table.BodyRow<Tables.FringeRowData>) =>
            tabling.rows.isModelRow(fringe) && !isNil(fringe.data.name) && fringe.data.name.trim() !== ""
        ) as Tables.FringeRow[]
      }
      tagProps={{
        getModelColor: (m: Tables.FringeRow) => m.data.color,
        getModelText: (m: Tables.FringeRow) => m.data.name
      }}
      onChange={(e: MenuChangeEvent<MenuItemSelectedState, Tables.FringeRow>) => {
        const selectedStates = filter(
          e.menuState,
          (s: MenuItemStateWithModel<MenuItemSelectedState, Tables.FringeRow>) => s.selected === true
        );
        const ms = map(
          selectedStates,
          (s: MenuItemStateWithModel<MenuItemSelectedState, Tables.FringeRow>) => s.model.id
        );
        editor.onChange(ms, e.event, false);
      }}
      searchIndices={[["data", "name"]]}
      focusSearchOnCharPress={true}
      extra={[
        {
          id: "add-fringes",
          onClick: () => props.onAddFringes(),
          label: "Add Fringes",
          icon: <Icon icon={"plus-circle"} weight={"solid"} green={true} />,
          showOnNoSearchResults: true,
          showOnNoData: true,
          focusOnNoSearchResults: true,
          focusOnNoData: true,
          leaveAtBottom: true
        }
      ]}
    />
  );
};

export default forwardRef(FringesEditor);
