import { Ref, ReactNode } from "react";

export type ModelMenuRef<M extends Model.M> = {
  readonly incrementFocusedIndex: () => void;
  readonly decrementFocusedIndex: () => void;
  readonly focus: (value: boolean) => void;
  readonly focusAtIndex: (index: number) => void;
  readonly getModelAtFocusedIndex: () => M | null;
  readonly performActionAtFocusedIndex: () => void;
  readonly focused: boolean;
  readonly focusedIndex: number | null;
  readonly allowableFocusedIndexRange: number;
};

export type EmptyItem = {
  readonly onClick?: () => void;
  readonly text: string;
  readonly icon?: JSX.Element;
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
  readonly renderItem: (model: M, context: { level: number; index: number }) => JSX.Element;
  readonly searchIndices?: (string[] | string)[] | undefined;
  readonly visible?: number[];
  readonly hidden?: number[];
  readonly emptyItem?: EmptyItem;
  readonly noSearchResultsItem?: EmptyItem;
}

interface SingleModelMenuProps<M extends Model.M> {
  readonly onChange: (model: M) => void;
  readonly multiple?: false;
}

interface MultipleModelMenuProps<M extends Model.M> {
  readonly onChange: (models: M[]) => void;
  readonly multiple: true;
  readonly checkbox?: boolean;
}

export interface ModelMenuItemProps<M extends Model.M> {
  readonly model: M;
  readonly selected: (number | string)[];
  readonly checkbox: boolean;
  readonly focused: boolean;
  readonly focusedIndex: number | null;
  readonly level: number;
  readonly levelIndent?: number;
  readonly multiple: boolean;
  readonly highlightActive: boolean | undefined;
  readonly hidden: (string | number)[] | undefined;
  readonly visible: (string | number)[] | undefined;
  readonly indexMap: { [key: string]: number };
  readonly itemProps?: any;
  readonly onClick: (model: M) => void;
  readonly onSelect: (model: M) => void;
  readonly onDeselect: (model: M) => void;
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
  readonly focusMenuAtIndex: (index: number) => void;
  readonly getModelAtMenuFocusedIndex: () => M | null;
  readonly performActionAtMenuFocusedIndex: () => void;
  readonly menuFocused: boolean;
  readonly menuFocusedIndex: number | null;
  readonly menuAllowableFocusedIndexRange: number;
};

interface _ExpandedModelMenuProps<M extends Model.M> extends Omit<_ModelMenuProps<M>, "menuRef" | "loading"> {
  readonly menuLoading?: boolean;
  readonly menuProps?: StandardComponentProps;
  readonly menuRef?: Ref<ExpandedModelMenuRef<M>>;
  readonly focusSearchOnCharPress?: boolean;
  readonly searchPlaceholder?: string;
  readonly children?: ReactNode;
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

export interface StringSubAccountNode extends Omit<Model.SimpleSubAccount, "id"> {
  readonly id: string;
  readonly originalId: number;
  readonly children: StringSubAccountNode[];
}
export interface StringAccountNode extends Omit<Model.SimpleAccount, "id"> {
  readonly id: string;
  readonly originalId: number;
  readonly children: StringSubAccountNode[];
}

export type BudgetItemMenuModel = StringSubAccountNode | StringAccountNode;

export interface BudgetItemTreeMenuProps
  extends Omit<
    ExpandedModelMenuProps<BudgetItemMenuModel>,
    "renderItem" | "models" | "multiple" | "onChange" | "selected"
  > {
  readonly nodes: Model.Tree;
  readonly onChange: (m: Model.SimpleAccount | Model.SimpleSubAccount) => void;
  readonly onSearch: (value: string) => void;
  readonly search: string;
  readonly childrenDefaultVisible?: boolean;
  readonly selected: { id: number; type: "subaccount" | "account" } | null;
}
