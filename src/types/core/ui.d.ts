type PageAndSize = {
  page?: number;
  pageSize?: number;
};

type BudgetViewType = "budget" | "template";

type Order = 1 | -1 | 0;
type DefinitiveOrder = 1 | -1;

type Ordering<T = string> = { [key: T]: Order };
type FieldOrder<T = string> = {
  field: T;
  order: DefinitiveOrder;
};
type FieldOrdering<T = string> = FieldOrder<T>[];

interface Field {
  id: string;
  label: string;
}

interface FieldCheck {
  id: string;
  checked: boolean;
}

type SearchIndex = string | string[];
type SearchIndicies = SearchIndex[];

interface StandardComponentProps {
  readonly id?: any;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

interface StandardPdfComponentProps {
  readonly className?: string;
  readonly style?: import("@react-pdf/renderer").Styles;
  readonly debug?: boolean;
}

type PropsOf<T> = T extends React.ComponentType<infer Props> ? Props : never;

type RenderFunc = () => JSX.Element;

interface IBreadCrumbItemRenderParams {
  readonly toggleDropdownVisible: () => void;
}

interface IBreadCrumbItemOption {
  readonly id: number;
  readonly url?: string;
  readonly text?: string;
  readonly render?: () => JSX.Element;
}

interface ILazyBreadCrumbItem {
  readonly requiredParams: string[];
  readonly func: (params: any) => IBreadCrumbItem | IBreadCrumbItem[];
}

interface IBreadCrumbItem {
  readonly id: number | string;
  readonly url?: string;
  readonly tooltip?: import("antd/lib/tooltip").TooltipPropsWithTitle;
  readonly text?: string;
  readonly render?: (params: IBreadCrumbItemRenderParams) => React.ReactChild;
  readonly options?: IBreadCrumbItemOption[];
  readonly visible?: boolean;
  readonly primary?: boolean;
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

interface ITagRenderParams extends StandardComponentProps {
  readonly color: string;
  readonly textColor: string;
  readonly uppercase: boolean;
  readonly fillWidth: boolean;
  readonly text: string;
}

type TagProps<M extends Model.M = Model.M> = StandardComponentProps & {
  readonly children?: string | M | null;
  readonly text?: string | null;
  readonly textColor?: string;
  readonly color?: string;
  readonly model?: M | null;
  readonly modelTextField?: keyof M;
  readonly modelColorField?: keyof M;
  readonly scheme?: string[];
  readonly uppercase?: boolean;
  readonly colorIndex?: number;
  readonly fillWidth?: boolean;
  // Used for custom rendering of the tag - mostly applicable for PDF purposes.
  readonly render?: (params: ITagRenderParams) => JSX.Element;
  // Used for custom rendering of the tag content.
  readonly contentRender?: (params: ITagRenderParams) => JSX.Element;
}

interface VisibleEmptyTagProps extends StandardComponentProps {
  readonly visible?: true;
  readonly text: string;
}

interface InvisibleEmptyTagProps extends StandardComponentProps {
  readonly visible: false;
}

type EmptyTagProps = VisibleEmptyTagProps | InvisibleEmptyTagProps;

type MultipleTagsProps<M extends Model.M = Model.M> = StandardComponentProps & {
  // <Tag> components should be generated based on a set of provided models M.
  readonly models?: M[];
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

type ModelMenuRef<M extends Model.M> = {
    readonly incrementFocusedIndex: () => void;
    readonly decrementFocusedIndex: () => void;
    readonly focus: (value: boolean) => void;
    readonly getModelAtFocusedIndex: () => M | null;
    readonly performActionAtFocusedIndex: () => void;
    readonly focused: boolean;
  };

type EmptyItem = {
  readonly onClick?: (event: import("react").SyntheticEvent | KeyboardEvent) => void;
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
  readonly onChange: (model: M, e: Table.CellDoneEditingEvent) => void;
  readonly multiple?: false;
}

interface MultipleModelMenuProps<M extends Model.M> {
  readonly onChange: (models: M[], e: Table.CellDoneEditingEvent) => void;
  readonly multiple: true;
  readonly checkbox?: boolean;
}

interface ModelMenuItemProps<M extends Model.M> {
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
  readonly onPress: (model: M, e: import("react").SyntheticEvent) => void;
  readonly renderItem: (model: M, context: { level: number; index: number }) => JSX.Element;
}

interface ModelMenuItemsProps<M extends Model.M> extends Omit<ModelMenuItemProps<M>, "model"> {
  readonly models: M[];
}

type ModelMenuProps<M extends Model.M> = _ModelMenuProps<M> &
    (MultipleModelMenuProps<M> | SingleModelMenuProps<M>);

interface _ModelTagsMenuProps<M extends Model.M> extends Omit<_ModelMenuProps<M>, "renderItem"> {
  readonly tagProps?: Omit<TagProps<M>, "model" | "children">;
}

type ModelTagsMenuProps<M extends Model.M> = _ModelTagsMenuProps<M> &
    (MultipleModelMenuProps<M> | SingleModelMenuProps<M>);

type ExpandedModelMenuRef<M extends Model.M> = {
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

type ExpandedModelMenuProps<M extends Model.M> = _ExpandedModelMenuProps<M> &
    (MultipleModelMenuProps<M> | SingleModelMenuProps<M>);

interface _ExpandedModelTagsMenuProps<M extends Model.M> extends Omit<_ExpandedModelMenuProps<M>, "renderItem"> {
  readonly tagProps?: Omit<TagProps<M>, "model" | "children">;
}

type ExpandedModelTagsMenuProps<M extends Model.M> = _ExpandedModelTagsMenuProps<M> &
    (MultipleModelMenuProps<M> | SingleModelMenuProps<M>);

interface SubAccountTreeMenuProps
  extends Omit<
    ExpandedModelMenuProps<Model.SubAccountTreeNode>,
    "renderItem" | "models" | "multiple" | "onChange" | "selected"
  > {
  readonly nodes: Model.Tree;
  readonly onChange: (m: Model.SimpleSubAccount, e: Table.CellDoneEditingEvent) => void;
  readonly onSearch: (value: string) => void;
  readonly search: string;
  readonly childrenDefaultVisible?: boolean;
  readonly selected: { id: number; type: "subaccount" | "account" } | null;
}
