'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Avatar,
  Divider,
  Tabs,
  Tab
} from '@nextui-org/react';
import {
  AlertTriangle,
  CreditCard,
  Eye,
  Download,
  Upload,
  Link,
  Youtube,
  FileVideo,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Lock,
  Play
} from 'lucide-react';

interface AdminModalsProps {
  // Order modals
  isViewOrderOpen: boolean;
  onViewOrderClose: () => void;
  isRefundOrderOpen: boolean;
  onRefundOrderClose: () => void;
  isRetryPaymentOpen: boolean;
  onRetryPaymentClose: () => void;
  
  // Selected data
  selectedOrder: any;
  refundForm: any;
  setRefundForm: (form: any) => void;
  
  // Handlers
  handleDownloadReceipt: (orderId: string) => void;
  handleProcessRefund: () => void;
  handleRetryPaymentProcess: () => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
}

export default function AdminModals({
  isViewOrderOpen,
  onViewOrderClose,
  isRefundOrderOpen,
  onRefundOrderClose,
  isRetryPaymentOpen,
  onRetryPaymentClose,
  selectedOrder,
  refundForm,
  setRefundForm,
  handleDownloadReceipt,
  handleProcessRefund,
  handleRetryPaymentProcess,
  formatCurrency,
  getStatusColor
}: AdminModalsProps) {
  return (
    <>
      {/* Order View Modal */}
      <Modal isOpen={isViewOrderOpen} onClose={onViewOrderClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold">Order Details</h2>
          </ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Order ID</label>
                    <p className="font-semibold">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <Chip color={getStatusColor(selectedOrder.status)} size="sm">
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Chip>
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Avatar name={selectedOrder.customer.name} size="sm" />
                    <div>
                      <p className="font-medium">{selectedOrder.customer.name}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customer.email}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Items</label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{selectedOrder.item.name}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.item.count} {selectedOrder.item.type}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount</label>
                    <p className="font-semibold text-lg">{formatCurrency(selectedOrder.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Method</label>
                    <p className="font-medium">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Order Date</label>
                  <p className="font-medium">{selectedOrder.date.toLocaleDateString()} at {selectedOrder.date.toLocaleTimeString()}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                  <p className="font-mono text-sm">{selectedOrder.transactionId}</p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onViewOrderClose}>
              Close
            </Button>
            <Button color="primary" onPress={() => handleDownloadReceipt(selectedOrder?.id || '')}>
              Download Receipt
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Refund Order Modal */}
      <Modal isOpen={isRefundOrderOpen} onClose={onRefundOrderClose} size="lg">
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold">Process Refund</h2>
          </ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">Order: {selectedOrder.id}</p>
                  <p className="text-sm text-gray-600">Customer: {selectedOrder.customer.name}</p>
                  <p className="text-sm text-gray-600">Original Amount: {formatCurrency(selectedOrder.amount)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Refund Type</label>
                  <Select 
                    value={refundForm.refundType}
                    onChange={(e) => setRefundForm((prev: any) => ({ ...prev, refundType: e.target.value }))}
                  >
                    <SelectItem key="full">Full Refund</SelectItem>
                    <SelectItem key="partial">Partial Refund</SelectItem>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Refund Amount</label>
                  <Input
                    type="number"
                    value={refundForm.amount}
                    onChange={(e) => setRefundForm((prev: any) => ({ ...prev, amount: e.target.value }))}
                    startContent="$"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Reason for Refund</label>
                  <Select 
                    value={refundForm.reason}
                    onChange={(e) => setRefundForm((prev: any) => ({ ...prev, reason: e.target.value }))}
                  >
                    <SelectItem key="customer-request">Customer Request</SelectItem>
                    <SelectItem key="technical-issue">Technical Issue</SelectItem>
                    <SelectItem key="billing-error">Billing Error</SelectItem>
                    <SelectItem key="duplicate-charge">Duplicate Charge</SelectItem>
                    <SelectItem key="other">Other</SelectItem>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Additional Notes</label>
                  <Textarea
                    value={refundForm.notes}
                    onChange={(e) => setRefundForm((prev: any) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter any additional notes about this refund..."
                  />
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onRefundOrderClose}>
              Cancel
            </Button>
            <Button color="warning" onPress={handleProcessRefund}>
              Process Refund
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Retry Payment Modal */}
      <Modal isOpen={isRetryPaymentOpen} onClose={onRetryPaymentClose} size="lg">
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold">Retry Payment</h2>
          </ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <p className="font-medium text-red-800">Payment Failed</p>
                  </div>
                  <p className="text-sm text-red-600 mt-1">This order's payment failed and needs to be retried.</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">Order: {selectedOrder.id}</p>
                  <p className="text-sm text-gray-600">Customer: {selectedOrder.customer.name}</p>
                  <p className="text-sm text-gray-600">Amount: {formatCurrency(selectedOrder.amount)}</p>
                  <p className="text-sm text-gray-600">Payment Method: {selectedOrder.paymentMethod}</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <p className="font-medium text-blue-800">Retry Payment</p>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    This will attempt to charge the customer's payment method again. 
                    Make sure the customer has been notified and has resolved any payment issues.
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onRetryPaymentClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleRetryPaymentProcess}>
              Retry Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}