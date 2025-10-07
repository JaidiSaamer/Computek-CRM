import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import {
  Download,
  FileText,
  Search,
  Calendar,
  Eye,
  Folder,
  Loader2
} from 'lucide-react';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { apiUrl } from "@/lib/utils"

const Downloads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { toast } = useToast();
  const { user, token } = useAuth();

  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf', 'application/zip'];

  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/v1/downloads`, { headers: { Authorization: `Bearer ${token}` } });
      setDownloads(res.data?.data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch downloads', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (token) fetchDownloads(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredItems = useMemo(() => {
    return downloads.filter(d => !searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase()) || (d.description || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [downloads, searchTerm]);

  const onSelectFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_MIME.includes(f.type)) {
      toast({ title: 'Invalid File', description: 'Unsupported file type', variant: 'destructive' });
      return;
    }
    setFile(f);
  };

  const uploadFile = async () => {
    if (!file) {
      toast({ title: 'No File', description: 'Please select a file first', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await axios.post(`${apiUrl}/api/v1/downloads/upload`, form, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      const url = res.data?.data?.fileUrl;
      setFileUrl(url);
      toast({ title: 'Uploaded', description: 'File uploaded successfully' });
    } catch {
      toast({ title: 'Upload Failed', description: 'Unable to upload file', variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const createDownload = async () => {
    if (!fileUrl || !formData.name) {
      toast({ title: 'Missing Fields', description: 'Name and uploaded file required', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const payload = { name: formData.name, description: formData.description, fileUrl };
      const res = await axios.post(`${apiUrl}/api/v1/downloads`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setDownloads(prev => [res.data?.data, ...prev]);
      toast({ title: 'Created', description: 'Download added' });
      setShowCreate(false);
      setFormData({ name: '', description: '' });
      setFile(null); setFileUrl('');
    } catch {
      toast({ title: 'Create Failed', description: 'Unable to create download entry', variant: 'destructive' });
    } finally { setCreating(false); }
  };

  const handleDownload = (item) => {
    if (!item.fileUrl) return;
    window.open(item.fileUrl, '_blank');
  };

  const handlePreview = (item) => {
    if (!item.fileUrl) return;
    window.open(item.fileUrl, '_blank');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Downloads</h1>
        <p className="text-gray-600 mt-1">Access templates, guidelines, and resources</p>
        {user?.role !== 'client' && (
          <Button className="mt-4" size="sm" onClick={() => setShowCreate(v => !v)}>
            {showCreate ? 'Close' : 'Add Download'}
          </Button>
        )}
      </div>

      {/* Create Section */}
      {showCreate && user?.role !== 'client' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Download</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide">Name *</label>
                <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="File display name" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide">Description</label>
                <Textarea rows={3} value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="Short description" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide">Select File *</label>
                <Input type="file" accept={ALLOWED_MIME.join(',')} onChange={onSelectFile} />
                {file && <p className="text-[11px] text-gray-600">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={uploadFile} disabled={uploading || !file || !!fileUrl}>
                    {uploading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    {uploading ? 'Uploading' : fileUrl ? 'Uploaded' : 'Upload'}
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={createDownload} disabled={creating || !fileUrl}>
                    {creating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Create
                  </Button>
                </div>
                {fileUrl && <p className="text-[11px] text-green-600 truncate">Uploaded ✓</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search downloads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={fetchDownloads} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Downloads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-sm text-gray-600">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No downloads found</h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "No downloads match your search criteria."
                    : "No downloads available in this category."}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredItems.map(item => {
            return (
              <Card key={item._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        <p className="text-xs text-gray-600 mt-1">File</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {(item.fileUrl || '').split('.').pop()?.toUpperCase() || ''}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(item)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">How to use templates</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Download the template files</li>
                <li>• Edit using Adobe Illustrator or Photoshop</li>
                <li>• Follow the included guidelines</li>
                <li>• Save as print-ready PDF format</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">File format support</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• PDF - Print-ready documents</li>
                <li>• AI/PSD - Editable design files</li>
                <li>• ZIP - Multiple files package</li>
                <li>• JPEG/PNG - Image previews</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Downloads;