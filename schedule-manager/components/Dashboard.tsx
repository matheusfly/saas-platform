import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Teacher, Workload } from '../types';
import { ChartBarIcon, ClockIcon } from './icons';

interface DashboardProps {
  workloadData: Workload[];
  teachers: Teacher[];
}

interface ChartData {
    name: string;
    'Horas Trabalhadas': number;
    'Horas Contratadas': number;
    'Horas Extras': number;
}

const Dashboard: React.FC<DashboardProps> = ({ workloadData, teachers }) => {
    const chartData: ChartData[] = workloadData.map(wl => {
        const teacher = teachers.find(t => t.id === wl.teacherId);
        return {
            name: teacher ? teacher.name.split(' ')[0] : 'N/A',
            'Horas Trabalhadas': wl.workedHours,
            'Horas Contratadas': teacher?.contractedHours || 0,
            'Horas Extras': wl.overtime
        };
    });

    const totalWorkedHours = workloadData.reduce((sum, wl) => sum + wl.workedHours, 0);
    const totalContractedHours = teachers.reduce((sum, t) => sum + t.contractedHours, 0);
    const occupancyRate = totalContractedHours > 0 ? (totalWorkedHours / totalContractedHours) * 100 : 0;

  return (
    <div className="bg-white dark:bg-army-olive p-6 rounded-2xl shadow-lg transition-colors duration-300
                    [--recharts-tick-fill:theme(colors.gray.500)] dark:[--recharts-tick-fill:theme(colors.sage)]
                    [--recharts-legend-text:theme(colors.gray.700)] dark:[--recharts-legend-text:theme(colors.gray.300)]
                    [--recharts-grid-stroke:theme(colors.gray.200)] dark:[--recharts-grid-stroke:theme(colors.army-olive-light)]
    ">
      <div className="flex items-center mb-6">
        <ChartBarIcon className="h-8 w-8 text-lime-green mr-3" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard de Desempenho</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-100 dark:bg-charcoal-black p-4 rounded-xl text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-sage">Total de Horas Trabalhadas</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalWorkedHours.toFixed(2)}h</p>
        </div>
        <div className="bg-gray-100 dark:bg-charcoal-black p-4 rounded-xl text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-sage">Total de Horas Contratadas</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalContractedHours}h</p>
        </div>
        <div className="bg-gray-100 dark:bg-charcoal-black p-4 rounded-xl text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-sage">Taxa de Ocupação</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{occupancyRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="h-96">
        <div className="flex items-center mb-4">
            <ClockIcon className="h-6 w-6 text-lime-green mr-2" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Carga Horária Semanal por Professor</h3>
        </div>
        <ResponsiveContainer width="100%" height="95%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid-stroke)" strokeOpacity={0.5} />
            <XAxis dataKey="name" tick={{ fill: 'var(--recharts-tick-fill)' }} />
            <YAxis tick={{ fill: 'var(--recharts-tick-fill)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(5px)',
                border: '1px solid #E5E7EB',
                borderRadius: '0.75rem',
                color: '#1F2937'
              }}
              wrapperClassName="dark:!hidden"
            />
             <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(79, 81, 45, 0.95)',
                backdropFilter: 'blur(5px)',
                border: '1px solid #6F6C4B',
                borderRadius: '0.75rem',
                color: '#e5e7eb'
              }}
              wrapperClassName="!hidden dark:!block"
            />
            <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{color: 'var(--recharts-legend-text)', paddingLeft: '20px'}}/>
            <Bar dataKey="Horas Trabalhadas" fill="#B0D236" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Horas Contratadas" className="fill-gray-400 dark:fill-gray-300" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Horas Extras" className="fill-gray-600 dark:fill-gray-500" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;