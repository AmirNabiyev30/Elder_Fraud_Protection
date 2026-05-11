import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import Navbar from '../components/Navbar';
import Herosection from '../components/Herosection';
import Footer from '../components/Footer';
import ScanSection from '../components/ScanSection';
import AnalysisResults from '../components/Analysis';
import { scanEmail } from "../lib/authApi";

const GUEST_SCAN_STORAGE_KEY = "guest_scan_used";

function Home(){
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [analysisResult, setAnalysisResult] = useState(null);
    const [scanError, setScanError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const handleAnalyze = async (text) => {
        const trimmedText = text.trim();
        if (!trimmedText) {
            setScanError("Paste an email before running the analysis.");
            return;
        }

        const guestScanUsed = window.localStorage.getItem(GUEST_SCAN_STORAGE_KEY) === "true";
        if (isLoaded && !isSignedIn && guestScanUsed) {
            setShowLoginPrompt(true);
            setScanError("Please sign in to keep analyzing more messages.");
            return;
        }

        setScanError("");
        setShowLoginPrompt(false);
        setIsSubmitting(true);

        try {
            const response = await scanEmail(getToken, trimmedText);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to analyze this message right now.");
            }

            setAnalysisResult(data);
            if (isLoaded && !isSignedIn) {
                window.localStorage.setItem(GUEST_SCAN_STORAGE_KEY, "true");
                setShowLoginPrompt(true);
            }
        } catch (error) {
            setScanError(error.message || "Unable to analyze this message right now.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return(
    <>
        <Navbar/>
        <Herosection/>
        <ScanSection
            onAnalyze={handleAnalyze}
            isSubmitting={isSubmitting}
            errorMessage={scanError}
            isSignedIn={isSignedIn}
            showLoginPrompt={showLoginPrompt}
        />
        <AnalysisResults analysisResult={analysisResult}/>
        <Footer/>
    </>
    )
}

export default Home;
