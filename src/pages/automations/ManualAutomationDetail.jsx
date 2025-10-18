import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiUrl } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';

const ManualAutomationDetail = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const { toast } = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch all manual automations then pick by id
            const res = await axios.get(`${apiUrl}/api/v1/automate/manual`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.data.success) throw new Error(res.data.message);
            const list = res.data.data || [];
            const found = list.find((m) => m._id === id);
            setData(found || null);
        } catch (err) {
            toast({ title: 'Error', description: err.message || 'Failed to load manual automation', variant: 'destructive' });
        } finally { setLoading(false); }
    }, [id, token, toast]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <div className='p-8 flex items-center gap-2 text-sm text-gray-600'><Loader2 className='h-4 w-4 animate-spin' /> Loading...</div>
    if (!data) return <div className='p-8 text-sm text-gray-600'>Not found</div>;

    return (
        <div className='p-6 max-w-5xl mx-auto space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>Manual Automation</h1>
                    <p className='text-gray-600 text-sm mt-1'>Created: {data.createdAt ? new Date(data.createdAt).toLocaleString() : '—'}</p>
                </div>
                <div className='flex gap-2'>
                    <Button asChild variant='outline'><Link to='/automations'><ArrowLeft className='h-4 w-4 mr-1' />Back</Link></Button>
                    {data.automationFile && (
                        <Button asChild className='bg-gray-900 text-white hover:bg-gray-800'>
                            <a href={data.automationFile} target='_blank' rel='noreferrer'><Download className='h-4 w-4 mr-1' />Download File</a>
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader className='py-3'>
                    <CardTitle className='text-sm'>Overview</CardTitle>
                </CardHeader>
                <CardContent className='text-sm space-y-1'>
                    <p><span className='text-gray-600'>Name:</span> {data.name}</p>
                    <p><span className='text-gray-600'>Description:</span> {data.description || '—'}</p>
                    <p><span className='text-gray-600'>Orders:</span> {(data.orders || []).length}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className='py-3'>
                    <CardTitle className='text-sm'>Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {(!data.orders || data.orders.length === 0) ? (
                        <div className='text-xs text-gray-600'>No orders linked</div>
                    ) : (
                        <ul className='text-xs space-y-1'>
                            {data.orders.map((o) => (
                                <li key={o._id} className='flex items-center justify-between border-b py-1'>
                                    <span className='font-mono'>#{o._id?.slice?.(-8) || o._id}</span>
                                    <span>{o.orderDetails?.productName}</span>
                                    <span>qty {o.orderDetails?.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className='py-3'>
                    <CardTitle className='text-sm'>Raw Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className='text-[11px] bg-black/90 text-green-300 p-4 rounded overflow-auto max-h-96'>{JSON.stringify(data, null, 2)}</pre>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManualAutomationDetail;
