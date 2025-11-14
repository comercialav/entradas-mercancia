
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


export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
    return (
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
    );
};
