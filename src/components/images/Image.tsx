import classNames from "classnames";
import { isNil } from "lodash";

export interface ImageProps extends StandardComponentProps {
  readonly src?: string;
  readonly alt?: string;
  readonly onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  readonly overlay?: () => JSX.Element;
  readonly circle?: boolean;
}

const Image = (props: ImageProps): JSX.Element => {
  return (
    <div className={classNames("img-wrapper", { circle: props.circle })}>
      {!isNil(props.overlay) && props.overlay()}
      <img
        {...props}
        className={classNames("img", props.className)}
        alt={props.alt || "Not Found"}
        src={props.src}
        style={props.style}
      />
    </div>
  );
};

export default Image;
