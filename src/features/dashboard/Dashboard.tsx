import React from 'react';
import { AnalyticsSection } from '../../components/analytics/AnalyticsSection';
import { ReportNotificationsWidget } from '../reports/ReportNotificationsWidget';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Forensic Reports & Court Notifications Panel */}
      <ReportNotificationsWidget />

      {/* Main Department Statistics & Analytics Section */}
      <AnalyticsSection />
    </div>
  );
};

export default Dashboard;
