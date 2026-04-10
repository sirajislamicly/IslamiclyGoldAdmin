export interface AugUser {
  id: number;
  uid: number;
  userName: string;
  uniqueId: string;
  customerMappedId: string;
  mobileNumber: string;
  dateOfBirth: string;
  gender: string | null;
  userEmail: string | null;
  userAddress: string | null;
  userStateId: string | null;
  userCityId: string | null;
  userPincode: string | null;
  nomineeName: string | null;
  nomineeRelation: string | null;
  nomineeDateOfBirth: string | null;
  kycStatus: 'approved' | 'pending' | 'rejected';
  userState: string | null;
  userCity: string | null;
  createdAt: string;
  ts: string;
  panNumber: string | null;
}

export interface UserAddress {
  id: number;
  userAddressId: string;
  userAccountId: string;
  uniqueId: string;
  name: string;
  mobileNumber: string;
  email: string;
  address: string;
  stateId: string;
  stateName: string;
  cityId: string;
  cityName: string;
  pincode: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string | null;
}

export interface UserNominee {
  id: number;
  uniqueId: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeDateOfBirth: string;
  nomineeMobile: string;
  nomineeEmail: string;
  ts: string;
}

export interface PANOutput {
  id: number;
  panNumber: string;
  name: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  panStatus: 'VALID' | 'INVALID';
  dob: string;
  ts: string;
}

export interface CustomerBankAccount {
  id: number;
  uid: number;
  safeGoldUserId: string | null;
  bankAccount: string;
  ifscCode: string;
  bankName: string;
  isActive: number;
  ts: string;
  type: number;
  upiDetails: string | null;
  accountName: string;
  augUniqueId: string;
}
