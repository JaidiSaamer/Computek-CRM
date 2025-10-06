// Mock data for Computek Printing CRM System

export const mockUsers = {
  client1: {
    id: 'client1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'client',
    whatsapp: '+91 9876543210',
    courierService: 'BlueDart',
    printingPress: 'Computek Printing'
  },
  staff1: {
    id: 'staff1',
    name: 'Jane Smith',
    email: 'jane@staff.com',
    role: 'staff',
    whatsapp: '+91 9876543211',
    courierService: 'DTDC'
  },
  admin1: {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@computek.com',
    role: 'admin',
    whatsapp: '+91 9876543212',
    courierService: 'FedEx'
  }
};

export const mockOrders = [
  {
    id: 'ORD001',
    orderNo: 'CP-2024-001',
    jobName: 'Business Cards - Tech Corp',
    clientId: 'client1',
    clientName: 'John Doe',
    status: 'Order Placed', // Changed from 'In Production' to 'Order Placed'
    productType: 'Business Cards',
    size: '3.5" x 2"',
    paperType: 'Premium Matt',
    quantity: 1000,
    netAmount: 2500,
    deliveryDate: '2024-01-15',
    orderDate: '2024-01-10',
    files: [
      { key: 'design1.pdf', name: 'Business Card Design.pdf', url: '#' }
    ],
    courierService: 'BlueDart',
    address: '123 Tech Street, Mumbai, 400001'
  },
  {
    id: 'ORD002',
    orderNo: 'CP-2024-002',
    jobName: 'Brochure - Marketing Material',
    clientId: 'client1',
    clientName: 'John Doe',
    status: 'In Production', // Changed from 'Quality Check' to 'In Production'
    productType: 'Brochure',
    size: 'A4',
    paperType: 'Art Paper',
    quantity: 500,
    netAmount: 4500,
    deliveryDate: '2024-01-20',
    orderDate: '2024-01-12',
    files: [
      { key: 'brochure1.pdf', name: 'Brochure Design.pdf', url: '#' }
    ],
    courierService: 'DTDC',
    address: '456 Business Ave, Delhi, 110001'
  },
  {
    id: 'ORD003',
    orderNo: 'CP-2024-003',
    jobName: 'Flyers - Grand Opening',
    clientId: 'client1',
    clientName: 'John Doe',
    status: 'Quality Check', // This one won't show in payment page (as expected)
    productType: 'Flyers',
    size: 'A5',
    paperType: 'Glossy Paper',
    quantity: 2000,
    netAmount: 3200,
    deliveryDate: '2024-01-25',
    orderDate: '2024-01-14',
    files: [
      { key: 'flyer1.pdf', name: 'Flyer Design.pdf', url: '#' }
    ],
    courierService: 'BlueDart',
    address: '123 Tech Street, Mumbai, 400001'
  }
];

export const mockPrintingServices = [
  'Business Cards',
  'Brochures',
  'Banners',
  'Leaflets',
  'Handbills',
  'Pamphlets',
  'Letter Heads',
  'Invitation Cards',
  'Envelopes',
  'Books',
  'Posters',
  'Flyers'
];

export const mockPaperTypes = [
  'Premium Matt',
  'Art Paper',
  'Glossy Paper',
  'Recycled Paper',
  'Cardstock',
  'Photo Paper',
  'Kraft Paper'
];

export const mockSizes = [
  '3.5" x 2"',
  'A4',
  'A3',
  'A5',
  'Letter Size',
  '4" x 6"',
  '8.5" x 11"',
  'Custom'
];

export const mockOrderStatuses = [
  'Order Placed',
  'In Production', 
  'Quality Check',
  'Ready for Delivery',
  'Completed',
  'Cancelled'
];

export const mockPaymentQR = {
  qrCodeUrl: 'https://via.placeholder.com/300x300?text=Payment+QR+Code',
  bankDetails: {
    accountName: 'Computek Printing',
    accountNumber: '1234567890',
    ifsc: 'ICIC0001234',
    bankName: 'ICICI Bank',
    upiId: 'computek@paytm'
  }
};

export const mockAnalytics = {
  totalOrders: 150,
  completedOrders: 120,
  pendingOrders: 25,
  cancelledOrders: 5,
  totalRevenue: 450000,
  monthlyRevenue: 65000,
  ordersByStatus: {
    'Order Placed': 8,
    'In Production': 12,
    'Quality Check': 3,
    'Ready for Delivery': 2,
    'Completed': 120,
    'Cancelled': 5
  }
};

export const mockInventory = [
  {
    id: 'inv1',
    itemName: 'Premium Matt Paper',
    category: 'Paper',
    currentStock: 5000,
    unit: 'sheets',
    reorderLevel: 1000,
    vendorId: 'vendor1'
  },
  {
    id: 'inv2', 
    itemName: 'Art Paper',
    category: 'Paper',
    currentStock: 3000,
    unit: 'sheets',
    reorderLevel: 800,
    vendorId: 'vendor1'
  }
];

export const mockVendors = [
  {
    id: 'vendor1',
    name: 'Paper Supplies Co.',
    vendorType: 'Paper',
    contactPerson: 'Raj Kumar',
    phone: '+91 9876543213',
    gst: '27AAAAA0000A1Z5'
  },
  {
    id: 'vendor2',
    name: 'Printing Plates Ltd',
    vendorType: 'Plate',
    contactPerson: 'Sita Devi',
    phone: '+91 9876543214',
    gst: '27BBBBB0000B1Z5'
  }
];

export const mockTickets = [
  {
    id: 'TIC001',
    title: 'Order Delivery Delayed',
    description: 'My order CP-2024-001 delivery is delayed. Need update.',
    clientId: 'client1',
    clientName: 'John Doe',
    status: 'Open',
    priority: 'High',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  }
];

// Authentication mock functions
export const mockLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = Object.values(mockUsers).find(u => u.email === email);
      if (user && password === 'password123') {
        resolve({
          success: true,
          user,
          token: 'mock-jwt-token-' + user.role
        });
      } else {
        reject({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }, 1000);
  });
};

export const mockSignup = (userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser = {
        id: 'user_' + Date.now(),
        ...userData
      };
      resolve({
        success: true,
        user: newUser,
        token: 'mock-jwt-token-' + newUser.role
      });
    }, 1000);
  });
};

export const mockCreateOrder = (orderData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newOrder = {
        id: 'ORD' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
        orderNo: 'CP-2024-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
        ...orderData,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Order Placed'
      };
      mockOrders.unshift(newOrder);
      resolve({
        success: true,
        order: newOrder
      });
    }, 1000);
  });
};