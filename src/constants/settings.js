const dev = process.env.NODE_ENV !== 'production';

module.exports = {
  accounts: {
    facebook: "https://www.facebook.com/wokeweeklyuk",
    twitter: "https://www.twitter.com/wokeweeklyuk",
    instagram: "https://www.instagram.com/wokeweeklyuk",
    linkedin: "https://www.linkedin.com/company/wokeweeklyuk",
    youtube: "https://www.youtube.com/channel/UC2pxSc01dJSFSVDPSN6_hBA",
    paypal: 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=BUWDQJCN66KRL&source=url'
  },
  cdn: {
    url: 'https://res.cloudinary.com/wokeweekly/image/upload',
  },
  creationDate: new Date(2017, 2, 2),
  domain: dev ? 'http://localhost:3000' : "https://www.wokeweekly.co.uk",
  emails: {
    applications: "applications@wokeweekly.co.uk",
    enquiries: "enquiries@wokeweekly.co.uk",
    site: "site@wokeweekly.co.uk",

    director: "zavidegbue@gmail.com"
  },
  socialPlatforms: {
    facebook: { name: 'Facebook', icon: 'facebook-f', domain: 'https://www.facebook.com/' },
    twitter: { name: 'Twitter', icon: 'twitter', domain: 'https://www.twitter.com/' },
    instagram: { name: 'Instagram', icon: 'instagram', domain: 'https://www.instagram.com/' },
    linkedin: { name: 'LinkedIn', icon: 'linkedin-in', domain: '' },
    snapchat: { name: 'Snapchat', icon: 'snapchat-ghost', domain: 'https://www.snapchat.com/add/' },
    youtube: { name: 'Youtube', icon: 'youtube', domain: '' },
    soundcloud: { name: 'SoundCloud', icon: 'soundcloud', domain: 'https://www.soundcloud.com/' }
  }
}