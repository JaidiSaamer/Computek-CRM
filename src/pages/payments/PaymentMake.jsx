import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Upload, FileText, X } from 'lucide-react';
import { mockOrders } from '../../mocks/mock';

const PaymentMake = () => {
  const [formData, setFormData] = useState({
    orderId: '',
    paymentMethod: '',
    amount: '',
    transactionId: '',
    notes: ''
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Get user's orders that can be paid
  const getUserOrders = () => {
    if (user?.role === 'client') {
      return mockOrders.filter(order => 
        order.clientId === user.id && 
        ['Order Placed', 'In Production'].includes(order.status)
      );
    }
    return mockOrders.filter(order => ['Order Placed', 'In Production'].includes(order.status));
  };

  const payableOrders = getUserOrders();
  const selectedOrder = payableOrders.find(order => order.id === formData.orderId);

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
    
    // Auto-fill amount when order is selected
    if (field === 'orderId') {
      const order = payableOrders.find(o => o.id === value);
      if (order) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          amount: order.netAmount.toString()
        }));
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Receipt file must be smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      setReceiptFile({
        file,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file)
      });
    }
  };

  const removeReceiptFile = () => {
    if (receiptFile?.url) {
      URL.revokeObjectURL(receiptFile.url);
    }
    setReceiptFile(null);
  };

  const validateForm = () => {
    const required = ['orderId', 'paymentMethod', 'amount', 'transactionId'];
    const missing = required.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      toast({
        title: "Missing Fields",
        description: `Please fill in: ${missing.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }

    if (formData.paymentMethod === 'bank_transfer' && !receiptFile) {
      toast({
        title: "Receipt Required",
        description: "Please upload payment receipt for bank transfer",
        variant: "destructive"
      });
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Submitted",
        description: `Payment of ₹${formData.amount} for order ${selectedOrder?.orderNo} has been submitted for verification.`
      });

      // Reset form
      setFormData({
        orderId: '',
        paymentMethod: '',
        amount: '',
        transactionId: '',
        notes: ''
      });
      setReceiptFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Make Payment</h1>
        <p className="text-gray-600 mt-1">Submit payment for your orders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Select Order *</Label>
                  <Select value={formData.orderId} onValueChange={(value) => handleSelectChange('orderId', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose order to pay for" />
                    </SelectTrigger>
                    <SelectContent>
                      {payableOrders.map(order => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.orderNo} - {order.jobName} (₹{order.netAmount.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Payment Method *</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => handleSelectChange('paymentMethod', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI Payment</SelectItem>
                      <SelectItem value="cash">Cash Payment</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="Enter payment amount"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="transactionId">Transaction ID *</Label>
                    <Input
                      id="transactionId"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleChange}
                      placeholder="Enter transaction/reference ID"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional information about the payment..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Receipt Upload */}
                {formData.paymentMethod === 'bank_transfer' && (
                  <div>
                    <Label>Payment Receipt *</Label>
                    <div className="mt-1 space-y-3">
                      {!receiptFile ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <div className="mt-2">
                            <Label htmlFor="receipt-upload" className="cursor-pointer">
                              <span className="text-sm font-medium text-gray-900">
                                Upload receipt
                              </span>
                              <span className="block text-xs text-gray-600">
                                PNG, JPG, PDF up to 5MB
                              </span>
                            </Label>
                            <Input
                              id="receipt-upload"
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">{receiptFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeReceiptFile}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || payableOrders.length === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Payment...
                    </>
                  ) : (
                    'Submit Payment'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedOrder ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Order Details</p>
                    <p className="text-xs text-gray-600">{selectedOrder.orderNo}</p>
                    <p className="text-sm">{selectedOrder.jobName}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Product:</span>
                      <span>{selectedOrder.productType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span>{selectedOrder.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium">{selectedOrder.status}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between font-medium">
                      <span>Total Amount:</span>
                      <span>₹{selectedOrder.netAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 text-sm">Select an order to view details</p>
                </div>
              )}

              {payableOrders.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-600 text-sm">No orders available for payment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Tips */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Payment Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2">
              <p>• Payments are verified within 24 hours</p>
              <p>• Keep your transaction receipt safe</p>
              <p>• Contact support for payment issues</p>
              <p>• Production starts after payment confirmation</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentMake;