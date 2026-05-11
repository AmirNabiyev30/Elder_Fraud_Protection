// src/components/ScanSection.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import "../color-scheme.css";
import { IoShieldCheckmark } from "react-icons/io5";

function ScanSection({ onAnalyze, isSubmitting, errorMessage, isSignedIn, showLoginPrompt }) {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    await onAnalyze(text);
  };

  return (
    <div className="grid grid-cols-2  gap-10">
      <div className=" bg-[#f2f3fd] rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <h2
            className="font-bold text-[#003461]"
          >
            Scan New Email
          </h2>
        </div>

        <div className="space-y-6">
          <div className="">
            <label
              className="block font-semibold text-[#424750] mb-2"
              htmlFor="scan-email-text"
            >
              Paste email content here
            </label>
            <textarea
              id="scan-email-text"
              className="w-full bg-white border-none rounded-lg p-6 text-lg text-[#191b22] placeholder-[#727781] focus:ring-2 focus:ring-[#27609d]/40 transition-all resize-none shadow-sm"
              placeholder="e.g. Dear Valued Customer, your account has been compromised and locked. Please click here to verify your identity and send a wire transfer immediately. bit.ly/secure-verify-993"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={10}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              className="primary-gradient text-[var(--color-primary)] px-10 py-4 rounded-lg font-bold text-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isSubmitting || !text.trim()}
              type="button"
            >
              {isSubmitting ? "Analyzing..." : "Analyze Email"}
            </button>
          </div>
          {errorMessage ? (
            <p className="text-sm font-medium text-red-600">{errorMessage}</p>
          ) : null}
          {showLoginPrompt && !isSignedIn ? (
            <div className="rounded-lg border border-[#c2c6d1]/40 bg-white px-5 py-4 text-[#424750]">
              <p className="font-semibold text-[#191b22] mb-2">
                Your free guest scan has been used.
              </p>
              <p className="mb-3">
                Sign in to analyze more messages and save your results to your account.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center rounded-lg bg-[#003461] px-4 py-2 font-semibold text-white hover:bg-[#004b87] transition-colors"
              >
                Sign in to continue
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Context Info Cards */}
      <div className="flex flex-col gap-6">
        {/* Why use this */}
        <div className="bg-[#004b87] text-[#8abcff] p-8 rounded-xl relative overflow-hidden flex-1">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4 text-white">Why use this?</h3>
            <p className="opacity-90 leading-relaxed mb-6 text-lg">
              Fraudulent emails often use pressure tactics and familiar logos to
              create a false sense of urgency. We help you slow down and see the
              facts.
            </p>
            <ul className="space-y-4">
              {[
                "Identify fake sender addresses",
                "Detect manipulative language",
                "Spot suspicious external links",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#acf4a4]">
                    <IoShieldCheckmark/>
                  </span>
                  <span className="font-medium text-white">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanSection;
