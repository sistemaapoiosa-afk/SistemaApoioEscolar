
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useResource } from '../contexts/ResourceContext';
import { Navigate } from 'react-router-dom';
import { Lock, Mail, Loader2, School, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';


export function Login() {
    const { user, profile, loading } = useAuth();
    const { institutionName, logoUrl, semanticColors } = useResource();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // Default primary color fallback (blue-600)
    const primaryColor = semanticColors?.regular || '#2563eb';

    // Helper to decide text color (black or white) based on background luminance
    const getContrastColor = (hexColor: string) => {
        // Remove hash if present
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Calculate luminance (YIQ)
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq >= 128 ? 'text-slate-900' : 'text-white';
    };

    const dynamicTextColor = getContrastColor(primaryColor);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    if (user && profile) {
        return <Navigate to="/" replace />;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Falha ao fazer login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div
                    className="p-8 text-center transition-colors duration-300"
                    style={{ backgroundColor: primaryColor }}
                >
                    <div className="mx-auto w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-sm overflow-hidden border border-white/20">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt="Logo da Escola"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <School className={`w-10 h-10 ${dynamicTextColor}`} />
                        )}
                    </div>
                    <h1 className={`text-xl font-bold mb-2 leading-tight drop-shadow-sm ${dynamicTextColor}`}>
                        {institutionName || 'EscolaManager Pro'}
                    </h1>
                    <p className={`text-sm font-medium opacity-90 ${dynamicTextColor}`}>Sistema de Apoio Escolar</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 animate-fade-in">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                    placeholder="seu.email@escola.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Senha</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                backgroundColor: semanticColors?.loginButtonBg || primaryColor,
                                color: semanticColors?.loginButtonText || undefined // If undefined, let class handle it or default
                            }}
                            // If custom text color is set, don't use dynamicTextColor class, otherwise do.
                            className={`w-full ${semanticColors?.loginButtonText ? '' : dynamicTextColor} font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:brightness-110 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Entrar no Sistema</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}

