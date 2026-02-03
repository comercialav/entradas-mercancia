
import React from 'react';
import type { Page } from '../../types';
import { DashboardIcon, HistoryIcon } from '../ui/Icons';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
    const activeClasses = "bg-[rgba(47,142,219,0.08)] text-[--color-primary] border-l-4 border-[--color-primary]";
    const inactiveClasses = "text-[--color-text-secondary] hover:bg-gray-200 hover:text-[--color-text-primary]";

    return (
        <li
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 ease-out ${isActive ? activeClasses : inactiveClasses}`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </li>
    );
};

// Bottom Navigation Item para móvil
const BottomNavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center flex-1 py-2 gap-1 transition-colors ${isActive
                    ? 'text-[--color-primary]'
                    : 'text-[--color-text-secondary]'
                }`}
        >
            <span className={isActive ? 'scale-110 transition-transform' : ''}>{icon}</span>
            <span className={`text-[10px] font-medium ${isActive ? 'text-[--color-primary]' : ''}`}>{label}</span>
        </button>
    );
};


export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
    return (
        <>
            {/* Sidebar Desktop - oculto en móvil */}
            <aside className="w-64 bg-[#F3F4F6] border-r border-[--color-border-subtle] flex-shrink-0 hidden lg:block">
                <nav className="mt-8">
                    <ul>
                        <NavItem
                            icon={<DashboardIcon />}
                            label="Panel de llegadas"
                            isActive={currentPage === 'dashboard'}
                            onClick={() => setCurrentPage('dashboard')}
                        />
                        <NavItem
                            icon={<HistoryIcon />}
                            label="Historial"
                            isActive={currentPage === 'history'}
                            onClick={() => setCurrentPage('history')}
                        />
                    </ul>
                </nav>
            </aside>

            {/* Bottom Navigation Móvil - solo visible en móvil */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[--color-border-subtle] flex items-center justify-around z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                <BottomNavItem
                    icon={<DashboardIcon className="w-6 h-6" />}
                    label="Llegadas"
                    isActive={currentPage === 'dashboard'}
                    onClick={() => setCurrentPage('dashboard')}
                />
                <BottomNavItem
                    icon={<HistoryIcon className="w-6 h-6" />}
                    label="Historial"
                    isActive={currentPage === 'history'}
                    onClick={() => setCurrentPage('history')}
                />
            </nav>
        </>
    );
};
