import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/context";

export default function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="app-header">
        <Link to="/teams" className="brand">
          Synced
        </Link>
        <div className="app-header-user">
          {user && <span>{user.full_name}</span>}
          <button type="button" onClick={signOut}>
            Log out
          </button>
        </div>
      </header>
      <Outlet />
    </>
  );
}