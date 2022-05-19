import React, { useState, useEffect, useRef, useImperativeHandle, ForwardedRef, forwardRef } from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { InputRef } from "antd";

interface InputOnFocusProps extends React.HTMLProps<HTMLInputElement> {
  /* When unfocused, the <input> will be hidden and other content will be shown.
     This content can either be provided as the children of this component, or as
     a render callback. */
  readonly renderBlurredContent?: (value: string) => JSX.Element;
  readonly renderBlurredContentOnNoValue?: boolean;
  readonly children: (value: string) => JSX.Element;
}

const InputOnFocus = (
  { children, renderBlurredContent, renderBlurredContentOnNoValue = false, ...props }: InputOnFocusProps,
  ref: ForwardedRef<Pick<InputRef, "focus" | "blur">>
): JSX.Element => {
  const innerRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!isNil(innerRef.current)) {
      if (focused) {
        innerRef.current.focus();
      } else {
        innerRef.current.blur();
      }
    }
  }, [focused]);

  /* We have to expose the focus() method so that this component can be
		 auto-focused with our Form mechanics. */
  useImperativeHandle(ref, () => ({
    focus: () => setFocused(true),
    blur: () => setFocused(false)
  }));

  // Note that the tabIndex is required to allow the div to be focusable.
  return (
    <div
      className={classNames("input-div", props.className)}
      tabIndex={0}
      style={props.style}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {focused === true ||
      (renderBlurredContentOnNoValue === false && (props.value === undefined || props.value === "")) ? (
        <input {...props} value={!isNil(props.value) ? props.value : ""} ref={innerRef} />
      ) : (
        /*
        The component that is rendered in the unfocused state must be *tightly*
        wrapped in a <div> element that can intercept the focus/blur events and
        stop them from propogating to the parent.

        This is required to render clickable components when this component is
        blurred - because without it, clicking the child component would not
        register the click on the child but would trigger the focus/blur behavior
        of the `input-div` parent component.

        `input-div-content` will tightly wrap the children component so that
				clicks outside of the child component will still trigger the focus/blur
				behavior of the parent `input-div` component.
        */
        <div
          className={"input-div-content"}
          tabIndex={0}
          onFocus={(e: React.FocusEvent<HTMLDivElement>) => e.stopPropagation()}
          onBlur={(e: React.FocusEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          {isNil(renderBlurredContent)
            ? children(!isNil(props.value) ? String(props.value) : "")
            : renderBlurredContent(!isNil(props.value) ? String(props.value) : "")}
        </div>
      )}
    </div>
  );
};

export default React.memo(forwardRef(InputOnFocus));
