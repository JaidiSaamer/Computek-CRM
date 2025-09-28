import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { 
  Eye, 
  Download, 
  Search, 
  Filter, 
  Plus,
  Calendar,
  MapPin,
  Package,
  X
} from 'lucide-react';
import { mockOrders, mockOrderStatuses } from '../../mocks/mock';

const OrderList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Get user-specific orders
  const getUserOrders = () => {
    if (user?.role === 'client') {
      return mockOrders.filter(order => order.clientId === user.id);
    }
    return mockOrders;
  };

  const userOrders = getUserOrders();

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return userOrders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [userOrders, searchTerm, statusFilter]);

  const getStatusBadgeVariant = (status) => {
    const variants = {
      'Order Placed': 'secondary',
      'In Production': 'default',
      'Quality Check': 'outline',
      'Ready for Delivery': 'secondary',
      'Completed': 'default',
      'Cancelled': 'destructive'
    };
    return variants[status] || 'secondary';
  };

  const handleCancelOrder = (orderId) => {
    toast({
      title: "Order Cancelled",
      description: `Order ${orderId} has been cancelled successfully.`
    });
  };

  const handleDownloadInvoice = (orderNo) => {
    toast({
      title: "Download Started",
      description: `Invoice for order ${orderNo} is being downloaded.`
    });
  };

  const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Order Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold mb-3">Order Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Order No:</span>
                  <p className="font-medium">{order.orderNo}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Job Name:</span>
                  <p className="font-medium">{order.jobName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Order Date:</span>
                  <p>{order.orderDate}</p>
                </div>
                <div>
                  <span className="text-gray-600">Delivery Date:</span>
                  <p>{order.deliveryDate}</p>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <p className="font-medium">₹{order.netAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h3 className="font-semibold mb-3">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Product Type:</span>
                  <p>{order.productType}</p>
                </div>
                <div>
                  <span className="text-gray-600">Size:</span>
                  <p>{order.size}</p>
                </div>
                <div>
                  <span className="text-gray-600">Paper Type:</span>
                  <p>{order.paperType}</p>
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span>
                  <p>{order.quantity}</p>
                </div>
              </div>
            </div>

            {/* Files */}
            <div>
              <h3 className="font-semibold mb-3">Design Files</h3>
              <div className="space-y-2">
                {order.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div>
              <h3 className="font-semibold mb-3">Delivery Information</h3>
              <div className="text-sm">
                <div className="mb-2">
                  <span className="text-gray-600">Address:</span>
                  <p>{order.address}</p>
                </div>
                <div>
                  <span className="text-gray-600">Courier Service:</span>
                  <p>{order.courierService}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button onClick={() => handleDownloadInvoice(order.orderNo)}>
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
              {(order.status === 'Order Placed' || order.status === 'In Production') && (
                <Button 
                  variant="destructive"
                  onClick={() => handleCancelOrder(order.orderNo)}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'client' ? 'My Orders' : 'All Orders'}
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {user?.role === 'client' && (
            <Link to="/orders/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders by job name, order number, or client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  {mockOrderStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">
                {user?.role === 'client' 
                  ? "You haven't placed any orders yet." 
                  : "No orders match your current filters."}
              </p>
              {user?.role === 'client' && (
                <Link to="/orders/create">
                  <Button>Create Your First Order</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map(order => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.jobName}</h3>
                        <p className="text-sm text-gray-600">Order: {order.orderNo}</p>
                        {user?.role !== 'client' && (
                          <p className="text-sm text-gray-600">Client: {order.clientName}</p>
                        )}
                      </div>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Package className="h-4 w-4 mr-2" />
                        {order.productType}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Due: {order.deliveryDate}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {order.courierService}
                      </div>
                      <div className="font-medium">
                        ₹{order.netAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadInvoice(order.orderNo)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Invoice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

export default OrderList;