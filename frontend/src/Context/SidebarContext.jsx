import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebar_open');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => {
            const newValue = !prev;
            localStorage.setItem('sidebar_open', JSON.stringify(newValue));
            return newValue;
        });
    };

    return (
        <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
