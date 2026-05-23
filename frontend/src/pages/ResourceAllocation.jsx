import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import { Users, Briefcase, Star, Clock, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const ResourceAllocation = () => {
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { pmStats } = useContext(DataContext);

    useEffect(() => {
        const fetchDevs = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/developers');
                const data = await res.json();
                if (data.status === 'success') {
                    setDevelopers(data.developers);
                }
            } catch (err) {
                console.error("Failed to fetch developers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDevs();
    }, []);

    const getUtilizationColor = (util) => {
        if (util > 85) return '#de350b';
        if (util > 60) return '#ffab00';
        return '#00875a';
    };

    return (
        <div style={{ padding: '2rem', background: '#f4f5f7', minHeight: '100%' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#172b4d' }}>Resource Allocation Map</h1>
                    <p style={{ color: '#5e6c84' }}>Optimize your enterprise talent through AI-driven skill matching and workload balancing.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Users size={20} color="#0052cc" />
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#5e6c84', fontWeight: 700, textTransform: 'uppercase' }}>Active Talent</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{developers.length} Devs</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>Loading Human Capital Data...</div>
                ) : developers.map((dev) => {
                    const mockUtilization = 60 + (dev.id * 7) % 35;
                    return (
                        <div key={dev.id} className="card" style={{ padding: '1.5rem', background: 'white', border: '1px solid #dfe1e6', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ebecf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#42526e' }}>
                                        {dev.name[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#172b4d', fontSize: '1.1rem' }}>{dev.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#5e6c84', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Star size={12} /> Senior Expert
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ 
                                        padding: '0.25rem 0.75rem', 
                                        borderRadius: '100px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 700,
                                        background: dev.availability ? '#e3fcef' : '#ffebe6',
                                        color: dev.availability ? '#006644' : '#bf2600'
                                    }}>
                                        {dev.availability ? 'AVAILABLE' : 'BUSY'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5e6c84', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Primary Skillset</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {dev.skills.split(',').map(skill => (
                                        <span key={skill} style={{ padding: '0.25rem 0.6rem', background: '#f4f5f7', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, color: '#42526e', border: '1px solid #dfe1e6' }}>
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#5e6c84', fontWeight: 600 }}>Utilization Index</span>
                                    <span style={{ fontSize: '0.85rem', color: getUtilizationColor(mockUtilization), fontWeight: 700 }}>{mockUtilization}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: '#ebecf0', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${mockUtilization}%`, height: '100%', background: getUtilizationColor(mockUtilization) }}></div>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#5e6c84', fontSize: '0.85rem' }}>
                                    <Clock size={16} />
                                    <span>2 Active Projects</span>
                                </div>
                                <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>Assign Task</button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div style={{ marginTop: '3rem', padding: '2rem', background: '#ebf5ff', borderRadius: '12px', border: '1px solid #b3d4ff', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ background: '#0052cc', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={32} color="white" />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0747a6', marginBottom: '0.25rem' }}>AI Matching Engine is Active</h3>
                    <p style={{ color: '#172b4d', margin: 0 }}>The allocation algorithm is currently suggesting resource shifts to mitigate the 15% risk detected in "Sprint Alpha".</p>
                </div>
                <button className="btn-primary" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>Auto-Optimize Team</button>
            </div>
        </div>
    );
};

export default ResourceAllocation;
