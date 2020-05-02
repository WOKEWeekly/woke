const {
    respondToClient
} = require("../../response");
const async = require("async");
const SQL = require("../../sql");
const conn = require("../db").getDb();
const filer = require('../../filer');
const {
    DIRECTORY,
    ENTITY
} = require('../../../constants/strings');
const ERROR = require('../../errors');

/** Retrieve all team members */
exports.getAllMembers = (req, res) => {
    conn.query(SQL.MEMBERS.READ.ALL(), function (err, members) {
        respondToClient(res, err, 200, members);
    });
};

/** Retrieve individual member */
exports.getMember = (req, res) => {
    const id = req.params.id;
    conn.query(SQL.MEMBERS.READ.SINGLE(), id, function (err, [member] = []) {
        if (err) return respondToClient(res, err);
        if (!member) err = ERROR.INVALID_ENTITY_ID(ENTITY.MEMBER, id);
        respondToClient(res, err, 200, member);
    });
};

/** Retrieve a random verified member */
exports.getRandomMember = (req, res) => {
    conn.query(SQL.MEMBERS.READ.RANDOM, function (err, [member] = []) {
        respondToClient(res, err, 200, member);
    });
};

/** Retrieve only authors */
exports.getAuthors = (req, res) => {
    conn.query(SQL.MEMBERS.READ.AUTHORS, function (err, authors) {
        respondToClient(res, err, 200, authors);
    });
};

/** Retrieve only executive team members */
exports.getExecutives = (req, res) => {
    conn.query(SQL.MEMBERS.READ.EXECUTIVES, function (err, executives) {
        respondToClient(res, err, 200, executives);
    });
};

/** Add new team member to database */
exports.addMember = (req, res) => {
    const member = req.body;

    async.waterfall([
        function (callback) { // Upload image to cloud
            filer.uploadImage(member, DIRECTORY.MEMBERS, true, callback);
        },
        function (member, callback) { // Add member to database
            const {
                sql,
                values
            } = SQL.MEMBERS.CREATE(member);
            conn.query(sql, [values], function (err, result) {
                err ? callback(err) : callback(null, result.insertId);
            });
        }
    ], function (err, id) {
        respondToClient(res, err, 201, {
            id
        });
    });
};

/** Update details of existing team member in database */
exports.updateMember = (req, res) => {
    const id = req.params.id;
    const {
        member,
        changed
    } = req.body;

    async.waterfall([
        function (callback) { // Delete old image if changed.
            conn.query(SQL.MEMBERS.READ.SINGLE('image'), id, function (err, [member] = []) {
                if (err) return callback(err);
                if (!member) return callback(ERROR.INVALID_ENTITY_ID(ENTITY.MEMBER, id));
                if (!changed) return callback(null);
                filer.destroyImage(member.image, callback);
            });
        },
        function (callback) { // Equally, upload new image if changed
            filer.uploadImage(member, DIRECTORY.MEMBERS, changed, callback);
        },
        function (member, callback) { // Update member in database
            const {
                sql,
                values
            } = SQL.MEMBERS.UPDATE(id, member, changed);
            conn.query(sql, values, function (err) {
                err ? callback(err) : callback(null, member.slug);
            });
        }
    ], function (err, slug) {
        respondToClient(res, err, 200, {
            slug
        });
    });
};

/** Delete an existing team member from database */
exports.deleteMember = (req, res) => {
    const id = req.params.id;

    async.waterfall([
        function (callback) { // Delete image from cloud
            conn.query(SQL.MEMBERS.READ.SINGLE('image'), id, function (err, [member] = []) {
                if (err) return callback(err);
                if (!member) return callback(ERROR.INVALID_ENTITY_ID(ENTITY.MEMBER, id));
                filer.destroyImage(member.image, callback);
            });
        },
        function (callback) { // Delete member from database
            conn.query(SQL.MEMBERS.DELETE, id, function (err) {
                err ? callback(err) : callback(null);
            });
        }
    ], function (err) {
        respondToClient(res, err, 204);
    });
};