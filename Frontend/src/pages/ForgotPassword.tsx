import { useState } from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import otpAnimation from "../assets/otp.json"; // <-- your lottie json here

import { authService } from "../services/authService";
import toast from "react-hot-toast";
import { Mail, Lock, KeyRound, Loader2, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      toast.success("OTP sent to your email!");
      setStep("otp");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.verifyOtp(email, otp);
      toast.success("OTP verified!");
      setStep("reset");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");

    setLoading(true);

    try {
      await authService.resetPassword(email, otp, newPassword);
      toast.success("Password reset successful!");
      window.location.href = "/login";
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-5xl w-full bg-white shadow-2xl rounded-2xl grid grid-cols-1 md:grid-cols-2">
        {/* LEFT SIDE LOTTIE */}
        <div className="hidden md:flex justify-center items-center bg-blue-50 rounded-l-2xl p-6">
          <Lottie animationData={otpAnimation} loop className="w-3/4" />
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="p-10 space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 rounded-full p-3">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-gray-600">
              {step === "email" && "Enter your email to receive OTP"}
              {step === "otp" && "Enter the OTP sent to your email"}
              {step === "reset" && "Create your new password"}
            </p>
          </div>

          {/* STEP 1 – Email */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          )}

          {/* STEP 2 – OTP */}
          {/* STEP 2 – OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="text-center">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Enter 6-digit OTP
                </label>

                {/* OTP BOXES */}
                <div className="flex justify-center gap-3 mt-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      maxLength={1}
                      type="text"
                      inputMode="numeric"
                      className="
              w-12 h-14 text-center text-2xl font-semibold 
              border border-gray-300 rounded-xl 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              outline-none
            "
                      value={otp[index] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!/^\d?$/.test(value)) return;

                        const newOtp = otp.split("");
                        newOtp[index] = value;
                        setOtp(newOtp.join(""));

                        // Move to next box
                        if (value && index < 5) {
                          const next = document.getElementById(
                            `otp-${index + 1}`
                          );
                          next?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[index] && index > 0) {
                          const prev = document.getElementById(
                            `otp-${index - 1}`
                          );
                          prev?.focus();
                        }
                      }}
                      id={`otp-${index}`}
                    />
                  ))}
                </div>
              </div>

              <button
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  "Verify OTP"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full flex justify-center items-center text-gray-600 hover:text-black mt-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </button>
            </form>
          )}

          {/* STEP 3 – Reset Password */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-4">
            <Link to="/login" className="text-blue-600 hover:text-blue-700">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
