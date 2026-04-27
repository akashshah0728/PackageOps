"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [message, setMessage] = useState("");

    // 1. New State to hold our list of packages
    const [packages, setPackages] = useState<any[]>([]);

    // 2. The Fetch Function
    const fetchPackages = async () => {
        const { data, error } = await supabase
            .from("packages")
            .select("*")
            .order("created_at", { ascending: false }); // Newest on top

        if (data) {
            setPackages(data);
        }
    };

    // 3. Fire the fetch function exactly once when the page loads
    useEffect(() => {
        fetchPackages();
    }, []);

    const handleAddPackage = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("Connecting to database...");

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setMessage("Error: You are not logged in.");
            return;
        }

        const { error } = await supabase
            .from("packages")
            .insert([
                {
                    tracking_number: trackingNumber,
                    user_id: user.id
                }
            ]);

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("Success! Package added to the vault.");
            setTrackingNumber("");
            // 4. Refresh the list immediately after adding a new package
            fetchPackages();
        }
    };

    return (
        <main className="p-10 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-gray-900">PackageOps Dashboard</h1>
            <p className="mt-4 text-gray-600">Welcome to the logistics hub.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">

                {/* Left Column: The Intake Form */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Package</h2>
                    <form onSubmit={handleAddPackage} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Enter Tracking Number"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
                        >
                            Add Package
                        </button>
                    </form>
                    {message && (
                        <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
                    )}
                </div>

                {/* Right Column: The Output Display */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Scans</h2>

                    <div className="border border-gray-100 rounded-md overflow-hidden">
                        {packages.length === 0 ? (
                            <p className="p-4 text-gray-500 text-sm">No packages found in the vault.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {packages.map((pkg) => (
                                    <li key={pkg.id} className="p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {pkg.tracking_number}
                    </span>
                                        <span className="text-xs text-gray-500">
                      {new Date(pkg.created_at).toLocaleDateString()}
                    </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}