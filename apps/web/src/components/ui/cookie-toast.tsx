"use client";

import React, { useState, useEffect } from "react";

export default function CookieToast() {
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (consent !== "true") {
            setShowToast(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "true");
        setShowToast(false);
    };

    const handleDecline = () => {
        // You might want to handle decline differently, e.g., disable certain features.
        // For this example, we'll just hide the toast.
        setShowToast(false);
    };

    if (!showToast) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="flex flex-col items-center w-full max-w-sm sm:max-w-md bg-white text-gray-500 text-center p-6 rounded-lg border border-gray-500/30 text-sm shadow-lg">
                <img className="w-14 h-14" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/cookies/cookieImage1.svg" alt="cookieImage1" />
                <h2 className="text-gray-800 text-xl font-medium pb-3 mt-2">We care about your privacy</h2>
                <p className="w-11/12">This website uses cookies for functionality, analytics, and marketing. By accepting, you agree to our <a href="#" className="font-medium underline">Cookie Policy</a>.</p>
                <div className="flex items-center justify-center mt-6 gap-4 w-full">
                    <button type="button" onClick={handleDecline} className="font-medium px-8 border border-gray-500/30 py-2 rounded hover:bg-gray-100 active:scale-95 transition">Decline</button>
                    <button type="button" onClick={handleAccept} className="bg-indigo-600 px-8 py-2 rounded text-white font-medium active:scale-95 transition">Accept</button>
                </div>
            </div>
        </div>
    );
};
