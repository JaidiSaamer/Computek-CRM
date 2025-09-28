import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { mockAnalytics, mockOrders } from '../../mocks/mock';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState('2024');

  const stats = mockAnalytics;

  // Calculate some additional metrics
  const avgOrderValue = stats.totalRevenue / stats.totalOrders;
  const completionRate = (stats.completedOrders / stats.totalOrders) * 100;

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const years = [
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' }
  ];

  // Mock monthly data for charts
  const monthlyData = [
    { month: 'Jan', orders: 12, revenue: 35000 },
    { month: 'Feb', orders: 15, revenue: 42000 },
    { month: 'Mar', orders: 18, revenue: 48000 },
    { month: 'Apr', orders: 14, revenue: 38000 },
    { month: 'May', orders: 20, revenue: 55000 },
    { month: 'Jun', orders: 16, revenue: 44000 },
    { month: 'Jul', orders: 22, revenue: 62000 },
    { month: 'Aug', orders: 19, revenue: 52000 },
    { month: 'Sep', orders: 24, revenue: 65000 },
    { month: 'Oct', orders: 0, revenue: 0 },
    { month: 'Nov', orders: 0, revenue: 0 },
    { month: 'Dec', orders: 0, revenue: 0 }
  ];

  const currentMonth = monthlyData[8]; // September
  const previousMonth = monthlyData[7]; // August

  const orderGrowth = previousMonth.orders ? 
    ((currentMonth.orders - previousMonth.orders) / previousMonth.orders * 100).toFixed(1) : 0;
  const revenueGrowth = previousMonth.revenue ? 
    ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1) : 0;

  const StatCard = ({ title, value, icon: Icon, change, changeType, subtitle }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex flex-col items-end">
            <Icon className="h-6 w-6 text-gray-400" />
            {change && (
              <div className={`flex items-center mt-2 text-xs font-medium ${
                changeType === 'positive' ? 'text-green-600' : 
                changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {changeType === 'positive' ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : changeType === 'negative' ? (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                ) : null}
                {change}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your business performance and insights</p>
          </div>
          <div className="flex space-x-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map(period => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={`+${revenueGrowth}%`}
          changeType="positive"
          subtitle="All time earnings"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={Package}
          change={`+${orderGrowth}%`}
          changeType="positive"
          subtitle="Orders processed"
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${Math.round(avgOrderValue).toLocaleString()}`}
          icon={TrendingUp}
          change="+12.5%"
          changeType="positive"
          subtitle="Per order average"
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate.toFixed(1)}%`}
          icon={BarChart3}
          change="+2.3%"
          changeType="positive"
          subtitle="Successfully completed"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                const percentage = (count / stats.totalOrders) * 100;
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{status}</span>
                      <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">This Month Orders</p>
                  <p className="text-xl font-bold text-blue-600">{currentMonth.orders}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">This Month Revenue</p>
                  <p className="text-xl font-bold text-green-600">₹{currentMonth.revenue.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Recent Months Comparison</h4>
                {monthlyData.slice(6, 9).reverse().map((month) => (
                  <div key={month.month} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{month.month}</span>
                    <div className="flex space-x-4">
                      <span className="text-gray-600">{month.orders} orders</span>
                      <span className="font-medium">₹{month.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{order.jobName}</p>
                    <p className="text-gray-600">{order.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.netAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Product Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Business Cards', count: 45, percentage: 30 },
                { name: 'Brochures', count: 32, percentage: 21 },
                { name: 'Banners', count: 28, percentage: 19 },
                { name: 'Leaflets', count: 24, percentage: 16 },
                { name: 'Others', count: 21, percentage: 14 }
              ].map(product => (
                <div key={product.name} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{product.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-900 h-2 rounded-full"
                        style={{ width: `${product.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-6">{product.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Performance Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Customer Retention</span>
                <span className="font-medium">85.2%</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Avg Processing Time</span>
                <span className="font-medium">3.2 days</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Customer Satisfaction</span>
                <span className="font-medium">4.7/5.0</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Return Rate</span>
                <span className="font-medium">2.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Clients</span>
                <span className="font-medium">127</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;