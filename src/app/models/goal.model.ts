export interface GoldLiteGoal {
  id: number;
  goalName: string;
  metalType: 'gold' | 'silver';
  sipId: number;
  amount: number;
  imageUrl: string;
  ts: string;
  type: number;
}

export interface GoalTypeMaster {
  id: number;
  goalName: string;
  imageUrl: string;
  ts: string;
}

export interface GoldProduct {
  id: number;
  name: string;
  sku: string;
  productWeight: number;
  redeemWeight: number;
  metalType: 'gold' | 'silver';
  purity: number;
  jewelleryType: string;
  productSize: number;
  basePrice: number;
  description: string;
  status: 'active' | 'inactive';
  url: string;
  displayOrder: number | null;
  defaultImage: string | null;
  ts: string;
}

export interface GiftPeerToPeer {
  id: number;
  senderUID: number;
  receiverUID: number;
  senderUniqueId: string;
  receiverUniqueId: string;
  amount: number;
  giftTemplateId: number;
  isClaimed: number;
  paymentOrderId: string;
  txId: string;
  ts: string;
  giftMessage: string;
  receiverMobile: string | null;
  receiverName: string | null;
  metalType: 'gold' | 'silver';
  isWeb: number;
  isClaimedTs: string | null;
}

export interface RateAlert {
  rateId: number;
  metalType: 'GOLD' | 'SILVER';
  price: number;
  type: number;
  appNotification: number;
  emailNotification: number;
  augUserId: string;
  status: number;
  createDate: string;
}
