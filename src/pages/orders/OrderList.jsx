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
import { Plus, RefreshCcw, UserCheck, PlayCircle, Loader2, Layers, Pencil, Eye, Download, Trash2, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import OrderSummary from '../../components/OrderSummary';
// Inline automation-related API calls (removed shared automations service)

const statusVariants = {
  PENDING: 'secondary',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
  DELETED: 'secondary',
  MANUALLY_AUTOMATED: 'default'
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
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const STATUS_TABS = ['PENDING', 'ACTIVE', 'AUTOMATED', 'MANUALLY_AUTOMATED', 'COMPLETED', 'CANCELLED', 'DELETED'];
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
  // Automation state
  const [automationDialogOpen, setAutomationDialogOpen] = useState(false);
  const [selectedForAutomation, setSelectedForAutomation] = useState([]); // array of order ids
  const [sheets, setSheets] = useState([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [creatingAutomation, setCreatingAutomation] = useState(false);
  const [automationStep, setAutomationStep] = useState(1); // 1 = summary, 2 = configuration
  const [automationForm, setAutomationForm] = useState({
    sheetId: '',
    bleed: '',
    rotationsAllowed: false,
    name: '',
    description: '',
    type: 'BOTTOM_LEFT_FILL',
    margins: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  // Manual automation state
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', description: '', fileUrl: '' });
  const [manualUploading, setManualUploading] = useState(false);

  // Update order dialog state
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [orderToUpdate, setOrderToUpdate] = useState(null);

  // Order details dialog state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState(null);

  const filteredOrders = useMemo(() => orders.filter(o => {
    const term = searchTerm.toLowerCase();
    const matchSearch = !term || (
      o.orderDetails?.productName?.toLowerCase().includes(term) ||
      o._id?.toLowerCase().includes(term) ||
      o.raisedBy?.username?.toLowerCase().includes(term) ||
      o.raisedTo?.username?.toLowerCase().includes(term)
    );
    return matchSearch;
  }), [orders, searchTerm]);

  const getOrdersByStatus = useCallback(async (status) => {
    const res = await axios.get(`${apiUrl}/api/v1/order/status/${status}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data || [];
  }, [token]);

  const getOrders = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getOrdersByStatus(filterStatus);
      setOrders(list);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to load orders', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [filterStatus, getOrdersByStatus, toast]);

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

  const loadSheets = useCallback(async () => {
    try {
      setLoadingSheets(true);
      const res = await axios.get(`${apiUrl}/api/v1/products/sheets`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setSheets(res.data.data); else throw new Error(res.data.message);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to load sheets', variant: 'destructive' });
    } finally { setLoadingSheets(false); }
  }, [token, toast]);

  useEffect(() => { getOrders(); if (user?.userType === 'admin') { getStaffUsers(); } getProducts(); }, [getOrders, getStaffUsers, getProducts, user]);

  // Refetch when filter changes
  useEffect(() => { getOrders(); }, [filterStatus, getOrders]);

  const calculateOrderPrice = useCallback(() => {
    if (!orderForm.quantity || !selectedProduct) return '0';

    const product = products.find(p => p._id === selectedProduct);
    if (!product) return '0';

    let totalPrice = 0;
    const quantity = parseInt(orderForm.quantity) || 0;

    // Base price from product
    const basePrice = product.basePrice || 0;
    totalPrice += basePrice * quantity;

    // Paper cost
    if (orderForm.paperConfig) {
      const [paperType, paperGsm] = orderForm.paperConfig.split('-');
      const paper = product.availablePapers?.find(
        p => p.type === paperType && p.gsm === parseInt(paperGsm)
      );
      if (paper && paper.pricePerUnit) {
        totalPrice += paper.pricePerUnit * quantity;
      }
    }

    // Size cost (if applicable)
    if (orderForm.width && orderForm.height) {
      const area = (parseFloat(orderForm.width) * parseFloat(orderForm.height)) / 10000; // Convert to sq meters
      const sizeCostPerSqM = product.sizeCostPerSqM || 50;
      totalPrice += area * sizeCostPerSqM * quantity;
    }

    // Printing side cost
    if (orderForm.printingSide === 'DOUBLE') {
      const doubleSideCost = product.doubleSideCost || 0.5;
      totalPrice += doubleSideCost * quantity;
    }

    // Cost items (Finishing options)
    costItemDefinitions.forEach(def => {
      const fieldValue = orderForm[def.field];
      if (fieldValue) {
        const costItem = product.costItems?.find(
          ci => ci.type === def.enum && ci.value === fieldValue
        );
        if (costItem && costItem.price) {
          totalPrice += costItem.price * quantity;
        }
      }
    });

    return totalPrice.toFixed(2);
  }, [orderForm, selectedProduct, products, costItemDefinitions]);

  // When opening automation dialog, fetch sheets if not loaded
  useEffect(() => { if (automationDialogOpen && sheets.length === 0) { loadSheets(); } }, [automationDialogOpen, sheets.length, loadSheets]);

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
        setOrderForm(prev => ({ ...prev, fileUrl: res.data.data.fileUrl, quality: res.data.data.imageValidationData.metadata.density }));
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

  const toggleOrderSelect = (orderId) => {
    setSelectedForAutomation(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };

  const allVisibleIds = useMemo(() => filteredOrders.map(o => o._id), [filteredOrders]);
  const allSelectedOnPage = allVisibleIds.every(id => selectedForAutomation.includes(id)) && allVisibleIds.length > 0;
  const toggleSelectAll = () => {
    if (allSelectedOnPage) {
      // remove only those currently visible
      setSelectedForAutomation(prev => prev.filter(id => !allVisibleIds.includes(id)));
    } else {
      setSelectedForAutomation(prev => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };

  const openAutomationDialog = () => {
    if (selectedForAutomation.length < 1) {
      toast({ title: 'Select Orders', description: 'Select at least one order to automate', variant: 'destructive' });
      return;
    }
    // Validate all selected orders are ACTIVE
    const invalid = orders.filter(o => selectedForAutomation.includes(o._id) && o.currentStatus !== 'ACTIVE');
    if (invalid.length) {
      toast({ title: 'Invalid Orders', description: 'All selected orders must be ACTIVE', variant: 'destructive' });
      return;
    }
    setAutomationStep(1);
    setAutomationDialogOpen(true);
  };

  // Manual automation helpers
  const openManualDialog = () => {
    if (selectedForAutomation.length < 1) {
      toast({ title: 'Select Orders', description: 'Select at least one order to manually automate', variant: 'destructive' });
      return;
    }
    const invalid = orders.filter(o => selectedForAutomation.includes(o._id) && o.currentStatus !== 'ACTIVE');
    if (invalid.length) {
      toast({ title: 'Invalid Orders', description: 'All selected orders must be ACTIVE', variant: 'destructive' });
      return;
    }
    setManualDialogOpen(true);
  };

  const uploadManualFile = async (file) => {
    if (!file) return;
    // Limit 1MB client-side
    const MAX_BYTES = 1 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      toast({ title: 'File too large', description: 'Max 1MB file size allowed', variant: 'destructive' });
      return;
    }
    try {
      setManualUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${apiUrl}/api/v1/automate/manual/upload`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        setManualForm(prev => ({ ...prev, fileUrl: res.data.data.filePath }));
        toast({ title: 'Uploaded', description: 'Manual automation file uploaded' });
      } else throw new Error(res.data.message);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Upload failed', variant: 'destructive' });
    } finally { setManualUploading(false); }
  };

  const submitManualAutomation = async (e) => {
    e.preventDefault();
    if (!manualForm.name) { toast({ title: 'Validation', description: 'Name is required', variant: 'destructive' }); return; }
    if (!manualForm.fileUrl) { toast({ title: 'Validation', description: 'Upload the manual automation file', variant: 'destructive' }); return; }
    try {
      const payload = { name: manualForm.name, description: manualForm.description || '', orders: selectedForAutomation, automationFile: manualForm.fileUrl };
      const res = await axios.post(`${apiUrl}/api/v1/automate/manual`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast({ title: 'Manual Automation Saved', description: 'Orders marked as MANUALLY_AUTOMATED' });
        setManualDialogOpen(false);
        setManualForm({ name: '', description: '', fileUrl: '' });
        setSelectedForAutomation([]);
        getOrders();
      } else throw new Error(res.data.message);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to save manual automation', variant: 'destructive' });
    }
  };

  const handleAutomationField = (name, value) => {
    if (name.startsWith('margins.')) {
      const key = name.split('.')[1];
      setAutomationForm(prev => ({ ...prev, margins: { ...prev.margins, [key]: Number(value) || 0 } }));
    } else {
      setAutomationForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const submitAutomation = async (e) => {
    e.preventDefault();
    if (!automationForm.sheetId) { toast({ title: 'Validation', description: 'Select a sheet', variant: 'destructive' }); return; }
    try {
      setCreatingAutomation(true);
      const payload = {
        orderIds: selectedForAutomation,
        sheetId: automationForm.sheetId,
        bleed: automationForm.bleed ? Number(automationForm.bleed) : undefined,
        rotationsAllowed: Boolean(automationForm.rotationsAllowed),
        type: automationForm.type,
        name: automationForm.name || undefined,
        description: automationForm.description || undefined,
        margins: automationForm.margins
      };
      const res = await axios.post(`${apiUrl}/api/v1/automate`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast({ title: 'Automation Started', description: 'Automation process initialized successfully' });
        setAutomationDialogOpen(false);
        setAutomationForm({ sheetId: '', bleed: '', rotationsAllowed: false, name: '', description: '', type: 'BOTTOM_LEFT_FILL', margins: { top: 0, bottom: 0, left: 0, right: 0 } });
        setSelectedForAutomation([]);
        getOrders();
      } else throw new Error(res.data.message);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to start automation', variant: 'destructive' });
    } finally { setCreatingAutomation(false); }
  };

  const approveOrder = async (order) => {
    try {
      const res = await axios.patch(`${apiUrl}/api/v1/order/${order._id}/update`, { currentStatus: 'ACTIVE' }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast({ title: 'Order Approved', description: 'Order moved to ACTIVE status' });
        getOrders();
      } else throw new Error(res.data.message);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to approve order', variant: 'destructive' });
    }
  };

  const cancelOrder = async (order) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await axios.patch(`${apiUrl}/api/v1/order/${order._id}/update`, { currentStatus: 'CANCELLED' }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast({ title: 'Order Cancelled', description: 'Order moved to CANCELLED status' });
        getOrders();
      } else throw new Error(res.data.message);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to cancel order', variant: 'destructive' });
    }
  };

  // Open update dialog (admin-only route)
  const openUpdate = (order, e) => {
    if (e) e.stopPropagation();
    setOrderToUpdate(order);
    setUpdateQuantity(order?.orderDetails?.quantity?.toString() || '');
    setUpdateOpen(true);
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    if (!orderToUpdate?._id) return;
    const qty = Number(updateQuantity);
    if (!qty || qty <= 0) { toast({ title: 'Validation', description: 'Enter a valid quantity', variant: 'destructive' }); return; }
    try {
      setUpdating(true);
      const payload = { currentStatus: 'ACTIVE', orderDetails: { quantity: qty } };
      const res = await axios.patch(`${apiUrl}/api/v1/order/${orderToUpdate._id}/update`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast({ title: 'Order Updated', description: 'Quantity updated and status set to ACTIVE' });
        setUpdateOpen(false);
        setOrderToUpdate(null);
        getOrders();
      } else throw new Error(res.data.message);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to update order', variant: 'destructive' });
    } finally { setUpdating(false); }
  };

  // Order details dialog helpers
  const openDetails = (order) => {
    setDetailsOrder(order);
    setDetailsOpen(true);
  };
  const closeDetails = () => { setDetailsOpen(false); setDetailsOrder(null); };

  // Download order details as .txt
  const downloadOrderTxt = (order, e) => {
    if (e) e.stopPropagation();
    const d = order.orderDetails || {};
    const metaLines = [
      `Order ID: ${order._id}`,
      `Status: ${order.currentStatus}`,
      `Created: ${new Date(order.createdAt).toLocaleString()}`,
      `Raised By: ${order.raisedBy?.username || ''}`,
      `Assigned To: ${order.raisedTo?.username || ''}`,
      '',
      'Order Details:',
      `Product: ${d.productName || ''}`,
      `Size: ${d.width || ''} x ${d.height || ''}`,
      `Paper: ${d.paperConfig || ''}`,
      `Printing Side: ${d.printingSide || ''}`,
      `Quantity: ${d.quantity || ''}`,
      `Quality (DPI): ${d.quality || ''}`,
      `Folding: ${d.foldingType || ''}`,
      `Lamination: ${d.laminationType || ''}`,
      `UV: ${d.uvType || ''}`,
      `Foil: ${d.foilType || ''}`,
      `Die: ${d.dieType || ''}`,
      `Texture: ${d.textureType || ''}`,
      `Notes: ${d.additionalNote || ''}`,
      '',
      'Attached Files:',
      d.fileUrl ? `${d.fileUrl}` : 'None',
    ];
    const content = metaLines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const nameSafe = (d.productName || 'order').replace(/[^a-z0-9-]+/gi, '_');

    const a2 = document.createElement("a");
    a2.href = d.fileUrl;
    a2.download = `${nameSafe}_designfile`;
    document.body.appendChild(a2);
    a2.click();
    a2.remove();

    const a = document.createElement('a');
    a.href = url;
    a.download = `${nameSafe}_${order._id.slice(-6)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Manage and track all printing orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={getOrders} disabled={loading}><RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />New Order</Button>
        </div>
      </div>

      <Card className="mb-5">
        <CardContent className="p-4 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Input placeholder="Search orders (id, product, user)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {STATUS_TABS.map(s => {
              const isActive = filterStatus === s;
              return (
                <Button
                  key={s}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(s)}
                  className="rounded-full h-8"
                  aria-pressed={isActive}
                >
                  {s}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">All Orders ({filteredOrders.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={selectedForAutomation.length < 1} onClick={openAutomationDialog}>
                <PlayCircle className="h-4 w-4 mr-1" /> Automate ({selectedForAutomation.length})
              </Button>
              <Button variant="outline" size="sm" disabled={selectedForAutomation.length < 1} onClick={openManualDialog}>
                <Upload className="h-4 w-4 mr-1" /> Manual Automate
              </Button>
            </div>
          </div>
          {selectedForAutomation.length > 0 && (
            <div className="text-xs text-gray-600 flex items-center gap-3">
              <span className="font-medium">{selectedForAutomation.length} selected</span>
              <button type="button" className="underline" onClick={() => setSelectedForAutomation([])}>Clear</button>
              <button type="button" className="underline" onClick={toggleSelectAll}>{allSelectedOnPage ? 'Unselect visible' : 'Select all visible'}</button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox checked={allSelectedOnPage} onCheckedChange={toggleSelectAll} aria-label="Select all" />
                </TableHead>
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
                <TableRow><TableCell colSpan={9} className="py-10 text-center text-sm text-gray-500">Loading...</TableCell></TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="py-10 text-center text-sm text-gray-500">No orders found</TableCell></TableRow>
              ) : filteredOrders.map(o => (
                <TableRow
                  key={o._id}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedForAutomation.includes(o._id) ? 'bg-blue-50/50 ring-1 ring-blue-100' : ''}`}
                  onClick={() => openDetails(o)}
                >
                  <TableCell className="w-8" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      disabled={o.currentStatus !== 'ACTIVE'}
                      checked={selectedForAutomation.includes(o._id)}
                      onCheckedChange={() => toggleOrderSelect(o._id)}
                      aria-label={`Select order ${o._id}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{o._id.slice(-8)}</TableCell>
                  <TableCell className="text-sm">{o.orderDetails?.productName}</TableCell>
                  <TableCell className="text-sm">{o.orderDetails?.quantity}</TableCell>
                  <TableCell><Badge variant={statusVariants[o.currentStatus] || 'outline'} className="text-[10px] px-2 py-0.5 bg-green-600 text-white">{o.currentStatus}</Badge></TableCell>
                  <TableCell className="text-xs">{o.raisedBy?.username || '\u2014'}</TableCell>
                  <TableCell className="text-xs">{o.raisedTo?.username || <span className="text-gray-400">Unassigned</span>}</TableCell>
                  <TableCell className="text-xs">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); openDetails(o); }} title="View details">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => downloadOrderTxt(o, e)} title="Download as .txt">
                      <Download className="h-4 w-4" />
                    </Button>
                    {user?.userType === 'admin' && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => openUpdate(o, e)} title="Update quantity">
                        <Pencil className="h-3.5 w-3.5 mr-1" />Update
                      </Button>
                    )}
                    {user?.userType === 'admin' && !o.raisedTo && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); openAssign(o); }}>
                        <UserCheck className="h-3.5 w-3.5 mr-1" />Assign
                      </Button>
                    )}
                    {user?.userType === 'admin' && o.currentStatus === 'PENDING' && (
                      <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); approveOrder(o); }}>
                        Approve
                      </Button>
                    )}
                    {user?.userType === 'admin' && ['PENDING', 'ACTIVE'].includes(o.currentStatus) && (
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); cancelOrder(o); }}>
                        Cancel
                      </Button>
                    )}
                    {user?.userType === 'admin' && o.currentStatus === 'CANCELLED' && (
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm('Delete this cancelled order? This will mark it as DELETED.')) return;
                        try {
                          const res = await axios.delete(`${apiUrl}/api/v1/order/${o._id}`, { headers: { Authorization: `Bearer ${token}` } });
                          if (res.data.success) { toast({ title: 'Order Deleted', description: 'Order marked as DELETED' }); getOrders(); }
                          else throw new Error(res.data.message);
                        } catch (err) { toast({ title: 'Error', description: err.message || 'Delete failed', variant: 'destructive' }); }
                      }} title="Delete (mark as DELETED)">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sticky selection bar for better UX */}
      {selectedForAutomation.length > 0 && (
        <div className="sticky bottom-2 z-30 mt-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between rounded-md border bg-white shadow-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" />
                <span><span className="font-semibold">{selectedForAutomation.length}</span> selected</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedForAutomation([])}>Clear</Button>
                <Button variant="outline" size="sm" onClick={toggleSelectAll}>{allSelectedOnPage ? 'Unselect visible' : 'Select visible'}</Button>
                <Button size="sm" onClick={openAutomationDialog} disabled={selectedForAutomation.length < 1}>
                  <PlayCircle className="h-4 w-4 mr-1" /> Automate
                </Button>
                <Button size="sm" variant="outline" onClick={openManualDialog} disabled={selectedForAutomation.length < 1}>
                  <Upload className="h-4 w-4 mr-1" /> Manual Automate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Create Order Dialog with Order Summary */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Order</DialogTitle></DialogHeader>
          <form onSubmit={submitCreateOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
                  <CardContent>
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
                          const size = productMeta.sizes.find(s => s._id === val);
                          if (size) {
                            setOrderForm(prev => ({ ...prev, width: size.width, height: size.height }));
                          }
                        }}>
                          <SelectTrigger><SelectValue placeholder="Select Size" /></SelectTrigger>
                          <SelectContent>
                            {productMeta.sizes.map(sz => (
                              <SelectItem key={sz._id} value={sz._id}>
                                {sz.name} ({sz.width}x{sz.height})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Paper *</Label>
                        <Select onValueChange={(val) => setOrderForm(prev => ({ ...prev, paperConfig: val }))}>
                          <SelectTrigger><SelectValue placeholder="Select Paper" /></SelectTrigger>
                          <SelectContent>
                            {productMeta.papers.map(p => (
                              <SelectItem key={p._id} value={p.type + '-' + p.gsm}>
                                {p.type} {p.gsm}gsm
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          name="quantity"
                          value={orderForm.quantity}
                          onChange={handleOrderField}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Printing Side *</Label>
                        <Select
                          value={orderForm.printingSide}
                          onValueChange={(val) => setOrderForm(p => ({ ...p, printingSide: val }))}
                        >
                          <SelectTrigger><SelectValue placeholder="Select Printing Side" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SINGLE">Single</SelectItem>
                            <SelectItem value="DOUBLE">Double</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Finishing Options */}
                <Card>
                  <CardHeader><CardTitle>Finishing Options</CardTitle></CardHeader>
                  <CardContent>
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
                            <Select
                              value={orderForm[def.field]}
                              onValueChange={val => setOrderForm(p => ({ ...p, [def.field]: val }))}
                            >
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
                  </CardContent>
                </Card>

                {/* Additional Notes & File Upload */}
                <Card>
                  <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Additional Note *</Label>
                      <textarea
                        name="additionalNote"
                        value={orderForm.additionalNote}
                        onChange={handleOrderField}
                        className="w-full border rounded-md p-2 text-sm"
                        rows={3}
                        placeholder="Any special instructions or requirements..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Design File *</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files[0];
                          if (f) {
                            if (filePreview) URL.revokeObjectURL(filePreview);
                            setFilePreview(URL.createObjectURL(f));
                            uploadDesignFile(f);
                          }
                        }}
                      />
                      {uploadingFile && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Uploading...</span>
                        </div>
                      )}
                      {orderForm.fileUrl && (
                        <p className="text-xs text-green-600 truncate">
                          ✓ Uploaded: {orderForm.fileUrl.split('/').pop()}
                        </p>
                      )}
                      {filePreview && (
                        <div className="mt-2 border rounded-md p-2 bg-gray-50">
                          <p className="text-xs text-gray-600 mb-1">Preview</p>
                          <img
                            src={filePreview}
                            alt="Design preview"
                            className="max-h-48 rounded object-contain mx-auto"
                          />
                          <div className="flex justify-end mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                if (filePreview) URL.revokeObjectURL(filePreview);
                                setFilePreview(null);
                                setOrderForm(prev => ({ ...prev, fileUrl: '', quality: '' }));
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary Sidebar - 1/3 width */}
              <div className="lg:col-span-1">
                <OrderSummary
                  formData={{
                    productType: orderForm.productName,
                    size: orderForm.width && orderForm.height
                      ? `${orderForm.width} x ${orderForm.height} mm`
                      : '',
                    paperType: orderForm.paperConfig
                      ? orderForm.paperConfig.replace('-', ' ')
                      : '',
                    quantity: orderForm.quantity,
                    printingSide: orderForm.printingSide
                  }}
                  files={orderForm.fileUrl ? [{ name: 'Design File' }] : []}
                  calculateEstimatedPrice={calculateOrderPrice}
                  onSubmit={submitCreateOrder}
                  isLoading={creating}
                  submitButtonText="Create Order"
                  showNotes={true}
                />
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Automation Dialog with Summary Step */}
      <Dialog open={automationDialogOpen} onOpenChange={setAutomationDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{automationStep === 1 ? 'Automation Summary' : 'Start Automation'}</DialogTitle>
          </DialogHeader>
          {automationStep === 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Review selected orders before configuring automation.</p>
              <div className="max-h-72 overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.filter(o => selectedForAutomation.includes(o._id)).map(o => (
                      <TableRow key={o._id}>
                        <TableCell className="font-mono text-[11px]">{o._id.slice(-8)}</TableCell>
                        <TableCell className="text-sm">{o.orderDetails?.productName}</TableCell>
                        <TableCell className="text-xs">{o.orderDetails?.width}x{o.orderDetails?.height} • {o.orderDetails?.paperConfig}</TableCell>
                        <TableCell className="text-right text-sm">{o.orderDetails?.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Orders: <span className="font-semibold">{selectedForAutomation.length}</span></span>
                <span className="text-gray-600">Total Quantity: <span className="font-semibold">{orders.filter(o => selectedForAutomation.includes(o._id)).reduce((sum, o) => sum + (o.orderDetails?.quantity || 0), 0)}</span></span>
              </div>
              <DialogFooter className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setAutomationDialogOpen(false)}>Cancel</Button>
                <Button type="button" onClick={() => setAutomationStep(2)}>Next</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={submitAutomation} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sheet *</Label>
                  <Select value={automationForm.sheetId} onValueChange={val => handleAutomationField('sheetId', val)}>
                    <SelectTrigger><SelectValue placeholder={loadingSheets ? 'Loading...' : 'Select Sheet'} /></SelectTrigger>
                    <SelectContent>
                      {sheets.map(s => (
                        <SelectItem key={s._id} value={s._id}>{s.name || `${s.width}x${s.height}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bleed (mm)</Label>
                  <Input type="number" value={automationForm.bleed} onChange={e => handleAutomationField('bleed', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Algorithm Type *</Label>
                  <Select value={automationForm.type} onValueChange={val => handleAutomationField('type', val)}>
                    <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOTTOM_LEFT_FILL">Bottom Left Fill</SelectItem>
                      <SelectItem value="SHELF">Shelf (Row-based)</SelectItem>
                      <SelectItem value="MAX_RECTS">Max Rects (High Efficiency)</SelectItem>
                      <SelectItem value="GANG">Gang (Interleaved Jobs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">Allow Rotations
                    <Checkbox checked={automationForm.rotationsAllowed} onCheckedChange={val => handleAutomationField('rotationsAllowed', !!val)} />
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={automationForm.name} onChange={e => handleAutomationField('name', e.target.value)} placeholder="Optional name" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <textarea className="w-full border rounded-md p-2 text-sm" value={automationForm.description} onChange={e => handleAutomationField('description', e.target.value)} placeholder="Optional description" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <p className="text-xs font-semibold tracking-wide text-gray-500">Margins (mm)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['top', 'bottom', 'left', 'right'].map(m => (
                      <div key={m} className="space-y-1">
                        <Label className="capitalize text-xs">{m}</Label>
                        <Input type="number" value={automationForm.margins[m]} onChange={e => handleAutomationField(`margins.${m}`, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <p className="text-xs text-gray-600">Orders Selected: <span className="font-medium">{selectedForAutomation.length}</span></p>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto border rounded p-2 bg-gray-50">
                    {selectedForAutomation.map(id => <span key={id} className="text-[10px] font-mono bg-gray-200 px-1.5 py-0.5 rounded">{id.slice(-6)}</span>)}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex gap-2 justify-between">
                <div>
                  <Button type="button" variant="ghost" onClick={() => setAutomationStep(1)}>Back</Button>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setAutomationDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={creatingAutomation}>{creatingAutomation ? <Loader2 className="h-4 w-4 animate-spin" /> : <><PlayCircle className="h-4 w-4 mr-1" /> Start</>}</Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Automation Dialog */}
      <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Manual Automate Selected Orders</DialogTitle></DialogHeader>
          <form onSubmit={submitManualAutomation} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={manualForm.name} onChange={(e) => setManualForm(p => ({ ...p, name: e.target.value }))} placeholder="Enter a name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea className="w-full border rounded-md p-2 text-sm" rows={3} value={manualForm.description} onChange={(e) => setManualForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" />
            </div>
            <div className="space-y-2">
              <Label>Upload File (max 1MB)</Label>
              <Input type="file" onChange={(e) => uploadManualFile(e.target.files?.[0])} />
              {manualUploading && <div className="text-xs text-gray-500 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</div>}
              {manualForm.fileUrl && <p className="text-xs text-green-600 truncate">✓ Uploaded: {manualForm.fileUrl.split('/').pop()}</p>}
            </div>
            <div className="text-xs text-gray-600">Orders Selected: <span className="font-medium">{selectedForAutomation.length}</span></div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setManualDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Manual Automation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Order Dialog */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Update Order</DialogTitle></DialogHeader>
          <form onSubmit={submitUpdate} className="space-y-4">
            <div className="text-sm">
              <p className="text-gray-600">Order <span className="font-mono">{orderToUpdate?._id?.slice(-8)}</span></p>
              <p className="text-gray-600">Product: <span className="font-medium">{orderToUpdate?.orderDetails?.productName}</span></p>
              <p className="text-gray-600">Current Qty: <span className="font-medium">{orderToUpdate?.orderDetails?.quantity}</span></p>
            </div>
            <div className="space-y-2">
              <Label>New Quantity</Label>
              <Input type="number" value={updateQuantity} onChange={(e) => setUpdateQuantity(e.target.value)} min={1} />
              <p className="text-[11px] text-gray-500">Updating will set status to <span className="font-semibold">ACTIVE</span> so you can re-run automation.</p>
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setUpdateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updating}>{updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={(open) => { if (!open) closeDetails(); else setDetailsOpen(true); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {detailsOrder && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Overview</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><span className="text-gray-600">Order:</span> <span className="font-mono">{detailsOrder._id}</span></p>
                    <p><span className="text-gray-600">Status:</span> <Badge className="ml-1">{detailsOrder.currentStatus}</Badge></p>
                    <p><span className="text-gray-600">Created:</span> {new Date(detailsOrder.createdAt).toLocaleString()}</p>
                    <p><span className="text-gray-600">Raised By:</span> {detailsOrder.raisedBy?.username || '—'}</p>
                    <p><span className="text-gray-600">Assigned To:</span> {detailsOrder.raisedTo?.username || '—'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Order Details</CardTitle></CardHeader>
                  <CardContent className="text-sm grid grid-cols-2 gap-y-2">
                    <p><span className="text-gray-600">Product:</span> {detailsOrder.orderDetails?.productName}</p>
                    <p><span className="text-gray-600">Quantity:</span> {detailsOrder.orderDetails?.quantity}</p>
                    <p><span className="text-gray-600">Size:</span> {detailsOrder.orderDetails?.width} x {detailsOrder.orderDetails?.height} mm</p>
                    <p><span className="text-gray-600">Paper:</span> {detailsOrder.orderDetails?.paperConfig}</p>
                    <p><span className="text-gray-600">Printing:</span> {detailsOrder.orderDetails?.printingSide}</p>
                    <p><span className="text-gray-600">Quality (DPI):</span> {detailsOrder.orderDetails?.quality}</p>
                    <p className="col-span-2"><span className="text-gray-600">Finishing:</span> {[detailsOrder.orderDetails?.foldingType, detailsOrder.orderDetails?.laminationType, detailsOrder.orderDetails?.uvType, detailsOrder.orderDetails?.foilType, detailsOrder.orderDetails?.dieType, detailsOrder.orderDetails?.textureType].filter(Boolean).join(', ') || '—'}</p>
                    <p className="col-span-2"><span className="text-gray-600">Notes:</span> {detailsOrder.orderDetails?.additionalNote || '—'}</p>
                    <div className="col-span-2 flex items-center gap-2 mt-2">
                      <Button type="button" variant="outline" size="sm" onClick={(e) => downloadOrderTxt(detailsOrder, e)}>
                        <Download className="h-4 w-4 mr-1" /> Download .txt
                      </Button>
                      {detailsOrder.orderDetails?.fileUrl && (
                        <a href={detailsOrder.orderDetails.fileUrl} target="_blank" rel="noreferrer" className="text-xs underline text-blue-600">Open file</a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="md:col-span-1">
                <Card>
                  <CardHeader><CardTitle className="text-base">Preview</CardTitle></CardHeader>
                  <CardContent>
                    {detailsOrder.orderDetails?.fileUrl ? (
                      <img src={detailsOrder.orderDetails.fileUrl} alt="Order file preview" className="rounded border max-h-64 object-contain w-full bg-gray-50" />
                    ) : (
                      <p className="text-xs text-gray-500">No file attached</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderList;