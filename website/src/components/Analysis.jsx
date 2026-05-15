// src/components/AnalysisResults.jsx

const exampleAnalysis = {
  pred_label: "phishing",
  pred_score: 94.7,
  summary: "This email shows strong indicators of a scam attempt.",
  red_flags: [
    "Urgent call to action asking you to respond immediately.",
    "A suspicious verification link that does not clearly match a trusted official website.",
  ],
  next_steps: [
    "Do not click links or open attachments in the message.",
    "Visit the institution's official website directly instead of using the email link.",
    "Contact the organization with a trusted phone number if the message seems important.",
  ],
  explanation:
    "This sample analysis highlights how scam emails often create panic, ask you to verify account information quickly, and steer you toward suspicious links or money requests.",
};

const severityMap = {
  phishing: {
    title: "High Risk: Phishing",
    body: "This message shows strong indicators of a scam attempt.",
    accent: "text-[#ba1a1a]",
    badge: "bg-[#ffdad6]",
    icon: "Warning",
  },
  spam: {
    title: "Caution: Likely Spam",
    body: "This message includes patterns commonly found in suspicious bulk messages.",
    accent: "text-[#9a4d00]",
    badge: "bg-[#ffe0b2]",
    icon: "Report",
  },
  legitimate: {
    title: "Lower Risk: Likely Legitimate",
    body: "The analysis did not find strong scam indicators in this message.",
    accent: "text-[#0f6a42]",
    badge: "bg-[#d7f3df]",
    icon: "Verified",
  },
};

function toHeadline(flag, index) {
  const normalized = flag.replace(/[.]/g, "").trim();
  if (!normalized) {
    return `Flag ${index + 1}`;
  }

  const words = normalized.split(" ");
  return words.slice(0, 4).join(" ");
}

export default function AnalysisResults({ analysisResult }) {
  const {
    pred_label: predLabel,
    pred_score: predScore,
    summary,
    red_flags: redFlags = [],
    next_steps: nextSteps = [],
    explanation,
  } = analysisResult || exampleAnalysis;
  const severity = severityMap[predLabel] || severityMap.spam;
  const riskFactors = [
    { label: "Classifier Label", value: predLabel },
    { label: "Confidence Score", value: `${predScore}%` },
    { label: "Detected Red Flags", value: String(redFlags.length) },
  ];

  return (
    <div className="mt-20">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#e7e7f1] pb-4">
        <h2
          className="font-bold text-[#003461]"
          style={{ fontSize: "2rem" }}
        >
          Analysis Summary
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verdict Card */}
        <div className="lg:col-span-1 bg-[#f2f3fd] p-8 rounded-xl flex flex-col items-center text-center">
          <div className={`w-50 h-50 rounded-full ${severity.badge} flex items-center justify-center mb-6`}>
            <span
              className={`material-symbols-outlined ${severity.accent}`}
              style={{ fontSize: "48px" }}
            >
              {severity.icon}
            </span>
          </div>
          <h3 className={`${severity.accent} font-extrabold text-2xl mb-2`}>
            {severity.title}
          </h3>
          <p className="text-[#424750] text-lg mb-8">
            {summary || severity.body}
          </p>

          <div className="w-full pt-6 border-t border-[#c2c6d1]/30 text-left">
            <span className="text-xs uppercase tracking-widest text-[#727781] block mb-4">
              Risk Factors
            </span>
            <div className="space-y-3">
              {riskFactors.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between bg-white p-3 rounded-lg"
                >
                  <span className="text-lg">{label}</span>
                  <span className={`${severity.accent} font-bold capitalize`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold text-[#003461] mb-6">
            Suspicious Elements Detected
          </h3>

          <div className="space-y-6">
            {redFlags.length ? redFlags.map((flag, index) => (
              <div key={`${flag}-${index}`} className="p-6 rounded-lg bg-[#f2f3fd] flag-card">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-[#ba1a1a]">
                    Report
                  </span>
                  <h4 className="font-bold text-[#191b22]">{toHeadline(flag, index)}</h4>
                </div>
                <p className="text-[#424750] text-lg mb-3">{flag}</p>
                <p className="text-sm font-medium text-[#003461] bg-[#004b87]/10 px-3 py-1 rounded-full inline-block">
                  Why this matters: This may be part of the scam signal pattern found in the message.
                </p>
              </div>
            )) : (
              <div className="p-6 rounded-lg bg-[#f2f3fd]">
                <p className="text-[#424750] text-lg">
                  No major red flags were highlighted for this message.
                </p>
              </div>
            )}

            {/* Understanding the Verdict */}
            <div className="mt-10 p-8 bg-[#e7e7f1] rounded-xl">
              <h4 className="font-bold text-[#191b22] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003461]">
                  Info
                </span>
                Understanding the Verdict
              </h4>
              <p className="text-[#424750] text-lg leading-relaxed">
                {explanation}
              </p>
              {nextSteps.length ? (
                <div className="mt-6">
                  <h5 className="font-bold text-[#191b22] mb-3">Recommended next steps</h5>
                  <ul className="space-y-2 text-[#424750] text-lg">
                    {nextSteps.map((step, index) => (
                      <li key={`${step}-${index}`} className="flex gap-3">
                        <span className="text-[#003461] font-bold">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
