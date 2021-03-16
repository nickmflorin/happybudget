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

type Order = 1 | -1 | 0;

type Ordering = { [key: string]: Order };

interface Field {
  id: string;
  label: string;
}

interface StandardComponentProps {
  className?: string;
  style?: React.CSSProperties;
}
