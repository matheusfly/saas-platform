
import React, { useState, useMemo } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from './icons';

interface SortableTableProps {
    title: string;
    data: any[];
    headers: { key: string; label: string; sortable?: boolean }[];
    renderRow: (item: any) => React.ReactNode;
    initialSortKey: string;
}

const SortableTable: React.FC<SortableTableProps> = ({ title, data, headers, renderRow, initialSortKey }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: initialSortKey, direction: 'asc' });

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];

                if (valA === undefined || valA === null) return 1;
                if (valB === undefined || valB === null) return -1;
                
                let comparison = 0;
                if (valA instanceof Date && valB instanceof Date) {
                    comparison = valA.getTime() - valB.getTime();
                } else if (typeof valA === 'string' && typeof valB === 'string') {
                    comparison = valA.localeCompare(valB, 'pt-BR', { numeric: true });
                } else {
                    if (valA < valB) comparison = -1;
                    if (valA > valB) comparison = 1;
                }
                
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: string) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' 
            ? <ChevronUpIcon className="h-4 w-4 ml-1 inline-block" /> 
            : <ChevronDownIcon className="h-4 w-4 ml-1 inline-block" />;
    };

    return (
        <div className="bg-white dark:bg-army-olive p-4 rounded-lg shadow-md transition-all duration-300">
            <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => setIsCollapsed(prev => !prev)} 
                aria-expanded={!isCollapsed} 
                aria-controls={`table-content-${title}`}
            >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{`${title} (${data.length})`}</h3>
                <button
                    className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-army-olive-light"
                    aria-label={isCollapsed ? `Expandir ${title}` : `Recolher ${title}`}
                >
                    {isCollapsed ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronUpIcon className="h-6 w-6" />}
                </button>
            </div>
            {!isCollapsed && (
                <div id={`table-content-${title}`} className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-army-olive-light dark:text-gray-300">
                            <tr>
                                {headers.map(h => (
                                    <th key={h.key} scope="col" className="px-6 py-3">
                                        {h.sortable === false ? (
                                            h.label
                                        ) : (
                                            <button 
                                                onClick={() => requestSort(h.key)}
                                                className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors"
                                            >
                                                {h.label}
                                                {getSortIndicator(h.key)}
                                            </button>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((item, index) => renderRow(item))}
                        </tbody>
                    </table>
                    {data.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">Nenhum dado para exibir.</p>}
                </div>
            )}
        </div>
    );
};

export default SortableTable;
