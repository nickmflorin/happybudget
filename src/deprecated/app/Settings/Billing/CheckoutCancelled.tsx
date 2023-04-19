import { Redirect } from "react-router-dom";

const CheckoutCancelled = (): JSX.Element => <Redirect to={{ pathname: "/billing" }} />;

export default CheckoutCancelled;
