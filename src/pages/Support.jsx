import React, { useState } from 'react';
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
import { mockTickets } from '../mocks/mock';

const Support = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Filter tickets for current user if client
  const getUserTickets = () => {
    if (user?.role === 'client') {
      return mockTickets.filter(ticket => ticket.clientId === user.id);
    }
    return mockTickets;
  };

  const userTickets = getUserTickets();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill in title and description",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Ticket Created",
      description: "Your support ticket has been submitted successfully."
    });

    setFormData({ title: '', description: '', priority: 'Medium' });
    setShowCreateForm(false);
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Open': 'destructive',
      'In Progress': 'default',
      'Resolved': 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      'High': 'destructive',
      'Medium': 'default',
      'Low': 'secondary'
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
                    <Label htmlFor="title">Issue Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Brief description of your issue"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Priority Level</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low - General question</SelectItem>
                        <SelectItem value="Medium">Medium - Order related</SelectItem>
                        <SelectItem value="High">High - Urgent issue</SelectItem>
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
                    <Button type="submit">Submit Ticket</Button>
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
              {userTickets.length === 0 ? (
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
                  {userTickets.map(ticket => (
                    <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-lg">{ticket.title}</h4>
                          <p className="text-sm text-gray-600">Ticket ID: {ticket.id}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant={getPriorityBadge(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant={getStatusBadge(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{ticket.description}</p>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        {user?.role !== 'client' && (
                          <span>Client: {ticket.clientName}</span>
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