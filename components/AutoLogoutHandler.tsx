import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useResource } from '../contexts/ResourceContext';
import { toast } from 'sonner';
import { Modal } from './Modal';

export const AutoLogoutHandler: React.FC = () => {
    const { user, signOut, profile } = useAuth();
    const { sessionTimeouts } = useResource();
    const lastActivityRef = useRef<number>(Date.now());
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [showWarning, setShowWarning] = useState(false);
    const showWarningRef = useRef(false);

    useEffect(() => {
        // Update ref whenever state changes
        showWarningRef.current = showWarning;
    }, [showWarning]);

    useEffect(() => {
        if (!user || !profile || !profile.tipo) return;

        const timeoutMinutes = sessionTimeouts[profile.tipo] || 0;
        if (timeoutMinutes <= 0) return;

        const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        const handleActivity = () => {
            lastActivityRef.current = Date.now();

            // Auto dismiss warning on activity
            if (showWarningRef.current) {
                setShowWarning(false);
            }
        };

        EVENTS.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        timerRef.current = setInterval(() => {
            const now = Date.now();
            const idleTime = now - lastActivityRef.current;
            const timeoutMs = timeoutMinutes * 60 * 1000;
            // Warn 2 minutes before (or 50% if total time is small < 4 min)
            const warningThreshold = Math.max(timeoutMs - (2 * 60 * 1000), timeoutMs * 0.8);

            if (idleTime > timeoutMs) {
                console.log(`[AutoLogout] Time limit reached. Logging out.`);
                toast.warning('Sessão expirada por inatividade.');
                signOut();
            } else if (idleTime > warningThreshold) {
                if (!showWarningRef.current) {
                    setShowWarning(true);
                }
            } else {
                // If we are safe, ensure warning is closed (e.g. if user interacted recently)
                if (showWarningRef.current) {
                    setShowWarning(false);
                }
            }
        }, 5000); // Check every 5s

        handleActivity();

        return () => {
            EVENTS.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [user, profile, sessionTimeouts, signOut]);

    return (
        <Modal
            isOpen={showWarning}
            onClose={() => setShowWarning(false)}
            title="Sessão Expirando"
            message="Sua sessão será encerrada em breve por inatividade. Mova o mouse ou clique em Continuar para permanecer conectado."
            type="warning"
            confirmText="Continuar Conectado"
            onConfirm={() => setShowWarning(false)}
        />
    );
};
