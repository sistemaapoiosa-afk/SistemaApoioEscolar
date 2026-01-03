import React, { useState, useEffect } from 'react';
import { X, User, Lock, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, profile, refreshProfile } = useAuth();
    const [alias, setAlias] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && profile) {
            setAlias(profile.alias || '');
            setPassword('');
            setConfirmPassword('');
        }
    }, [isOpen, profile]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!user || !profile) return;

        // Validation
        if (password && password !== confirmPassword) {
            toast.error('As senhas não coincidem.');
            return;
        }

        if (password && password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setIsSaving(true);
        let success = true;

        // 1. Update Alias if changed
        if (alias !== (profile.alias || '')) {
            const { error } = await supabase
                .from('Profissionais')
                .update({ alias: alias.trim() || null })
                .eq('id', user.id);

            if (error) {
                console.error('Error updating alias:', error);
                toast.error('Erro ao salvar apelido.');
                success = false;
            } else {
                await refreshProfile();
            }
        }

        // 2. Update Password if provided
        if (password && success) {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                console.error('Error updating password:', error);
                toast.error('Erro ao atualizar senha.');
                success = false;
            } else {
                toast.success('Senha atualizada com sucesso.');
            }
        }

        if (success) {
            toast.success('Alterações salvas!');
            onClose();
        }

        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-600" />
                        Editar Perfil
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Info (Read Only) */}
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-2">
                        <p className="text-xs font-bold text-slate-500 uppercase">Usuário</p>
                        <p className="text-sm font-medium text-slate-800">{profile?.nome}</p>
                        <p className="text-xs text-slate-500">{profile?.email}</p>
                    </div>

                    {/* Alias Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            Apelido (Nome Curto)
                        </label>
                        <input
                            type="text"
                            value={alias}
                            onChange={(e) => setAlias(e.target.value)}
                            placeholder="Como você quer ser chamado..."
                            className="w-full pl-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        <p className="text-[10px] text-slate-400">Usado na exibição de horários e cards.</p>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            Alterar Senha
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nova Senha (min. 6 caracteres)"
                            className="w-full pl-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmar Nova Senha"
                            className="w-full pl-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};
