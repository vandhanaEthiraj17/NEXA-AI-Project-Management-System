import React, { useState, useEffect, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend
} from 'recharts';
import { TrendingUp, DollarSign, Activity, Target, Zap, Clock, ChevronRight } from 'lucide-react';

const AnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/analytics/full');
                const data = await res.json();
                setAnalytics(data);
            } catch (err) {
                console.error("Analytics fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const COLORS = ['#0052cc', '#00875a', '#ffab00', '#de350b', '#253858'];

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Crunching Enterprise Data Streams...</div>;

    return (
        <div style={{ padding: '2rem', background: '#f4f5f7', minHeight: '100%' }}>
            {/* Header Stats */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#172b4d' }}>Enterprise Intelligence Dashboard</h1>
                    <p style={{ color: '#5e6c84' }}>Real-time cross-project analytics and predictive resource modeling.</p>
                </div>
                <div style={{ color: '#0052cc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    View Full Report <ChevronRight size={18} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard icon={<TrendingUp color="#0052cc" />} label="Avg. Efficiency" value={`${analytics.trends[analytics.trends.length-1].efficiency}%`} delta="+4.2%" />
                <StatCard icon={<DollarSign color="#00875a" />} label="Monthly Revenue" value={`$${analytics.trends[analytics.trends.length-1].revenue.toLocaleString()}`} delta="+12%" />
                <StatCard icon={<Activity color="#ffab00" />} label="Burn Rate" value={analytics.burn_rate} delta="Stable" />
                <StatCard icon={<Target color="#de350b" />} label="Project Health" value="Healthy" delta="Optimum" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Revenue & Efficiency Chart */}
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #dfe1e6' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: '#172b4d' }}>Growth & Efficiency Trends</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.trends}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0052cc" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#0052cc" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#5e6c84', fontSize: 12}} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#5e6c84', fontSize: 12}} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#5e6c84', fontSize: 12}} />
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#0052cc" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#00875a" strokeWidth={3} dot={{r: 4}} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Resource Allocation Mix */}
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #dfe1e6' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: '#172b4d' }}>Resource Utilization Mix</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.resource_usage} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#172b4d', fontSize: 11, fontWeight: 600}} width={80} />
                                <Tooltip />
                                <Bar dataKey="utilization" radius={[0, 4, 4, 0]} barSize={20}>
                                    {analytics.resource_usage.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <InsightCard 
                    icon={<Zap size={20} color="#0052cc" />} 
                    title="Velocity Optimization" 
                    desc="Sprint velocity is up 12% following AI-suggested task reassignments in March."
                />
                <InsightCard 
                    icon={<Clock size={20} color="#ffab00" />} 
                    title="Estimated Arrival" 
                    desc="Projected Q3 2026 delivery for 'Titan X' platform remains stable at 94% confidence."
                />
                <InsightCard 
                    icon={<Activity size={20} color="#00875a" />} 
                    title="Risk Mitigation" 
                    desc="Aggressive bottleneck detection saved approx. 14 developer hours this week."
                />
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, delta }) => (
    <div className="card" style={{ padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #dfe1e6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: '#f4f5f7', borderRadius: '8px' }}>{icon}</div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5e6c84', textTransform: 'uppercase' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#172b4d' }}>{value}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: delta.startsWith('+') ? '#00875a' : '#5e6c84' }}>{delta}</span>
        </div>
    </div>
);

const InsightCard = ({ icon, title, desc }) => (
    <div className="card" style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #dfe1e6', borderLeft: '4px solid #0052cc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {icon}
            <span style={{ fontWeight: 700, color: '#172b4d' }}>{title}</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#5e6c84', margin: 0, lineHeight: '1.5' }}>{desc}</p>
    </div>
);

export default AnalyticsDashboard;
