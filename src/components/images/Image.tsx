import classNames from "classnames";
import { isNil } from "lodash";

import { ShowHide } from "components";

export interface ImageProps extends StandardComponentProps {
  readonly src?: string;
  readonly alt?: string;
  readonly circle?: boolean;
  readonly tint?: boolean;
  readonly wrapperStyle?: React.CSSProperties;
  readonly wrapperClassName?: string;
  readonly onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  readonly onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  readonly overlay?: () => JSX.Element;
}

const Image = (props: ImageProps): JSX.Element => {
  return (
    <div
      className={classNames("img-wrapper", { circle: props.circle }, props.wrapperClassName)}
      style={props.wrapperStyle}
      onClick={props.onClick}
    >
      {!isNil(props.overlay) && props.overlay()}
      <ShowHide show={props.tint}>
        <div className={"image-tint"}></div>
      </ShowHide>
      <img
        className={classNames("img", props.className)}
        alt={props.alt || "Not Found"}
        src={props.src}
        style={props.style}
        onError={props.onError}
      />
    </div>
  );
};

export default Image;
