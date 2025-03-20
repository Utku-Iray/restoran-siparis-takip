'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setErrorMessage("Email ve şifre gereklidir.");
            return;
        }

        if (email === "user@example.com" && password === "password123") {
            router.push("/orders");
        } else {
            setErrorMessage("Geçersiz kullanıcı bilgileri.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 text-black">
            <div className="w-full max-w-md p-8 space-y-6 bg-white text-black shadow-lg rounded-lg">
                <h2 className="text-center text-2xl font-bold text-gray-700">Giriş Yap</h2>
                {errorMessage && <div className="text-red-500 text-center">{errorMessage}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            E-posta
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Şifre
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                    >
                        Giriş Yap
                    </button>
                </form>
                <div className="text-center mt-4">
                    <a href="/auth/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800">
                        Şifremi Unuttum?
                    </a>
                </div>
            </div>
        </div>
    );
}
