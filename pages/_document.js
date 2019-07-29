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
  title,
  isHome,
  url = null,
  description = '',
  image = '/static/images/logos/woke-card.jpg'
}) => (
  <React.Fragment>
    <meta charSet="UTF-8" name="author" content="Zavid Egbue" />
    <meta name="viewport" content="initial-scale=1.0, width=device-width" />

    <title>{title ? (isHome ? title : `${title} | #WOKEWeekly`) : 'Page Not Found'}</title>
    <meta name="description" content={description} />

    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={`${domain}${url}`} />
    <meta property="og:image" content={`${domain}${image}`} />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:alt" content={title} />
    <meta property="og:site_name" content="#WOKEWeekly" />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="icon" href="/static/images/logos/favicon.jpg" />
  </React.Fragment>
)