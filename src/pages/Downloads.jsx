import React, { useState } from 'react';
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
  Book,
  Image as ImageIcon
} from 'lucide-react';

const Downloads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Mock download data
  const downloadItems = [
    {
      id: 1,
      title: 'Business Card Templates',
      description: 'Standard business card templates in various designs',
      fileType: 'ZIP',
      fileSize: '2.5 MB',
      uploadedAt: '2024-01-15',
      category: 'Templates',
      icon: FileText
    },
    {
      id: 2,
      title: 'Brochure Design Guidelines',
      description: 'Complete guide for creating effective brochures',
      fileType: 'PDF',
      fileSize: '1.8 MB',
      uploadedAt: '2024-01-10',
      category: 'Guidelines',
      icon: Book
    },
    {
      id: 3,
      title: 'Logo Usage Guidelines',
      description: 'Brand guidelines and logo usage instructions',
      fileType: 'PDF',
      fileSize: '950 KB',
      uploadedAt: '2024-01-08',
      category: 'Guidelines',
      icon: ImageIcon
    },
    {
      id: 4,
      title: 'Order Form Template',
      description: 'Printable order form for offline submissions',
      fileType: 'PDF',
      fileSize: '340 KB',
      uploadedAt: '2024-01-05',
      category: 'Forms',
      icon: FileText
    },
    {
      id: 5,
      title: 'Print Specifications',
      description: 'Technical specifications for all print products',
      fileType: 'PDF',
      fileSize: '1.2 MB',
      uploadedAt: '2024-01-03',
      category: 'Specifications',
      icon: FileText
    }
  ];

  const categories = ['All', 'Templates', 'Guidelines', 'Forms', 'Specifications'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = downloadItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (item) => {
    toast({
      title: "Download Started",
      description: `${item.title} is being downloaded.`
    });
  };

  const handlePreview = (item) => {
    toast({
      title: "Opening Preview",
      description: `Opening preview for ${item.title}.`
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Downloads</h1>
        <p className="text-gray-600 mt-1">Access templates, guidelines, and resources</p>
      </div>

      {/* Search and Filters */}
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
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Downloads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
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
            const Icon = item.icon;
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <p className="text-xs text-gray-600 mt-1">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.fileType}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span>{item.fileSize}</span>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.uploadedAt}
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