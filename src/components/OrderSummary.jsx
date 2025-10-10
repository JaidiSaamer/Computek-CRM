// src/components/OrderSummary.jsx
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
        {formData.productType ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Product:</span>
              <span className="font-medium text-right">{formData.productType}</span>
            </div>
            {formData.size && (
              <div className="flex justify-between">
                <span className="text-gray-600">Size:</span>
                <span className="text-right">{formData.size}</span>
              </div>
            )}
            {formData.paperType && (
              <div className="flex justify-between">
                <span className="text-gray-600">Paper:</span>
                <span className="text-right">{formData.paperType}</span>
              </div>
            )}
            {formData.printingSide && (
              <div className="flex justify-between">
                <span className="text-gray-600">Printing:</span>
                <span className="text-right">{formData.printingSide} Sided</span>
              </div>
            )}
            {formData.quantity && (
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{formData.quantity}</span>
              </div>
            )}
            {files.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Files:</span>
                <span className="text-green-600">{files.length} uploaded</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            <p>Fill in the order details</p>
            <p className="text-xs mt-1">to see summary</p>
          </div>
        )}

        {formData.productType && formData.quantity && calculateEstimatedPrice && (
          <>
            <div className="border-t pt-4">
              <div className="flex justify-between items-start">
                <span className="text-gray-700 font-medium">Estimated Total:</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">
                    ₹{calculateEstimatedPrice()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                *Final price may vary based on specifications and actual production costs
              </p>
            </div>
          </>
        )}

        {onSubmit && (
          <Button 
            type="submit" 
            className="w-full bg-zinc-800 hover:bg-zinc-900"
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
          <div className="text-xs text-gray-600 space-y-1 border-t pt-4">
            <p className="flex items-start">
              <span className="mr-1.5">•</span>
              <span>Orders are processed within 24 hours</span>
            </p>
            <p className="flex items-start">
              <span className="mr-1.5">•</span>
              <span>You will receive email confirmation</span>
            </p>
            <p className="flex items-start">
              <span className="mr-1.5">•</span>
              <span>Payment required before production</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderSummary;