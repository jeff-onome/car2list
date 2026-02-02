
import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-12">Master Control</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <Stat label="Global Users" value="1,240" />
          <Stat label="Total Volume" value="$42.5M" />
          <Stat label="Pending KYC" value="18" />
          <Stat label="Dealer Partners" value="34" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-3xl h-[400px]">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <ActivityItem text="New dealer 'Swiss Luxury' registered" time="2h ago" />
              <ActivityItem text="Sale confirmed: Rolls Royce Spectre" time="5h ago" />
              <ActivityItem text="KYC approved: User #8922" time="1d ago" />
            </div>
          </div>
          <div className="glass p-8 rounded-3xl h-[400px]">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Listing Moderation</h3>
            <div className="flex items-center justify-center h-full text-zinc-600 italic">
              All listings current. No pending reviews.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="glass p-6 rounded-2xl">
    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const ActivityItem: React.FC<{ text: string; time: string }> = ({ text, time }) => (
  <div className="flex justify-between items-center text-xs p-3 hover:bg-white/5 rounded-xl transition-colors">
    <span className="text-zinc-300">{text}</span>
    <span className="text-zinc-600">{time}</span>
  </div>
);

export default AdminDashboard;
