import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import {
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react';
import { apiUrl } from "@/lib/utils";
// Removed mockTickets in favor of live API calls

const Support = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', search: '' });
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'low'
  });

  const { user, token } = useAuth();
  const { toast } = useToast();

  const fetchTickets = async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${apiUrl}/api/v1/support`, { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data?.data || [];
      // If client, filter tickets raised by user
      const filtered = user?.role === 'client' ? data.filter(t => t.raisedBy === user._id || t.raisedBy?._id === user._id) : data;
      setTickets(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      console.log(e)
      setError('Failed to load support tickets');
      toast({ title: 'Error', description: 'Failed to fetch support tickets', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (token) fetchTickets(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role]);

  const normalizedTickets = useMemo(() => {
    return tickets.map(t => ({
      id: t._id,
      subject: t.subject,
      description: t.description,
      status: t.status,
      priority: t.priority,
      raisedBy: t.raisedBy?._id || t.raisedBy,
      raisedByName: t.raisedBy?.name || t.raisedBy?.email || '—',
      assignedTo: t.assignedTo?.name || null,
      createdAt: t.createdAt
    }));
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return normalizedTickets.filter(t => {
      if (filters.status !== 'all' && t.status !== filters.status) return false;
      if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
      if (filters.search && !(`${t.subject} ${t.description}`.toLowerCase().includes(filters.search.toLowerCase()))) return false;
      return true;
    });
  }, [normalizedTickets, filters]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill in subject and description",
        variant: "destructive"
      });
      return;
    }
    setCreating(true);
    try {
      const res = await axios.post(`${apiUrl}/api/v1/support`, formData, { headers: { Authorization: `Bearer ${token}` } });
      const newTicket = res.data?.data;
      toast({ title: 'Ticket Created', description: 'Support ticket submitted.' });
      setTickets(prev => [newTicket, ...prev]);
      setFormData({ subject: '', description: '', priority: 'low' });
      setShowCreateForm(false);
    } catch {
      toast({ title: 'Create Failed', description: 'Unable to create ticket', variant: 'destructive' });
    } finally { setCreating(false); }
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: 'destructive',
      in_progress: 'default',
      resolved: 'secondary',
      closed: 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    return variants[priority] || 'secondary';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
            <p className="text-gray-600 mt-1">Get help with your orders and account</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Create Ticket Form */}
          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief subject of your issue"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - General question</SelectItem>
                        <SelectItem value="medium">Medium - Order related</SelectItem>
                        <SelectItem value="high">High - Urgent issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Detailed Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Please describe your issue in detail..."
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Submit Ticket'}</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tickets List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-end">
                <div className="flex flex-col w-full md:w-1/3">
                  <Label htmlFor="search" className="text-xs font-semibold tracking-wide">Search</Label>
                  <Input id="search" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} placeholder="Search subject or description" />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="flex flex-col">
                    <Label className="text-xs font-semibold tracking-wide">Status</Label>
                    <Select value={filters.status} onValueChange={v => setFilters(f => ({ ...f, status: v }))}>
                      <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs font-semibold tracking-wide">Priority</Label>
                    <Select value={filters.priority} onValueChange={v => setFilters(f => ({ ...f, priority: v }))}>
                      <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" onClick={fetchTickets} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
                </div>
              </div>
              {loading ? (
                <div className="py-8 text-center text-sm text-gray-600">Loading tickets...</div>
              ) : error ? (
                <div className="py-8 text-center text-sm text-red-500">{error}</div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
                  <p className="text-gray-600 mb-4">You haven't created any support tickets yet.</p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    Create Your First Ticket
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTickets.map(ticket => (
                    <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-lg">{ticket.subject}</h4>
                          <p className="text-sm text-gray-600">ID: {ticket.id}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant={getPriorityBadge(ticket.priority)} className="capitalize">{ticket.priority}</Badge>
                          <Badge variant={getStatusBadge(ticket.status)} className="capitalize">{ticket.status.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3 line-clamp-3">{ticket.description}</p>
                      <div className="flex items-center flex-wrap gap-3 justify-between text-xs text-gray-600">
                        <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                        {user?.role !== 'client' && (
                          <span>Raised By: {ticket.raisedByName}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-gray-600">+91 98765 43210</p>
                  <p className="text-xs text-gray-500">Mon-Sat: 9 AM - 7 PM</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-gray-600">support@computek.com</p>
                  <p className="text-xs text-gray-500">Response within 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <h4 className="font-medium mb-1">How to track my order?</h4>
                <p className="text-gray-600">Go to "My Orders" section to see current status</p>
              </div>

              <div className="text-sm">
                <h4 className="font-medium mb-1">Payment not reflecting?</h4>
                <p className="text-gray-600">Payments take 24 hours to verify</p>
              </div>

              <div className="text-sm">
                <h4 className="font-medium mb-1">Can I modify my order?</h4>
                <p className="text-gray-600">Contact support before production starts</p>
              </div>

              <div className="text-sm">
                <h4 className="font-medium mb-1">Delivery time?</h4>
                <p className="text-gray-600">Usually 3-5 business days after payment</p>
              </div>
            </CardContent>
          </Card>

          {/* Status Icons */}
          <Card>
            <CardHeader>
              <CardTitle>Status Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Open - Awaiting response</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <span>In Progress - Being worked on</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Resolved - Issue fixed</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;