import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '@/lib/utils';
import { useToast } from '../../hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Plus, RefreshCcw, Users, UserCheck, Filter, Loader2 } from 'lucide-react';

const statusVariants = {
  PENDING: 'secondary',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  CANCELLED: 'destructive'
};

const OrderList = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [staffUsers, setStaffUsers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productMeta, setProductMeta] = useState({ sizes: [], papers: [], costItems: [] });
  const costItemTypeMap = React.useMemo(() => ({
    FOLDING: 'foldingType',
    LAMINATION: 'laminationType',
    UV: 'uvType',
    FOIL: 'foilType',
    DIE: 'dieType',
    TEXTURE: 'textureType'
  }), []);
  const costItemDefinitions = React.useMemo(() => [
    { enum: 'FOLDING', label: 'Folding', field: costItemTypeMap.FOLDING },
    { enum: 'LAMINATION', label: 'Lamination', field: costItemTypeMap.LAMINATION },
    { enum: 'UV', label: 'UV', field: costItemTypeMap.UV },
    { enum: 'FOIL', label: 'Foil', field: costItemTypeMap.FOIL },
    { enum: 'DIE', label: 'Die', field: costItemTypeMap.DIE },
    { enum: 'TEXTURE', label: 'Texture', field: costItemTypeMap.TEXTURE },
  ], [costItemTypeMap]);
  const [orderForm, setOrderForm] = useState({
    productName: '',
    width: '',
    height: '',
    quantity: '',
    paperConfig: '',
    printingSide: '',
    foldingType: '',
    laminationType: '',
    uvType: '',
    foilType: '',
    dieType: '',
    textureType: '',
    additionalNote: '',
    quality: '',
    fileUrl: ''
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  const filteredOrders = useMemo(() => orders.filter(o => {
    const matchStatus = filterStatus === 'ALL' || o.currentStatus === filterStatus;
    const term = searchTerm.toLowerCase();
    const matchSearch = !term || (
      o.orderDetails?.productName?.toLowerCase().includes(term) ||
      o._id?.toLowerCase().includes(term) ||
      o.raisedBy?.username?.toLowerCase().includes(term) ||
      o.raisedTo?.username?.toLowerCase().includes(term)
    );
    return matchStatus && matchSearch;
  }), [orders, filterStatus, searchTerm]);

  const getOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/api/v1/order`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setOrders(res.data.data); else throw new Error(res.data.message);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to load orders', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [token, toast]);

  const getStaffUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/v1/user/staff`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setStaffUsers(res.data.data); else throw new Error(res.data.message);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to load staff users', variant: 'destructive' });
    }
  }, [token, toast]);

  const getProducts = useCallback(async () => {
    try {
      // Backend route: /api/v1/products + /product
      const res = await axios.get(`${apiUrl}/api/v1/products/product`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setProducts(res.data.data); else throw new Error(res.data.message);
    } catch (err) { toast({ title: 'Error', description: err.message || 'Failed to load products', variant: 'destructive' }); }
  }, [token, toast]);

  useEffect(() => { getOrders(); if (user?.userType === 'admin') { getStaffUsers(); } getProducts(); }, [getOrders, getStaffUsers, getProducts, user]);

  const openAssign = (order) => {
    setSelectedOrder(order);
    setSelectedStaff(order.raisedTo?._id || '');
    setAssignOpen(true);
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    if (!selectedStaff) { toast({ title: 'Validation', description: 'Select a staff', variant: 'destructive' }); return; }
    try {
      setAssigning(true);
      const res = await axios.patch(`${apiUrl}/api/v1/order/${selectedOrder._id}/assign`, { raisedTo: selectedStaff }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast({ title: 'Assigned', description: 'Order assigned successfully' });
        setAssignOpen(false);
        getOrders();
      } else throw new Error(res.data.message);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Assignment failed', variant: 'destructive' });
    } finally { setAssigning(false); }
  };

  // Product selection mapping to order form base fields
  useEffect(() => {
    if (!selectedProduct) return;
    const prod = products.find(p => p._id === selectedProduct);
    if (prod) {
      setProductMeta({
        sizes: prod.availableSizes || [],
        papers: prod.availablePapers || [],
        costItems: prod.costItems || []
      });
      // Pre-fill product name
      setOrderForm(prev => ({ ...prev, productName: prod.name }));
      // Auto-select single option cost items
      const updated = {};
      Object.entries(costItemTypeMap).forEach(([enumKey, fieldName]) => {
        const items = (prod.costItems || []).filter(ci => ci.type === enumKey);
        if (items.length === 1) {
          updated[fieldName] = items[0].value;
        } else {
          updated[fieldName] = ''; // reset
        }
      });
      setOrderForm(prev => ({ ...prev, ...updated }));
    }
  }, [selectedProduct, products, costItemTypeMap]);

  const handleOrderField = (e) => {
    const { name, value } = e.target; setOrderForm(prev => ({ ...prev, [name]: value }));
  };

  const uploadDesignFile = async (file) => {
    if (!file) return;
    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${apiUrl}/api/v1/order/upload`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        setOrderForm(prev => ({ ...prev, fileUrl: res.data.data.fileUrl, quality: res.data.data.imageValidationData.metadata.quality }));
        toast({ title: 'Uploaded', description: 'Design file uploaded' });
      } else throw new Error(res.data.message);
    } catch (err) { toast({ title: 'Error', description: err.message || 'Upload failed', variant: 'destructive' }); }
    finally { setUploadingFile(false); }
  };

  const submitCreateOrder = async (e) => {
    e.preventDefault();
    // Determine required fields dynamically based on available cost items
    const dynamicRequired = costItemDefinitions.reduce((acc, def) => {
      const exists = productMeta.costItems.some(ci => ci.type === def.enum);
      if (exists) acc.push(def.field);
      return acc;
    }, []);
    const baseRequired = ['productName', 'width', 'height', 'quantity', 'paperConfig', 'printingSide', 'additionalNote', 'quality'];
    const required = [...baseRequired, ...dynamicRequired];
    for (const f of required) { if (!orderForm[f]) { toast({ title: 'Validation', description: `Field ${f} is required`, variant: 'destructive' }); return; } }
    try {
      setCreating(true);
      const payload = {
        orderDetails: {
          ...orderForm,
          width: Number(orderForm.width),
          height: Number(orderForm.height),
          quantity: Number(orderForm.quantity),
          quality: Number(orderForm.quality)
        }
      };
      const res = await axios.post(`${apiUrl}/api/v1/order`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast({ title: 'Order Created', description: 'Order created successfully' });
        setCreateOpen(false);
        setOrderForm({ productName: '', width: '', height: '', quantity: '', paperConfig: '', printingSide: '', foldingType: '', laminationType: '', uvType: '', foilType: '', dieType: '', textureType: '', additionalNote: '', quality: '', fileUrl: '' });
        getOrders();
      } else throw new Error(res.data.message);
    } catch (err) { toast({ title: 'Error', description: err.message || 'Creation failed', variant: 'destructive' }); }
    finally { setCreating(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 text-sm mt-1">Manage and track all printing orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={getOrders} disabled={loading}><RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
          <Button className="bg-zinc-800 text-white" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />New Order</Button>
        </div>
      </div>

      <Card className="mb-5">
        <CardContent className="p-4 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Input placeholder="Search orders (id, product, user)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 items-center">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4"><CardTitle className="text-sm font-semibold">All Orders ({filteredOrders.length})</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Raised By</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-gray-500">Loading...</TableCell></TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-gray-500">No orders found</TableCell></TableRow>
              ) : filteredOrders.map(o => (
                <TableRow key={o._id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-xs">{o._id.slice(-8)}</TableCell>
                  <TableCell className="text-sm">{o.orderDetails?.productName}</TableCell>
                  <TableCell className="text-sm">{o.orderDetails?.quantity}</TableCell>
                  <TableCell><Badge variant={statusVariants[o.currentStatus] || 'outline'} className="text-[10px] px-2 py-0.5 bg-green-600 text-white">{o.currentStatus}</Badge></TableCell>
                  <TableCell className="text-xs">{o.raisedBy?.username || '—'}</TableCell>
                  <TableCell className="text-xs">{o.raisedTo?.username || <span className="text-gray-400">Unassigned</span>}</TableCell>
                  <TableCell className="text-xs">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {user?.userType === 'admin' && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openAssign(o)}>
                        <UserCheck className="h-3.5 w-3.5 mr-1" />Assign
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Assign Order</DialogTitle></DialogHeader>
          <form onSubmit={submitAssign} className="space-y-4">
            <div>
              <Label className="text-xs uppercase">Order</Label>
              <p className="text-sm font-mono">{selectedOrder?._id}</p>
            </div>
            <div className="space-y-2">
              <Label>Staff User</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger><SelectValue placeholder="Select Staff" /></SelectTrigger>
                <SelectContent>
                  {staffUsers.map(s => <SelectItem key={s._id} value={s._id}>{s.username}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={assigning}>{assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Order Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Order</DialogTitle></DialogHeader>
          <form onSubmit={submitCreateOrder} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label>Product *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Size *</Label>
                <Select onValueChange={(val) => {
                  const size = productMeta.sizes.find(s => s._id === val); if (size) { setOrderForm(prev => ({ ...prev, width: size.width, height: size.height })); }
                }}>
                  <SelectTrigger><SelectValue placeholder="Select Size" /></SelectTrigger>
                  <SelectContent>
                    {productMeta.sizes.map(sz => <SelectItem key={sz._id} value={sz._id}>{sz.name} ({sz.width}x{sz.height})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Paper *</Label>
                <Select onValueChange={(val) => setOrderForm(prev => ({ ...prev, paperConfig: val }))}>
                  <SelectTrigger><SelectValue placeholder="Select Paper" /></SelectTrigger>
                  <SelectContent>
                    {productMeta.papers.map(p => <SelectItem key={p._id} value={p.type + '-' + p.gsm}>{p.type} {p.gsm}gsm</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input type="number" name="quantity" value={orderForm.quantity} onChange={handleOrderField} />
              </div>
              <div className="space-y-2">
                <Label>Printing Side *</Label>
                <Input name="printingSide" value={orderForm.printingSide} onChange={handleOrderField} placeholder="e.g. Single/Double" />
              </div>
              {/* Finishing Options */}
              <div className="md:col-span-3 pt-2">
                <p className="text-xs font-semibold tracking-wide text-gray-500 mb-2">Finishing Options</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {costItemDefinitions.map(def => {
                    const items = productMeta.costItems.filter(c => c.type === def.enum);
                    if (!items.length) return (
                      <div key={def.enum} className="space-y-2 opacity-50 cursor-not-allowed">
                        <Label>{def.label}</Label>
                        <Select disabled>
                          <SelectTrigger><SelectValue placeholder="Not Available" /></SelectTrigger>
                        </Select>
                      </div>
                    );
                    return (
                      <div key={def.enum} className="space-y-2">
                        <Label>{def.label} *</Label>
                        <Select value={orderForm[def.field]} onValueChange={val => setOrderForm(p => ({ ...p, [def.field]: val }))}>
                          <SelectTrigger><SelectValue placeholder={`Select ${def.label}`} /></SelectTrigger>
                          <SelectContent>
                            {items.map(ci => (
                              <SelectItem key={ci._id} value={ci.value}>{ci.value}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* End Finishing Options */}
              <div className="space-y-2 md:col-span-3">
                <Label>Additional Note *</Label>
                <textarea name="additionalNote" value={orderForm.additionalNote} onChange={handleOrderField} className="w-full border rounded-md p-2 text-sm" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Design File *</Label>
                <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { if (filePreview) URL.revokeObjectURL(filePreview); setFilePreview(URL.createObjectURL(f)); uploadDesignFile(f); } }} />
                {uploadingFile && <p className="text-xs text-gray-500">Uploading...</p>}
                {orderForm.fileUrl && <p className="text-xs text-green-600 truncate">Uploaded: {orderForm.fileUrl}</p>}
                {filePreview && (
                  <div className="mt-2 border rounded-md p-2 bg-gray-50">
                    <p className="text-xs text-gray-600 mb-1">Preview</p>
                    <img src={filePreview} alt="Design preview" className="max-h-48 rounded object-contain mx-auto" />
                    <div className="flex justify-end mt-2">
                      <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => { if (filePreview) URL.revokeObjectURL(filePreview); setFilePreview(null); setOrderForm(prev => ({ ...prev, fileUrl: '', quality: '' })); }}>Remove</Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Quality (auto)</Label>
                <Input value={orderForm.quality} disabled />
              </div>
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); if (filePreview) URL.revokeObjectURL(filePreview); setFilePreview(null); }}>Cancel</Button>
              <Button type="submit" disabled={creating}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Order'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderList;