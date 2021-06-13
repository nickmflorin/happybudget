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

interface _TagCommonProps extends StandardComponentProps {
  readonly textColor?: string;
  readonly scheme?: string[];
  readonly uppercase?: boolean;
  readonly colorIndex?: number;
  readonly fillWidth?: boolean;
  // Used for custom rendering of the tag - mostly applicable for PDF purposes.
  readonly render?: (params: ITagRenderParams) => JSX.Element;
}

interface _TagModelProps<M extends Model.Model = Model.Model> extends _TagCommonProps {
  readonly model: M;
  readonly modelTextField?: keyof M;
  readonly modelColorField?: keyof M;
}

interface _TagTextProps extends _TagCommonProps {
  readonly text: string;
  readonly color?: string;
}

interface _TagChildrenProps extends _TagCommonProps {
  readonly children: string;
  readonly color?: string;
}

type TagProps<M extends Model.Model = Model.Model> = _TagModelProps<M> | _TagTextProps | _TagChildrenProps;

// Common props used in all 3 different ways of instantiating a <MultipleTags> component.
interface _MultipleTagsProps extends StandardComponentProps {
  // Globally provided color - will be set on all created <Tag> components if the color is not
  // explicitly provided to that <Tag> component (either by means of the ITag object or the
  // model M used to generate the <Tag> component).
  color?: string;
  // Globally provided textColor - will be set on all created <Tag> components if the textColor is not
  // explicitly provided to that <Tag> component (either by means of the ITag object or the
  // model M used to generate the <Tag> component).
  textColor?: string;
  scheme?: string[];
  // Globally provided uppercase setting - will be set on all created <Tag> components if the uppercase
  // setting is not explicitly provided to the <Tag> component (by means of the ITag object only).
  uppercase?: boolean;
  // If the list of Models (M) or list of ITag objects or Array of Children <Tag> components is empty,
  // this will either render the component provided by onMissingList or create an <EmptyTag> component
  // with props populated from this attribute.
  onMissing?: JSX.Element | EmptyTagProps;
}

// <Tag> components are provided as children to the component:
// <MultipleTags><Tag /><Tag /></MultipleTags>
interface _MultipleTagsChildrenProps extends _MultipleTagsProps {
  children: typeof Tag[];
}

// <Tag> components should be generated based on a set of provided models M.
interface _MultipleTagsModelsProps<M extends Model.Model = Model.Model> extends _MultipleTagsProps {
  models: M[];
  modelTextField?: keyof M;
  modelColorField?: keyof M;
}

// <Tag> components should be generated based on a provided Array of objects (ITag), each of which
// contains the properties necessary to create a <Tag> component.
interface _MultipleTagsExplicitProps extends _MultipleTagsProps {
  tags: ITag[];
}

type MultipleTagsProps<M extends Model.Model = Model.Model> =
  | _MultipleTagsChildrenProps
  | _MultipleTagsModelsProps<M>
  | _MultipleTagsExplicitProps;