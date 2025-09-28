import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  Settings,
  Package,
  Ruler,
  FileText
} from 'lucide-react';
import { 
  mockPrintingServices, 
  mockPaperTypes, 
  mockSizes 
} from '../../mocks/mock';

const OrderOptions = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [editingItem, setEditingItem] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [termsConditions, setTermsConditions] = useState(
    'All orders must be paid in advance. Delivery time is 3-5 business days after payment confirmation. Cancellations are not allowed once production starts. Quality checks are performed before dispatch.'
  );
  const { toast } = useToast();

  const tabs = [
    { id: 'products', name: 'Product Types', icon: Package },
    { id: 'sizes', name: 'Sizes', icon: Ruler },
    { id: 'papers', name: 'Paper Types', icon: FileText },
    { id: 'terms', name: 'Terms & Conditions', icon: Settings }
  ];

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'products': return mockPrintingServices;
      case 'sizes': return mockSizes;
      case 'papers': return mockPaperTypes;
      default: return [];
    }
  };

  const getCurrentTitle = () => {
    switch (activeTab) {
      case 'products': return 'Product Types';
      case 'sizes': return 'Available Sizes';
      case 'papers': return 'Paper Types';
      case 'terms': return 'Terms & Conditions';
      default: return '';
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the new item",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Item Added",
      description: `${newItemName} has been added to ${getCurrentTitle()}`
    });
    setNewItemName('');
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItemName(item);
  };

  const handleSaveEdit = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a valid name",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Item Updated",
      description: `Item updated successfully`
    });
    setEditingItem(null);
    setNewItemName('');
  };

  const handleDeleteItem = (item) => {
    toast({
      title: "Item Deleted",
      description: `${item} has been removed`,
      variant: "destructive"
    });
  };

  const handleSaveTerms = () => {
    toast({
      title: "Terms Updated",
      description: "Terms & Conditions have been updated successfully"
    });
  };

  const renderItemsManager = () => {
    const items = getCurrentItems();
    
    return (
      <div className="space-y-6">
        {/* Add New Item */}
        <Card>
          <CardHeader>
            <CardTitle>Add New {getCurrentTitle().slice(0, -1)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder={`Enter new ${getCurrentTitle().toLowerCase().slice(0, -1)} name`}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Existing {getCurrentTitle()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  {editingItem === item ? (
                    <div className="flex gap-3 flex-1">
                      <Input
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingItem(null);
                          setNewItemName('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{item}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteItem(item)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTermsEditor = () => (
    <Card>
      <CardHeader>
        <CardTitle>Terms & Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="terms">Terms & Conditions Text</Label>
          <Textarea
            id="terms"
            value={termsConditions}
            onChange={(e) => setTermsConditions(e.target.value)}
            className="mt-1 min-h-32"
            placeholder="Enter your terms and conditions..."
          />
          <p className="text-xs text-gray-600 mt-2">
            This will be displayed to customers before they submit an order.
          </p>
        </div>
        <Button onClick={handleSaveTerms}>
          <Save className="h-4 w-4 mr-2" />
          Save Terms & Conditions
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Options</h1>
        <p className="text-gray-600 mt-1">Manage product types, sizes, papers, and order settings</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1">
          {tabs.map((tab) => {
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
      {activeTab === 'terms' ? renderTermsEditor() : renderItemsManager()}

      {/* Usage Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Product Management</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Add new product types for order forms</li>
                <li>• Edit existing product names</li>
                <li>• Remove discontinued products</li>
                <li>• Changes reflect immediately in order forms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Terms & Conditions</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Displayed to customers during checkout</li>
                <li>• Include payment and delivery policies</li>
                <li>• Update regularly as per business needs</li>
                <li>• Must be accepted before order submission</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderOptions;