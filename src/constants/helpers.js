/**
 * Determine the slug of a specified member based on their level.
 * @param {object} member - The member.
 * @returns {string} The full slug.
 */
exports.determineMemberSlug = (member) => {
  if (!member) return '/';

  let link;

  switch (member.level) {
    case 'Guest':
      link = `/author/${member.slug}`;
      break;
    case 'Quiescent':
      link = '/admin/members';
      break;
    default:
      link = `/team/${member.slug}`;
  }

  return link;
};
