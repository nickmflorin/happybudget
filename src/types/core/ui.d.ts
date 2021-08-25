type ReactNode = import("react").ReactNode;

type PageAndSize = {
  page?: number;
  pageSize?: number;
};

type Breakpoint = 320 | 480 | 768 | 1024 | 1200 | 1580;
type BreakpointId = "small" | "medium" | "large" | "xl" | "xxl" | "xxxl";
type Breakpoints = Record<BreakpointId, Breakpoint>;

type Order = 1 | -1 | 0;
type DefinitiveOrder = 1 | -1;

type Ordering<T = string> = { [key: T]: Order };
type FieldOrder<T = string> = {
  field: T;
  order: DefinitiveOrder;
};
type FieldOrdering<T = string> = FieldOrder<T>[];

type LayoutClassNameParams = {
  "expanded-layout": boolean | undefined,
  "collapsed-layout": boolean | undefined,
  "sidebar-visible": boolean | undefined,
  "sidebar-hidden": boolean | undefined
}

type SearchIndex = string | string[];
type SearchIndicies = SearchIndex[];

type StandardComponentPropNames = "id" | "className" | "style";

interface StandardComponentProps {
  readonly id?: any;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

interface StandardComponentWithChildrenProps extends StandardComponentProps {
  readonly children: ReactNode;
}

interface StandardPdfComponentProps {
  readonly className?: string;
  readonly style?: import("@react-pdf/renderer").Styles;
  readonly debug?: boolean;
  readonly children?: ReactNode;
  readonly debug?: boolean;
  readonly fixed?: boolean;
  readonly wrap?: boolean;
}

type IconProp = import("@fortawesome/fontawesome-svg-core").IconName | [import("@fortawesome/fontawesome-svg-core").IconPrefix, import("@fortawesome/fontawesome-svg-core").IconName];
type IconWeight = "light" | "regular" | "solid";
type IconOrElement = IconProp | JSX.Element;

interface IIcon extends Omit<import("@fortawesome/react-fontawesome").FontAwesomeIconProps, "icon"> {
  readonly icon?: IconProp | undefined | null;
  readonly prefix?: import("@fortawesome/fontawesome-svg-core").IconPrefix;
  readonly green?: boolean;
  readonly weight?: IconWeight;
  readonly light?: boolean;
  readonly regular?: boolean;
  readonly solid?: boolean;
}

type PropsOf<T> = T extends React.ComponentType<infer Props> ? Props : never;

type RenderFunc = () => JSX.Element;

interface ISidebarItem {
  readonly icon?: IconOrElement | null | undefined;
  readonly activeIcon?: IconOrElement | null | undefined;
  readonly label?: string;
  readonly to?: string;
  readonly collapsed?: boolean;
  readonly active?: boolean;
  readonly hidden?: boolean;
  readonly separatorAfter?: boolean;
  readonly activePathRegexes?: RegExp[];
  readonly tooltip?: Tooltip;
  readonly onClick?: () => void;
  readonly onActivated?: () => void;
}

type MenuItemId = string | number;
type MenuMode = "single" | "multiple";

type IMenuItemState<M extends MenuItemModel> = {
  readonly model: M;
  readonly selected: boolean;
}

type MenuItemClickEvent<M extends MenuItemModel> = {
  readonly model: M;
  readonly event: Table.CellDoneEditingEvent;
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
  readonly keepDropdownOpenOnClick?: boolean;
  readonly onClick?: (e: Table.CellDoneEditingEvent) => void;
  readonly render?: () => ReactNode;
}

interface ILazyBreadCrumbItem {
  readonly requiredParams: string[];
  readonly func: (params: any) => IBreadCrumbItem | IBreadCrumbItem[];
}

interface IBreadCrumbItem extends Omit<MenuItemModel, "render"> {
  readonly tooltip?: Tooltip;
  readonly options?: MenuItemModel[];
  readonly primary?: boolean;
  readonly render?: () => React.ReactChild;
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
  readonly keepDropdownOpenOnClick?: boolean;
  readonly onClick?: (state: MenuButtonClickEvent<M>) => void;
}

/**
 * Represents the required data in it's most basic form that is used to create a Tag component.
 * This is meant to be used for creating MultipleTags components, when we want to provide the
 * data used to create the tags as a series of objects:
 *
 * <MultipleTags tags={[{ text: "foo", color: "red" }]} />
 */
interface ITag {
  readonly color?: string | undefined | null;
  readonly textColor?: string | undefined | null;
  readonly uppercase?: boolean;
  readonly text: string;
}

type PluralityWithModel<M extends Model.M = Model.M> = {
  readonly isPlural?: boolean;
  readonly model: M;
}

interface ITagRenderParams<S extends object = React.CSSProperties> {
  readonly className: string | undefined;
  readonly textClassName: string | undefined;
  readonly style: S | undefined;
  readonly textStyle: S | undefined;
  readonly color: string;
  readonly textColor: string;
  readonly uppercase: boolean;
  readonly fillWidth: boolean;
  readonly text: string;
  readonly contentRender: ((params: Omit<ITagRenderParams<S>, "contentRender">) => JSX.Element) | undefined
}

type TagProps<M extends Model.M = Model.M, S extends object = React.CSSProperties> = {
  readonly className?: string;
  readonly textClassName?: string;
  readonly style?: S;
  readonly textStyle?: S;
  readonly children?: string | M | null;
  readonly text?: string | null;
  readonly pluralText?: string | null;
  readonly textColor?: string;
  readonly color?: string;
  readonly model?: M | null;
  readonly isPlural?: boolean;
  readonly modelTextField?: keyof M;
  readonly modelColorField?: keyof M;
  readonly scheme?: string[];
  readonly uppercase?: boolean;
  readonly colorIndex?: number;
  readonly fillWidth?: boolean;
  // Used for custom rendering of the tag - mostly applicable for PDF purposes.
  readonly render?: (params: ITagRenderParams<S>) => JSX.Element;
  // Used for custom rendering of the tag content.
  readonly contentRender?: (params: Omit<ITagRenderParams<S>, "contentRender">) => JSX.Element;
}

type MultipleTagsProps<M extends Model.M = Model.M> = StandardComponentProps & {
  // <Tag> components should be generated based on a set of provided models M.
  readonly models?: (M | PluralityWithModel<M>)[];
  // <Tag> components are provided as children to the component:
  // <MultipleTags><Tag /><Tag /></MultipleTags>
  readonly children?: JSX.Element[];
  // <Tag> components should be generated based on a provided Array of objects (ITag), each of which
  // contains the properties necessary to create a <Tag> component.
  readonly tags?: ITag[];
  readonly tagProps?: Omit<TagProps<M>, "children" | "model" | "text">;
  // If the list of Models (M) or list of ITag objects or Array of Children <Tag> components is empty,
  // this will either render the component provided by onMissingList or create an <EmptyTag> component
  // with props populated from this attribute.
  readonly onMissing?: JSX.Element | EmptyTagProps;
}

interface VisibleEmptyTagProps extends StandardComponentProps {
  readonly visible?: true;
  readonly text: string;
}

interface InvisibleEmptyTagProps extends StandardComponentProps {
  readonly visible: false;
}

type EmptyTagProps = VisibleEmptyTagProps | InvisibleEmptyTagProps;

type Tooltip = Omit<Partial<import("antd/lib/tooltip").TooltipPropsWithTitle>, "title"> & { readonly title: string } | string;

type ClickableIconCallbackParams = {
  readonly isHovered: boolean;
}
type ClickableIconCallback = (params: ClickableIconCallbackParams) => IconOrElement
type ClickableIconOrElement = IconOrElement | ClickableIconCallback;

interface ClickableProps extends StandardComponentProps {
  readonly disabled?: boolean;
  readonly tooltip?: Tooltip;
  readonly icon?: ClickableIconOrElement;
}

type HeaderTemplateFormData = {
  readonly header: RichText.Block[] | null;
  readonly left_image: UploadedImage | SavedImage | null;
  readonly left_info: RichText.Block[] | null;
  readonly right_image: UploadedImage | SavedImage | null;
  readonly right_info: RichText.Block[] | null;
};
