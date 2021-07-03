import { Ref, ReactNode, SyntheticEvent } from "react";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

export type ModelMenuRef<M extends Model.M> = {
  readonly incrementFocusedIndex: () => void;
  readonly decrementFocusedIndex: () => void;
  readonly focus: (value: boolean) => void;
  readonly getModelAtFocusedIndex: () => M | null;
  readonly performActionAtFocusedIndex: () => void;
  readonly focused: boolean;
};

export type EmptyItem = {
  readonly onClick?: (event: SyntheticEvent | KeyboardEvent) => void;
  readonly text: string;
  readonly icon?: JSX.Element;
  readonly defaultFocus?: boolean;
};

interface _ModelMenuProps<M extends Model.M> extends StandardComponentProps {
  readonly loading?: boolean;
  readonly models: M[];
  readonly uppercase?: boolean;
  readonly selected?: number | number[] | string | string[] | null;
  readonly search?: string;
  readonly fillWidth?: boolean;
  readonly menuRef?: Ref<ModelMenuRef<M>>;
  readonly highlightActive?: boolean;
  readonly itemProps?: any;
  readonly levelIndent?: number;
  readonly clientSearching?: boolean;
  readonly defaultFocusFirstItem?: boolean;
  readonly defaultFocusOnlyItem?: boolean;
  readonly defaultFocusOnlyItemOnSearch?: boolean;
  readonly searchIndices?: (string[] | string)[] | undefined;
  readonly visible?: number[];
  readonly hidden?: number[];
  readonly bottomItem?: Omit<EmptyItem, "defaultFocus">;
  readonly onNoData?: EmptyItem;
  readonly onNoSearchResults?: EmptyItem;
  readonly autoFocus?: boolean;
  readonly leftAlign?: boolean;
  readonly bordersForLevels?: boolean;
  readonly getFirstSearchResult?: (models: M[]) => M | null;
  readonly renderItem: (model: M, context: { level: number; index: number }) => JSX.Element;
  readonly onFocusCallback?: (focused: boolean) => void;
}

interface SingleModelMenuProps<M extends Model.M> {
  readonly onChange: (model: M, e: SyntheticEvent | KeyboardEvent | CheckboxChangeEvent) => void;
  readonly multiple?: false;
}

interface MultipleModelMenuProps<M extends Model.M> {
  readonly onChange: (models: M[], e: SyntheticEvent | KeyboardEvent | CheckboxChangeEvent) => void;
  readonly multiple: true;
  readonly checkbox?: boolean;
}

export interface ModelMenuItemProps<M extends Model.M> {
  readonly menuId: number;
  readonly model: M;
  readonly selected: (number | string)[];
  readonly checkbox: boolean;
  readonly focusedIndex: number | null;
  readonly level: number;
  readonly levelIndent?: number;
  readonly multiple: boolean;
  readonly highlightActive: boolean | undefined;
  readonly leftAlign: boolean | undefined;
  readonly hidden: (string | number)[] | undefined;
  readonly visible: (string | number)[] | undefined;
  readonly indexMap: { [key: string]: number };
  readonly itemProps?: any;
  readonly bordersForLevels?: boolean;
  // This is intentionally not named onClick because it conflicts with AntD's mechanics.
  readonly onPress: (model: M, e: SyntheticEvent) => void;
  readonly onSelect: (model: M, e: CheckboxChangeEvent) => void;
  readonly onDeselect: (model: M, e: CheckboxChangeEvent) => void;
  readonly renderItem: (model: M, context: { level: number; index: number }) => JSX.Element;
}

export interface ModelMenuItemsProps<M extends Model.M> extends Omit<ModelMenuItemProps<M>, "model"> {
  readonly models: M[];
}

export const isMultipleModelMenuProps = <M extends Model.M>(
  data: ModelMenuProps<M>
): data is MultipleModelMenuProps<M> & _ModelMenuProps<M> => {
  return (data as MultipleModelMenuProps<M> & _ModelMenuProps<M>).multiple === true;
};

export type ModelMenuProps<M extends Model.M> = _ModelMenuProps<M> &
  (MultipleModelMenuProps<M> | SingleModelMenuProps<M>);

interface _ModelTagsMenuProps<M extends Model.M> extends Omit<_ModelMenuProps<M>, "renderItem"> {
  readonly modelTextField?: keyof M & string;
  readonly modelColorField?: keyof M & string;
  readonly tagProps?: any;
}

export type ModelTagsMenuProps<M extends Model.M> = _ModelTagsMenuProps<M> &
  (MultipleModelMenuProps<M> | SingleModelMenuProps<M>);

export type ExpandedModelMenuRef<M extends Model.M> = {
  readonly focusSearch: (value: boolean, search?: string) => void;
  readonly incrementMenuFocusedIndex: () => void;
  readonly decrementMenuFocusedIndex: () => void;
  readonly focusMenu: (value: boolean) => void;
  readonly getModelAtMenuFocusedIndex: () => M | null;
  readonly performActionAtMenuFocusedIndex: (e: KeyboardEvent) => void;
  readonly menuFocused: boolean;
};

interface _ExpandedModelMenuProps<M extends Model.M>
  extends Omit<_ModelMenuProps<M>, "menuRef" | "loading" | "onFocusCallback" | "autoFocus"> {
  readonly menuLoading?: boolean;
  readonly menuProps?: StandardComponentProps;
  readonly menuRef?: Ref<ExpandedModelMenuRef<M>>;
  readonly focusSearchOnCharPress?: boolean;
  readonly searchPlaceholder?: string;
  readonly children?: ReactNode;
  readonly autoFocusMenu?: boolean;
  readonly unfocusMenuOnSearchFocus?: boolean;
  readonly bordersForLevels?: boolean;
  readonly onSearch?: (value: string) => void;
}

export type ExpandedModelMenuProps<M extends Model.M> = _ExpandedModelMenuProps<M> &
  (MultipleModelMenuProps<M> | SingleModelMenuProps<M>);

interface _ExpandedModelTagsMenuProps<M extends Model.M> extends Omit<_ExpandedModelMenuProps<M>, "renderItem"> {
  readonly modelTextField?: keyof M & string;
  readonly modelColorField?: keyof M & string;
  readonly tagProps?: any;
}

export type ExpandedModelTagsMenuProps<M extends Model.M> = _ExpandedModelTagsMenuProps<M> &
  (MultipleModelMenuProps<M> | SingleModelMenuProps<M>);

export interface SubAccountTreeMenuProps
  extends Omit<
    ExpandedModelMenuProps<Model.SubAccountTreeNode>,
    "renderItem" | "models" | "multiple" | "onChange" | "selected"
  > {
  readonly nodes: Model.Tree;
  readonly onChange: (m: Model.SimpleSubAccount, e: SyntheticEvent | KeyboardEvent | CheckboxChangeEvent) => void;
  readonly onSearch: (value: string) => void;
  readonly search: string;
  readonly childrenDefaultVisible?: boolean;
  readonly selected: { id: number; type: "subaccount" | "account" } | null;
}
