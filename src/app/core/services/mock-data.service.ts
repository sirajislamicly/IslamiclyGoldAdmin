import { Injectable } from '@angular/core';
import { AugUser, UserNominee, CustomerBankAccount } from '../../models/user.model';
import { BuyTransaction, SellTransaction, OrderAug } from '../../models/transaction.model';
import { GoldSIP, SIPPaymentSchedule } from '../../models/sip.model';
import { GoldLiteGoal, GoalTypeMaster, GoldProduct, GiftPeerToPeer, RateAlert } from '../../models/goal.model';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  private randomDate(start: Date, end: Date): string {
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return d.toISOString();
  }

  private randomPhone(): string {
    return '9' + Math.floor(100000000 + Math.random() * 900000000).toString();
  }

  private randomUniqueId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private firstNames = ['Swaroop', 'Jagdish', 'Mohd', 'Sandeep', 'Ayesha', 'Fatima', 'Omar', 'Yusuf', 'Zainab', 'Ali',
    'Priya', 'Rahul', 'Neha', 'Vikram', 'Pooja', 'Arjun', 'Sakina', 'Irfan', 'Deepak', 'Meera',
    'Ravi', 'Sunita', 'Amir', 'Kavita', 'Rajesh', 'Noor', 'Sanjay', 'Amina', 'Kiran', 'Tariq',
    'Anita', 'Farhan', 'Shreya', 'Imran', 'Divya', 'Hassan', 'Rekha', 'Bilal', 'Swati', 'Zaheer'];

  private lastNames = ['Kumar', 'Prasad', 'Khan', 'Singh', 'Dhoot', 'Noor', 'Ali', 'Sharma', 'Patel', 'Gupta',
    'Siddiq', 'Rashid', 'Verma', 'Joshi', 'Reddy', 'Iyer', 'Shah', 'Malik', 'Das', 'Rao',
    'Bhat', 'Mishra', 'Chauhan', 'Nair', 'Pillai', 'Saxena', 'Bansal', 'Thakur', 'Chopra', 'Kapoor'];

  private states = ['Gujarat', 'Maharashtra', 'Karnataka', 'Bihar', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh',
    'Rajasthan', 'Kerala', 'Telangana', 'West Bengal', 'Madhya Pradesh'];

  private cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'Jaipur', 'Lucknow', 'Nawada', 'Surat', 'Kochi', 'Indore', 'Bhopal'];

  private goalNames = ['Marriage', 'Hajj', 'Education', 'Emergency Fund', 'Retirement', 'Home', 'Business', 'Travel'];

  getUsers(count = 200): AugUser[] {
    return Array.from({ length: count }, (_, i) => {
      const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
      const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
      const uniqueId = this.randomUniqueId() + (1767000000 + i);
      const kycStatuses: AugUser['kycStatus'][] = ['approved', 'pending', 'rejected'];
      return {
        id: i + 1,
        uid: 163000 + i,
        userName: `${firstName} ${lastName}`,
        uniqueId,
        customerMappedId: 'IC' + uniqueId,
        mobileNumber: this.randomPhone(),
        dateOfBirth: `${1970 + Math.floor(Math.random() * 35)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        userEmail: `${firstName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`,
        userAddress: null,
        userStateId: null,
        userCityId: null,
        userPincode: String(100000 + Math.floor(Math.random() * 899999)),
        nomineeName: Math.random() > 0.6 ? this.firstNames[Math.floor(Math.random() * this.firstNames.length)] : null,
        nomineeRelation: Math.random() > 0.6 ? ['Father', 'Mother', 'Spouse', 'Child'][Math.floor(Math.random() * 4)] : null,
        nomineeDateOfBirth: null,
        kycStatus: kycStatuses[Math.floor(Math.random() * (i < 150 ? 1.5 : 3))],
        userState: this.states[Math.floor(Math.random() * this.states.length)],
        userCity: this.cities[Math.floor(Math.random() * this.cities.length)],
        createdAt: this.randomDate(new Date('2025-01-01'), new Date('2026-04-10')),
        ts: this.randomDate(new Date('2025-01-01'), new Date('2026-04-10')),
        panNumber: Math.random() > 0.3 ? `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}P${String.fromCharCode(76 + Math.floor(Math.random() * 10))}${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}` : null
      };
    });
  }

  getBuyTransactions(count = 500): BuyTransaction[] {
    const users = this.getUsers(50);
    return Array.from({ length: count }, (_, i) => {
      const user = users[Math.floor(Math.random() * users.length)];
      const metalType: 'gold' | 'silver' = Math.random() > 0.4 ? 'gold' : 'silver';
      const rate = metalType === 'gold' ? 14500 + Math.random() * 2000 : 230 + Math.random() * 30;
      const quantity = metalType === 'gold' ? +(Math.random() * 10).toFixed(4) : +(Math.random() * 50).toFixed(4);
      const preTax = +(quantity * rate).toFixed(2);
      const total = +(preTax * 1.03).toFixed(2);
      return {
        id: 800 + i,
        quantity,
        totalAmount: total,
        preTaxAmount: preTax,
        metalType,
        rate: +rate.toFixed(2),
        uniqueId: user.uniqueId,
        transactionId: `IC${Date.now()}${Math.floor(Math.random() * 1000000)}`,
        userName: user.userName,
        merchantTransactionId: this.randomUniqueId(),
        mobileNumber: user.mobileNumber,
        goldBalance: +(Math.random() * 20).toFixed(4),
        silverBalance: +(Math.random() * 100).toFixed(4),
        invoiceNumber: `SIC${String(Math.floor(Math.random() * 999999999)).padStart(9, '0')}`,
        referenceType: null,
        referenceId: null,
        ts: this.randomDate(new Date('2025-06-01'), new Date('2026-04-10')),
        filePath: `SIC${String(Math.floor(Math.random() * 999999999)).padStart(9, '0')}.pdf`,
        paymentOrderId: `ord_${Date.now()}${Math.floor(Math.random() * 1000)}`,
        isWeb: Math.random() > 0.8 ? 1 : 0,
        sipId: Math.random() > 0.7 ? Math.floor(Math.random() * 100) : null,
        scheduleId: null,
        isClient: 0,
        clientCommissionPercentage: null,
        clientCommissionValue: null,
        isGiftedUID: null
      };
    });
  }

  getSellTransactions(count = 200): SellTransaction[] {
    const users = this.getUsers(50);
    return Array.from({ length: count }, (_, i) => {
      const user = users[Math.floor(Math.random() * users.length)];
      const metalType: 'gold' | 'silver' = Math.random() > 0.4 ? 'gold' : 'silver';
      const rate = metalType === 'gold' ? 14500 + Math.random() * 2000 : 230 + Math.random() * 30;
      const quantity = metalType === 'gold' ? +(Math.random() * 5).toFixed(4) : +(Math.random() * 30).toFixed(4);
      const total = +(quantity * rate).toFixed(2);
      return {
        id: 100 + i,
        merchantId: 0,
        quantity,
        totalAmount: total,
        preTaxAmount: total,
        metalType,
        rate: +rate.toFixed(2),
        uniqueId: user.uniqueId,
        transactionId: `IC${Date.now()}${Math.floor(Math.random() * 1000000)}`,
        userName: user.userName,
        merchantTransactionId: this.randomUniqueId(),
        mobileNumber: user.mobileNumber,
        goldBalance: +(Math.random() * 20).toFixed(4),
        silverBalance: +(Math.random() * 100).toFixed(4),
        createdAt: this.randomDate(new Date('2025-06-01'), new Date('2026-04-10')),
        updatedAt: null,
        isWeb: 0,
        bankAccountId: 100 + Math.floor(Math.random() * 100),
        sellPaymentDone: null,
        paymentSlip: null,
        isClient: 0,
        clientCommissionPercentage: null,
        clientCommissionValue: null,
        sipId: null,
        scheduleId: null,
        buyId: null
      };
    });
  }

  getOrders(count = 100): OrderAug[] {
    const users = this.getUsers(30);
    const statuses: OrderAug['orderStatus'][] = ['Generated', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    return Array.from({ length: count }, (_, i) => {
      const user = users[Math.floor(Math.random() * users.length)];
      return {
        id: 100 + i,
        uniqueId: user.uniqueId,
        orderId: `OD${Math.floor(Math.random() * 99999)}${Date.now()}`,
        merchantTransactionId: this.randomUniqueId(),
        shippingCharges: [0, 100, 200, 300][Math.floor(Math.random() * 4)],
        goldBalance: +(Math.random() * 20).toFixed(4),
        silverBalance: +(Math.random() * 100).toFixed(4),
        orderStatus: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: this.randomDate(new Date('2025-06-01'), new Date('2026-04-10')),
        updatedAt: null,
        paymentOrderId: `order_${this.randomUniqueId()}`,
        quantity: null,
        rate: 14500 + Math.random() * 2000,
        productType: null,
        productDescription: null,
        metalType: Math.random() > 0.4 ? 'gold' : 'silver',
        isWeb: 0,
        isClient: 0,
        clientCommissionPercentage: null,
        clientCommissionValue: null
      };
    });
  }

  getSIPs(count = 150): GoldSIP[] {
    const frequencies: GoldSIP['sipFrequency'][] = ['Daily', 'Weekly', 'Monthly'];
    return Array.from({ length: count }, (_, i) => {
      const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
      const startDate = this.randomDate(new Date('2025-06-01'), new Date('2026-04-10'));
      const endDate = new Date(new Date(startDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
      return {
        id: 800 + i,
        safeGoldUserId: null,
        sipName: this.goalNames[Math.floor(Math.random() * this.goalNames.length)],
        sipAmount: [100, 200, 481, 500, 1000, 2000, 2500, 5000][Math.floor(Math.random() * 8)],
        sipFrequency: freq,
        startDate,
        endDate,
        duration: freq === 'Daily' ? 365 : freq === 'Weekly' ? 52 : 12,
        ts: startDate,
        txnId: null,
        status: Math.random() > 0.2 ? 1 : 0,
        paymentMode: ['UPI', 'NetBanking', 'Card'][Math.floor(Math.random() * 3)],
        isClient: null,
        augUniqueId: this.randomUniqueId() + (1767000000 + i),
        metalType: Math.random() > 0.4 ? 'gold' : 'silver'
      };
    });
  }

  getSIPPaymentSchedules(count = 800): SIPPaymentSchedule[] {
    const statuses: (SIPPaymentSchedule['paymentStatus'])[] = ['Success', 'Failed', 'Pending', null];
    return Array.from({ length: count }, (_, i) => ({
      id: 110000 + i,
      sipId: 800 + Math.floor(Math.random() * 150),
      scheduleDate: this.randomDate(new Date('2025-06-01'), new Date('2027-04-10')),
      notifyDate: this.randomDate(new Date('2025-06-01'), new Date('2027-04-10')),
      amount: [100, 200, 481, 500, 1000, 2000, 2500, 5000][Math.floor(Math.random() * 8)],
      active: Math.random() > 0.2 ? 1 : 0,
      paymentStatus: statuses[Math.floor(Math.random() * statuses.length)],
      paymentId: Math.random() > 0.5 ? `Pay${Date.now()}` : null,
      ts: this.randomDate(new Date('2025-06-01'), new Date('2026-04-10')),
      installmentNumber: Math.floor(Math.random() * 52) + 1,
      paymentCapturedTs: null,
      goldBuyStatus: null,
      goldBuyStatusTs: null
    }));
  }

  getGoals(count = 100): GoldLiteGoal[] {
    return Array.from({ length: count }, (_, i) => {
      const goalName = this.goalNames[Math.floor(Math.random() * this.goalNames.length)];
      return {
        id: 200 + i,
        goalName,
        metalType: Math.random() > 0.4 ? 'gold' : 'silver',
        sipId: 800 + Math.floor(Math.random() * 150),
        amount: [5000, 10000, 15000, 25000, 50000, 100000][Math.floor(Math.random() * 6)],
        imageUrl: `https://pic.islamicly.com/goldlite/gold/${goalName.toLowerCase()}.png`,
        ts: this.randomDate(new Date('2025-06-01'), new Date('2026-04-10')),
        type: Math.floor(Math.random() * 3) + 1
      };
    });
  }

  getGoalTypes(): GoalTypeMaster[] {
    return this.goalNames.map((name, i) => ({
      id: i + 1,
      goalName: name.toUpperCase(),
      imageUrl: `https://pic.islamicly.com/goldlite/gold/${name.toLowerCase()}.png`,
      ts: '2026-03-26T14:36:20'
    }));
  }

  getNominees(count = 80): UserNominee[] {
    return Array.from({ length: count }, (_, i) => {
      const name = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
      const relations = ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister'];
      return {
        id: i + 1,
        uniqueId: this.randomUniqueId() + (1769000000 + i),
        nomineeName: name,
        nomineeRelation: relations[Math.floor(Math.random() * relations.length)],
        nomineeDateOfBirth: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${1950 + Math.floor(Math.random() * 50)}`,
        nomineeMobile: this.randomPhone(),
        nomineeEmail: `${name.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`,
        ts: this.randomDate(new Date('2025-06-01'), new Date('2026-04-10'))
      };
    });
  }

  getGifts(count = 50): GiftPeerToPeer[] {
    return Array.from({ length: count }, (_, i) => ({
      id: 400 + i,
      senderUID: 163000 + Math.floor(Math.random() * 200),
      receiverUID: 163000 + Math.floor(Math.random() * 200),
      senderUniqueId: this.randomUniqueId(),
      receiverUniqueId: this.randomUniqueId(),
      amount: [50, 100, 200, 500, 1000, 2000][Math.floor(Math.random() * 6)],
      giftTemplateId: Math.floor(Math.random() * 5) + 1,
      isClaimed: Math.random() > 0.3 ? 1 : 0,
      paymentOrderId: `isl_mobile_${Date.now()}`,
      txId: `${this.randomUniqueId().substring(0, 5)}${Date.now()}`,
      ts: this.randomDate(new Date('2025-06-01'), new Date('2026-04-10')),
      giftMessage: ['Happy Birthday', 'Congratulations', 'Eid Mubarak', 'Happy Anniversary', 'Best Wishes'][Math.floor(Math.random() * 5)],
      receiverMobile: null,
      receiverName: null,
      metalType: Math.random() > 0.4 ? 'gold' : 'silver',
      isWeb: 0,
      isClaimedTs: null
    }));
  }

  getRateAlerts(count = 30): RateAlert[] {
    return Array.from({ length: count }, (_, i) => ({
      rateId: i + 1,
      metalType: Math.random() > 0.5 ? 'GOLD' as const : 'SILVER' as const,
      price: Math.random() > 0.5 ? 14000 + Math.floor(Math.random() * 3000) : 200 + Math.floor(Math.random() * 100),
      type: 1,
      appNotification: Math.random() > 0.3 ? 1 : 0,
      emailNotification: Math.random() > 0.5 ? 1 : 0,
      augUserId: this.randomUniqueId(),
      status: 1,
      createDate: this.randomDate(new Date('2026-01-01'), new Date('2026-04-10'))
    }));
  }

  getProducts(): GoldProduct[] {
    return [
      { id: 1, name: 'Augmont 0.1Gm Gold Coin (999 Purity)', sku: 'AU999GC001R', productWeight: 0.1, redeemWeight: 0.1, metalType: 'gold', purity: 999, jewelleryType: 'coin', productSize: 1, basePrice: 80, description: 'Auspicious 0.1 gram gold coin', status: 'active', url: 'https://pic.islamicly.com/goldlite/Products/GoldImages/0.1Gold.png', displayOrder: null, defaultImage: null, ts: '2026-04-08T14:52:16' },
      { id: 2, name: 'Augmont 10Gm Gold Coin (999 Purity)', sku: 'AU999GC10G', productWeight: 10, redeemWeight: 10, metalType: 'gold', purity: 999, jewelleryType: 'coin', productSize: 1, basePrice: 800, description: 'Auspicious 10 gram gold coin', status: 'active', url: 'https://pic.islamicly.com/goldlite/Products/GoldImages/10Gold.png', displayOrder: null, defaultImage: null, ts: '2026-04-08T14:52:16' },
      { id: 3, name: 'Augmont 1Gm Gold Coin (999 Purity)', sku: 'AU999GC1G', productWeight: 1, redeemWeight: 1, metalType: 'gold', purity: 999, jewelleryType: 'coin', productSize: 1, basePrice: 160, description: 'Auspicious 1 gram gold coin', status: 'active', url: 'https://pic.islamicly.com/goldlite/Products/GoldImages/1Gold.png', displayOrder: null, defaultImage: null, ts: '2026-04-08T14:52:16' },
      { id: 4, name: 'Augmont 5Gm Gold Coin (999 Purity)', sku: 'AU999GC5G', productWeight: 5, redeemWeight: 5, metalType: 'gold', purity: 999, jewelleryType: 'coin', productSize: 1, basePrice: 400, description: 'Auspicious 5 gram gold coin', status: 'active', url: 'https://pic.islamicly.com/goldlite/Products/GoldImages/5Gold.png', displayOrder: null, defaultImage: null, ts: '2026-04-08T14:52:16' },
      { id: 5, name: 'Augmont 10Gm Silver Coin (999 Purity)', sku: 'AU999SC10G', productWeight: 10, redeemWeight: 10, metalType: 'silver', purity: 999, jewelleryType: 'coin', productSize: 1, basePrice: 50, description: '10 gram silver coin', status: 'active', url: 'https://pic.islamicly.com/goldlite/Products/SilverImages/10Silver.png', displayOrder: null, defaultImage: null, ts: '2026-04-08T14:52:16' }
    ];
  }

  getCurrentRates() {
    return {
      gBuy: '15654.60',
      gSell: '15047.50',
      sBuy: '245.71',
      sSell: '244.41',
      gBuyGst: '469.64',
      sBuyGst: '7.37'
    };
  }

  getDashboardStats() {
    const buys = this.getBuyTransactions();
    const sells = this.getSellTransactions();
    const sips = this.getSIPs();
    const schedules = this.getSIPPaymentSchedules();
    const goals = this.getGoals();
    const nominees = this.getNominees();
    const users = this.getUsers();

    return {
      totalUsers: users.length,
      totalGoals: goals.length,
      totalBuyTransactions: buys.length,
      totalSellTransactions: sells.length,
      totalRedeemRequests: this.getOrders().filter(o => o.orderStatus !== 'Cancelled').length,
      sipSuccess: schedules.filter(s => s.paymentStatus === 'Success').length,
      sipFailed: schedules.filter(s => s.paymentStatus === 'Failed').length,
      nominationsCreated: nominees.length,
      totalBuyValue: buys.reduce((sum, b) => sum + b.totalAmount, 0),
      totalSellValue: sells.reduce((sum, s) => sum + s.totalAmount, 0),
      activeUsers: users.filter(u => u.kycStatus === 'approved').length,
      pendingKyc: users.filter(u => u.kycStatus === 'pending').length,
      activeSIPs: sips.filter(s => s.status === 1).length,
      goldBuys: buys.filter(b => b.metalType === 'gold').length,
      silverBuys: buys.filter(b => b.metalType === 'silver').length,
      rates: this.getCurrentRates()
    };
  }

  getAppAnalytics() {
    return {
      playStore: {
        downloads: 45230,
        activeInstalls: 28450,
        rating: 4.3,
        totalReviews: 1256,
        dailyDownloads: Array.from({ length: 30 }, () => Math.floor(50 + Math.random() * 200)),
        reviewSummary: { 5: 620, 4: 312, 3: 148, 2: 96, 1: 80 }
      },
      appStore: {
        downloads: 32100,
        activeInstalls: 21300,
        rating: 4.5,
        totalReviews: 890,
        dailyDownloads: Array.from({ length: 30 }, () => Math.floor(30 + Math.random() * 150)),
        reviewSummary: { 5: 445, 4: 230, 3: 112, 2: 58, 1: 45 }
      }
    };
  }
}
