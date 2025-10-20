import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { mockOrders, mockAnalytics } from '../mocks/mock';

const Dashboard = () => {
  const { user } = useAuth();

  // Get user-specific data
  const getUserOrders = () => {
    if (user?.userType === 'client') {
      return mockOrders.filter(order => order.clientId === user.id);
    }
    return mockOrders;
  };

  const userOrders = getUserOrders();
  const stats = mockAnalytics;

  // UI helpers for colorful, professional status chips
  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'In Production':
        return 'bg-blue-100 text-blue-800';
      case 'Quality Check':
        return 'bg-amber-100 text-amber-800';
      case 'Ready for Delivery':
        return 'bg-violet-100 text-violet-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-muted text-foreground/70';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderClientDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userOrders.length}</div>
            <p className="text-xs text-muted-foreground">Orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userOrders.filter(o => ['In Production', 'Quality Check', 'Ready for Delivery'].includes(o.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">Active orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <CheckCircle className="h-4 w-4 text-primary" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userOrders.filter(o => o.status === 'Completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Finished orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{userOrders.reduce((sum, order) => sum + order.netAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userOrders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-border bg-card rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">{order.jobName}</h4>
                  <p className="text-sm text-muted-foreground">Order: {order.orderNo}</p>
                  <p className="text-xs text-muted-foreground">Delivery: {order.deliveryDate}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                    {order.status}
                  </div>
                  <p className="text-sm font-medium mt-1 text-foreground">₹{order.netAmount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStaffAdminDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <AlertCircle className="h-4 w-4 text-primary" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{status}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-primary/70 h-2 rounded-full"
                        style={{ width: `${(count / stats.totalOrders) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold min-w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center space-x-3 p-2 border-l-4 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                  <Package className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{order.jobName}</p>
                    <p className="text-xs text-gray-500">{order.orderNo} • {order.clientName}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="page-subtitle">
          Welcome to your {user?.userType} dashboard at Computek{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Printing</span>
        </p>
      </div>

      {/* Dashboard Content Based on Role */}
      {user?.userType === 'client' ? renderClientDashboard() : renderStaffAdminDashboard()}
    </div>
  );
};

export default Dashboard;