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

// TODO: Deprecate me.
interface Field {
  id: string;
  label: string;
}

type SearchIndex = string | string[];
type SearchIndicies = SearchIndex[];

interface StandardComponentProps {
  readonly id?: any;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

type PropsOf<T> = T extends React.ComponentType<infer Props> ? Props : never;

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
  readonly render?: (params: IBreadCrumbItemRenderParams) => JSX.Element | null | undefined;
  readonly options?: IBreadCrumbItemOption[];
  readonly visible?: boolean;
  readonly primary?: boolean;
}
