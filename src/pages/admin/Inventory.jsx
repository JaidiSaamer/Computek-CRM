import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Package, 
  AlertTriangle,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { mockInventory, mockVendors } from '../../mocks/mock';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    currentStock: '',
    unit: '',
    reorderLevel: '',
    vendorId: ''
  });
  
  const { toast } = useToast();

  const categories = ['Paper', 'Plate', 'Lamination', 'Foiling', 'Die', 'Ink', 'Other'];
  const units = ['sheets', 'kg', 'pieces', 'meters', 'liters'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleAddInventoryItem = (e) => {
    e.preventDefault();
    const required = ['itemName', 'category', 'currentStock', 'unit', 'reorderLevel', 'vendorId'];
    const missing = required.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      toast({
        title: "Missing Fields",
        description: `Please fill in: ${missing.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Item Added",
      description: `${formData.itemName} has been added to inventory`
    });

    setFormData({
      itemName: '',
      category: '',
      currentStock: '',
      unit: '',
      reorderLevel: '',
      vendorId: ''
    });
    setShowAddForm(false);
  };

  const handleEditItem = (itemId) => {
    toast({
      title: "Edit Item",
      description: `Edit functionality for item ${itemId} would open here`
    });
  };

  const handleDeleteItem = (itemId) => {
    toast({
      title: "Item Deleted",
      description: `Inventory item has been deleted`,
      variant: "destructive"
    });
  };

  const getStockStatus = (currentStock, reorderLevel) => {
    if (currentStock <= reorderLevel) return 'low';
    if (currentStock <= reorderLevel * 1.5) return 'medium';
    return 'good';
  };

  const getStockStatusColor = (status) => {
    const colors = {
      'low': 'text-red-600 bg-red-50',
      'medium': 'text-yellow-600 bg-yellow-50',
      'good': 'text-green-600 bg-green-50'
    };
    return colors[status] || colors.good;
  };

  const renderInventoryTab = () => (
    <div className="space-y-6">
      {/* Add New Item */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Inventory Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddInventoryItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    placeholder="Enter item name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentStock">Current Stock *</Label>
                  <Input
                    id="currentStock"
                    name="currentStock"
                    type="number"
                    min="0"
                    value={formData.currentStock}
                    onChange={handleChange}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleSelectChange('unit', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reorderLevel">Reorder Level *</Label>
                  <Input
                    id="reorderLevel"
                    name="reorderLevel"
                    type="number"
                    min="0"
                    value={formData.reorderLevel}
                    onChange={handleChange}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Vendor *</Label>
                <Select value={formData.vendorId} onValueChange={(value) => handleSelectChange('vendorId', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVendors.map(vendor => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name} - {vendor.vendorType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3">
                <Button type="submit">Add Item</Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Inventory Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inventory Items</CardTitle>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInventory.map(item => {
              const status = getStockStatus(item.currentStock, item.reorderLevel);
              const vendor = mockVendors.find(v => v.id === item.vendorId);
              
              return (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-lg">{item.itemName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(status)}`}>
                          {status === 'low' && <AlertTriangle className="inline h-3 w-3 mr-1" />}
                          {status === 'low' ? 'Low Stock' : status === 'medium' ? 'Medium Stock' : 'Good Stock'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Category:</span> {item.category}
                        </div>
                        <div>
                          <span className="font-medium">Current Stock:</span> {item.currentStock} {item.unit}
                        </div>
                        <div>
                          <span className="font-medium">Reorder Level:</span> {item.reorderLevel} {item.unit}
                        </div>
                        <div>
                          <span className="font-medium">Vendor:</span> {vendor?.name || 'Unknown'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditItem(item.id)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVendorsTab = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vendors</CardTitle>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockVendors.map(vendor => (
            <div key={vendor.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-lg">{vendor.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Type:</span> {vendor.vendorType}
                    </div>
                    <div>
                      <span className="font-medium">Contact:</span> {vendor.contactPerson}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {vendor.phone}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">GST:</span> {vendor.gst}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Manage your inventory items and vendors</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1">
          {[
            { id: 'inventory', name: 'Inventory', icon: Package },
            { id: 'vendors', name: 'Vendors', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'inventory' ? renderInventoryTab() : renderVendorsTab()}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {mockInventory.length}
            </p>
            <p className="text-sm text-gray-600">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {mockInventory.filter(item => 
                getStockStatus(item.currentStock, item.reorderLevel) === 'low'
              ).length}
            </p>
            <p className="text-sm text-gray-600">Low Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {categories.length}
            </p>
            <p className="text-sm text-gray-600">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {mockVendors.length}
            </p>
            <p className="text-sm text-gray-600">Vendors</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Inventory;