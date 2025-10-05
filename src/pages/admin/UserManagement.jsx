import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Building2,
  CalendarClock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { apiUrl } from '@/lib/utils';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString(); } catch { return dateStr; }
};

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [allUsers, setAllUsers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [openAdd, setOpenAdd] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formRole, setFormRole] = useState('client');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    companyName: '',
    primaryContactNo: '',
    secondaryContactNo: '',
    email: '',
    state: '',
    district: '',
    city: '',
    postalCode: '',
    address: '',
    gstNo: '',
    dob: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();
  const roles = ['All', 'client', 'staff', 'admin'];

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredUsers = useMemo(() => allUsers.filter(user => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.username?.toLowerCase().includes(term) ||
      user.companyName?.toLowerCase().includes(term) ||
      user.primaryContactNo?.includes(term);

    const matchesRole = selectedRole === 'All' || user.userType === selectedRole;

    return matchesSearch && matchesRole;
  }), [allUsers, searchTerm, selectedRole]);

  const getRoleBadgeVariant = (role) => {
    const variants = {
      'admin': 'destructive',
      'staff': 'default',
      'client': 'secondary'
    };
    return variants[role] || 'secondary';
  };

  const getAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setAllUsers(response.data.data);
      } else {
        toast({
          title: 'Error',
          description: `Failed to fetch users. ${response.data.message}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users. Please try again.',
        variant: 'destructive',
      });
    } finally { setLoading(false); }
  }, [token, toast]);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '', username: '', password: '', companyName: '', primaryContactNo: '', secondaryContactNo: '', email: '', state: '', district: '', city: '', postalCode: '', address: '', gstNo: '', dob: ''
    });
    setFormRole('client');
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password || !formData.email || !formData.primaryContactNo) {
      toast({ title: 'Validation', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    try {
      setCreating(true);
      const payload = { ...formData };
      if (!payload.gstNo) delete payload.gstNo;
      if (!payload.companyName) delete payload.companyName;
      if (!payload.secondaryContactNo) delete payload.secondaryContactNo;
      if (!payload.dob) delete payload.dob; else payload.dob = new Date(payload.dob).toISOString();
      const res = await axios.post(`${apiUrl}/api/v1/user/${formRole}/create`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast({ title: 'Success', description: 'User created successfully' });
        setOpenAdd(false);
        resetForm();
        getAllUsers();
      } else {
        toast({ title: 'Error', description: res.data.message || 'Failed to create user', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all users, roles and onboarding details</p>
          </div>
          <Button className="bg-zinc-800 text-white" onClick={() => setOpenAdd(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, username, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {roles.map(role => (
                <Button
                  key={role}
                  variant={selectedRole === role ? 'default' : 'outline'}
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
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-start gap-4 py-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-3 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="w-28 space-y-2">
                    <div className="h-8 bg-gray-200 rounded" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map(user => (
                <div key={user._id || user.id} className="py-4 first:pt-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center ring-1 ring-white shadow-inner">
                        <UserIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base">{user.name}</h4>
                          <Badge variant={getRoleBadgeVariant(user.userType)} className="uppercase tracking-wide text-[10px]">{user.userType}</Badge>
                          {user.companyName && (
                            <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100">
                              <Building2 className="h-3 w-3 mr-1" /> {user.companyName}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center truncate"><Mail className="h-4 w-4 mr-1" />{user.email}</div>
                          <div className="flex items-center"><Phone className="h-4 w-4 mr-1" />{user.primaryContactNo}</div>
                          <div className="flex items-center"><CalendarClock className="h-4 w-4 mr-1" />Joined {formatDate(user.createdAt)}</div>
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() => toggleExpand(user._id || user.id)}
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {expanded[user._id || user.id] ? <><ChevronUp className="h-3 w-3" /> Hide Details</> : <><ChevronDown className="h-3 w-3" /> View Details</>}
                          </button>
                        </div>
                        {expanded[user._id || user.id] && (
                          <div className="mt-3 bg-gray-50 rounded-md p-3 text-xs md:text-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border border-gray-100">
                            <div>
                              <p className="text-gray-500">Username</p>
                              <p className="font-medium text-gray-800">{user.username}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">GST No</p>
                              <p className="font-medium text-gray-800">{user.gstNo || '—'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Secondary Contact</p>
                              <p className="font-medium text-gray-800">{user.secondaryContactNo || '—'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Date of Birth</p>
                              <p className="font-medium text-gray-800">{formatDate(user.dob)}</p>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1">
                              <p className="text-gray-500 flex items-center"><MapPin className="h-3.5 w-3.5 mr-1" />Location</p>
                              <p className="font-medium text-gray-800">{[user.city, user.district, user.state].filter(Boolean).join(', ')}</p>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-gray-500">Address</p>
                              <p className="font-medium text-gray-800 line-clamp-2">{user.address}</p>
                            </div>
                          </div>
                        )}
                      </div>
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
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{allUsers.length}</p>
            <p className="text-xs uppercase tracking-wide text-gray-500 mt-1">Total Users</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{allUsers.filter(u => u.userType === 'client').length}</p>
            <p className="text-xs uppercase tracking-wide text-gray-500 mt-1">Clients</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{allUsers.filter(u => u.userType === 'staff').length}</p>
            <p className="text-xs uppercase tracking-wide text-gray-500 mt-1">Staff</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-rose-600">{allUsers.filter(u => u.userType === 'admin').length}</p>
            <p className="text-xs uppercase tracking-wide text-gray-500 mt-1">Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Role</Label>
                <select
                  className="w-full border rounded-md h-10 px-3 text-sm bg-white"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                >
                  <option value="client">Client</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Username *</Label>
                <Input name="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input name="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Primary Contact *</Label>
                <Input name="primaryContactNo" value={formData.primaryContactNo} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Secondary Contact</Label>
                <Input name="secondaryContactNo" value={formData.secondaryContactNo} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input name="companyName" value={formData.companyName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>GST No</Label>
                <Input name="gstNo" value={formData.gstNo} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input name="dob" type="date" value={formData.dob} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input name="state" value={formData.state} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>District *</Label>
                <Input name="district" value={formData.district} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input name="city" value={formData.city} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Postal Code *</Label>
                <Input name="postalCode" value={formData.postalCode} onChange={handleChange} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address *</Label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md p-2 text-sm min-h-[70px]"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => { setOpenAdd(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create User'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;