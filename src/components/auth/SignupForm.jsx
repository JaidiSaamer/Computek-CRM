import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
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
    dob: '', // yyyy-mm-dd
    preferredCourier: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const required = ['name', 'username', 'password', 'confirmPassword', 'primaryContactNo', 'secondaryContactNo', 'email', 'state', 'district', 'city', 'postalCode', 'address'];
    for (const key of required) {
      if (!formData[key]?.toString().trim()) {
        toast({ title: 'Error', description: `Please fill in ${key}`, variant: 'destructive' });
        return false;
      }
    }

    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(formData.primaryContactNo) || !phoneRegex.test(formData.secondaryContactNo)) {
      toast({ title: 'Error', description: 'Contact numbers must be 10-15 digits', variant: 'destructive' });
      return false;
    }

    if (formData.postalCode.length < 3 || formData.postalCode.length > 12) {
      toast({ title: 'Error', description: 'Postal code should be 3-12 characters', variant: 'destructive' });
      return false;
    }

    if (formData.gstNo && !/^[0-9A-Z]{15}$/.test(formData.gstNo)) {
      toast({ title: 'Error', description: 'Invalid GST number', variant: 'destructive' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword: _CONFIRM, dob, ...rest } = formData;
      const payload = { ...rest };
      if (dob) payload.dob = dob; // backend will coerce date
      const result = await signup(payload);

      if (result.success) {
        toast({
          title: "Success",
          description: "Account created successfully! Please login."
        });
        navigate('/login');
      } else {
        toast({
          title: "Signup Failed",
          description: result.message || "Failed to create account",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An error occurred during signup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <img
            src="./src/assets/CP_logo.png"
            alt="Computek Printing"
            className="mx-auto h-16 w-auto object-contain mb-4"
          />
          <h2 className="text-3xl font-bold text-gray-900">Computek Printing</h2>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Complete the form below to get started.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Account Section */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">Account Information</h3>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} placeholder="John Doe" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input id="username" name="username" type="text" required value={formData.username} onChange={handleChange} placeholder="johndoe" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com" className="mt-1" />
                  </div>
                  <div className="hidden md:block" />
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative mt-1">
                      <Input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} placeholder="Min 8 characters" className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative mt-1">
                      <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" className="pr-10" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Section */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">Contact Details</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryContactNo">Primary Contact No *</Label>
                    <Input id="primaryContactNo" name="primaryContactNo" type="tel" required value={formData.primaryContactNo} onChange={handleChange} placeholder="10-15 digits" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="secondaryContactNo">Secondary Contact No *</Label>
                    <Input id="secondaryContactNo" name="secondaryContactNo" type="tel" required value={formData.secondaryContactNo} onChange={handleChange} placeholder="10-15 digits" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="preferredCourier">Preferred Courier (Optional)</Label>
                    <Input id="preferredCourier" name="preferredCourier" type="text" value={formData.preferredCourier} onChange={handleChange} placeholder="BlueDart, DTDC, FedEx, etc." className="mt-1" />
                  </div>
                  <div className="hidden md:block" />
                </div>
              </div>

              <Separator />

              {/* Organization Section */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">Organization (Optional)</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" name="companyName" type="text" value={formData.companyName} onChange={handleChange} placeholder="Your company name" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="gstNo">GST Number</Label>
                    <Input id="gstNo" name="gstNo" type="text" value={formData.gstNo} onChange={(e) => setFormData({ ...formData, gstNo: e.target.value.toUpperCase() })} placeholder="22AAAAA0000A1Z5" className="mt-1 uppercase" />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} className="mt-1" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Section */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">Address</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" name="state" type="text" required value={formData.state} onChange={handleChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="district">District *</Label>
                    <Input id="district" name="district" type="text" required value={formData.district} onChange={handleChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" type="text" required value={formData.city} onChange={handleChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input id="postalCode" name="postalCode" type="text" required value={formData.postalCode} onChange={handleChange} className="mt-1" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea id="address" name="address" required value={formData.address} onChange={handleChange} placeholder="House/Street, Area, Landmark" className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full bg-zinc-900 text-zinc-100 hover:bg-zinc-800 md:w-auto px-6" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-gray-900 font-medium hover:underline">Sign in here</Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupForm;
