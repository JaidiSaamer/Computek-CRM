import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User,
  Mail,
  Phone,
  MoreVertical
} from 'lucide-react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const { toast } = useToast();

  // Mock users data
  const mockUsers = [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'client',
      whatsapp: '+91 9876543210',
      courierService: 'BlueDart',
      status: 'Active',
      ordersCount: 15,
      joinedDate: '2024-01-15'
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@staff.com',
      role: 'staff',
      whatsapp: '+91 9876543211',
      courierService: 'DTDC',
      status: 'Active',
      ordersCount: 0,
      joinedDate: '2024-01-10'
    },
    {
      id: 'user3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'client',
      whatsapp: '+91 9876543212',
      courierService: 'FedEx',
      status: 'Inactive',
      ordersCount: 8,
      joinedDate: '2024-01-05'
    }
  ];

  const roles = ['All', 'client', 'staff', 'admin'];
  
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role) => {
    const variants = {
      'admin': 'destructive',
      'staff': 'default',
      'client': 'secondary'
    };
    return variants[role] || 'secondary';
  };

  const getStatusBadgeVariant = (status) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  const handleCreateUser = () => {
    toast({
      title: "Create User",
      description: "Create user functionality would open a modal or form here."
    });
  };

  const handleEditUser = (userId) => {
    toast({
      title: "Edit User",
      description: `Edit user ${userId} functionality would open a modal here.`
    });
  };

  const handleDeleteUser = (userId) => {
    toast({
      title: "Delete User",
      description: `User ${userId} would be deleted after confirmation.`,
      variant: "destructive"
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all system users and their permissions</p>
          </div>
          <Button onClick={handleCreateUser}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
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
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {roles.map(role => (
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                >
                  {role === 'All' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">No users match your search criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map(user => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{user.name}</h4>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(user.status)}>
                            {user.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {user.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {user.whatsapp}
                          </div>
                          <div>
                            Courier: {user.courierService}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Joined: {user.joinedDate}</span>
                          {user.role === 'client' && (
                            <span>Orders: {user.ordersCount}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user.id)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {mockUsers.length}
            </p>
            <p className="text-sm text-gray-600">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {mockUsers.filter(u => u.role === 'client').length}
            </p>
            <p className="text-sm text-gray-600">Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {mockUsers.filter(u => u.role === 'staff').length}
            </p>
            <p className="text-sm text-gray-600">Staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {mockUsers.filter(u => u.status === 'Active').length}
            </p>
            <p className="text-sm text-gray-600">Active Users</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;