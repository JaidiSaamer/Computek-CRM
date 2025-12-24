import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Upload, X, FileText } from 'lucide-react';
import {
  mockPrintingServices,
  mockPaperTypes,
  mockSizes,
  mockCreateOrder
} from '../../mocks/mock';

const CreateOrder = () => {
  const [formData, setFormData] = useState({
    jobName: '',
    productType: '',
    size: '',
    paperType: '',
    quantity: '',
    description: '',
    deliveryDate: '',
    address: '',
    courierService: ''
  });
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const newFiles = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      file: file,
      url: URL.createObjectURL(file)
    }));
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (fileId) => {
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove?.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    setFiles(files.filter(f => f.id !== fileId));
  };

  

  const calculateEstimatedPrice = () => {
    const quantity = parseInt(formData.quantity) || 0;
    const basePrice = {
      'Business Cards': 2.5,
      'Brochures': 8,
      'Banners': 15,
      'Leaflets': 3,
      'Handbills': 2,
      'Pamphlets': 4,
      'Letter Heads': 5,
      'Invitation Cards': 6,
      'Envelopes': 3,
      'Books': 25,
      'Posters': 12,
      'Flyers': 3
    };

    const price = (basePrice[formData.productType] || 5) * quantity;
    return price.toLocaleString();
  };

  const validateForm = () => {
    const required = ['jobName', 'productType', 'size', 'paperType', 'quantity', 'deliveryDate', 'address'];
    const missing = required.filter(field => !formData[field]);

    if (missing.length > 0) {
      toast({
        title: "Missing Fields",
        description: `Please fill in: ${missing.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }

    if (files.length === 0) {
      toast({
        title: "Files Required",
        description: "Please upload at least one design file",
        variant: "destructive"
      });
      return false;
    }

    const deliveryDate = new Date(formData.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deliveryDate <= today) {
      toast({
        title: "Invalid Date",
        description: "Delivery date must be in the future",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const orderData = {
        ...formData,
        clientId: user.id,
        clientName: user.name,
        files: files.map(f => ({ key: f.name, name: f.name, url: f.url })),
        netAmount: parseInt(calculateEstimatedPrice().replace(/,/g, ''))
      };

      const result = await mockCreateOrder(orderData);

      if (result.success) {
        toast({
          title: "Order Created",
          description: `Order ${result.order.orderNo} has been successfully created!`
        });
        navigate('/orders');
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="app-container">
      <div className="mb-6">
        <h1 className="page-title">Create New Order</h1>
        <p className="page-subtitle">Fill in the details to place your printing order</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jobName">Job Name *</Label>
                  <Input
                    id="jobName"
                    name="jobName"
                    value={formData.jobName}
                    onChange={handleChange}
                    placeholder="e.g., Business Cards - Tech Corp"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Product Type *</Label>
                    <Select value={formData.productType} onValueChange={(value) => handleSelectChange('productType', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPrintingServices.map(service => (
                          <SelectItem key={service} value={service}>{service}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Size *</Label>
                    <Select value={formData.size} onValueChange={(value) => handleSelectChange('size', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSizes.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Paper Type *</Label>
                    <Select value={formData.paperType} onValueChange={(value) => handleSelectChange('paperType', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select paper type" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPaperTypes.map(paper => (
                          <SelectItem key={paper} value={paper}>{paper}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="Enter quantity"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="deliveryDate">Required Delivery Date *</Label>
                  <Input
                    id="deliveryDate"
                    name="deliveryDate"
                    type="date"
                    min={getTomorrowDate()}
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Additional Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Any special instructions or requirements..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Design Files *</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload design files
                        </span>
                        <span className="text-sm text-gray-600">
                          PDF, PNG, JPG up to 10MB each
                        </span>
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Uploaded Files:</h4>
                      {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Details */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete delivery address with pincode"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="courierService">Preferred Courier Service</Label>
                  <Input
                    id="courierService"
                    name="courierService"
                    value={formData.courierService}
                    onChange={handleChange}
                    placeholder="e.g., BlueDart, DTDC, FedEx"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.productType && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Product:</span>
                      <span className="font-medium">{formData.productType}</span>
                    </div>
                    {formData.size && (
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{formData.size}</span>
                      </div>
                    )}
                    {formData.paperType && (
                      <div className="flex justify-between">
                        <span>Paper:</span>
                        <span>{formData.paperType}</span>
                      </div>
                    )}
                    {formData.quantity && (
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span>{formData.quantity}</span>
                      </div>
                    )}
                    {files.length > 0 && (
                      <div className="flex justify-between">
                        <span>Files:</span>
                        <span>{files.length} uploaded</span>
                      </div>
                    )}
                  </div>
                )}

                {formData.productType && formData.quantity && (
                  <>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-medium">
                        <span>Estimated Total:</span>
                        <span>₹{calculateEstimatedPrice()}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        *Final price may vary based on specifications
                      </p>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    'Create Order'
                  )}
                </Button>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Orders are processed within 24 hours</p>
                  <p>• You will receive email confirmation</p>
                  <p>• Payment required before production</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;