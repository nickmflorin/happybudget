import classNames from "classnames";
import { Pagination as RootPagination, PaginationProps as RootPaginationProps } from "antd";

export type PaginationProps = RootPaginationProps & {
  readonly small?: boolean;
};

const Pagination = ({ small, ...props }: PaginationProps): JSX.Element => (
  <RootPagination {...props} className={classNames("pagination", props.className, { small })} />
);

export default Pagination;
