import * as api from "application/api";
import { AppProps } from "lib/compat";
import { ClientConfig } from "components/config/ClientConfig";
import "style/globals/index.scss";

const CorshaConsole = ({ Component, pageProps }: AppProps) => {
  if (pageProps.statusCode === api.STATUS_CODES.HTTP_404_NOT_FOUND) {
    return <Component {...pageProps} />;
  }
  return (
    <ClientConfig authenticated={true}>
      <Component {...pageProps} />
    </ClientConfig>
  );
};

export default CorshaConsole;
