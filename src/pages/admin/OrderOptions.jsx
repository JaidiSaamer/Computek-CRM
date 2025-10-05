import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import {
  Package,
  Ruler,
  FileText,
  Layers,
  Search,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { apiUrl } from "@/lib/utils"
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ItemDetails = ({ item }) => {
  const details = Object.entries(item).filter(
    ([key]) => key !== '_id' && key !== '__v' && key !== 'name'
  );

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-md border">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {details.map(([key, value]) => (
          <div key={key}>
            <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
            <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderOptions = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [selectedItem, setSelectedItem] = useState(null);
  const [products, setProducts] = useState([]);
  const [pageSizes, setPageSizes] = useState([]);
  const [paperConfigs, setPaperConfigs] = useState([]);
  const [costItems, setCostItems] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [applicabilityOptions, setApplicabilityOptions] = useState([]);
  const [costItemTypeOptions, setCostItemTypeOptions] = useState([]);
  const [enumsLoading, setEnumsLoading] = useState(false);
  const [enumsError, setEnumsError] = useState('');
  const { token } = useAuth();
  const { toast } = useToast();
  
  const getCurrentTitle = useCallback(() => {
    switch (activeTab) {
      case 'products': return 'Products';
      case 'sizes': return 'Page Sizes';
      case 'papers': return 'Paper Configs';
      case 'costItems': return 'Cost Items';
      case 'sheets': return 'Sheets';
      default: return '';
    }
  }, [activeTab]);

  const tabs = [
    { id: 'products', name: 'Products', icon: Package },
    { id: 'sizes', name: 'Page Sizes', icon: Ruler },
    { id: 'papers', name: 'Paper Configs', icon: FileText },
    { id: 'costItems', name: 'Cost Items', icon: FileText },
    { id: 'sheets', name: 'Sheets', icon: Layers }
  ];

  const fetchDataForTab = useCallback(async (tab, signal) => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      switch (tab) {
        case 'products': {
          const url = `${apiUrl}/api/v1/products/product`;
          const res = await axios.get(url, { headers, signal });
          setProducts(Array.isArray(res.data.data) ? res.data.data : []);
          break;
        }
        case 'sizes': {
          const url = `${apiUrl}/api/v1/products/page-size`;
          const res = await axios.get(url, { headers, signal });
          setPageSizes(Array.isArray(res.data.data) ? res.data.data : []);
          break;
        }
        case 'papers': {
          const url = `${apiUrl}/api/v1/products/paper-config`;
          const res = await axios.get(url, { headers, signal });
          setPaperConfigs(Array.isArray(res.data.data) ? res.data.data : []);
          break;
        }
        case 'costItems': {
          const url = `${apiUrl}/api/v1/products/cost-item`;
          const res = await axios.get(url, { headers, signal });
          setCostItems(Array.isArray(res.data.data) ? res.data.data : []);
          break;
        }
        case 'sheets': {
          const url = `${apiUrl}/api/v1/products/sheets`;
          const res = await axios.get(url, { headers, signal });
          setSheets(Array.isArray(res.data.data) ? res.data.data : []);
          break;
        }
        default:
          return;
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        toast({
          title: "Error",
          description: `Failed to fetch ${getCurrentTitle()}, error: ${error}`,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [token, toast, getCurrentTitle]);

  useEffect(() => {
    const controller = new AbortController();
    fetchDataForTab(activeTab, controller.signal);

    return () => {
      controller.abort();
    };
  }, [activeTab, fetchDataForTab]);

  const fetchEnums = useCallback(async () => {
    if (!token) return;
    setEnumsLoading(true);
    setEnumsError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [appRes, costRes] = await Promise.all([
        axios.get(`${apiUrl}/api/v1/products/applicability`, { headers }),
        axios.get(`${apiUrl}/api/v1/products/cost-item/enums`, { headers })
      ]);
      const appData = Array.isArray(appRes.data?.data) ? appRes.data.data : [];
      const costData = Array.isArray(costRes.data?.data) ? costRes.data.data : [];
      setApplicabilityOptions(appData);
      setCostItemTypeOptions(costData);
      if (appData.length === 0 || costData.length === 0) {
        setEnumsError('No enum values returned from server');
      }
    } catch (err) {
      console.warn('Failed fetching enums', err);
      setEnumsError('Failed to load enums');
      toast({ title: 'Enum Fetch Error', description: 'Could not load applicability or cost item types', variant: 'destructive' });
    } finally {
      setEnumsLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchEnums();
  }, [fetchEnums]);

  const handleItemClick = (item) => {
    if (selectedItem && selectedItem._id === item._id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const openAddModal = async () => {
    if ((applicabilityOptions.length === 0 || costItemTypeOptions.length === 0) && !enumsLoading) {
      await fetchEnums();
    }
    // Ensure dependencies for product form
    if (activeTab === 'products') {
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const promises = [];
        if (pageSizes.length === 0) promises.push(axios.get(`${apiUrl}/api/v1/products/page-size`, { headers }).then(r => setPageSizes(Array.isArray(r.data?.data) ? r.data.data : [])));
        if (paperConfigs.length === 0) promises.push(axios.get(`${apiUrl}/api/v1/products/paper-config`, { headers }).then(r => setPaperConfigs(Array.isArray(r.data?.data) ? r.data.data : [])));
        if (costItems.length === 0) promises.push(axios.get(`${apiUrl}/api/v1/products/cost-item`, { headers }).then(r => setCostItems(Array.isArray(r.data?.data) ? r.data.data : [])));
        if (promises.length) await Promise.all(promises);
      } catch (e) {
        console.warn('Preload dependencies failed', e);
      }
    }
    setFormErrors({});
    setFormData({});
    setShowAddModal(true);
  };
  const closeAddModal = () => {
    if (submitting) return;
    setShowAddModal(false);
  };

  const fieldConfigs = {
    sizes: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'width', label: 'Width (mm)', type: 'number', required: true },
      { name: 'height', label: 'Height (mm)', type: 'number', required: true },
      { name: 'applicability', label: 'Applicability', type: 'select', options: applicabilityOptions, required: true },
      { name: 'associatedCost', label: 'Associated Cost', type: 'number', required: true }
    ],
    papers: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'text', required: true },
      { name: 'gsm', label: 'GSM', type: 'number', required: true },
      { name: 'applicability', label: 'Applicability', type: 'select', options: applicabilityOptions, required: true },
      { name: 'associatedCost', label: 'Associated Cost', type: 'number', required: true }
    ],
    costItems: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: costItemTypeOptions, required: true },
      { name: 'value', label: 'Value', type: 'text', required: true },
      { name: 'applicability', label: 'Applicability', type: 'select', options: applicabilityOptions, required: true },
      { name: 'associatedCost', label: 'Associated Cost', type: 'number', required: true }
    ],
    sheets: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'width', label: 'Width (mm)', type: 'number', required: true },
      { name: 'height', label: 'Height (mm)', type: 'number', required: true }
    ],
    products: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'availableSizes', label: 'Available Sizes', type: 'relation', source: 'sizes', required: true },
      { name: 'availablePapers', label: 'Available Papers', type: 'relation', source: 'papers', required: true },
      { name: 'costItems', label: 'Cost Items', type: 'relation', source: 'costItems', required: false }
    ]
  };

  const endpointMap = {
    sizes: '/api/v1/products/page-size',
    papers: '/api/v1/products/paper-config',
    costItems: '/api/v1/products/cost-item',
    sheets: '/api/v1/products/sheets',
    products: '/api/v1/products/product'
  };

  const transformPayload = (tab, data) => {
    const clone = { ...data };
    if (tab === 'sizes') {
      clone.name = clone.name?.toUpperCase();
      clone.width = Number(clone.width); clone.height = Number(clone.height); clone.associatedCost = Number(clone.associatedCost);
    }
    if (tab === 'papers') {
      clone.type = clone.type?.toUpperCase();
      clone.gsm = Number(clone.gsm); clone.associatedCost = Number(clone.associatedCost);
    }
    if (tab === 'costItems') {
      clone.associatedCost = Number(clone.associatedCost);
    }
    if (tab === 'sheets') {
      clone.name = clone.name?.toUpperCase();
      clone.width = Number(clone.width); clone.height = Number(clone.height);
    }
    if (tab === 'products') {
      // arrays already objectIds selected
    }
    return clone;
  };

  const validateForm = (tab, fields) => {
    const errs = {};
    for (const f of fields) {
      const val = formData[f.name];
      if (f.required) {
        if (['multiselect', 'relation'].includes(f.type)) {
          if (!val || !Array.isArray(val) || val.length === 0) errs[f.name] = 'Required';
        } else if (val === undefined || val === null || val === '') {
          errs[f.name] = 'Required';
        }
      }
      if (f.type === 'number' && val !== undefined && val !== '' && isNaN(Number(val))) {
        errs[f.name] = 'Must be a number';
      }
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleRelationValue = (field, value) => {
    setFormData(prev => {
      const current = new Set(prev[field] || []);
      if (current.has(value)) current.delete(value); else current.add(value);
      return { ...prev, [field]: Array.from(current) };
    });
  };
  const selectAllRelation = (field, values) => setFormData(prev => ({ ...prev, [field]: values }));
  const clearRelation = (field) => setFormData(prev => ({ ...prev, [field]: [] }));

  const handleSubmitAdd = async () => {
    const fields = fieldConfigs[activeTab] || [];
    if (!validateForm(activeTab, fields)) return;
    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const payload = transformPayload(activeTab, formData);
      await axios.post(`${apiUrl}${endpointMap[activeTab]}`, payload, { headers });
      toast({ title: 'Success', description: `${getCurrentTitle().slice(0, -1)} added successfully.` });
      closeAddModal();
      fetchDataForTab(activeTab);
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to add item', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const dataMap = useMemo(() => ({ products, sizes: pageSizes, papers: paperConfigs, costItems, sheets }), [products, pageSizes, paperConfigs, costItems, sheets]);
  const currentItems = useMemo(() => dataMap[activeTab] || [], [dataMap, activeTab]);
  const filteredItems = useMemo(() => {
    if (!search.trim()) return currentItems;
    return currentItems.filter(i => (i.name || '').toLowerCase().includes(search.toLowerCase()));
  }, [currentItems, search]);

  const renderItemsManager = () => {
    const items = filteredItems;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold tracking-wide flex items-center gap-2">
                <span className="uppercase text-[11px] font-medium text-gray-500">{getCurrentTitle()}</span>
                <span className="inline-flex items-center justify-center rounded-md bg-gray-900 text-white text-[10px] h-5 px-2">{filteredItems.length}</span>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => fetchDataForTab(activeTab)} disabled={loading} className="gap-1 text-xs">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button size="sm" onClick={openAddModal} className="gap-1 text-xs bg-gray-900 text-white hover:bg-gray-800" disabled={loading}>
                + Add
              </Button>
            </div>
            <div className="mt-3 relative">
              <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${getCurrentTitle()}...`}
                className="pl-8 text-sm h-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="divide-y rounded-md border overflow-hidden">
                {items.length > 0 ? items.map(item => {
                  const expanded = selectedItem && selectedItem._id === item._id;
                  return (
                    <div key={item._id} className="group bg-white hover:bg-gray-50 transition-colors">
                      <button
                        onClick={() => handleItemClick(item)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-gray-300"
                        aria-expanded={expanded}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-gray-400">
                            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </span>
                          <span className="font-medium text-sm text-gray-800 truncate">
                            {item.name || item.type || item.label || `Item ${item._id}`}
                          </span>
                          {/* context summary */}
                          <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded hidden md:inline-block">
                            {activeTab === 'sizes' && typeof item.width !== 'undefined' && typeof item.height !== 'undefined' ? `${item.width}x${item.height}` : ''}
                            {activeTab === 'costItems' && typeof item.amount !== 'undefined' ? `Cost: ${item.amount}` : ''}
                            {activeTab === 'papers' && item.gsm ? `${item.gsm}gsm` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold tracking-wide uppercase bg-gray-900 text-white px-2 py-1 rounded">
                            {activeTab.slice(0, 3)}
                          </span>
                        </div>
                      </button>
                      {expanded && (
                        <div className="px-8 pb-5 -mt-1 bg-gradient-to-b from-gray-50/40 to-white">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 text-xs">
                            {Object.entries(item)
                              .filter(([k]) => !['_id', '__v'].includes(k))
                              .map(([k, v]) => {
                                let displayValue;
                                if (activeTab === 'products' && ['availableSizes', 'availablePapers', 'costItems'].includes(k) && Array.isArray(v)) {
                                  const names = v.map(o => {
                                    if (o == null) return '';
                                    if (typeof o === 'string') return o; // in case backend already populated with ids only
                                    return o.name || o.type || o.id || o._id || '';
                                  }).filter(Boolean);
                                  displayValue = names.join(', ');
                                  if (!displayValue) displayValue = '—';
                                } else if (typeof v === 'object') {
                                  // Keep objects readable but concise
                                  displayValue = Array.isArray(v) ? JSON.stringify(v) : JSON.stringify(v);
                                } else {
                                  displayValue = String(v);
                                }
                                return (
                                  <div key={k} className="space-y-1">
                                    <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">{k.replace(/([A-Z])/g, ' $1')}</div>
                                    <div className="text-gray-800 font-medium break-all">{displayValue}</div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="text-center py-10 text-sm text-gray-500 flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <p>No {getCurrentTitle().toLowerCase()} found.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Order Catalog</h1>
          <p className="text-gray-500 text-sm mt-1">Browse configured products and production parameters.</p>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all ${active ? 'bg-gray-900 text-white border-gray-900 shadow-sm' : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'}`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
      {renderItemsManager()}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAddModal} />
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-lg border p-6 space-y-5 overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Add {getCurrentTitle().slice(0, -1)}</h2>
                <p className="text-xs text-gray-500 mt-1">Fill in the required fields below.</p>
              </div>
              <button onClick={closeAddModal} className="text-gray-400 hover:text-gray-600 text-sm" disabled={submitting}>✕</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              {enumsLoading && (
                <div className="mb-4 text-xs text-gray-500 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" /> Loading enums...
                </div>
              )}
              {enumsError && (
                <div className="mb-4 flex items-center justify-between bg-red-50 border border-red-200 text-red-600 rounded px-3 py-2 text-xs">
                  <span>{enumsError}</span>
                  <button type="button" onClick={fetchEnums} className="underline">Retry</button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(fieldConfigs[activeTab] || []).map(f => {
                  if (f.type === 'relation') {
                    let sourceList = [];
                    if (f.source === 'sizes') sourceList = pageSizes;
                    if (f.source === 'papers') sourceList = paperConfigs;
                    if (f.source === 'costItems') sourceList = costItems;
                    const selectedArr = formData[f.name] || [];
                    return (
                      <div key={f.name} className="flex flex-col gap-2 col-span-1 sm:col-span-2 border rounded-md p-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">{f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}</label>
                          <div className="flex gap-2">
                            <button type="button" className="text-[10px] px-2 py-1 rounded bg-gray-200 hover:bg-gray-300" onClick={() => selectAllRelation(f.name, sourceList.map(s => s._id))}>All</button>
                            <button type="button" className="text-[10px] px-2 py-1 rounded bg-gray-200 hover:bg-gray-300" onClick={() => clearRelation(f.name)}>Clear</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                          {sourceList.map(item => {
                            const id = item._id;
                            const checked = selectedArr.includes(id);
                            const label = item.name || item.type || item.id || id;
                            return (
                              <label key={id} className={`flex items-center gap-2 text-[11px] font-medium px-2 py-1 rounded border cursor-pointer select-none ${checked ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-100 border-gray-200'} ${enumsLoading ? 'opacity-60 pointer-events-none' : ''}`}>\n                                <input
                                type="checkbox"
                                className="h-3 w-3"
                                disabled={enumsLoading}
                                checked={checked}
                                onChange={() => toggleRelationValue(f.name, id)}
                              />
                                <span className="truncate">{label}</span>
                              </label>
                            );
                          })}
                        </div>
                        {formErrors[f.name] && <span className="text-xs text-red-500">{formErrors[f.name]}</span>}
                      </div>
                    );
                  }
                  // existing non-relation rendering follows
                  const spanClass = f.type === 'textarea' ? 'sm:col-span-2' : '';
                  return (
                    <div key={f.name} className={`flex flex-col gap-1 col-span-1 ${spanClass}`}>
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">{f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}</label>
                      {f.type === 'text' && (
                        <Input value={formData[f.name] || ''} onChange={e => handleFieldChange(f.name, e.target.value)} className="h-9" />
                      )}
                      {f.type === 'number' && (
                        <Input type="number" value={formData[f.name] || ''} onChange={e => handleFieldChange(f.name, e.target.value)} className="h-9" />
                      )}
                      {f.type === 'select' && (
                        <select value={formData[f.name] || ''} disabled={enumsLoading} onChange={e => handleFieldChange(f.name, e.target.value)} className="h-9 rounded-md border-gray-300 text-sm focus:ring-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed">
                          <option value="">{enumsLoading ? 'Loading...' : 'Select...'}</option>
                          {(f.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      )}
                      {f.type === 'multiselect' && (
                        <select multiple value={formData[f.name] || []} onChange={e => {
                          const values = Array.from(e.target.selectedOptions).map(o => o.value);
                          handleFieldChange(f.name, values);
                        }} className="rounded-md border-gray-300 text-sm focus:ring-gray-200 min-h-[90px]">
                          {(f.options || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      )}
                      {f.type === 'textarea' && (
                        <textarea value={formData[f.name] || ''} onChange={e => handleFieldChange(f.name, e.target.value)} className="rounded-md border-gray-300 text-sm focus:ring-gray-200 min-h-[90px] resize-y" />
                      )}
                      {formErrors[f.name] && <span className="text-xs text-red-500">{formErrors[f.name]}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={closeAddModal} disabled={submitting}>Cancel</Button>
              <Button size="sm" onClick={handleSubmitAdd} disabled={submitting} className="bg-gray-900 text-white hover:bg-gray-800">
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderOptions;