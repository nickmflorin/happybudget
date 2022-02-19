import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import classNames from "classnames";

import { ui } from "lib";
import { isNil } from "lodash";

type WithSizeConfig<S extends string> = {
  readonly default?: S;
  readonly classNamePrefix?: string;
};

export const withSize =
  <T extends { readonly className?: string }, S extends string, CT extends T & UseSizeProps<S> = T & UseSizeProps<S>>(
    options: S[],
    conf?: WithSizeConfig<S>
  ) =>
  (Component: React.FunctionComponent<T>): React.FunctionComponent<CT> => {
    const WithSize = (props: CT): JSX.Element => {
      const _size = ui.hooks.useSize({ options, default: conf?.default }, props);

      let injectedProps = { ...props };
      for (let i = 0; i < options.length; i++) {
        delete injectedProps[options[i]];
      }
      const sizeClassName: string | undefined = !isNil(_size)
        ? !isNil(conf?.classNamePrefix)
          ? `${conf?.classNamePrefix}${_size}`
          : _size
        : undefined;
      injectedProps = { ...injectedProps, className: classNames(props.className, sizeClassName) };

      return <Component {...injectedProps} />;
    };
    return hoistNonReactStatics(WithSize, Component);
  };
