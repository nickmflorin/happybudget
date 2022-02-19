import PrimaryButton, { PrimaryButtonProps } from "./PrimaryButton";
import classNames from "classnames";

type TonyButtonProps = {
	readonly name: string;
	readonly age: number;
  readonly tonySize: string;
};

/* const props = {
     tonySize: "TEST",
     id: "5",
     separatorProps: 5
   }; */

// const { tonySize, ...data } = props;

const TonyButton = ({ tonySize, ...props }: TonyButtonProps): JSX.Element => {
  // do something with tonysize and incldue result in props
  return <PrimaryButton name={props.name} age={props.age} loading={true} />;
};

/* type TonyCarouselProps = StandardComponentProps & {
   	readonly name: string;
   	readonly image?: string;
   } */

/* const TonyCarousel = ({name, image, ...props}: TonyCarouselProps): JSX.Element => {
   	return (
   		<div {...props} className={classNames("tony-carousel", props.className)}/>
   			<h1>{props.name}</h1>
   		</div>
   	)
   } */

// "tony-carousel custom-tony"

// <TonyCarousel style={{display: "flex"}}  name={"Tony"} image={"https".."} />
