import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { validateName, validateEmail } from "../utils/validators";

function SignUpPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = () => {
        if (validateInputs()) {
        console.log({ fullName, email, phone, password });
        alert("Registration successful! (This is a demo, no actual account is created.)");
        // Reset form fields
        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
        }
        else{
            const submitErrorElement = document.getElementById("submit-error");
            submitErrorElement.classList.remove("hidden");
            submitErrorElement.classList.add("text-red-500");
            console.log("All fields are required.");
        }
    };

  /*Functions for validating inputs */
  // Source - https://stackoverflow.com/a/9204568
// Posted by C. Lee, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-05, License - CC BY-SA 4.0

    

    const validateInputs = () => {

        //Name Format Validation
        if (!validateName(fullName)) {
        const nameErrorElement = document.getElementById("name-error");
        nameErrorElement.classList.remove("hidden");
        console.log("Invalid name. Please enter a valid full name.");
        return false;
        }
        
        //Email Format Validation
        if (!validateEmail(email)) {
        const emailErrorElement = document.getElementById("email-error");
        emailErrorElement.classList.remove("hidden");
        console.log("Invalid email address.");
        return false;
        }
        //Password and confirm password validation
        if (password !== confirmPassword) {
        //alert("Passwords do not match.");
            const passwordMismatchElement = document.getElementById("password-mismatch");

            passwordMismatchElement.classList.remove("hidden");
            console.log("Passwords do not match.");
            return false;
        }
        return true;
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
                Protect <br />Yourself.
            </h1>
            <p className="text-[#424750] text-lg leading-relaxed max-w-sm">
                Set up your secure protection account in minutes. We'll guide you through each step of the journey.
            </p>
            </div>

            {/* Register Card */}
            <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-sm border border-[#c2c6d1]/20">
            <div className="space-y-8">
                <div className="space-y-6">

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
                    <div id="name-error" className="hidden text-sm text-[#424750]/80 mt-1">
                        <p>Invalid name. Please enter a valid full name.</p>
                    </div>
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
                    <div id="email-error" className="hidden text-sm text-[#424750]/80 mt-1">
                        <p>Please enter a valid email address.</p>
                    </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <label className="text-[#191b22] font-bold text-lg block" htmlFor="phone">
                    Create Password
                    </label>
                    <input
                    className="w-full h-14 px-5 bg-[#e1e2ec] rounded-lg border-0 focus:ring-2 focus:ring-[#27609d]/40 focus:bg-white transition-all text-[#191b22] text-lg"
                    id="password"
                    name="password"
                    placeholder="Create a strong password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                    <label className="text-[#191b22] font-bold text-lg block" htmlFor="confirm_password">
                    Confirm Password
                    </label>
                    <input
                    className="w-full h-14 px-5 bg-[#e1e2ec] rounded-lg border-0 focus:ring-2 focus:ring-[#27609d]/40 focus:bg-white transition-all text-[#191b22] text-lg"
                    id="confirm_password"
                    name="confirm_password"
                    placeholder="Confirm your password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <div id="password-mismatch" className="hidden text-sm text-[#424750]/80 mt-1">
                    <p> Password's don't match</p>
                    </div>
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
                <div id = "submit-error" className="hidden text-sm text-[#424750]/80 mt-1">
                    <p> Please correct the errors in the form before submitting.</p>
                </div>
                </div>

                <div className="pt-4 text-center">
                <p className="text-[#424750] mb-4">Already have an account?</p>
                <Link
                    className="inline-flex items-center justify-center w-full h-14 bg-[#e7e7f1] text-[#191b22] font-bold text-lg rounded-lg hover:bg-[#e1e2ec] transition-colors"
                    to="/login"
                >
                    Sign In
                </Link>
                </div>
            </div>
            </div>
        </main>

        {/* Footer */}
        <Footer />
        </div>
    );
    }

export default SignUpPage; 