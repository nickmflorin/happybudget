import React, { forwardRef } from "react";
import { Input as AntDInput } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/pro-regular-svg-icons";

import classNames from "classnames";

import Input, { InputProps } from "./Input";

export type SearchInputProps = InputProps;

const SearchInput = (props: SearchInputProps, ref: React.ForwardedRef<AntDInput>): JSX.Element => (
  <Input
    placeholder={"Search"}
    allowClear={true}
    prefix={<FontAwesomeIcon icon={faSearch} className={"icon"} />}
    {...props}
    ref={ref}
    className={classNames("input--search", props.className)}
  />
);

export default forwardRef(SearchInput);
