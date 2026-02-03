
import React from 'react';
import type { UserRole } from '../../types';
import logoWhite from '@/assets/logo-white.png';
import { UserCircleIcon, LogoutIcon } from '../ui/Icons';

interface TopBarProps {
    userRole: UserRole;
    userName?: string;
    onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ userRole, userName, onLogout }) => {
    return (
        <header className="h-14 md:h-16 w-full bg-[#1E6EAD] text-white flex-shrink-0 flex items-center justify-between px-3 md:px-8 z-20 shadow-md">
            <div className="flex items-center gap-2 md:gap-3">
                <img src={logoWhite} alt="AV" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                {/* Título solo visible en desktop */}
                <h1 className="hidden md:block text-xl font-bold tracking-tight">Entradas de mercancía</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                {/* Info usuario - condensado en móvil */}
                <div className="text-right leading-tight">
                    <p className="text-xs md:text-sm font-semibold truncate max-w-[100px] md:max-w-none">{userName ?? 'Usuario'}</p>
                    <p className="text-[10px] md:text-xs text-white/80">{userRole}</p>
                </div>
                <UserCircleIcon className="hidden md:block w-8 h-8 text-[--color-primary-light]" />
                {/* Botón logout - texto en desktop, icono en móvil */}
                <button
                    onClick={onLogout}
                    className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Cerrar sesión"
                >
                    <LogoutIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={onLogout}
                    className="hidden md:block text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        </header>
    );
};
