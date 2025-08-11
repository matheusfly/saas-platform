
import React, { useMemo } from 'react';
import { ScheduleEntry, WorkLog, Teacher, Student } from '../types';
import { ChevronLeftIcon } from './icons';
import SortableTable from './SortableTable';

interface DataTableViewProps {
    schedule: ScheduleEntry[];
    workLogs: WorkLog[];
    teachers: Teacher[];
    students: Student[];
    onBack: () => void;
}

const DataTableView: React.FC<DataTableViewProps> = ({ schedule, workLogs, teachers, students, onBack }) => {
    
    const formatDate = (date?: Date) => date ? date.toLocaleString('pt-BR') : 'N/A';

    const processedWorkLogs = useMemo(() => {
        return workLogs.map(log => ({
            ...log,
            teacherName: teachers.find(t => t.id === log.teacherId)?.name || 'N/A'
        }));
    }, [workLogs, teachers]);

    const tableDefinitions = [
        {
            title: 'Work Logs',
            data: processedWorkLogs,
            initialSortKey: 'checkIn',
            headers: [
                { key: 'id', label: 'ID', sortable: true },
                { key: 'teacherId', label: 'Professor ID', sortable: true },
                { key: 'teacherName', label: 'Nome', sortable: true },
                { key: 'checkIn', label: 'Check-in', sortable: true },
                { key: 'checkOut', label: 'Check-out', sortable: true },
            ],
            renderRow: (item: WorkLog & { teacherName: string }) => (
                <tr key={item.id} className="bg-white dark:bg-army-olive-light/50 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-army-olive-light">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.id}</td>
                    <td className="px-6 py-4">{item.teacherId}</td>
                    <td className="px-6 py-4">{item.teacherName}</td>
                    <td className="px-6 py-4">{formatDate(item.checkIn)}</td>
                    <td className="px-6 py-4">{formatDate(item.checkOut)}</td>
                </tr>
            )
        },
        {
            title: 'Schedule Entries',
            data: schedule,
            initialSortKey: 'startTime',
            headers: [
                { key: 'id', label: 'ID', sortable: true },
                { key: 'teacherIds', label: 'Professor IDs', sortable: false },
                { key: 'studentIds', label: 'Aluno IDs', sortable: false },
                { key: 'startTime', label: 'Início', sortable: true },
                { key: 'endTime', label: 'Fim', sortable: true },
                { key: 'classType', label: 'Tipo', sortable: true },
                { key: 'workLogId', label: 'WorkLog ID', sortable: true },
                { key: 'isUnplanned', label: 'Não Planejado?', sortable: true },
            ],
            renderRow: (item: ScheduleEntry) => (
                <tr key={item.id} className="bg-white dark:bg-army-olive-light/50 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-army-olive-light">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.id}</td>
                    <td className="px-6 py-4">{item.teacherIds.join(', ')}</td>
                    <td className="px-6 py-4">{item.studentIds.join(', ') || 'N/A'}</td>
                    <td className="px-6 py-4">{formatDate(item.startTime)}</td>
                    <td className="px-6 py-4">{formatDate(item.endTime)}</td>
                    <td className="px-6 py-4">{item.classType}</td>
                    <td className="px-6 py-4">{item.workLogId || 'N/A'}</td>
                    <td className="px-6 py-4">{item.isUnplanned ? 'Sim' : 'Não'}</td>
                </tr>
            )
        },
        {
            title: 'Teachers',
            data: teachers,
            initialSortKey: 'name',
            headers: [
               { key: 'id', label: 'ID', sortable: true },
               { key: 'name', label: 'Nome', sortable: true },
               { key: 'type', label: 'Tipo', sortable: true },
               { key: 'contractedHours', label: 'Horas Contratadas', sortable: true },
            ],
            renderRow: (item: Teacher) => (
                <tr key={item.id} className="bg-white dark:bg-army-olive-light/50 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-army-olive-light">
                   <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.id}</td>
                   <td className="px-6 py-4">{item.name}</td>
                   <td className="px-6 py-4">{item.type}</td>
                   <td className="px-6 py-4">{item.contractedHours}</td>
               </tr>
           )
        },
        {
            title: 'Students',
            data: students,
            initialSortKey: 'name',
            headers: [
                { key: 'id', label: 'ID', sortable: true },
                { key: 'name', label: 'Nome', sortable: true },
            ],
            renderRow: (item: Student) => (
                <tr key={item.id} className="bg-white dark:bg-army-olive-light/50 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-army-olive-light">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.id}</td>
                    <td className="px-6 py-4">{item.name}</td>
                </tr>
            )
        },
    ];

    // Sort tables by data length (descending) so most populated tables are first
    tableDefinitions.sort((a, b) => b.data.length - a.data.length);


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-charcoal-black text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Data Table View</h1>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 bg-lime-green text-charcoal-black font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all duration-200 active:scale-95"
                    >
                        <ChevronLeftIcon className="h-5 w-5"/>
                        <span>Voltar</span>
                    </button>
                </header>

                <main className="space-y-8">
                    {tableDefinitions.map(({ title, data, headers, renderRow, initialSortKey }) => (
                         <SortableTable
                            key={title}
                            title={title}
                            data={data}
                            headers={headers}
                            renderRow={renderRow}
                            initialSortKey={initialSortKey}
                        />
                    ))}
                </main>
            </div>
        </div>
    );
};

export default DataTableView;
