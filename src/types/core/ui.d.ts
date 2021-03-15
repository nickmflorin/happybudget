type PageAndSize = {
  page?: number;
  pageSize?: number;
};

interface IMenuItem {
  text: string;
  loading?: boolean;
  onClick: () => void;
  icon?: JSX.Element;
  disabled?: boolean;
}

type Order = 1 | -1 | 0;

type Ordering = { [key: string]: Order };

interface IFieldMenuField {
  id: string;
  label: string;
  defaultChecked?: boolean;
}
