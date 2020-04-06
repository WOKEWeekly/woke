const TEST_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

module.exports = {

  TEST_CANDIDATES: {
    CREATED: {
      id: 0,
      name: 'Jon Snow',
      occupation: 'Mentor',
      birthday: '1990-02-02',
      ethnicity: JSON.stringify(['Nigeria', 'Togo']),
      socials: JSON.stringify({ instagram: 'madting' }),
      description: 'An added candidate through service tests.',
      authorId: 1,
      dateWritten: '1990-02-02',
      image: TEST_IMAGE,
    },
    UPDATED: {
      id: 0,
      name: 'Jon Snow',
      occupation: 'Teacher',
      birthday: '1990-02-02',
      ethnicity: JSON.stringify(['Ghana', 'France']),
      socials: JSON.stringify({ twitter: 'madting', instagram: 'madting' }),
      description: 'An updated candidate through service tests.',
      authorId: 1,
      dateWritten: '2020-02-02',
      image: TEST_IMAGE,
    }
  },

  TEST_SESSIONS: {
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
  },

  TEST_USERS: {
    NINE: {
      id: 1,
      firstname: 'Admin',
      lastname: 'Istrator',
      clearance: 9
    },
    FIVE: {
      id: 2,
      firstname: 'Test',
      lastname: 'Subject',
      clearance: 5
    },
    ONE: {
      firstname: 'David',
      lastname: 'Egbue',
      email: 'd.master700@gmail.com',
      username: 'david',
      password1: 'davido607',
      password2: 'davido607',
      subscribe: false
    }
  }
}