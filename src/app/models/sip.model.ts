export interface GoldSIP {
  id: number;
  safeGoldUserId: string | null;
  sipName: string;
  sipAmount: number;
  sipFrequency: 'Daily' | 'Weekly' | 'Monthly';
  startDate: string;
  endDate: string;
  duration: number;
  ts: string;
  txnId: string | null;
  status: number;
  paymentMode: string;
  isClient: number | null;
  augUniqueId: string;
  metalType: 'gold' | 'silver';
}

export interface SIPPaymentSchedule {
  id: number;
  sipId: number;
  scheduleDate: string;
  notifyDate: string;
  amount: number;
  active: number;
  paymentStatus: 'Success' | 'Failed' | 'Pending' | null;
  paymentId: string | null;
  ts: string;
  installmentNumber: number;
  paymentCapturedTs: string | null;
  goldBuyStatus: string | null;
  goldBuyStatusTs: string | null;
}

export interface CashfreeOrderSIP {
  id: number;
  safeGoldUserId: string | null;
  sipId: number;
  subscriptionId: string;
  status: number;
  createTs: string;
  isNewKey: number;
  augUniqueId: string;
}

export interface SIPInitiateRecurring {
  id: number;
  sipId: number;
  scheduleId: number;
  subscriptionId: string;
  initiatedTs: string;
  isMandateActive: number;
  mandateStatusDesc: string | null;
  isMandateStatusChecked: number;
  isRecurringPayCreated: number;
  paymentId: string;
  paymentStatus: string | null;
  cfPaymentId: number;
}

export interface SIPBuyTracking {
  id: number;
  sipId: number;
  scheduleId: number;
  initiatedTs: string;
  isBuyPriceApiHit: number;
  isBuyVerifyHit: number;
  isBuyConfirmed: number;
  buyAmount: number;
  buyGram: number;
  transactionId: string;
  emailSend: number;
}
