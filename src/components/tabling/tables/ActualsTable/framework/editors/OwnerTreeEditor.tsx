import { forwardRef, ForwardedRef } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { OwnerTreeMenu } from "components/menus";
import { framework } from "components/tabling/generic";

interface OwnerTreeEditorProps
  extends Table.EditorParams<Tables.ActualRowData, Model.Actual, Tables.ActualTableStore, Model.SimpleSubAccount> {
  readonly setSearch: (value: string) => void;
}

const OwnerTreeEditor = ({ setSearch, ...props }: OwnerTreeEditorProps, ref: ForwardedRef<any>) => {
  const tree = useSelector((state: Application.Authenticated.Store) => props.selector(state).ownerTree.data);
  const search = useSelector((state: Application.Authenticated.Store) => props.selector(state).ownerTree.search);
  const loading = useSelector((state: Application.Authenticated.Store) => props.selector(state).ownerTree.loading);

  const [editor] = framework.editors.useModelMenuEditor<
    Model.SimpleSubAccount | Model.SimpleMarkup,
    Model.SimpleSubAccount | Model.SimpleMarkup,
    Tables.ActualRowData,
    Model.Actual,
    Tables.ActualTableStore
  >({
    ...props,
    forwardedRef: ref
  });

  return (
    <OwnerTreeMenu
      style={{ minWidth: 200, maxWidth: 300 }}
      loading={loading}
      onSearch={(v: string) => setSearch(v)}
      search={search}
      selected={!isNil(editor.value) ? `${editor.value.type}-${editor.value.id}` : null}
      nodes={tree}
      includeSearch={true}
      onChange={(m: Model.SimpleSubAccount | Model.SimpleMarkup, e: Table.CellDoneEditingEvent) => {
        editor.onChange(m, e);
      }}
      menu={editor.menu as NonNullRef<IMenuRef<Model.OwnerTreeNode>>}
      focusSearchOnCharPress={true}
    />
  );
};

export default forwardRef(OwnerTreeEditor);
