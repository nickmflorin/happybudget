declare type MenuMode = "single" | "multiple";

declare type MenuItemSelectedState = {
  readonly selected: boolean;
};

declare type MenuItemStateWithModel<
  S extends object = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> = S & {
  readonly model: M;
};

declare type MenuExtraItemClickEvent = {
  readonly event: Table.CellDoneEditingEvent;
  readonly closeParentDropdown: (() => void) | undefined;
};

declare type MenuButtonClickEvent<
  S extends object = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> = {
  readonly menuState: MenuItemStateWithModel<S, M>[];
  readonly event: React.MouseEvent<HTMLButtonElement>;
};

declare type MenuItemModelClickEvent<S extends object = MenuItemSelectedState> = {
  readonly state: S;
  readonly event: Table.CellDoneEditingEvent;
  readonly closeParentDropdown: (() => void) | undefined;
};

declare type MenuItemClickEvent<
  S extends object = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> = MenuItemModelClickEvent<S> & {
  readonly model: M;
};

type InferStateFromModel<M> = M extends MenuItemModel<infer S> ? S : never;

declare type MenuChangeEvent<
  S extends object = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> = MenuItemClickEvent<S, M> & {
  readonly menuState: MenuItemStateWithModel<S, M>[];
};

declare type MenuItemModel<S extends object = MenuItemSelectedState> = Model.Model & {
  readonly label?: string | number | null;
  readonly icon?: IconOrElement;
  readonly loading?: boolean;
  readonly url?: string;
  readonly visible?: boolean;
  readonly disabled?: boolean;
  readonly keepDropdownOpenOnClick?: boolean;
  readonly onClick?: (e: MenuItemModelClickEvent<S>) => void;
};

declare type ExtraMenuItemModel = Omit<MenuItemModel, "onClick"> & {
  readonly showOnNoSearchResults?: boolean;
  readonly focusOnNoSearchResults?: boolean;
  readonly leaveAtBottom?: boolean;
  readonly showOnNoData?: boolean;
  readonly focusOnNoData?: boolean;
  readonly onClick?: (e: MenuExtraItemClickEvent) => void;
};

declare interface ICommonMenuItem<
  S extends object = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> extends Omit<StandardComponentProps, "id"> {
  readonly model: M;
  readonly menuId: string;
  readonly focused: boolean;
  readonly keepDropdownOpenOnClick?: boolean;
  readonly closeParentDropdown?: () => void;
  readonly onClick?: (e: Table.CellDoneEditingEvent) => void;
}

declare interface IMenuItem<S extends object = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>>
  extends StandardComponentProps,
    Omit<ICommonMenuItem<S, M>, "onClick"> {
  readonly checkbox?: boolean;
  readonly label?: string;
  readonly state: S;
  readonly getLabel?: (m: M, s: S) => string;
  readonly renderContent?: (model: M, s: S) => JSX.Element;
  readonly iconAfterLabel?: (model: M, s: S) => JSX.Element;
  readonly onClick?: (params: MenuItemClickEvent<S, M>) => void;
}

declare type IExtraMenuItem = Omit<StandardComponentProps, "id"> &
  Omit<ICommonMenuItem<ExtraMenuItemModel>, "onClick"> & {
    readonly onClick?: (e: MenuExtraItemClickEvent) => void;
  };

declare interface IMenuButton<S extends object = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>> {
  readonly label: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly onClick?: (e: MenuButtonClickEvent<S, M>) => void;
  readonly keepDropdownOpenOnClick?: boolean;
}

declare type IMenuRef<S extends object = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>> = {
  readonly getState: () => S[];
  readonly getSearchValue: () => string;
  readonly incrementFocusedIndex: () => void;
  readonly decrementFocusedIndex: () => void;
  readonly getModelAtFocusedIndex: () => M | null;
  readonly performActionAtFocusedIndex: (e: KeyboardEvent) => void;
  readonly focus: (value: boolean) => void;
  readonly focusSearch: (value: boolean, search?: string) => void;
};

declare type IMenu<
  S extends object = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> = StandardComponentProps & {
  readonly models: M[];
  readonly checkbox?: boolean;
  readonly selected?: ID[] | null | undefined | ID;
  readonly mode?: MenuMode;
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
  readonly getModelIdentifier?: (m: M) => ID;
  readonly getItemState?: (m: M) => S;
  readonly getItemLabel?: (m: M, s: S) => string;
  readonly onChange?: (e: MenuChangeEvent<S, M>) => void;
  readonly onSearch?: (value: string) => void;
  readonly onFocusCallback?: (focused: boolean) => void;
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
