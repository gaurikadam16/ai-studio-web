import { useCallback, useEffect, useState } from 'react';
import AuthPage from './components/AuthPage.jsx';
import Studio from './Studio.jsx';
import { getMe, getToken, setToken, whenLoggedOut } from './api/client.js';
import { moveOldDataToUser } from './data/storage.js';

/**
 * Front door of the app:
 *   1. Checking your saved login…
 *   2. Not logged in  -> Sign up / Log in screen
 *   3. Logged in      -> the Studio (dashboard)
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [serverDown, setServerDown] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsNewUser(false);
  }, []);

  // Check if this browser is already logged in
  const checkLogin = useCallback(async () => {
    setServerDown(false);
    if (!getToken()) { setChecking(false); return; }
    setChecking(true);
    try {
      const { user: me } = await getMe();
      moveOldDataToUser(me.id);
      setUser(me);
    } catch (e) {
      if (/reach the server/i.test(e.message)) setServerDown(true); // backend not running: keep the login
      else setToken(null); // login expired or wrong
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    whenLoggedOut(logout); // if the server says "log in again", go back to the login screen
    checkLogin();
  }, [checkLogin, logout]);

  const onAuthed = ({ token, user: me }, isSignup) => {
    setToken(token);
    moveOldDataToUser(me.id);
    setIsNewUser(isSignup);
    setUser(me);
  };

  if (checking) return <div className="splash">Loading…</div>;

  if (serverDown) {
    return (
      <div className="splash stack10 center">
        <strong>Can't reach the server.</strong>
        <span className="muted small">Start it with "npm run dev" in the server folder, then try again.</span>
        <button className="btn-primary sm" onClick={checkLogin}>Try again</button>
      </div>
    );
  }

  if (!user) return <AuthPage onAuthed={onAuthed} />;

  // key={user.id}: switching accounts gives a completely fresh studio
  return <Studio key={user.id} user={user} setUser={setUser} onLogout={logout} isNewUser={isNewUser} />;
}