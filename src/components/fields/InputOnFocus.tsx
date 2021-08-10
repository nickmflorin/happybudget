import { useState } from "react";
import classNames from "classnames";

interface InputOnFocusProps extends StandardComponentProps {
  readonly placeholder?: string;
  // readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // readonly value?: number | string;
}

const InputOnFocus = ({ ...props }: InputOnFocusProps): JSX.Element => {
  const [_value, setValue] = useState<string>("");

  return (
    <div className={classNames("input", props.className)} style={props.style}>
      <input placeholder={props.placeholder} />
    </div>
  );
};

export default InputOnFocus;
