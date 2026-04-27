"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("Creating account...");

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("Success! Account created and you are logged in.");
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("Signing in...");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("Success! Welcome back.");
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm w-96">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    PackageOps Login
                </h1>

                <form className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleSignIn}
                            className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={handleSignUp}
                            className="w-full bg-gray-200 text-gray-800 font-semibold py-2 rounded hover:bg-gray-300 transition"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>

                {message && (
                    <p className="mt-4 text-sm font-medium text-center text-gray-700">
                        {message}
                    </p>
                )}
            </div>
        </main>
    );
}