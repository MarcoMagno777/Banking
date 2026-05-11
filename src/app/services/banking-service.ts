import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, switchMap, tap } from 'rxjs';
import {
  Account,
  CryptoConversion,
  Deposit,
  FiatConversion,
  Transaction,
  Withdrawal,
} from '../models/banking.model';

@Injectable({
  providedIn: 'root',
})
export class BankingService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:8080';
  private readonly currentAccountNumber = signal<string | null>(null);
  private readonly accountSignal = signal<Account | null>(null);
  private readonly transactionsSignal = signal<Transaction[]>([]);

  totalBalance = computed(() => this.accountSignal()?.balance ?? 0);

  recentTransactions = computed(() => {
    return this.transactionsSignal().slice(0, 10);
  });

  setCurrentAccountNumber(accountNumber: string): void {
    this.currentAccountNumber.set(accountNumber.trim());
  }

  getCurrentAccountNumber(): string | null {
    return this.currentAccountNumber();
  }

  clearSession(): void {
    this.currentAccountNumber.set(null);
    this.accountSignal.set(null);
    this.transactionsSignal.set([]);
  }

  getCachedAccount(): Account | null {
    return this.accountSignal();
  }

  getCachedTransactions(): Transaction[] {
    return this.transactionsSignal();
  }

  fetchAccount(): Observable<Account> {
    const accountId = this.requireAccountId();
    return this.http
      .get<{ balance: number }>(`${this.apiBaseUrl}/accounts/${accountId}/balance`)
      .pipe(
        map(({ balance }) => ({
          id: String(accountId),
          name: `Conto ${accountId}`,
          balance,
          currency: 'EUR',
          type: 'primary' as const,
        })),
        tap((account) => this.accountSignal.set(account))
      );
  }

  fetchTransactions(): Observable<Transaction[]> {
    const accountId = this.requireAccountId();
    return this.http
      .get<
        Array<{
          id: number;
          type: string;
          amount: number;
          description: string;
          created_at?: string;
        }>
      >(`${this.apiBaseUrl}/accounts/${accountId}/transactions`)
      .pipe(
        map((transactions) =>
          transactions.map((tx) => this.mapServerTransaction(tx))
        ),
        tap((transactions) => this.transactionsSignal.set(transactions))
      );
  }

  addDeposit(amount: number, method: string, description: string): Observable<Deposit> {
    const accountId = this.requireAccountId();
    return this.http
      .post<{ message: string }>(`${this.apiBaseUrl}/accounts/${accountId}/deposits`, {
        amount,
        description,
      })
      .pipe(
        switchMap(() =>
          this.refreshDashboardData().pipe(
            map(
              () =>
                ({
                  id: `dep-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  amount,
                  method,
                  status: 'completed',
                }) as Deposit
            )
          )
        )
      );
  }

  addWithdrawal(
    amount: number,
    destination: string,
    description: string
  ): Observable<Withdrawal> {
    const accountId = this.requireAccountId();
    return this.http
      .post<{ message: string }>(`${this.apiBaseUrl}/accounts/${accountId}/withdrawals`, {
        amount,
        description,
      })
      .pipe(
        switchMap(() =>
          this.refreshDashboardData().pipe(
            map(
              () =>
                ({
                  id: `wit-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  amount,
                  destination,
                  status: 'completed',
                }) as Withdrawal
            )
          )
        )
      );
  }

  addCryptoConversion(
    fromAmount: number,
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    description: string
  ): Observable<CryptoConversion> {
    const accountId = this.requireAccountId();
    return this.http
      .get<{ crypto_price: number; crypto_amount: number }>(
        `${this.apiBaseUrl}/accounts/${accountId}/balance/convert/crypto?to=${encodeURIComponent(
          toCurrency
        )}`
      )
      .pipe(
        map(
          ({ crypto_price, crypto_amount }) =>
            ({
              id: `crypto-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              fromAmount,
              fromCurrency,
              toAmount: crypto_amount,
              toCurrency,
              rate: rate > 0 ? rate : 1 / crypto_price,
              status: 'completed',
            }) as CryptoConversion
        )
      );
  }

  addFiatConversion(
    fromAmount: number,
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    description: string
  ): Observable<FiatConversion> {
    const accountId = this.requireAccountId();
    return this.http
      .get<{ rate: number; converted_balance: number }>(
        `${this.apiBaseUrl}/accounts/${accountId}/balance/convert/fiat?to=${encodeURIComponent(
          toCurrency
        )}`
      )
      .pipe(
        map(
          ({ rate: serverRate }) =>
            ({
              id: `fiat-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              fromAmount,
              fromCurrency,
              toAmount: fromAmount * serverRate,
              toCurrency,
              rate: serverRate,
              status: 'completed',
            }) as FiatConversion
        )
      );
  }

  private refreshDashboardData(): Observable<[Account, Transaction[]]> {
    return forkJoin({
      account: this.fetchAccount(),
      transactions: this.fetchTransactions(),
    }).pipe(
      map(
        ({ account, transactions }) =>
          [account, transactions] as [Account, Transaction[]]
      )
    );
  }

  private requireAccountId(): number {
    const accountNumber = this.currentAccountNumber();
    if (!accountNumber) {
      throw new Error('Numero conto non impostato');
    }
    const accountId = Number(accountNumber);
    if (!Number.isFinite(accountId)) {
      throw new Error('Numero conto non valido');
    }
    return accountId;
  }

  private mapServerTransaction(tx: {
    id: number;
    type: string;
    amount: number;
    description: string;
    created_at?: string;
  }): Transaction {
    const mappedType: Transaction['type'] =
      tx.type === 'deposit' || tx.type === 'withdrawal' ? tx.type : 'other';
    const signedAmount = mappedType === 'withdrawal' ? -Math.abs(tx.amount) : Math.abs(tx.amount);
    return {
      id: String(tx.id),
      date: tx.created_at ? tx.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
      description: tx.description,
      amount: signedAmount,
      type: mappedType,
      status: 'completed',
    };
  }
}
