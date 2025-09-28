import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import { Copy, QrCode, CreditCard, Smartphone } from 'lucide-react';
import { mockPaymentQR } from '../../mocks/mock';

const PaymentOnline = () => {
  const { toast } = useToast();
  const paymentInfo = mockPaymentQR;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Online Payment</h1>
        <p className="text-gray-600 mt-1">Make instant payments using UPI or bank transfer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              Scan & Pay
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <img 
                src={paymentInfo.qrCodeUrl}
                alt="Payment QR Code" 
                className="w-64 h-64 border-2 border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{paymentInfo.bankDetails.accountName}</h3>
              <p className="text-gray-600 text-sm">Scan with any UPI app to pay</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-2">UPI ID:</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{paymentInfo.bankDetails.upiId}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => copyToClipboard(paymentInfo.bankDetails.upiId, 'UPI ID')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Transfer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Bank Transfer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Account Holder Name</Label>
              <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 rounded">
                <span className="font-medium">{paymentInfo.bankDetails.accountName}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => copyToClipboard(paymentInfo.bankDetails.accountName, 'Account Name')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">Account Number</Label>
              <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 rounded">
                <span className="font-mono">{paymentInfo.bankDetails.accountNumber}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => copyToClipboard(paymentInfo.bankDetails.accountNumber, 'Account Number')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">IFSC Code</Label>
              <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 rounded">
                <span className="font-mono">{paymentInfo.bankDetails.ifsc}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => copyToClipboard(paymentInfo.bankDetails.ifsc, 'IFSC Code')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">Bank Name</Label>
              <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 rounded">
                <span className="font-medium">{paymentInfo.bankDetails.bankName}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => copyToClipboard(paymentInfo.bankDetails.bankName, 'Bank Name')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
              <div className="flex">
                <Smartphone className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Payment Instructions</h4>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1">
                    <li>• Add your order number in payment remarks</li>
                    <li>• Save payment receipt for verification</li>
                    <li>• Submit payment proof via "Make Payment" section</li>
                    <li>• Payment verification takes 24 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular UPI Apps */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Popular UPI Apps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Google Pay', logo: '📱' },
              { name: 'PhonePe', logo: '💜' },
              { name: 'Paytm', logo: '💰' },
              { name: 'BHIM', logo: '🏛️' },
              { name: 'Amazon Pay', logo: '🛒' },
              { name: 'PayU', logo: '💳' }
            ].map((app) => (
              <div key={app.name} className="text-center p-3 border rounded-lg hover:bg-gray-50">
                <div className="text-2xl mb-2">{app.logo}</div>
                <p className="text-xs font-medium">{app.name}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 text-center mt-4">
            Scan the QR code with any of these apps to make instant payment
          </p>
        </CardContent>
      </Card>

      {/* Payment Security */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Secure Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 text-xl">🔒</span>
              </div>
              <h4 className="font-medium">Bank Grade Security</h4>
              <p className="text-gray-600">Your payments are processed securely</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 text-xl">⚡</span>
              </div>
              <h4 className="font-medium">Instant Processing</h4>
              <p className="text-gray-600">Payments are verified quickly</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 text-xl">📞</span>
              </div>
              <h4 className="font-medium">24/7 Support</h4>
              <p className="text-gray-600">Help available round the clock</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Label = ({ className, children, ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
    {children}
  </label>
);

export default PaymentOnline;