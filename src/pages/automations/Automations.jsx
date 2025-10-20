import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { apiUrl } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCcw, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Automations = () => {
    const { token } = useAuth();
    const { toast } = useToast();
    const [automations, setAutomations] = useState([]);
    const [manualAutomations, setManualAutomations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('ALGO');

    const loadAutomations = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${apiUrl}/api/v1/automate`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) setAutomations(res.data.data); else throw new Error(res.data.message);
        } catch (err) {
            toast({ title: 'Error', description: err.message || 'Failed to load automations', variant: 'destructive' });
        } finally { setLoading(false); }
    }, [token, toast]);

    const loadManualAutomations = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${apiUrl}/api/v1/automate/manual`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) setManualAutomations(res.data.data); else throw new Error(res.data.message);
        } catch (err) {
            toast({ title: 'Error', description: err.message || 'Failed to load manual automations', variant: 'destructive' });
        } finally { setLoading(false); }
    }, [token, toast]);

    useEffect(() => { loadAutomations(); loadManualAutomations(); }, [loadAutomations, loadManualAutomations]);

    const filteredAlgo = automations.filter(a => {
        const term = search.toLowerCase();
        if (!term) return true;
        return (a.name || '').toLowerCase().includes(term) || (a.description || '').toLowerCase().includes(term) || (a._id || '').toLowerCase().includes(term);
    });

    const filteredManual = manualAutomations.filter(a => {
        const term = search.toLowerCase();
        if (!term) return true;
        return (a.name || '').toLowerCase().includes(term) || (a.description || '').toLowerCase().includes(term) || (a._id || '').toLowerCase().includes(term);
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                            Algo: <span className="ml-1 font-semibold">{automations.length}</span>
                        </span>
                        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                            Manual: <span className="ml-1 font-semibold">{manualAutomations.length}</span>
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { if (activeTab === 'ALGO') loadAutomations(); else loadManualAutomations(); }} disabled={loading}>
                        <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
                    </Button>
                </div>
            </div>

            <Card className="mb-5">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant={activeTab === 'ALGO' ? 'default' : 'outline'}
                            className={activeTab === 'ALGO' ? 'bg-primary text-white hover:bg-primary/90 shadow' : ''}
                            onClick={() => setActiveTab('ALGO')}
                        >
                            Algorithmic
                        </Button>
                        <Button
                            size="sm"
                            variant={activeTab === 'MANUAL' ? 'default' : 'outline'}
                            className={activeTab === 'MANUAL' ? 'bg-primary text-white hover:bg-primary/90 shadow' : ''}
                            onClick={() => setActiveTab('MANUAL')}
                        >
                            Manual
                        </Button>
                    </div>
                    <div className="flex-1">
                        <Input placeholder="Search automations (id, name, desc)" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            {activeTab === 'ALGO' && (
                <Card>
                    <CardHeader className="py-4"><CardTitle className="text-sm font-semibold">Algorithmic Automations ({filteredAlgo.length})</CardTitle></CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <Table className="min-w-[1100px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Orders</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Efficiency</TableHead>
                                    <TableHead>Created</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-gray-500 flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</TableCell></TableRow>
                                ) : filteredAlgo.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-gray-500">No automations found</TableCell></TableRow>
                                ) : filteredAlgo.map(a => (
                                    <TableRow key={a._id} className="hover:bg-gray-50">
                                        <TableCell className="font-mono text-xs flex items-center gap-1">
                                            <Link to={`/automations/${a._id}`} className="inline-flex items-center gap-1">
                                                {a._id?.slice(-8)}<ExternalLink className='h-3 w-3 text-gray-400' />
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium truncate max-w-[180px]" title={a.name}>{a.name || '\u2014'}</TableCell>
                                        <TableCell className="text-xs max-w-[280px] truncate" title={a.description}>{a.description || '\u2014'}</TableCell>
                                        <TableCell className="text-xs">{(a.orders || []).length}</TableCell>
                                        <TableCell className="text-[11px] uppercase tracking-wide text-gray-700">{a.automationData?.type || '\u2014'}</TableCell>
                                        <TableCell className="text-xs">{a.automationData?.optimizedLayout?.efficiency ? a.automationData.optimizedLayout.efficiency.toFixed(2) + '%' : '\u2014'}</TableCell>
                                        <TableCell className="text-xs whitespace-nowrap">{a.createdAt ? new Date(a.createdAt).toLocaleString() : '\u2014'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="destructive" size="sm" onClick={async () => {
                                                if (!window.confirm('Delete this automation?')) return;
                                                try {
                                                    const res = await axios.delete(`${apiUrl}/api/v1/automate/${a._id}`, { headers: { Authorization: `Bearer ${token}` } });
                                                    if (res.data.success) { toast({ title: 'Deleted', description: 'Automation deleted' }); await loadAutomations(); }
                                                    else throw new Error(res.data.message);
                                                } catch (err) { toast({ title: 'Error', description: err.message || 'Delete failed', variant: 'destructive' }); }
                                            }}>
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'MANUAL' && (
                <Card>
                    <CardHeader className="py-4"><CardTitle className="text-sm font-semibold">Manual Automations ({filteredManual.length})</CardTitle></CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <Table className="min-w-[1000px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Orders</TableHead>
                                    <TableHead>File</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-gray-500 flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</TableCell></TableRow>
                                ) : filteredManual.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-gray-500">No manual automations found</TableCell></TableRow>
                                ) : filteredManual.map(a => (
                                    <TableRow key={a._id} className="hover:bg-gray-50">
                                        <TableCell className="font-mono text-xs flex items-center gap-1">
                                            <Link to={`/automations/manual/${a._id}`} className="inline-flex items-center gap-1">
                                                {a._id?.slice(-8)}<ExternalLink className='h-3 w-3 text-gray-400' />
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium truncate max-w-[180px]" title={a.name}>{a.name || '\u2014'}</TableCell>
                                        <TableCell className="text-xs max-w-[280px] truncate" title={a.description}>{a.description || '\u2014'}</TableCell>
                                        <TableCell className="text-xs">{(a.orders || []).length}</TableCell>
                                        <TableCell className="text-xs">
                                            {a.automationFile ? <a href={a.automationFile} target="_blank" rel="noreferrer" className="text-blue-600 underline">Download</a> : '\u2014'}
                                        </TableCell>
                                        <TableCell className="text-xs whitespace-nowrap">{a.createdAt ? new Date(a.createdAt).toLocaleString() : '\u2014'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="destructive" size="sm" onClick={async () => {
                                                if (!window.confirm('Delete this manual automation?')) return;
                                                try {
                                                    const res = await axios.delete(`${apiUrl}/api/v1/automate/manual/${a._id}`, { headers: { Authorization: `Bearer ${token}` } });
                                                    if (res.data.success) { toast({ title: 'Deleted', description: 'Manual automation deleted' }); await loadManualAutomations(); }
                                                    else throw new Error(res.data.message);
                                                } catch (err) { toast({ title: 'Error', description: err.message || 'Delete failed', variant: 'destructive' }); }
                                            }}>
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Automations;