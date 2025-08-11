import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconDashboard, IconSettings } from '../constants';

interface SidebarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ searchTerm, onSearchChange }) => {
    const linkClasses = "flex items-center px-4 py-3 text-text-on-sidebar/70 hover:bg-ui-sidebar-surface rounded-lg transition-colors duration-200";
    const activeLinkClasses = "bg-success text-gray-900 font-bold";

    return (
        <aside className="w-64 bg-ui-sidebar text-text-on-sidebar flex flex-col p-4 fixed h-full shadow-2xl">
            <div className="flex items-center mb-10 p-2">
                 <div className="bg-success p-2 rounded-lg">
                    <i className="fas fa-bullseye text-gray-900"></i>
                 </div>
                <h1 className="text-xl font-bold ml-3 text-text-on-sidebar">Cliente360</h1>
            </div>

            <div className="relative mb-8">
                <input
                    type="text"
                    placeholder="Buscar clientes..."
                    className="w-full bg-ui-sidebar-surface border border-border/20 rounded-lg py-2 pl-4 pr-10 text-text-on-sidebar placeholder-text-on-sidebar/50 focus:outline-none focus:ring-2 focus:ring-success"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-text-on-sidebar/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>

            <nav className="flex flex-col space-y-2 flex-grow">
                <NavLink to="/" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <IconDashboard />
                    <span className="ml-4">Painel</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <IconSettings />
                    <span className="ml-4">Configurações</span>
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;