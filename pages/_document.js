import Document, { Html, Head, Main, NextScript } from 'next/document';
import { domain } from '~/constants/settings.js';
import css from '~/styles/_partials.scss';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const meta = await Document.getInitialProps(ctx);
    return { ...meta };
  }

  render() {
    const { query } = this.props.__NEXT_DATA__;
    
    return (
      <Html>
        <Head><Meta {...query}/></Head>
        <body className={css.body}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

/** Add metadata to each webpage */
const Meta = ({
  title = 'Page Not Found',
  url = null,
  description = '',
  cardImage = '/bg/card-home.jpg'
}) => (
  <React.Fragment>
    {/* Global site tag (gtag.js) - Google Analytics */}
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-145389782-1" />
    <script dangerouslySetInnerHTML={{__html: `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'UA-145389782-1');`}} />

    {/* Page information */}
    <meta charSet="UTF-8" name="author" content="Zavid Egbue" />
    <meta name="viewport" content="initial-scale=1.0, width=device-width" />

    <title>{title}</title>
    <meta name="description" content={description} />

    {/* OpenGraph meta tags for search engine optimisation */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={`${domain}${url}`} />
    <meta property="og:image" content={`${domain}/static/images${cardImage}`} />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:alt" content={title} />
    <meta property="og:site_name" content="#WOKEWeekly" />
    <meta name="twitter:card" content="summary_large_image" />

    {/* Favicon */}
    <link rel="icon" href="/static/images/logos/favicon.jpg" />

    {/* BootStrap and Google Web Fonts importation */}
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossOrigin="anonymous" />
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Raleway:400,700|Patua+One:400,700" />
  </React.Fragment>
)