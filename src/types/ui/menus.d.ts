type MenuMode = "single" | "multiple";

type IMenuItemState<M extends MenuItemModel> = {
  readonly model: M;
  readonly selected: boolean;
};

type MenuItemClickEvent<M extends MenuItemModel> = {
  readonly model: M;
  readonly event: Table.CellDoneEditingEvent;
  readonly closeParentDropdown: (() => void) | undefined;
};

type MenuChangeEvent<M extends MenuItemModel> = MenuItemClickEvent<M> & {
  readonly selected: boolean;
  readonly state: IMenuItemState<M>[];
};

type MenuButtonClickEvent<M extends MenuItemModel> = {
  readonly state: IMenuItemState<M>[];
};

type MenuItemModel = Model.Model & {
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

type ExtraMenuItemModel = MenuItemModel & {
  readonly showOnNoSearchResults?: boolean;
  readonly focusOnNoSearchResults?: boolean;
  readonly leaveAtBottom?: boolean;
  readonly showOnNoData?: boolean;
  readonly focusOnNoData?: boolean;
};

interface ICommonMenuItem<M extends MenuItemModel> extends Omit<StandardComponentProps, "id"> {
  readonly model: M;
  readonly menuId: string;
  readonly focused: boolean;
  readonly keepDropdownOpenOnClick?: boolean;
  readonly onClick?: (params: MenuItemClickEvent<M>) => void;
  readonly closeParentDropdown?: () => void;
}

interface IMenuItem<M extends MenuItemModel> extends StandardComponentProps, ICommonMenuItem<M> {
  readonly level: number;
  readonly selected: boolean;
  readonly checkbox?: boolean;
  readonly getLabel?: (m: M) => string;
  readonly renderContent?: (model: M, context: { level: number }) => JSX.Element;
}

type IExtraMenuItem = Omit<StandardComponentProps, "id"> & ICommonMenuItem<ExtraMenuItemModel>;

type IMenu<M extends MenuItemModel> = StandardComponentProps & {
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
  readonly renderItemContent?: (model: M, context: { level: number }) => JSX.Element;
  readonly closeParentDropdown?: () => void;
};

interface IMenuItems<M extends MenuItemModel> extends Omit<IMenuItem<M>, "selected" | "focused" | "model"> {
  readonly models: M[];
  readonly selected?: ID[];
  readonly checkbox?: boolean;
  readonly itemProps?: Omit<StandardComponentProps, "id">;
  readonly getLabel?: (m: M) => string;
  readonly isFocused: (m: M) => boolean;
  readonly onClick?: (params: MenuItemClickEvent<M>) => void;
  readonly closeParentDropdown?: () => void;
}

type IMenuRef<M extends MenuItemModel> = {
  readonly getState: () => IMenuItemState<M>[];
  readonly getSearchValue: () => string;
  readonly incrementFocusedIndex: () => void;
  readonly decrementFocusedIndex: () => void;
  readonly getModelAtFocusedIndex: () => M | null;
  readonly performActionAtFocusedIndex: (e: KeyboardEvent) => void;
  readonly focus: (value: boolean) => void;
  readonly focusSearch: (value: boolean, search?: string) => void;
};

interface IMenuButton<M extends MenuItemModel> {
  readonly label: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly onClick?: (state: MenuButtonClickEvent<M>) => void;
  readonly keepDropdownOpenOnClick?: boolean;
}
