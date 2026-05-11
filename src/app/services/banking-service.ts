import { Injectable, signal, computed } from '@angular/core';
import {Transaction, Account, Deposit, Withdrawal, CryptoConversion, FiatConversion} from '../models/banking.model';

@Injectable({
  providedIn: 'root',
})
export class BankingService {
  // Signal per il singolo account
  private accountSignal = signal<Account>({
    id: 'acc-001',
    name: 'Conto Corrente',
    balance: 5000,
    currency: 'EUR',
    iban: 'IT60X0542811101000000123456',
    type: 'primary',
  });

  private transactionsSignal = signal<Transaction[]>([
    {
      id: 'tx-001',
      date: '2024-05-10',
      description: 'Deposito iniziale',
      amount: 5000,
      type: 'deposit',
      status: 'completed',
    },
    {
      id: 'tx-002',
      date: '2024-05-09',
      description: 'Conversione EUR/USD',
      amount: -200,
      type: 'fiat-conversion',
      status: 'completed',
    },
    {
      id: 'tx-003',
      date: '2024-05-08',
      description: 'Prelievo bancomat',
      amount: -100,
      type: 'withdrawal',
      status: 'completed',
    },
    {
      id: 'tx-004',
      date: '2024-05-07',
      description: 'Conversione EUR/BTC',
      amount: -500,
      type: 'crypto-conversion',
      status: 'completed',
    },
    {
      id: 'tx-005',
      date: '2024-05-06',
      description: 'Bonifico ricevuto',
      amount: 1500,
      type: 'other',
      status: 'completed',
    },
  ]);

  private depositsSignal = signal<Deposit[]>([
    {
      id: 'dep-001',
      date: '2024-05-10',
      amount: 5000,
      method: 'bank-transfer',
      status: 'completed',
    },
    {
      id: 'dep-002',
      date: '2024-05-05',
      amount: 2000,
      method: 'card',
      status: 'completed',
    },
  ]);

  private withdrawalsSignal = signal<Withdrawal[]>([
    {
      id: 'wit-001',
      date: '2024-05-08',
      amount: 100,
      destination: 'Bancomat XYZ',
      status: 'completed',
    },
    {
      id: 'wit-002',
      date: '2024-05-03',
      amount: 500,
      destination: 'Conto esterno',
      status: 'completed',
    },
  ]);

  private cryptoConversionsSignal = signal<CryptoConversion[]>([
    {
      id: 'crypto-001',
      date: '2024-05-07',
      fromAmount: 500,
      fromCurrency: 'EUR',
      toAmount: 0.0125,
      toCurrency: 'BTC',
      rate: 0.000025,
      status: 'completed',
    },
    {
      id: 'crypto-002',
      date: '2024-04-20',
      fromAmount: 300,
      fromCurrency: 'EUR',
      toAmount: 150,
      toCurrency: 'ETH',
      rate: 0.5,
      status: 'completed',
    },
  ]);

  private fiatConversionsSignal = signal<FiatConversion[]>([
    {
      id: 'fiat-001',
      date: '2024-05-09',
      fromAmount: 200,
      fromCurrency: 'EUR',
      toAmount: 220,
      toCurrency: 'USD',
      rate: 1.1,
      status: 'completed',
    },
    {
      id: 'fiat-002',
      date: '2024-05-01',
      fromAmount: 500,
      fromCurrency: 'EUR',
      toAmount: 540,
      toCurrency: 'GBP',
      rate: 1.08,
      status: 'completed',
    },
  ]);

  // Computed signals per calcoli automatici
  primaryBalance = computed(() => this.accountSignal().balance);

  totalBalance = computed(() => this.accountSignal().balance);

  recentTransactions = computed(() => {
    return this.transactionsSignal().slice(0, 10);
  });

  // ===== METODI PER TRANSAZIONI =====
  getTransactions() {
    return this.transactionsSignal();
  }

  getTransactionById(id: string): Transaction | undefined {
    return this.transactionsSignal().find((t) => t.id === id);
  }

  addTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      ...transaction,
    };
    this.transactionsSignal.update((transactions) => [
      newTransaction,
      ...transactions,
    ]);
    return newTransaction;
  }

  updateTransaction(id: string, updates: Partial<Transaction>): boolean {
    const transactions = this.transactionsSignal();
    const index = transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      const updated = [...transactions];
      updated[index] = { ...updated[index], ...updates };
      this.transactionsSignal.set(updated);
      return true;
    }
    return false;
  }

  deleteTransaction(id: string): boolean {
    const transactions = this.transactionsSignal();
    const filtered = transactions.filter((t) => t.id !== id);
    if (filtered.length !== transactions.length) {
      this.transactionsSignal.set(filtered);
      return true;
    }
    return false;
  }

  // ===== METODI PER ACCOUNT =====
  getAccount(): Account {
    return this.accountSignal();
  }

  getPrimaryAccount(): Account {
    return this.accountSignal();
  }

  updateBalance(newBalance: number): boolean {
    const current = this.accountSignal();
    if (current) {
      this.accountSignal.set({ ...current, balance: newBalance });
      return true;
    }
    return false;
  }

  addFundsToBalance(amount: number): boolean {
    const account = this.getAccount();
    return this.updateBalance(account.balance + amount);
  }

  withdrawFundsFromBalance(amount: number): boolean {
    const account = this.getAccount();
    if (account.balance >= amount) {
      return this.updateBalance(account.balance - amount);
    }
    return false;
  }

  // ===== METODI PER DEPOSITI =====
  getDeposits() {
    return this.depositsSignal();
  }

  getDepositById(id: string): Deposit | undefined {
    return this.depositsSignal().find((d) => d.id === id);
  }

  addDeposit(amount: number, method: string, description: string): Deposit {
    const newDeposit: Deposit = {
      id: `dep-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount,
      method,
      status: 'completed',
    };
    this.depositsSignal.update((deposits) => [newDeposit, ...deposits]);

    // Aggiungere la transazione corrispondente
    this.addTransaction({
      date: newDeposit.date,
      description: description,
      amount: amount,
      type: 'deposit',
      status: 'completed',
    });

    return newDeposit;
  }

  completeDeposit(depositId: string): boolean {
    return this.updateDepositStatus(depositId, 'completed');
  }

  updateDepositStatus(
    depositId: string,
    status: 'completed' | 'failed'
  ): boolean {
    const deposits = this.depositsSignal();
    const index = deposits.findIndex((d) => d.id === depositId);
    if (index !== -1) {
      const updated = [...deposits];
      updated[index] = { ...updated[index], status };
      this.depositsSignal.set(updated);
      return true;
    }
    return false;
  }

  // ===== METODI PER PRELIEVI =====
  getWithdrawals() {
    return this.withdrawalsSignal();
  }

  getWithdrawalById(id: string): Withdrawal | undefined {
    return this.withdrawalsSignal().find((w) => w.id === id);
  }

  addWithdrawal(amount: number, destination: string, description: string): Withdrawal {
    const newWithdrawal: Withdrawal = {
      id: `wit-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount,
      destination,
      status: 'completed',
    };
    this.withdrawalsSignal.update((withdrawals) => [
      newWithdrawal,
      ...withdrawals,
    ]);

    // Aggiungere la transazione corrispondente
    this.addTransaction({
      date: newWithdrawal.date,
      description: description,
      amount: -amount,
      type: 'withdrawal',
      status: 'completed',
    });

    return newWithdrawal;
  }

  completeWithdrawal(withdrawalId: string): boolean {
    return this.updateWithdrawalStatus(withdrawalId, 'completed');
  }

  updateWithdrawalStatus(
    withdrawalId: string,
    status: 'completed' | 'failed'
  ): boolean {
    const withdrawals = this.withdrawalsSignal();
    const index = withdrawals.findIndex((w) => w.id === withdrawalId);
    if (index !== -1) {
      const updated = [...withdrawals];
      updated[index] = { ...updated[index], status };
      this.withdrawalsSignal.set(updated);
      return true;
    }
    return false;
  }

  // ===== METODI PER CONVERSIONI CRYPTO =====
  getCryptoConversions() {
    return this.cryptoConversionsSignal();
  }

  getCryptoConversionById(id: string): CryptoConversion | undefined {
    return this.cryptoConversionsSignal().find((c) => c.id === id);
  }

  addCryptoConversion(
    fromAmount: number,
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    description: string
  ): CryptoConversion {
    const toAmount = fromAmount * rate;
    const newConversion: CryptoConversion = {
      id: `crypto-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      fromAmount,
      fromCurrency,
      toAmount,
      toCurrency,
      rate,
      status: 'completed',
    };
    this.cryptoConversionsSignal.update((conversions) => [
      newConversion,
      ...conversions,
    ]);

    // Aggiungere la transazione corrispondente
    this.addTransaction({
      date: newConversion.date,
      description: description,
      amount: -fromAmount,
      type: 'crypto-conversion',
      status: 'completed',
    });

    return newConversion;
  }

  completeCryptoConversion(conversionId: string): boolean {
    return this.updateCryptoConversionStatus(conversionId, 'completed');
  }

  updateCryptoConversionStatus(
    conversionId: string,
    status: 'completed' | 'pending' | 'failed'
  ): boolean {
    const conversions = this.cryptoConversionsSignal();
    const index = conversions.findIndex((c) => c.id === conversionId);
    if (index !== -1) {
      const updated = [...conversions];
      updated[index] = { ...updated[index], status };
      this.cryptoConversionsSignal.set(updated);
      return true;
    }
    return false;
  }

  // ===== METODI PER CONVERSIONI FIAT =====
  getFiatConversions() {
    return this.fiatConversionsSignal();
  }

  getFiatConversionById(id: string): FiatConversion | undefined {
    return this.fiatConversionsSignal().find((f) => f.id === id);
  }

  addFiatConversion(
    fromAmount: number,
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    description: string
  ): FiatConversion {
    const toAmount = fromAmount * rate;
    const newConversion: FiatConversion = {
      id: `fiat-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      fromAmount,
      fromCurrency,
      toAmount,
      toCurrency,
      rate,
      status: 'completed',
    };
    this.fiatConversionsSignal.update((conversions) => [
      newConversion,
      ...conversions,
    ]);

    // Aggiungere la transazione corrispondente
    this.addTransaction({
      date: newConversion.date,
      description: description,
      amount: -fromAmount,
      type: 'fiat-conversion',
      status: 'completed',
    });

    return newConversion;
  }

  completeFiatConversion(conversionId: string): boolean {
    return this.updateFiatConversionStatus(conversionId, 'completed');
  }

  updateFiatConversionStatus(
    conversionId: string,
    status: 'completed' | 'failed'
  ): boolean {
    const conversions = this.fiatConversionsSignal();
    const index = conversions.findIndex((f) => f.id === conversionId);
    if (index !== -1) {
      const updated = [...conversions];
      updated[index] = { ...updated[index], status };
      this.fiatConversionsSignal.set(updated);
      return true;
    }
    return false;
  }

  // ===== METODI UTILITA' =====
  getTransactionsByType(type: Transaction['type']): Transaction[] {
    return this.transactionsSignal().filter((t) => t.type === type);
  }

  getTransactionsByStatus(status: Transaction['status']): Transaction[] {
    return this.transactionsSignal().filter((t) => t.status === status);
  }

  getTransactionsByDateRange(startDate: string, endDate: string): Transaction[] {
    return this.transactionsSignal().filter(
      (t) => t.date >= startDate && t.date <= endDate
    );
  }

  calculateTotalDeposited(): number {
    return this.depositsSignal().reduce(
      (sum, d) => (d.status === 'completed' ? sum + d.amount : sum),
      0
    );
  }

  calculateTotalWithdrawn(): number {
    return this.withdrawalsSignal().reduce(
      (sum, w) => (w.status === 'completed' ? sum + w.amount : sum),
      0
    );
  }

}
