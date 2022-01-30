import classNames from "classnames";
import { Pagination as RootPagination, PaginationProps as RootPaginationProps } from "antd";

export type PaginationProps = RootPaginationProps & {
  readonly subtle?: boolean;
  readonly small?: boolean;
};

const Pagination = ({ subtle, small, ...props }: PaginationProps): JSX.Element => {
  return <RootPagination {...props} className={classNames("pagination", props.className, { subtle, small })} />;
};

export default Pagination;
