interface ImageProps extends StandardComponentProps {
  readonly src?: string;
  readonly alt?: string;
}

const Image = (props: ImageProps): JSX.Element => {
  return <img {...props} alt={props.alt || "Not Found"} src={props.src} />;
};

export default Image;
