import React, { Component } from 'react';
import Head from 'next/head';
import { domain } from '~/constants/settings.js';

/** Add metadata to each webpage */
export default class Meta extends Component {
  render(){

    let { title, description, url, image, alt} = this.props;
    image = (image === undefined) ? '/static/images/logos/wokeweekly-logo.jpg' : image;
    alt = (alt === undefined) ? '#WOKEWeekly Logo' : alt;

    return (
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />

        <meta charSet="UTF-8" name="author" content="Zavid Egbue" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${domain}${url}`} />
        <meta property="og:image" content={`${domain}${image}`} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:alt" content={alt} />
        <meta property="og:site_name" content="#WOKEWeekly" />

        <meta name="twitter:card" content="summary_large_image" />
        {/* <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${domain}${image}`} />
        <meta name="twitter:image:alt" content={alt} /> */}

        <link rel="icon" href="/static/images/logos/favicon.jpg" />
      </Head>
    )
  }
}