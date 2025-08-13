
import React, { useMemo } from 'react';
import { Customer } from '../types';
import { IconActivity } from '../constants';
import { timeAgo } from '../utils/date';

const RecentSignups: React.FC<{ customers: Customer[] }> = ({ customers }) => {
    const recentCustomers = useMemo(() => {
        return [...customers]
            .filter(c => c.status === 'Novo')
            .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
            .slice(0, 5);
    }, [customers]);

    return (
        <div className="bg-ui-surface p-6 rounded-2xl shadow-lg border border-border">
            <div className="flex items-center mb-4">
                <div className="bg-primary text-text-on-primary p-2 rounded-lg mr-3">
                    <IconActivity />
                </div>
                <h2 className="text-xl font-bold text-text-default">Cadastros Recentes</h2>
            </div>
            <ul className="space-y-4">
                {recentCustomers.map(customer => (
                    <li key={customer.id} className="flex items-center space-x-4">
                        <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-grow">
                            <p className="font-semibold text-text-default">{customer.name}</p>
                            <p className="text-sm text-text-secondary">{customer.email}</p>
                        </div>
                        <p className="text-sm text-text-secondary flex-shrink-0">{timeAgo(customer.joinDate)}</p>
                    </li>
                ))}
                 {recentCustomers.length === 0 && (
                    <p className="text-center text-text-secondary py-4">Nenhum cadastro recente para mostrar.</p>
                 )}
            </ul>
        </div>
    );
};

export default RecentSignups;
