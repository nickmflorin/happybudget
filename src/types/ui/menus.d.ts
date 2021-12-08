declare type MenuMode = "single" | "multiple";

declare type IMenuItemState<M extends MenuItemModel> = {
  readonly model: M;
  readonly selected: boolean;
};

declare type MenuItemClickEvent<M extends MenuItemModel> = {
  readonly model: M;
  readonly event: Table.CellDoneEditingEvent;
  readonly closeParentDropdown: (() => void) | undefined;
};

declare type MenuChangeEvent<M extends MenuItemModel> = MenuItemClickEvent<M> & {
  readonly selected: boolean;
  readonly state: IMenuItemState<M>[];
};

declare type MenuButtonClickEvent<M extends MenuItemModel> = {
  readonly state: IMenuItemState<M>[];
};

declare type MenuItemModel = Model.Model & {
  readonly label?: string | number | null;
  readonly icon?: IconOrElement;
  readonly loading?: boolean;
  readonly url?: string;
  readonly visible?: boolean;
  readonly disabled?: boolean;
  readonly keepDropdownOpenOnClick?: boolean;
  readonly onClick?: (params: MenuItemClickEvent<MenuItemModel>) => void;
  readonly render?: () => import("react").ReactNode;
};

declare type ExtraMenuItemModel = MenuItemModel & {
  readonly showOnNoSearchResults?: boolean;
  readonly focusOnNoSearchResults?: boolean;
  readonly leaveAtBottom?: boolean;
  readonly showOnNoData?: boolean;
  readonly focusOnNoData?: boolean;
};

declare interface ICommonMenuItem<M extends MenuItemModel> extends Omit<StandardComponentProps, "id"> {
  readonly model: M;
  readonly menuId: string;
  readonly focused: boolean;
  readonly keepDropdownOpenOnClick?: boolean;
  readonly onClick?: (params: MenuItemClickEvent<M>) => void;
  readonly closeParentDropdown?: () => void;
}

declare interface IMenuItem<M extends MenuItemModel> extends StandardComponentProps, ICommonMenuItem<M> {
  readonly selected: boolean;
  readonly checkbox?: boolean;
  readonly getLabel?: (m: M) => string;
  readonly renderContent?: (model: M) => JSX.Element;
}

declare type IExtraMenuItem = Omit<StandardComponentProps, "id"> & ICommonMenuItem<ExtraMenuItemModel>;

declare type IMenu<M extends MenuItemModel> = StandardComponentProps & {
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
  readonly buttons?: IMenuButton<M>[];
  readonly searchIndices?: SearchIndicies | undefined;
  readonly extra?: ExtraMenuItemModel[];
  readonly keepDropdownOpenOnClick?: boolean;
  readonly getModelIdentifier?: (m: M) => ID;
  readonly getLabel?: (m: M) => string;
  readonly onChange?: (params: MenuChangeEvent<M>) => void;
  readonly onSearch?: (value: string) => void;
  readonly onFocusCallback?: (focused: boolean) => void;
  readonly renderItemContent?: (model: M) => JSX.Element;
  readonly closeParentDropdown?: () => void;
};

declare type IMenuRef<M extends MenuItemModel> = {
  readonly getState: () => IMenuItemState<M>[];
  readonly getSearchValue: () => string;
  readonly incrementFocusedIndex: () => void;
  readonly decrementFocusedIndex: () => void;
  readonly getModelAtFocusedIndex: () => M | null;
  readonly performActionAtFocusedIndex: (e: KeyboardEvent) => void;
  readonly focus: (value: boolean) => void;
  readonly focusSearch: (value: boolean, search?: string) => void;
};

declare interface IMenuButton<M extends MenuItemModel> {
  readonly label: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly onClick?: (state: MenuButtonClickEvent<M>) => void;
  readonly keepDropdownOpenOnClick?: boolean;
}
