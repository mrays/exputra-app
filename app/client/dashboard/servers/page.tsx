'use client';

import { useState, useEffect } from 'react';

interface Server {
    id: string;
    serverName: string;
    ipAddress: string;
    location: string;
    serverType: string;
    status: string;
}

export default function MyServersPage() {
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/client/servers')
            .then(res => res.json())
            .then(data => {
                setServers(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading servers...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold font-bold text-gray-900 tracking-tight">My Servers</h1>
                    <p className="text-gray-500 mt-1">Monitor your server status and details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servers.length === 0 ? (
                    <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                        No servers linked to your account yet.
                    </div>
                ) : (
                    servers.map(server => (
                        <div key={server.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${server.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                    {server.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{server.serverName}</h3>
                            <p className="text-sm font-mono text-gray-500 mb-4">{server.ipAddress}</p>

                            <div className="space-y-2 pt-4 border-t border-gray-50">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest">Type</span>
                                    <span className="text-gray-900 font-bold">{server.serverType}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest">Location</span>
                                    <span className="text-gray-900 font-bold">{server.location}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
