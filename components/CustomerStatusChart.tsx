import React, { useMemo } from 'react';
import { Customer, CustomerStatus } from '../types';
import { IconChartBar } from '../constants';

interface CustomerStatusChartProps {
    customers: Customer[];
    onStatusClick: (status: CustomerStatus) => void;
    activeStatus: CustomerStatus | 'all';
}

const CustomerStatusChart: React.FC<CustomerStatusChartProps> = ({ customers, onStatusClick, activeStatus }) => {
    const statusCounts = useMemo(() => {
        const counts = {
            [CustomerStatus.Active]: 0,
            [CustomerStatus.AtRisk]: 0,
            [CustomerStatus.Churned]: 0,
            [CustomerStatus.New]: 0,
        };
        customers.forEach(c => {
            if (counts[c.status] !== undefined) {
                counts[c.status]++;
            }
        });
        return counts;
    }, [customers]);

    const totalCustomers = customers.length;
    
    const statusConfig = {
        [CustomerStatus.Active]: { color: 'bg-chart-green', label: CustomerStatus.Active },
        [CustomerStatus.AtRisk]: { color: 'bg-chart-yellow', label: CustomerStatus.AtRisk },
        [CustomerStatus.Churned]: { color: 'bg-chart-red', label: CustomerStatus.Churned },
        [CustomerStatus.New]: { color: 'bg-chart-blue', label: CustomerStatus.New },
    };

    return (
        <div className="bg-ui-surface p-6 rounded-2xl shadow-lg border border-border">
            <div className="flex items-center mb-4">
                <div className="bg-primary text-text-on-primary p-2 rounded-lg mr-3">
                    <IconChartBar />
                </div>
                <h2 className="text-xl font-bold text-text-default">Saúde do Cliente</h2>
            </div>
            <div className="space-y-2">
                {Object.entries(statusCounts).map(([status, count]) => {
                    const percentage = totalCustomers > 0 ? (count / totalCustomers) * 100 : 0;
                    const config = statusConfig[status as CustomerStatus];
                    const isActive = activeStatus === status;

                    return (
                        <div 
                            key={status} 
                            onClick={() => onStatusClick(status as CustomerStatus)}
                            className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${isActive ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-ui-sidebar-surface/60'}`}
                        >
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-semibold text-text-default">{config.label}</span>
                                <span className="text-text-secondary">{count} Clientes</span>
                            </div>
                            <div className="bg-secondary rounded-full h-2.5">
                                <div 
                                    className={`${config.color} h-2.5 rounded-full transition-all duration-500`} 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CustomerStatusChart;