export interface BuyTransaction {
  id: number;
  quantity: number;
  totalAmount: number;
  preTaxAmount: number;
  metalType: 'gold' | 'silver';
  rate: number;
  uniqueId: string;
  transactionId: string;
  userName: string;
  merchantTransactionId: string;
  mobileNumber: string;
  goldBalance: number;
  silverBalance: number;
  invoiceNumber: string;
  referenceType: string | null;
  referenceId: string | null;
  ts: string;
  filePath: string;
  paymentOrderId: string;
  isWeb: number;
  sipId: number | null;
  scheduleId: number | null;
  isClient: number;
  clientCommissionPercentage: number | null;
  clientCommissionValue: number | null;
  isGiftedUID: string | null;
}

export interface SellTransaction {
  id: number;
  merchantId: number;
  quantity: number;
  totalAmount: number;
  preTaxAmount: number;
  metalType: 'gold' | 'silver';
  rate: number;
  uniqueId: string;
  transactionId: string;
  userName: string;
  merchantTransactionId: string;
  mobileNumber: string;
  goldBalance: number;
  silverBalance: number;
  createdAt: string;
  updatedAt: string | null;
  isWeb: number;
  bankAccountId: number;
  sellPaymentDone: string | null;
  paymentSlip: string | null;
  isClient: number;
  clientCommissionPercentage: number | null;
  clientCommissionValue: number | null;
  sipId: number | null;
  scheduleId: number | null;
  buyId: number | null;
}

export interface OrderAug {
  id: number;
  uniqueId: string;
  orderId: string;
  merchantTransactionId: string;
  shippingCharges: number;
  goldBalance: number;
  silverBalance: number;
  orderStatus: 'Generated' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  updatedAt: string | null;
  paymentOrderId: string;
  quantity: number | null;
  rate: number;
  productType: string | null;
  productDescription: string | null;
  metalType: 'gold' | 'silver';
  isWeb: number;
  isClient: number;
  clientCommissionPercentage: number | null;
  clientCommissionValue: number | null;
}

export interface GoldPayment {
  id: number;
  orderId: string;
  txId: string | null;
  paymentStatus: 'captured' | 'pending' | 'failed';
  paymentStatusTs: string;
  goldBuyStatus: string | null;
  goldBuyManually: string | null;
  goldBuyManuallyTxId: string | null;
  goldBuyManuallyTs: string | null;
  isNotifiedCount: number | null;
}

export interface CurrentRate {
  id: number;
  jsonOutput: string;
  ts: string;
  parsedRates?: {
    gBuy: string;
    gSell: string;
    sBuy: string;
    sSell: string;
    gBuyGst: string;
    sBuyGst: string;
  };
}
