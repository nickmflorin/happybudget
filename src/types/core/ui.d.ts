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

interface StandardComponentProps {
  readonly id?: any;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

type PropsOf<T> = T extends React.ComponentType<infer Props> ? Props : never;
