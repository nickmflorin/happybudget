type PageAndSize = {
  page?: number;
  pageSize?: number;
};

interface MenuItem {
  text: string;
  loading?: boolean;
  onClick: () => void;
  icon?: JSX.Element;
  disabled?: boolean;
}

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

interface StandardComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

type PropsOf<T> = T extends React.ComponentType<infer Props> ? Props : never;
