const async = require('async');
const fetch = require('node-fetch');

const slack = require('./slack.js');

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const authorization = `key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;

/** Map of Trello board IDs */
const BOARDS = {
  EXEC: 'cPCwhUI4',
  GENERAL: 'mbzVPEE6',
  SOCIAL_MEDIA: 'qKuY4vcl'
};

/** Notify Exec Slack channel of due tasks */
exports.notifyDueExecTasks = () => {
  getCardsFromTrelloBoard(BOARDS.EXEC, (cards) =>
    processDueCards(cards, slack.sendDueExecTasks)
  );
};

/** Notify General Slack channel of due tasks */
exports.notifyDueGeneralTasks = () => {
  getCardsFromTrelloBoard(BOARDS.GENERAL, (cards) =>
    processDueCards(cards, slack.sendDueGeneralTasks)
  );
};

/** Notify Social Media Slack channel of uncaptioned cards */
exports.notifyUncaptionedCards = () => {
  getCardsFromTrelloBoard(BOARDS.SOCIAL_MEDIA, (cards) => {
    const postWithoutCaptions = cards
      .map((card) => {
        const { name, desc, due } = card;
        const dueinMs = new Date(due).getTime();

        // If card has a due date, is due in the future
        // and doesn't already have a caption...
        if (due && dueinMs > Date.now() && !desc) {
          return { name, due };
        }
      })
      .filter((e) => e);

    if (postWithoutCaptions.length) {
      slack.sendPostsWithoutCaptions(postWithoutCaptions);
    }
  });
};

/**
 * Compile relevant information for due cards and send notifications.
 * @param {object[]} cards - The list of due cards from the board.
 * @param {Function} next - The callback called once this function has completed.
 */
const processDueCards = (cards, next) => {
  const seenMembers = {};

  // Retrieve all due cards on the executive board.
  const dueTasks = cards
    .map((card) => {
      const { name, due, dueComplete, idMembers } = card;
      const dueInMs = new Date(due).getTime();

      // If card has a due date, was due in the past
      // and has not been completed...
      if (due && dueInMs < Date.now() && !dueComplete) {
        const members = idMembers.map((memberId) => {
          // Add placeholder for each unique member.
          seenMembers[memberId] = '';
          return memberId;
        });

        return { name, due, members };
      }
    })
    .filter((e) => e);

  // If there are no due exec tasks, abort.
  if (!dueTasks.length) return;

  async.mapValues(
    seenMembers,
    function (value, id, callback) {
      // Retrieve the name of each unique member.
      getMemberByTrelloId(id, (name) => {
        const firstname = name.split(' ')[0];
        callback(null, firstname);
      });
    },
    function (err, memberMapping) {
      // Replace the member IDs on each card with the member names.
      const dueTasksWithMembers = dueTasks.map((card) => {
        card.members = card.members.map((member) => memberMapping[member]);
        return card;
      });

      // slack.sendDueExecTasks(dueTasksWithMembers);
      next(dueTasksWithMembers);
    }
  );
};

/**
 * Retrieve all cards from a specified Trello board.
 * @param {string} boardId - The ID of the Trello board.
 * @param {Function} callback - The function to be performed on the resulting cards.
 */
const getCardsFromTrelloBoard = (boardId, callback) => {
  fetch(`https://api.trello.com/1/boards/${boardId}/cards?${authorization}`, {
    method: 'GET'
  })
    .then((res) => res.json())
    .then((cards) => callback(cards))
    .catch((err) => console.error(err));
};

/**
 * Get the member corresponding to a specified ID.
 * @param {string} memberId - The member's ID.
 * @param {Function} callback - The function to be performed on the resulting member.
 */
const getMemberByTrelloId = (memberId, callback) => {
  fetch(`https://api.trello.com/1/members/${memberId}?${authorization}`, {
    method: 'GET'
  })
    .then((res) => res.json())
    .then(({ fullName }) => callback(fullName))
    .catch((err) => console.error(err));
};
