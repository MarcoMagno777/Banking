export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'crypto-conversion' | 'fiat-conversion' | 'other';
  status: 'completed'| 'failed';
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  iban?: string;
  type: 'primary' | 'savings' | 'business';
}

export interface Deposit {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'completed' | 'failed';
}

export interface Withdrawal {
  id: string;
  date: string;
  amount: number;
  destination: string;
  status: 'completed' | 'failed';
}

export interface CryptoConversion {
  id: string;
  date: string;
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  rate: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface FiatConversion {
  id: string;
  date: string;
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  rate: number;
  status: 'completed' | 'failed';
}
