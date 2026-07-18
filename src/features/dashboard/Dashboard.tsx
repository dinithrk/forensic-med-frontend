import React from 'react';
import { Users, FileText, ClipboardList, Scale } from 'lucide-react';

const Dashboard: React.FC = () => {
  const metrics = [
    { title: 'Total Active Cases', value: '124', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Pending Postmortems', value: '18', icon: ClipboardList, color: 'text-rose-600', bgColor: 'bg-rose-100' },
    { title: 'Reports Awaiting Signature', value: '7', icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { title: 'Evidence Items Logged', value: '892', icon: Scale, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back. Here is the current system overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.title} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{metric.title}</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{metric.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for future activity feed or charts */}
      <div className="mt-8 bg-white shadow-sm rounded-xl border border-gray-100 p-6 h-64 flex items-center justify-center">
        <p className="text-gray-400 text-sm italic">Recent Activity Feed (Coming Soon)</p>
      </div>
    </div>
  );
};

export default Dashboard;
