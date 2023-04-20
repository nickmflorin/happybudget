export type ModelSelectionMode = "single" | "multiple";

export type MenuItemSelectedState = {
  readonly selected: boolean;
};

export type MenuItemStateWithModel<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>,
> = S & {
  readonly model: M;
};

export type MenuExtraItemClickEvent = {
  readonly searchValue: string;
  readonly event: Table.CellDoneEditingEvent;
  readonly closeParentDropdown: (() => void) | undefined;
};

export type MenuButtonClickEvent<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>,
> = {
  readonly menuState: MenuItemStateWithModel<S, M>[];
  readonly event: React.MouseEvent<HTMLButtonElement>;
};

export type IMenuItemRef<S extends Record<string, unknown> = MenuItemSelectedState> = {
  readonly closeParentDropdown: (() => void) | undefined;
  readonly setLoading: (v: boolean) => void;
  readonly performClick: (e: Table.CellDoneEditingEvent) => void;
  readonly getState: () => S;
};

export type MenuItemModelClickEvent<S extends Record<string, unknown> = MenuItemSelectedState> = {
  readonly state: S;
  readonly event: Table.CellDoneEditingEvent;
  readonly item: Omit<IMenuItemRef<S>, "performClick">;
};

type InferStateFromModel<M> = M extends MenuItemModel<infer S> ? S : never;

export type MenuChangeEvent<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>,
> = MenuItemModelClickEvent<S> & {
  readonly model: M;
  readonly menuState: MenuItemStateWithModel<S, M>[];
  readonly menu: IMenuRef<S, M>;
};

export type BaseMenuItemModel = Model.Model & {
  readonly label?: string | number | null;
  readonly icon?: IconOrElement;
  readonly loading?: boolean;
  readonly url?: string;
  readonly visible?: boolean;
  readonly disabled?: boolean;
  readonly defaultFocused?: boolean;
  readonly keepDropdownOpenOnClick?: boolean;
  readonly renderContent?: () => JSX.Element;
};

export type MenuItemModel<S extends Record<string, unknown> = MenuItemSelectedState> =
  BaseMenuItemModel & {
    readonly onClick?: (e: MenuItemModelClickEvent<S>) => void;
  };

export type ExtraMenuItemModel = BaseMenuItemModel & {
  readonly showOnNoSearchResults?: boolean;
  readonly focusOnNoSearchResults?: boolean;
  readonly leaveAtBottom?: boolean;
  readonly showOnNoData?: boolean;
  readonly focusOnNoData?: boolean;
  readonly onClick?: (e: MenuExtraItemClickEvent) => void;
};

export interface IMenuButton<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>,
> {
  readonly label: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly onClick?: (e: MenuButtonClickEvent<S, M>) => void;
  readonly keepDropdownOpenOnClick?: boolean;
}

export type IMenuRef<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>,
> = {
  readonly setItemLoading: (id: M["id"], v: boolean) => void;
  readonly getState: () => S[];
  readonly getSearchValue: () => string;
  readonly incrementFocusedIndex: () => void;
  readonly decrementFocusedIndex: () => void;
  readonly getModelAtFocusedIndex: () => M | null;
  readonly performActionAtFocusedIndex: (e: KeyboardEvent) => void;
  readonly focus: (value: boolean) => void;
  readonly focusSearch: (value: boolean, search?: string) => void;
};

export type IMenu<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>,
> = StandardComponentProps & {
  readonly models: M[];
  readonly checkbox?: boolean;
  readonly selected?: ID[] | null | undefined | ID;
  readonly mode?: ModelSelectionMode;
  readonly defaultSelected?: ID[] | ID;
  readonly itemProps?: StandardComponentProps;
  readonly loading?: boolean;
  readonly search?: string;
  readonly includeSearch?: boolean;
  readonly clientSearching?: boolean;
  readonly focusSearchOnCharPress?: boolean;
  readonly searchPlaceholder?: string;
  readonly buttons?: IMenuButton<S, M>[];
  readonly searchIndices?: SearchIndicies | undefined;
  readonly extra?: ExtraMenuItemModel[];
  readonly keepDropdownOpenOnClick?: boolean;
  readonly menu?: NonNullRef<IMenuRef<S, M>>;
  readonly setFocusedFromSelectedState?: boolean;
  readonly getModelIdentifier?: (m: M) => ID;
  readonly getItemState?: (m: M) => S;
  readonly getItemLabel?: (m: M, s: S) => string;
  readonly onChange?: (e: MenuChangeEvent<S, M>) => void;
  readonly onSearch?: (value: string) => void;
  readonly renderItemContent?: (model: M, s: S) => JSX.Element;
  readonly itemIconAfterLabel?: (model: M, s: S) => JSX.Element;
  readonly closeParentDropdown?: () => void;
};

type OrderingMenuModel<F extends string = string> = {
  readonly id: F;
  readonly label: string;
  readonly icon: IconOrElement;
};

type OrderingMenuItemState = {
  readonly order: Http.Order;
};

export interface ContentMenuInstance extends UINotificationsManager {
  readonly setLoading: (value: boolean) => void;
  readonly loading: boolean | undefined;
}
