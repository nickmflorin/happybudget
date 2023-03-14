import { http } from "lib";
import { AppProps } from "lib/compat";

import { AppConfig } from "components/config";
import "styles/globals/index.scss";

const CorshaConsole = ({ Component, pageProps }: AppProps) => {
  if (pageProps.statusCode === http.STATUS_CODES.HTTP_404_NOT_FOUND) {
    return <Component {...pageProps} />;
  }
  return (
    <AppConfig>
      <Component {...pageProps} />
    </AppConfig>
  );
};

export default CorshaConsole;
