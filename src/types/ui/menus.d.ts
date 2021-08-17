type MenuItemId = string | number;
type MenuMode = "single" | "multiple";

type IMenuItemState<M extends MenuItemModel> = {
  readonly model: M;
  readonly selected: boolean;
}

type MenuItemClickEvent<M extends MenuItemModel> = {
  readonly model: M;
  readonly event: Table.CellDoneEditingEvent;
  readonly closeParentDropdown: (() => void) | undefined;
}

type MenuChangeEvent<M extends MenuItemModel> = MenuItemClickEvent<M> & {
  readonly selected: boolean;
  readonly state: IMenuItemState<M>[];
}

type MenuButtonClickEvent<M extends MenuItemModel> = {
  readonly state: IMenuItemState<M>[];
}

type MenuItemModel = Model.M & {
  readonly label?: string;
  readonly icon?: IconOrElement;
  readonly loading?: boolean;
  readonly url?: string;
  readonly visible?: boolean;
  readonly disabled?: boolean;
  readonly onClick?: (params: MenuItemClickEvent<this>) => void;
  readonly keepDropdownOpenOnClick?: boolean;
  readonly render?: () => ReactNode;
}

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
  readonly onClick?: (params: MenuItemClickEvent<M>) => void;
  readonly closeParentDropdown?: () => void;
}

interface IMenuItem<M extends MenuItemModel> extends Omit<StandardComponentProps, "id">, ICommonMenuItem<M> {
  readonly level: number;
  readonly selected: boolean;
  readonly checkbox?: boolean;
  readonly levelIndent?: number;
  readonly bordersForLevels?: boolean;
  readonly renderContent: (model: M, context: { level: number }) => JSX.Element;
}

type IExtraMenuItem = Omit<StandardComponentProps, "id"> & ICommonMenuItem<ExtraMenuItemModel>;

type IMenu<M extends MenuItemModel> = StandardComponentProps & {
  readonly models: M[];
  readonly checkbox?: boolean;
  readonly selected?: MenuItemId[] | null | undefined | MenuItemId;
  readonly mode?: MenuMode;
  readonly defaultSelected?: MenuItemId[] | MenuItemId;
  readonly itemProps?: StandardComponentProps;
  readonly levelIndent?: number;
  readonly loading?: boolean;
  readonly search?: string;
  readonly includeSearch?: boolean;
  readonly clientSearching?: boolean;
  readonly focusSearchOnCharPress?: boolean;
  readonly searchPlaceholder?: string;
  readonly autoFocusMenu?: boolean;
  readonly unfocusMenuOnSearchFocus?: boolean;
  readonly buttons?: IMenuButton<M>[];
  readonly defaultFocusFirstItem?: boolean;
  readonly defaultFocusOnlyItem?: boolean;
  readonly defaultFocusOnlyItemOnSearch?: boolean;
  readonly searchIndices?: SearchIndicies | undefined;
  readonly extra?: ExtraMenuItemModel[];
  readonly unfocusMenuOnSearchFocus?: boolean;
  readonly bordersForLevels?: boolean;
  readonly onChange?: (params: MenuChangeEvent<M>) => void;
  readonly onSearch?: (value: string) => void;
  readonly getFirstSearchResult?: (models: M[]) => M | null;
  readonly onFocusCallback?: (focused: boolean) => void;
  readonly renderItemContent?: (model: M, context: { level: number }) => JSX.Element;
  readonly closeParentDropdown?: () => void;
};

interface IMenuItems<M extends MenuItemModel> extends Omit<IMenuItem, "selected" | "focused"> {
  readonly selected?: MenuItemId[];
  readonly focusedIndex: number | null;
  readonly checkbox?: boolean;
  readonly indexMap: {[key in MenuItemId]: number};
  readonly itemProps?: Omit<StandardComponentProps, "id">;
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
  readonly focusSearch: (value: boolean, search?: string) => void;
  readonly focusMenu: (value: boolean) => void;
}

interface IMenuButton<M extends MenuItemModel> {
  readonly label: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly onClick?: (state: MenuButtonClickEvent<M>) => void;
  readonly keepDropdownOpenOnClick?: boolean;
}
