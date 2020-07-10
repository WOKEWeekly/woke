const dev = process.env.NODE_ENV !== 'production';

/** The full URLs for each #WOKEWeekly social platform or account. */
exports.accounts = {
  facebook: 'https://www.facebook.com/wokeweeklyuk',
  twitter: 'https://www.twitter.com/wokeweeklyuk',
  instagram: 'https://www.instagram.com/wokeweeklyuk',
  linkedin: 'https://www.linkedin.com/company/wokeweeklyuk',
  youtube:
    'https://www.youtube.com/channel/UC4aZ79_Ge_4BkCW-Y3UriLw?sub_confirmation=1',
  spotify: 'https://open.spotify.com/show/2IUSFVvNfsJBiTXMwruTIG',
  paypal:
    'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=BUWDQJCN66KRL&source=url',
  zoom: 'https://us02web.zoom.us/j/89460562084',
  slack:
    'https://join.slack.com/t/wokeweekly/shared_invite/zt-cz7frr9s-XFbOGaQ0zms1MaT3T9YAug',
  trello:
    'https://trello.com/invite/wokeweekly/40a83a607c57bec9423f411dd1c3c0b2'
};

exports.cloudinary = {
  /**
   * Checks whether the image is from Cloudinary by testing
   * if the image name string starts with a regular expression.
   * @param {string} image - The image in question.
   * @returns {boolean} Value indicating whether it's from Cloudinary
   */
  check: (image) => {
    if (!image) return false;

    const regex = new RegExp(/(v[0-9]+|dev|prod)\//);
    const match = image.match(regex);
    if (match === null) return false;

    return image.startsWith(match[0]);
  },

  regex: new RegExp(/(v[0-9]+\/)?(dev|prod)\/.*/),

  /** Lazy transformations for square images */
  lazy: '/w_800,h_800,c_fill',

  /** Base url for Cloudinary images */
  url: 'https://res.cloudinary.com/wokeweekly/image/upload'
};

/** The copyright notice. */
exports.copyright = `\u00A9 2020 #WOKEWeekly`;

/** The date #WOKEWeekly was established */
exports.creationDate = new Date(2017, 2, 2);

/** Domain to use dependent on environment */
exports.domain = dev ? 'http://localhost:3000' : 'https://www.wokeweekly.co.uk';

/** The emails associated with #WOKEWeekly. */
exports.emails = {
  applications: 'applications@wokeweekly.co.uk',
  enquiries: 'enquiries@wokeweekly.co.uk',
  site: 'site@wokeweekly.co.uk'
};

exports.github = {
  pages: 'https://zzavidd.github.io/woke/docs/rich-text'
};

/** Defines the size limits in MB */
exports.limits = {
  file: 10,
  image: 2
};

/** External Google Forms */
exports.forms = {
  recruitment: 'https://forms.gle/xAf5bMPZvXNob7FC7',
  clientFeedback: 'https://forms.gle/iAEusQ8JBTmBoUCF8',
  audienceFeedback: 'https://forms.gle/GErPZT2h2uHoFajn9',
  membership: 'https://forms.gle/vF3bjhdz6qeFuk6fA'
};

/** The site description */
exports.siteDescription =
  'Debates and discussions centered around and beyond the UK black community. Facilitating open-floor conversation to shape the minds and alter the perspectives of participants.';

/** List of social media domains and icons for forms */
exports.socialPlatforms = {
  facebook: {
    name: 'Facebook',
    icon: 'facebook-f',
    domain: 'https://www.facebook.com/'
  },
  twitter: {
    name: 'Twitter',
    icon: 'twitter',
    domain: 'https://www.twitter.com/'
  },
  instagram: {
    name: 'Instagram',
    icon: 'instagram',
    domain: 'https://www.instagram.com/'
  },
  linkedin: { name: 'LinkedIn', icon: 'linkedin-in', domain: '' },
  snapchat: {
    name: 'Snapchat',
    icon: 'snapchat-ghost',
    domain: 'https://www.snapchat.com/add/'
  },
  youtube: { name: 'Youtube', icon: 'youtube', domain: '' },
  soundcloud: {
    name: 'SoundCloud',
    icon: 'soundcloud',
    domain: 'https://www.soundcloud.com/'
  }
};
