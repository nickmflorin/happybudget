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
