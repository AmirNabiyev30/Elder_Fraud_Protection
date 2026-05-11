import { useAuth, useClerk } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchAuthContext, fetchCurrentUserProfile, fetchRecentScans } from "../lib/authApi";

function formatTimestamp(value) {
  if (!value) {
    return "No scans yet";
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return "No scans yet";
  }

  return timestamp.toLocaleString();
}

function formatLabel(label) {
  if (!label) {
    return "No scans yet";
  }

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getSafetySummary(stats) {
  if (!stats?.total_scans) {
    return {
      badge: "Ready",
      badgeClass: "bg-[#2196f3]",
      text: "Run your first scan to start building your protection history.",
    };
  }

  if (stats.high_risk_scans > 0) {
    return {
      badge: "Alert",
      badgeClass: "bg-[#d32f2f]",
      text: "High-risk messages have been detected recently. Review your latest scans carefully.",
    };
  }

  return {
    badge: "Safe",
    badgeClass: "bg-[#4caf50]",
    text: "No recent high-risk scans were detected in your account history.",
  };
}

function DashboardPage() {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [authContext, setAuthContext] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [scanStats, setScanStats] = useState(null);
  const [dashboardError, setDashboardError] = useState("");
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        navigate("/login");
        return;
      }

      setIsLoadingDashboard(true);
      setDashboardError("");

      try {
        const [authResponse, profileResponse, scansResponse] = await Promise.all([
          fetchAuthContext(getToken),
          fetchCurrentUserProfile(getToken),
          fetchRecentScans(getToken),
        ]);
        const [authData, profileData, scansData] = await Promise.all([
          authResponse.json(),
          profileResponse.json(),
          scansResponse.json(),
        ]);

        if (!authResponse.ok) {
          throw new Error(authData.auth_error || "Unable to load auth context");
        }
        if (!profileResponse.ok) {
          throw new Error(profileData.error || "Unable to load your profile");
        }
        if (!scansResponse.ok) {
          throw new Error(scansData.error || "Unable to load your scans");
        }

        setAuthContext(authData);
        setUserProfile(profileData.user);
        setRecentScans(scansData.scans || []);
        setScanStats(scansData.stats || null);
      } catch {
        setDashboardError("Unable to load your dashboard right now.");
      } finally {
        setIsLoadingDashboard(false);
      }
    }

    loadDashboard();
  }, [getToken, isLoaded, isSignedIn, navigate]);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate("/login");
    } finally {
      setIsSigningOut(false);
    }
  }

  const safetySummary = getSafetySummary(scanStats);
  const latestScan = recentScans[0];
  const profileName = userProfile?.full_name || "Protected user";
  const profileEmail = userProfile?.email || authContext?.auth_user?.user_id || "Unavailable";
  const profilePhone = userProfile?.phone || "No phone number saved";

  return (
    <div className="bg-[#faf8ff] text-[#191b22] min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-8 pb-20">
        <div className="w-full max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-[#c2c6d1]/20">
          <div className="mb-8">
            <h1 className="text-[#003461] font-extrabold text-4xl mb-2">Dashboard</h1>
            <p className="text-[#424750]">
              Welcome back. Review your latest protection activity and account details.
            </p>
          </div>

          {dashboardError ? (
            <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-700">
              {dashboardError}
            </div>
          ) : null}

          <div className="mb-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-gradient-to-br from-[#f8f9fa] to-[#f0f2f5] p-6 rounded-lg border border-[#c2c6d1]/20">
                <h2 className="text-[#003461] font-bold text-2xl mb-6 text-center">Safety Metrics</h2>
                <div className="flex flex-col items-center">
                  <div className={`w-24 h-24 rounded-full ${safetySummary.badgeClass} flex items-center justify-center mb-6 shadow-md`}>
                    <div className="text-2xl font-bold text-white">{safetySummary.badge}</div>
                  </div>

                  <div className="text-center mb-3">
                    <div className="text-sm text-[#424750] font-semibold">Latest Scan</div>
                    <div className="text-xl font-bold text-[#003461] font-mono">
                      {isLoadingDashboard ? "Loading..." : formatTimestamp(scanStats?.latest_scan_at)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-[#424750] font-semibold">Latest Verdict</div>
                    <div className="text-2xl font-bold text-[#003461] font-mono">
                      {isLoadingDashboard ? "Loading..." : formatLabel(scanStats?.latest_scan_label)}
                    </div>
                  </div>

                  <p className="mt-5 text-center text-[#424750]">{safetySummary.text}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#f8f9fa] to-[#f0f2f5] p-6 rounded-lg border border-[#c2c6d1]/20">
                <h2 className="text-[#003461] font-bold text-2xl mb-6 text-center">Quick Stats</h2>
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-full grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg text-center border border-[#c2c6d1]/20">
                      <div className="text-2xl font-bold text-[#003461]">
                        {isLoadingDashboard ? "..." : scanStats?.total_scans ?? 0}
                      </div>
                      <div className="text-xs text-[#424750] font-semibold mt-1">Total Scans</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg text-center border border-[#c2c6d1]/20">
                      <div className="text-2xl font-bold text-[#d32f2f]">
                        {isLoadingDashboard ? "..." : scanStats?.high_risk_scans ?? 0}
                      </div>
                      <div className="text-xs text-[#424750] font-semibold mt-1">High-Risk Scans</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg text-center border border-[#c2c6d1]/20">
                      <div className="text-2xl font-bold text-[#4caf50]">
                        {isLoadingDashboard ? "..." : scanStats?.counts_by_label?.legitimate ?? 0}
                      </div>
                      <div className="text-xs text-[#424750] font-semibold mt-1">Legitimate</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg text-center border border-[#c2c6d1]/20">
                      <div className="text-2xl font-bold text-[#2196f3]">
                        {isLoadingDashboard ? "..." : scanStats?.counts_by_label?.phishing ?? 0}
                      </div>
                      <div className="text-xs text-[#424750] font-semibold mt-1">Phishing</div>
                    </div>
                  </div>

                  <Link
                    to="/"
                    className="w-full bg-[#003461] hover:bg-[#002147] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
                  >
                    Scan Email Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <section className="bg-[#f8f9fa] rounded-xl border border-[#c2c6d1]/20 p-6">
              <h3 className="text-[#003461] font-bold text-xl mb-4">Recent Scans</h3>
              {isLoadingDashboard ? (
                <p className="text-[#424750]">Loading your scan history...</p>
              ) : recentScans.length ? (
                <div className="space-y-4">
                  {recentScans.map((scan, index) => (
                    <div key={`${scan.timestamp}-${index}`} className="rounded-lg bg-white border border-[#c2c6d1]/20 p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-sm uppercase tracking-wide text-[#727781]">Scan #{recentScans.length - index}</div>
                          <h4 className="text-lg font-bold text-[#191b22] capitalize">
                            {scan.pred_label} · {scan.pred_score}%
                          </h4>
                          <p className="text-[#424750] mt-1">
                            {scan.summary || "No summary available for this scan."}
                          </p>
                        </div>
                        <div className="text-sm text-[#727781] whitespace-nowrap">
                          {formatTimestamp(scan.timestamp)}
                        </div>
                      </div>

                      {scan.red_flags?.length ? (
                        <ul className="mt-4 space-y-2 text-sm text-[#424750]">
                          {scan.red_flags.slice(0, 3).map((flag, flagIndex) => (
                            <li key={`${flag}-${flagIndex}`} className="flex gap-2">
                              <span className="font-bold text-[#003461]">•</span>
                              <span>{flag}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-white border border-dashed border-[#c2c6d1]/40 p-6 text-center">
                  <p className="text-[#424750] mb-3">
                    You haven&apos;t analyzed any messages yet.
                  </p>
                  <Link to="/" className="text-[#003461] font-semibold hover:underline">
                    Analyze your first email
                  </Link>
                </div>
              )}
            </section>

            <section className="bg-[#f8f9fa] rounded-xl border border-[#c2c6d1]/20 p-6">
              <h3 className="text-[#003461] font-bold text-xl mb-4">Account Information</h3>
              {isLoadingDashboard ? (
                <p className="text-[#424750]">Loading your profile...</p>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-white border border-[#c2c6d1]/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-[#727781] mb-1">Name</div>
                    <div className="font-semibold text-[#191b22]">{profileName}</div>
                  </div>
                  <div className="rounded-lg bg-white border border-[#c2c6d1]/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-[#727781] mb-1">Email</div>
                    <div className="font-semibold text-[#191b22] break-all">{profileEmail}</div>
                  </div>
                  <div className="rounded-lg bg-white border border-[#c2c6d1]/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-[#727781] mb-1">Phone</div>
                    <div className="font-semibold text-[#191b22]">{profilePhone}</div>
                  </div>
                  <div className="rounded-lg bg-white border border-[#c2c6d1]/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-[#727781] mb-1">Auth Status</div>
                    <div className="font-semibold text-[#191b22]">
                      {authContext?.is_authenticated ? "Authenticated" : "Unavailable"}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

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
