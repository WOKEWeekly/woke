/* eslint-disable jsdoc/require-param */
const async = require('async');

const { respondToClient } = require('../../response');
const knex = require('../db').getKnex();
const filer = require('../../filer');
const { DIRECTORY, ENTITY } = require('../../../constants/strings');
const ERROR = require('../../errors');

/** Retrieve all team members */
exports.getAllMembers = (req, res) => {
  const { verified } = req.query;
  let query = knex.select().from('members');
  if (verified) query = query.where('verified', 1);
  query.asCallback(function (err, members) {
    respondToClient(res, err, 200, members);
  });
};

/** Retrieve individual member */
exports.getSingleMember = (req, res) => {
  const { id } = req.params;
  const query = knex.select().from('members').where('id', id);
  query.asCallback(function (err, [member] = []) {
    if (err) return respondToClient(res, err);
    if (!member) err = ERROR.INVALID_ENTITY_ID(ENTITY.MEMBER, id);
    respondToClient(res, err, 200, member);
  });
};

/** Retrieve a random verified member */
exports.getRandomMember = (req, res) => {
  const query = knex
    .select()
    .from('members')
    .where('verified', 1)
    .orderByRaw('RAND()')
    .limit(1);
  query.asCallback(function (err, [member] = []) {
    respondToClient(res, err, 200, member);
  });
};

/** Get only verified members */
exports.getVerifiedMembers = (req, res) => {
  const query = knex
    .select()
    .from('members')
    .where('verified', 1);
  query.asCallback(function (err, members) {
    respondToClient(res, err, 200, members);
  });
};

/** Retrieve only authors */
exports.getAuthors = (req, res) => {
  const query = knex.select().from('members').where('isAuthor', 1);
  query.asCallback(function (err, authors) {
    respondToClient(res, err, 200, authors);
  });
};

/** Add new team member to database */
exports.addMember = (req, res) => {
  const member = req.body;

  async.waterfall(
    [
      function (callback) {
        // Upload image to cloud
        filer.uploadImage(member, DIRECTORY.MEMBERS, true, callback);
      },
      function (member, callback) {
        // Add member to database
        const query = knex.insert(member).into('members');
        query.asCallback(function (err, [id] = []) {
          callback(err, id);
        });
      }
    ],
    function (err, id) {
      respondToClient(res, err, 201, {
        id
      });
    }
  );
};

/** Update details of existing team member in database */
exports.updateMember = (req, res) => {
  const id = req.params.id;
  const { member, changed } = req.body;

  async.waterfall(
    [
      function (callback) {
        // Delete old image if changed.
        const query = knex.select().from('members').where('id', id);
        query.asCallback(function (err, [member] = []) {
          if (err) return callback(err);
          if (!member)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.MEMBER, id));
          if (!changed) return callback(null);
          filer.destroyImage(member.image, callback);
        });
      },
      function (callback) {
        // Equally, upload new image if changed
        filer.uploadImage(member, DIRECTORY.MEMBERS, changed, callback);
      },
      function (member, callback) {
        // Update member in database
        const query = knex('members').update(member).where('id', id);
        query.asCallback(function (err) {
          callback(err, member.slug);
        });
      }
    ],
    function (err, slug) {
      respondToClient(res, err, 200, {
        slug
      });
    }
  );
};

/** Delete an existing team member from database */
exports.deleteMember = (req, res) => {
  const id = req.params.id;

  async.waterfall(
    [
      function (callback) {
        // Delete image from cloud
        const query = knex.select().from('members').where('id', id);
        query.asCallback(function (err, [member] = []) {
          if (err) return callback(err);
          if (!member)
            return callback(ERROR.INVALID_ENTITY_ID(ENTITY.MEMBER, id));
          filer.destroyImage(member.image, callback);
        });
      },
      function (callback) {
        // Delete member from database
        const query = knex('members').where('id', id).del();
        query.asCallback(function (err) {
          err ? callback(err) : callback(null);
        });
      }
    ],
    function (err) {
      respondToClient(res, err, 204);
    }
  );
};
