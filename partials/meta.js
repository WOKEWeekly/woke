import React from 'react';
import Head from 'next/head';
import { domain } from '~/constants/settings.js';

/** Add metadata to each webpage */
export default ({ title, description, url,
  image = '/static/images/logos/wokeweekly-logo.jpg',
  alt = '#WOKEWeekly Logo',
  isHome }) => (
  <React.Fragment>
    <meta charSet="UTF-8" name="author" content="Zavid Egbue" />
    <meta name="viewport" content="initial-scale=1.0, width=device-width" />

    <title>{isHome ? title : `${title} | #WOKEWeekly`}</title>
    <meta name="description" content={description} />
    <meta name="fragment" content="!" />

    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={`${domain}${url}`} />
    <meta property="og:image" content={`${domain}${image}`} />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:alt" content={alt} />
    <meta property="og:site_name" content="#WOKEWeekly" />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="icon" href="/static/images/logos/favicon.jpg" />
  </React.Fragment>
)