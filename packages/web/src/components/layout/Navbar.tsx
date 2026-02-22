import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCredits } from "../../hooks/useCredits";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { credits } = useCredits();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="text-xl font-bold text-dark">
          Resume<span className="text-coral">AI</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/pricing"
            className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <span>{credits}</span>
            <span>credits</span>
          </Link>

          <div className="flex items-center gap-3">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt=""
                className="h-8 w-8 rounded-full"
              />
            )}
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
