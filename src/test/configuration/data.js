const jwt = require('jsonwebtoken');

const SUPERUSER = {
  id: 1,
  firstname: 'Admin',
  lastname: 'Istrator',
  clearance: 9
};
const TEST_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
const TEST_PDF =
  'data:application/pdf;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
const TOKEN = jwt.sign({ user: SUPERUSER }, process.env.JWT_SECRET, {
  expiresIn: '5m'
});

exports.TEST_ARTICLES = {
  CREATED: {
    title: 'Crazy Blues',
    content: 'This is an added article via service tests.',
    category: 'Philosophy & Ethics',
    excerpt: 'Added service test article.',
    coverImage: TEST_IMAGE,
    fillerImages: JSON.stringify(new Array(4).fill(TEST_IMAGE)),
    authorId: 1,
    status: 'DRAFT',
    datePublished: null
  },
  UPDATED: {
    title: 'Wild Yellows',
    content: 'This is an updated article via service tests.',
    category: 'Society & Stereotypes',
    excerpt: 'Updated service test article.',
    coverImage: TEST_IMAGE,
    fillerImages: JSON.stringify([TEST_IMAGE]),
    authorId: 1,
    status: 'PUBLISHED',
    datePublished: '2020-08-30'
  }
};

exports.TEST_CANDIDATES = {
  CREATED: {
    id: 0,
    name: 'Ahmaud Arbery',
    occupation: 'Mentor',
    birthday: '1990-02-02',
    ethnicity: JSON.stringify(['Nigeria', 'Togo']),
    socials: JSON.stringify({ instagram: 'aarbery' }),
    description: 'An added candidate through service tests.',
    authorId: 1,
    dateWritten: '1990-02-02',
    image: TEST_IMAGE
  },
  UPDATED: {
    id: 0,
    name: 'Tamir Rice',
    occupation: 'Teacher',
    birthday: '1990-02-02',
    ethnicity: JSON.stringify(['Ghana', 'France']),
    socials: JSON.stringify({ twitter: 'trice', instagram: 'trice' }),
    description: 'An updated candidate through service tests.',
    authorId: 1,
    dateWritten: '2020-02-02',
    image: TEST_IMAGE
  }
};

exports.TEST_DOCUMENTS = {
  CREATED: {
    title: 'Service Test Created Document',
    file: TEST_PDF
  },
  UPDATED: {
    title: 'Service Test Updated Document',
    file: TEST_PDF
  }
};

exports.TEST_MEMBERS = {
  CREATED: {
    firstname: 'Breonna',
    lastname: 'Taylor',
    birthday: '1996-12-20',
    ethnicity: JSON.stringify(['South Africa', 'Poland']),
    sex: 'F',
    level: 'Coordinator',
    role: 'Researcher',
    image: TEST_IMAGE,
    socials: JSON.stringify({
      instagram: 'btaylor'
    }),
    description: 'An added member through service tests.',
    verified: true,
    slackId: null,
    isAuthor: true
  },
  UPDATED: {
    firstname: 'Sandra',
    lastname: 'Bland',
    birthday: '1996-12-20',
    ethnicity: JSON.stringify(['Tanzania', 'Poland']),
    sex: 'F',
    level: 'Manager',
    role: 'Social Media Manager',
    image: TEST_IMAGE,
    socials: JSON.stringify({
      twitter: 'sbland',
      instagram: 'sbland'
    }),
    description: 'An updated member through service tests.',
    verified: true,
    slackId: null,
    isAuthor: true
  }
};

exports.TEST_REVIEWS = {
  CREATED: {
    referee: 'Eric Garner',
    position: 'Founder of Garner Ministries',
    rating: 2,
    description: 'This is an added review via service tests.',
    image: TEST_IMAGE
  },
  UPDATED: {
    referee: 'Philando Castile',
    position: 'Director of Castile Tanks',
    rating: 5,
    description: 'This is an updated review via service tests.',
    image: TEST_IMAGE
  }
};

exports.TEST_SESSIONS = {
  CREATED: {
    title: 'Manchester 2020',
    dateHeld: '2020-03-01',
    timeHeld: '23:59',
    description: 'An added session from service tests.',
    image: TEST_IMAGE
  },
  UPDATED: {
    title: 'New Manchester 2021',
    dateHeld: '2021-09-22',
    timeHeld: '11:00',
    description: 'An updated session from service tests.',
    image: TEST_IMAGE
  }
};

exports.TEST_SUBSCRIBERS = {
  CREATED: {
    firstname: 'George',
    lastname: 'Floyd',
    email: 'wokeweeklyuk@gmail.com',
    subscriptions: JSON.stringify({
      articles: true
    })
  },
  UPDATED: {
    firstname: 'George',
    lastname: 'Floyd',
    email: 'wokeweeklyuk@gmail.com',
    subscriptions: JSON.stringify({
      articles: false
    })
  }
};

exports.TEST_TOPICS = {
  CREATED: {
    headline: 'Coding',
    question: 'Is this a development environment?',
    category: 'Society & Stereotypes',
    description: 'This is an added topic via service tests.',
    type: 'Discussion',
    polarity: true,
    validated: false,
    sensitivity: false,
    option1: 'Yes',
    option2: 'No',
    userId: 1
  },
  UPDATED: {
    headline: 'NHS',
    question: 'Does the government support them well?',
    category: 'Philosophy & Ethics',
    description: 'This is an updated topic via service tests.',
    type: 'Debate',
    polarity: true,
    validated: false,
    sensitivity: true,
    option1: 'Yes',
    option2: 'No',
    userId: 1
  }
};

exports.TEST_USERS = {
  NINE: { ...SUPERUSER, token: TOKEN },
  FIVE: {
    id: 2,
    firstname: 'Test',
    lastname: 'Subject',
    clearance: 5
  },
  CREATED: {
    firstname: 'Practice',
    lastname: 'User',
    email: 'wokeweeklyuk@gmail.com',
    username: 'wokew',
    password1: 'Marchsurrey20',
    password2: 'Marchsurrey20',
    privacy: true,
    subscribe: false
  }
};
