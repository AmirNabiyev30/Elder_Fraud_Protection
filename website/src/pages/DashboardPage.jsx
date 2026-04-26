import { useAuth, useClerk } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchAuthContext } from "../lib/authApi";

function DashboardPage() {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const [authContext, setAuthContext] = useState(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    async function loadContext() {
      try {
        const response = await fetchAuthContext(getToken);
        const data = await response.json();
        setAuthContext(data);
      } catch {
        setAuthContext({
          is_authenticated: false,
          auth_error: "Unable to load auth context",
        });
      }
    }

    loadContext();
  }, [getToken]);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate("/login");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="bg-[#faf8ff] text-[#191b22] min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-32 pb-20">
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-[#c2c6d1]/20">
          <h1 className="text-[#003461] font-extrabold text-4xl mb-4">Temporary Dashboard</h1>
          <p className="text-[#424750] mb-6">
            You are signed in. This is a temporary destination after login/sign up.
          </p>
          <pre className="bg-[#f2f3fd] p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(authContext, null, 2)}
          </pre>
          <div className="mt-6 flex gap-3">
            <Link className="text-[#003461] font-semibold hover:underline" to="/">
              Go to Home
            </Link>
            <Link className="text-[#003461] font-semibold hover:underline" to="/login">
              Go to Login
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-[#003461] font-semibold hover:underline disabled:opacity-60"
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default DashboardPage;
