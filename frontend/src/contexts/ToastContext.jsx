import React, { createContext, useContext, useCallback, useState } from 'react';

const ToastContext = createContext(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be inside ToastProvider');
    return ctx;
}

let _nextId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    }, []);

    const show = useCallback((message, type = 'info', duration = 3500) => {
        const id = ++_nextId;
        setToasts(prev => [...prev, { id, message, type, leaving: false }]);
        if (duration > 0) setTimeout(() => dismiss(id), duration);
        return id;
    }, [dismiss]);

    const toast = {
        success: (msg, dur) => show(msg, 'success', dur),
        error:   (msg, dur) => show(msg, 'error',   dur ?? 5000),
        warning: (msg, dur) => show(msg, 'warning', dur),
        info:    (msg, dur) => show(msg, 'info',    dur),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <Toaster toasts={toasts} dismiss={dismiss} />
        </ToastContext.Provider>
    );
}

/* ── Toaster UI ─────────────────────────────────────────────────────────────── */

const ICONS = {
    success: (
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    ),
    error: (
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
    ),
    warning: (
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
    ),
    info: (
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
    ),
};

const STYLES = {
    success: {
        bar:  '#22c55e',
        icon: '#16a34a',
        bg:   '#f0fdf4',
        border: '#bbf7d0',
        text: '#14532d',
    },
    error: {
        bar:  '#ef4444',
        icon: '#dc2626',
        bg:   '#fef2f2',
        border: '#fecaca',
        text: '#7f1d1d',
    },
    warning: {
        bar:  '#f59e0b',
        icon: '#d97706',
        bg:   '#fffbeb',
        border: '#fde68a',
        text: '#78350f',
    },
    info: {
        bar:  '#8b5628',
        icon: '#704214',
        bg:   '#f7efe8',
        border: '#d6b89a',
        text: '#4a2800',
    },
};

function Toaster({ toasts, dismiss }) {
    if (toasts.length === 0) return null;
    return (
        <div style={containerStyle}>
            {toasts.map(t => (
                <Toast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
            ))}
        </div>
    );
}

function Toast({ toast, onDismiss }) {
    const s = STYLES[toast.type] || STYLES.info;
    return (
        <div
            role="alert"
            style={{
                ...toastBase,
                background: s.bg,
                border: `1px solid ${s.border}`,
                opacity: toast.leaving ? 0 : 1,
                transform: toast.leaving ? 'translateX(110%)' : 'translateX(0)',
                transition: 'opacity 0.32s ease, transform 0.32s cubic-bezier(0.4,0,0.2,1)',
            }}
        >
            {/* Colored left bar */}
            <div style={{ width: 4, borderRadius: '4px 0 0 4px', background: s.bar, alignSelf: 'stretch', flexShrink: 0 }} />

            {/* Icon */}
            <span style={{ color: s.icon, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {ICONS[toast.type]}
            </span>

            {/* Message */}
            <span style={{ flex: 1, fontSize: 14, color: s.text, fontFamily: 'inherit', lineHeight: 1.45 }}>
                {toast.message}
            </span>

            {/* Close */}
            <button
                onClick={onDismiss}
                aria-label="Dismiss"
                style={closeBtn}
            >
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}

const containerStyle = {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxWidth: 380,
    width: 'calc(100vw - 48px)',
    pointerEvents: 'none',
};

const toastBase = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px 12px 0',
    borderRadius: 12,
    boxShadow: '0 4px 18px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    pointerEvents: 'all',
    cursor: 'default',
    minWidth: 0,
};

const closeBtn = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 6,
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    lineHeight: 1,
};
