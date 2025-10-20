import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { User as UserIcon, Phone, Mail, MapPin, Edit2, Save, X, Building2, Shield, CalendarIcon, Hash } from 'lucide-react';
import axios from 'axios';
import { apiUrl } from '@/lib/utils';

const fieldGroups = [
  {
    title: 'Personal Information',
    description: 'Basic identity details',
    fields: [
      { name: 'name', label: 'Full Name', required: true },
      { name: 'username', label: 'Username', required: true, disabled: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date' },
    ]
  },
  {
    title: 'Contact Details',
    description: 'Phone numbers',
    fields: [
      { name: 'primaryContactNo', label: 'Primary Contact No', required: true },
      { name: 'secondaryContactNo', label: 'Secondary Contact No' },
    ]
  },
  {
    title: 'Company & Tax',
    description: 'Business information',
    fields: [
      { name: 'companyName', label: 'Company Name' },
      { name: 'gstNo', label: 'GST Number' },
    ]
  },
  {
    title: 'Address',
    description: 'Location details',
    fields: [
      { name: 'address', label: 'Street Address', required: true },
      { name: 'city', label: 'City', required: true },
      { name: 'district', label: 'District', required: true },
      { name: 'state', label: 'State', required: true },
      { name: 'postalCode', label: 'Postal Code', required: true },
    ]
  }
];

const Profile = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchMe = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/api/v1/user/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        const data = res.data.data || {};
        const normalized = {
          name: data.name || '',
          username: data.username || '',
          email: data.email || '',
          userType: data.userType || '',
          companyName: data.companyName || '',
          primaryContactNo: data.primaryContactNo || '',
          secondaryContactNo: data.secondaryContactNo || '',
          state: data.state || '',
          district: data.district || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          address: data.address || '',
          gstNo: data.gstNo || '',
          dob: data.dob ? new Date(data.dob).toISOString().substring(0, 10) : ''
        };
        setUserData(data);
        setFormData(normalized);
      } else {
        throw new Error(res.data.message || 'Failed to load profile');
      }
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to fetch profile', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [token, toast]);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleCancel = () => {
    setFormData(userData || {});
    setIsEditing(false);
  };

  const validate = () => {
    const requiredFields = ['name', 'username', 'email', 'primaryContactNo', 'state', 'district', 'city', 'postalCode', 'address'];
    for (const f of requiredFields) {
      if (!formData[f] || String(formData[f]).trim() === '') {
        toast({ title: 'Validation', description: `${f.replace(/([A-Z])/g, ' $1')} is required`, variant: 'destructive' });
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setUpdating(true);
      // Prepare payload only with editable fields
      const payload = {};
      const original = userData || {};
      fieldGroups.forEach(g => g.fields.forEach(f => {
        if (!f.disabled) {
          const val = formData[f.name] || '';
          if (val !== (original[f.name] || '')) payload[f.name] = val;
        }
      }));
      ['companyName', 'gstNo', 'primaryContactNo', 'secondaryContactNo', 'address', 'city', 'district', 'state', 'postalCode', 'dob'].forEach(k => {
        if (formData[k] !== undefined) {
          const val = formData[k] || '';
          if (val !== (original[k] || '')) payload[k] = val;
        }
      });
      if (Object.keys(payload).length === 0) {
        toast({ title: 'No Changes', description: 'There are no changes to save.' });
        setIsEditing(false); return;
      }
      const res = await axios.put(`${apiUrl}/api/v1/user/me`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast({ title: 'Profile Updated', description: 'Changes saved successfully.' });
        setUserData(prev => ({ ...(prev || {}), ...payload }));
        setIsEditing(false);
      } else throw new Error(res.data.message);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Update failed', variant: 'destructive' });
    } finally { setUpdating(false); }
  };

  const formatDate = (d) => { if (!d) return '—'; try { return new Date(d).toLocaleDateString(); } catch { return d; } };

  const Skeleton = ({ lines = 3 }) => (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded" />)}
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 text-sm">View and manage your account information</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)} disabled={loading}>
              <Edit2 className="h-4 w-4 mr-2" />Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={updating}>
                <X className="h-4 w-4 mr-2" />Cancel
              </Button>
              <Button onClick={handleSave} disabled={updating}>
                {updating ? <Save className="h-4 w-4 mr-2 animate-pulse" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {fieldGroups.map(group => (
            <Card key={group.title} className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  {group.title === 'Personal Information' && <UserIcon className="h-4 w-4" />}
                  {group.title === 'Company & Tax' && <Building2 className="h-4 w-4" />}
                  {group.title === 'Contact Details' && <Phone className="h-4 w-4" />}
                  {group.title === 'Address' && <MapPin className="h-4 w-4" />}
                  {group.title}
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">{group.description}</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton lines={group.fields.length + 1} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.fields.map(f => (
                      <div key={f.name} className="space-y-1.5">
                        <Label htmlFor={f.name} className="text-xs font-medium tracking-wide">{f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}</Label>
                        <Input
                          id={f.name}
                          name={f.name}
                          type={f.type || 'text'}
                          value={formData[f.name] || ''}
                          onChange={handleChange}
                          disabled={!isEditing || f.disabled}
                          className="h-9"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><Shield className="h-4 w-4" />Account Overview</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              {loading ? <Skeleton lines={6} /> : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-1 ring-white">
                      <UserIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 leading-tight">{formData.name || '—'}</p>
                      <p className="text-xs uppercase tracking-wide text-gray-500">{formData.userType || '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600"><Mail className="h-4 w-4 mr-2" />{formData.email || '—'}</div>
                    <div className="flex items-center text-gray-600"><Phone className="h-4 w-4 mr-2" />{formData.primaryContactNo || '—'}</div>
                    <div className="flex items-center text-gray-600"><Hash className="h-4 w-4 mr-2" />{formData.username || '—'}</div>
                  </div>
                  <div className="pt-3 border-t space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" />Joined: {formatDate(userData?.createdAt)}</p>
                    <p className="text-xs text-gray-500">GST: {formData.gstNo || '—'}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;