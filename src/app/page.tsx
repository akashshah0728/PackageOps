"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [roomId, setRoomId] = useState(""); // Hooking up your existing column
    const [message, setMessage] = useState("");
    const [packages, setPackages] = useState<any[]>([]);

    const router = useRouter();

    // 1. Fetch only packages that are NOT delivered yet
    const fetchPackages = async () => {
        const { data, error } = await supabase
            .from("packages")
            .select("*")
            .neq("status", "delivered") // Filters out completed packages
            .order("created_at", { ascending: false });

        if (data) {
            setPackages(data);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    // 2. The Sign Out Engine
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login"); // Kicks you back to the front door
    };

    // 3. The Update Engine (Mark Delivered)
    const handleMarkDelivered = async (packageId: string) => {
        const { error } = await supabase
            .from("packages")
            .update({ status: "delivered" })
            .eq("id", packageId); // Finds the exact row to update

        if (!error) {
            fetchPackages(); // Refreshes the list to make the package disappear
        }
    };

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
                    user_id: user.id,
                    room_id: roomId || null, // Using your existing room_id column
                    status: "pending"
                }
            ]);

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("Success! Package added to the vault.");
            setTrackingNumber("");
            setRoomId("");
            fetchPackages();
        }
    };

    return (
        <main className="p-10 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">PackageOps Dashboard</h1>
                    <p className="mt-2 text-gray-600">Welcome to the logistics hub.</p>
                </div>
                <button
                    onClick={handleSignOut}
                    className="bg-red-50 text-red-600 font-semibold py-2 px-4 rounded hover:bg-red-100 transition border border-red-200"
                >
                    Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* Left Column: The Intake Form */}
                <div className="md:col-span-1 p-6 bg-white border border-gray-200 rounded-lg shadow-sm h-fit">
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
                        <input
                            type="text"
                            placeholder="Room ID (e.g., 101A)"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
                <div className="md:col-span-2 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Packages</h2>

                    <div className="border border-gray-100 rounded-md overflow-hidden">
                        {packages.length === 0 ? (
                            <p className="p-4 text-gray-500 text-sm">No active packages found.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {packages.map((pkg) => (
                                    <li key={pkg.id} className="p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
                                        <div className="flex flex-col">
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {pkg.tracking_number}
                      </span>
                                            <div className="flex gap-3 mt-1 text-xs text-gray-500 font-medium">
                                                {pkg.room_id && <span>Room: {pkg.room_id}</span>}
                                                {pkg.carrier && <span>Carrier: {pkg.carrier}</span>}
                                                <span className="capitalize text-yellow-600">Status: {pkg.status}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleMarkDelivered(pkg.id)}
                                            className="bg-green-50 text-green-700 text-sm font-semibold py-1 px-3 rounded hover:bg-green-100 transition border border-green-200"
                                        >
                                            Mark Delivered
                                        </button>
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