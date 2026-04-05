import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = () => {
    console.log({ fullName, email, phone });
  };

  return (
    <div className="bg-[#faf8ff] text-[#191b22] min-h-screen flex flex-col">
      {/* TopNavBar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-40 -left-20 w-96 h-96 bg-[#d3e4ff]/30 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-20 -right-20 w-[30rem] h-[30rem] bg-[#acf4a4]/20 rounded-full blur-[120px] -z-10" />

        {/* Editorial Header */}
        <div className="max-w-md w-full mb-10 md:-ml-16">
          <h1 className="text-[#003461] font-extrabold text-5xl md:text-6xl tracking-tight leading-tight mb-4">
            Join <br />Sanctuary.
          </h1>
          <p className="text-[#424750] text-lg leading-relaxed max-w-sm">
            Set up your secure protection account in minutes. We'll guide you through each step of the journey.
          </p>
        </div>

        {/* Register Card */}
        <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-sm border border-[#c2c6d1]/20">
          <div className="space-y-8">
            <div className="space-y-6">

              {/* Important Information */}
              <div className="bg-[#ededf7] rounded-lg p-4">
                <p className="text-[#003461] text-xs font-bold uppercase tracking-wide mb-2">Important Information</p>
                <div className="h-28 overflow-y-auto pr-1 space-y-2 text-sm text-[#424750] leading-relaxed">
                  <p>Welcome to The Guardian's Path. By proceeding with this registration, you acknowledge that Sanctuary provides enhanced digital protection and identity monitoring services.</p>
                  <p>Our commitment to your privacy is paramount. Your personal data is encrypted at rest and in transit. We do not sell your information to third parties.</p>
                  <p>Please ensure the details provided are accurate to facilitate the verification process. This information will be used to secure your account and communicate critical security alerts.</p>
                  <p>You may review our comprehensive Privacy Policy and Terms of Service at any time via the links provided at the bottom of this page.</p>
                </div>
              </div>

              {/* Full Name Input */}
              <div className="space-y-2">
                <label className="text-[#191b22] font-bold text-lg block" htmlFor="full_name">
                  Full Name
                </label>
                <input
                  className="w-full h-14 px-5 bg-[#e1e2ec] rounded-lg border-0 focus:ring-2 focus:ring-[#27609d]/40 focus:bg-white transition-all text-[#191b22] text-lg"
                  id="full_name"
                  name="full_name"
                  placeholder="Enter your full legal name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-[#191b22] font-bold text-lg block" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="w-full h-14 px-5 bg-[#e1e2ec] rounded-lg border-0 focus:ring-2 focus:ring-[#27609d]/40 focus:bg-white transition-all text-[#191b22] text-lg"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <label className="text-[#191b22] font-bold text-lg block" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  className="w-full h-14 px-5 bg-[#e1e2ec] rounded-lg border-0 focus:ring-2 focus:ring-[#27609d]/40 focus:bg-white transition-all text-[#191b22] text-lg"
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Continue Button */}
              <button
                className="w-full h-14 bg-gradient-to-br from-[#003461] to-[#004b87] text-white font-bold text-xl rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                disabled={!fullName || !email || !phone}
                onClick={handleSubmit}
              >
                Continue
                <span className="text-lg">→</span>
              </button>
            </div>

            <div className="pt-4 text-center">
              <p className="text-[#424750] mb-4">Already have an account?</p>
              <a
                className="inline-flex items-center justify-center w-full h-14 bg-[#e7e7f1] text-[#191b22] font-bold text-lg rounded-lg hover:bg-[#e1e2ec] transition-colors"
                href="#"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default RegisterPage; 