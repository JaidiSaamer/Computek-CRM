import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

const OrderSummary = ({ 
  formData, 
  files = [], 
  calculateEstimatedPrice,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Create Order',
  showNotes = true,
  className = ''
}) => {
  return (
    <Card className={`sticky top-6 ${className}`}>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.productType && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Product:</span>
              <span className="font-medium">{formData.productType}</span>
            </div>
            {formData.size && (
              <div className="flex justify-between">
                <span>Size:</span>
                <span>{formData.size}</span>
              </div>
            )}
            {formData.paperType && (
              <div className="flex justify-between">
                <span>Paper:</span>
                <span>{formData.paperType}</span>
              </div>
            )}
            {formData.quantity && (
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>{formData.quantity}</span>
              </div>
            )}
            {files.length > 0 && (
              <div className="flex justify-between">
                <span>Files:</span>
                <span>{files.length} uploaded</span>
              </div>
            )}
          </div>
        )}

        {formData.productType && formData.quantity && calculateEstimatedPrice && (
          <>
            <div className="border-t pt-4">
              <div className="flex justify-between font-medium">
                <span>Estimated Total:</span>
                <span>₹{calculateEstimatedPrice()}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                *Final price may vary based on specifications
              </p>
            </div>
          </>
        )}

        {onSubmit && (
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
            onClick={onSubmit}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Order...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        )}

        {showNotes && (
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Orders are processed within 24 hours</p>
            <p>• You will receive email confirmation</p>
            <p>• Payment required before production</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderSummary;