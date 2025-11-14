
import React from 'react';
import type { UserRole } from '../../types';
import logoWhite from '@/assets/logo-white.png';
import { UserCircleIcon } from '../ui/Icons';

interface TopBarProps {
    userRole: UserRole;
    userName?: string;
    onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ userRole, userName, onLogout }) => {
    return (
        <header className="h-16 w-full bg-[#1E6EAD] text-white flex-shrink-0 flex items-center justify-between px-4 md:px-8 z-20 shadow-md">
            <div className="flex items-center gap-3">
                <img src={logoWhite} alt="AV" className="w-10 h-10 object-contain" />
                <h1 className="text-xl font-bold tracking-tight">Entradas de mercancía</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right leading-tight">
                    <p className="text-sm font-semibold">{userName ?? 'Usuario'}</p>
                    <p className="text-xs text-white/80">{userRole}</p>
                </div>
                <UserCircleIcon className="w-8 h-8 text-[--color-primary-light]"/>
                <button 
                    onClick={onLogout}
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        </header>
    );
};
