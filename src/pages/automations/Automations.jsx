import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAutomations } from '@/services/api/automations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCcw, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Automations = () => {
    const { token } = useAuth();
    const { toast } = useToast();
    const [automations, setAutomations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const loadAutomations = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAutomations(token);
            if (res.success) setAutomations(res.data); else throw new Error(res.message);
        } catch (err) {
            toast({ title: 'Error', description: err.message || 'Failed to load automations', variant: 'destructive' });
        } finally { setLoading(false); }
    }, [token, toast]);

    useEffect(() => { loadAutomations(); }, [loadAutomations]);

    const filtered = automations.filter(a => {
        const term = search.toLowerCase();
        if (!term) return true;
        return (a.name || '').toLowerCase().includes(term) || (a.description || '').toLowerCase().includes(term) || (a._id || '').toLowerCase().includes(term);
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
                    <p className="text-gray-600 text-sm mt-1">Previously executed layout automations</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadAutomations} disabled={loading}>
                        <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
                    </Button>
                </div>
            </div>

            <Card className="mb-5">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Input placeholder="Search automations (id, name, desc)" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="py-4"><CardTitle className="text-sm font-semibold">All Automations ({filtered.length})</CardTitle></CardHeader>
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
                                <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-gray-500 flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</TableCell></TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-gray-500">No automations found</TableCell></TableRow>
                            ) : filtered.map(a => (
                                <TableRow key={a._id} className="hover:bg-gray-50 cursor-pointer" asChild>
                                    <Link to={`/automations/${a._id}`} className="contents">
                                        <TableCell className="font-mono text-xs flex items-center gap-1">{a._id?.slice(-8)}<ExternalLink className='h-3 w-3 text-gray-400' /></TableCell>
                                        <TableCell className="text-sm font-medium truncate max-w-[180px]" title={a.name}>{a.name || '—'}</TableCell>
                                        <TableCell className="text-xs max-w-[280px] truncate" title={a.description}>{a.description || '—'}</TableCell>
                                        <TableCell className="text-xs">{(a.orders || []).length}</TableCell>
                                        <TableCell className="text-[11px] uppercase tracking-wide text-gray-700">{a.automationData?.type || '—'}</TableCell>
                                        <TableCell className="text-xs">{a.automationData?.optimizedLayout?.efficiency ? a.automationData.optimizedLayout.efficiency.toFixed(2) + '%' : '—'}</TableCell>
                                        <TableCell className="text-xs whitespace-nowrap">{a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}</TableCell>
                                    </Link>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Automations;