
/** Ensure valid session is added or updated */
export const isValidSession = (session) => {
  if (!ifExists(session.title.trim(), 'Enter the session title.')) return false;
  if (!ifExists(session.date, 'Select the date when the session will be held.')) return false;
  if (!ifExists(session.image, 'Please select an image for the session.')) return false;
  return true;
}

/** Ensure valid topic is added or updated */
export const isValidTopic = (topic) => {
  if (!ifExists(topic.headline.trim(), 'Enter the topic headline.')) return false;
  if (!ifExists(topic.category, 'Select the topic category.')) return false;
  if (!ifExists(topic.question.trim(), 'Enter the topic question.')) return false;
  if (!ifExists(topic.type, 'Select the topic type.')) return false;
  if (topic.polarity){
    if (!ifExists(topic.option1.trim(), 'Enter the first option to the question.')) return false;
    if (!ifExists(topic.option2.trim(), 'Enter the second option to the question.')) return false;
  }
  return true;
}

/** Ensure valid candidate is added or updated */
export const isValidCandidate = (candidate) => {
  if (!ifExists(candidate.name.trim(), 'Enter the candidate\'s name.')) return false;
  if (!isValidID(candidate.id)) return false;
  if (!ifExists(candidate.birthday, 'Select the candidate\'s date of birth.')) return false;
  if (!ifExists(candidate.occupation.trim(), 'Please select an image for the session.')) return false;
  return true;
}

/** Ensure valid team member is added or updated */
export const isValidMember = (member) => {
  if (!ifExists(member.firstname.trim(), 'Enter the member\'s firstname.')) return false;
  if (!ifExists(member.lastname.trim(), 'Enter the member\'s lastname.')) return false;
  if (!ifExists(member.level, 'Select the member\'s level.')) return false;
  if (!ifExists(member.role.trim(), 'Enter the candidate\'s role.')) return false;
  if (!ifExists(member.birthday, 'Select the candidate\'s date of birth.')) return false;
  return true;
}

/** Check for the presence of a value */
const ifExists = (value, message) => {
  if (!value || value.length == 0){
    alert(message);
    return false;
  } else {
    return true;
  }
}

const isValidID = (x) => {
  if (!x){
    alert(`ID number is missing.`); return false;
  } else if (x < 1) {
    alert(`ID number needs to be a positive non-zero number.`); return false;
  } else {
    return true;
  }
}