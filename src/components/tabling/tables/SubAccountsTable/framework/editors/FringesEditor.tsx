import { forwardRef, ForwardedRef } from "react";
import { useSelector } from "react-redux";
import { isNil, filter, map } from "lodash";

import { Icon } from "components";
import { ModelTagsMenu } from "components/menus";
import { framework } from "components/tabling/generic";

export interface FringesEditorProps
  extends Table.EditorParams<Tables.SubAccountRowData, Model.SubAccount, Tables.SubAccountTableStore> {
  readonly onAddFringes: () => void;
  readonly colId: keyof Tables.SubAccountRowData;
}

const FringesEditor = (props: FringesEditorProps, ref: ForwardedRef<any>) => {
  const fringes = useSelector((state: Application.Store) => props.selector(state).fringes.data);
  const [editor] = framework.editors.useModelMenuEditor<
    Tables.FringeRow,
    ID[],
    Tables.SubAccountRowData,
    Model.SubAccount,
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
      selected={editor.value}
      models={filter(fringes, (fringe: Tables.FringeRow) => !isNil(fringe.name) && fringe.name.trim() !== "")}
      onChange={(e: MenuChangeEvent<Tables.FringeRow>) => {
        const selectedStates = filter(
          e.state,
          (s: IMenuItemState<Tables.FringeRow>) => s.selected === true
        ) as IMenuItemState<Tables.FringeRow>[];
        const ms = map(selectedStates, (s: IMenuItemState<Tables.FringeRow>) => s.model.id);
        editor.onChange(ms, e.event, false);
      }}
      searchIndices={["name"]}
      focusSearchOnCharPress={true}
      defaultFocusOnlyItem={true}
      defaultFocusFirstItem={true}
      autoFocusMenu={true}
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
