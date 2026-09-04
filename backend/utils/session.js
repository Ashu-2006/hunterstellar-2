/**
 * One active session per team.
 *
 * A team has a single login shared by up to four people, and before this the
 * app happily let all four play at once from four phones. That is now a
 * cheating vector: a team could split up, stand at two stations, and submit
 * both. The rule is newest-login-wins -- signing in mints a new session id,
 * stores it on the team row, and any device still holding an older one is
 * refused.
 *
 * Two deliberate limits on how far this goes:
 *
 * 1. It is checked only on the WRITE endpoints (verify-code, verify-answer),
 *    which already fetch the team row, so enforcement costs zero extra
 *    queries. A superseded phone can still read its clue; it just cannot
 *    submit. Checking in requireAuth instead would mean a database read on
 *    every /team/state poll -- 150 teams every 15 seconds -- to close a gap
 *    that is not where cheating happens.
 *
 * 2. A NULL session_token is permissive. It means "no session recorded yet",
 *    which is true of every team registered before this shipped. Failing
 *    those closed would lock a team out of a live event over a column that
 *    was never populated, and that is a far worse failure than the one this
 *    prevents.
 */

/**
 * @param team       the team row, as fetched by teamModel.getById
 * @param sessionId  the `sid` claim from the caller's JWT (may be undefined)
 */
function isCurrentSession(team, sessionId) {
  // No session on record: nothing to contradict, so let them play.
  if (!team || !team.session_token) return true;

  // A team WITH a session but a token carrying no sid is a token minted
  // before this feature existed. Refusing it is what stops the rule being
  // bypassed by simply replaying an older login.
  return team.session_token === sessionId;
}

/** The single 401 body for an evicted device, so the copy cannot drift. */
const SESSION_REPLACED = {
  error: "Signed in on another device",
  reason: "session_replaced",
};

module.exports = { isCurrentSession, SESSION_REPLACED };
