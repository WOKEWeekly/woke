import Document, { Html, Head, Main, NextScript } from 'next/document';
import Meta from '~/partials/meta.js';
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