import { api } from "application";
import { AppProps } from "lib/compat";
import { AppConfig } from "components/config";
import { Layout } from "components/layout";
import "style/globals/index.scss";

const CorshaConsole = ({ Component, pageProps }: AppProps) => {
  if (pageProps.statusCode === api.STATUS_CODES.HTTP_404_NOT_FOUND) {
    return <Component {...pageProps} />;
  }
  return (
    <AppConfig>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppConfig>
  );
};

export default CorshaConsole;
