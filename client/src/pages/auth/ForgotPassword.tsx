import { useState } from "react";
import { Link } from "wouter";

import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      await resetPassword(email);
      setMessage(
        "If an account exists for this email, a password reset link has been sent."
      );
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  
  }
  

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          className="w-full border rounded p-2 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded p-2"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {message && (
  <>
    <p className="mt-4 text-center text-sm text-green-600">
      {message}
    </p>

    <div className="mt-6 text-center">
      <Link href="/login">
        <button
          type="button"
          className="text-primary hover:underline font-medium"
        >
          ← Back to Sign In
        </button>
      </Link>
    </div>
  </>
)}
    </div>
  );
}