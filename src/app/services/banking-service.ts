import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, forkJoin, map, Observable, switchMap, tap } from 'rxjs';
import {
  Account,
  AccountBalanceResponse,
  CryptoConversion,
  CryptoConversionResponse,
  Deposit,
  FiatConversion,
  FiatConversionResponse,
  ServerTransaction,
  Transaction,
  TransactionsListResponse,
  Withdrawal,
} from '../models/banking.model';

@Injectable({
  providedIn: 'root',
})
export class BankingService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'https://bankingapi-production-2687.up.railway.app';
  private readonly currentAccountNumber = signal<string | null>(null);
  private readonly accountSignal = signal<Account | null>(null);
  private readonly transactionsSignal = signal<Transaction[]>([]);
  private readonly dashboardSyncing = signal(false);

  /** True mentre saldo e transazioni vengono aggiornati dal server. */
  readonly isDashboardSyncing = this.dashboardSyncing.asReadonly();

  totalBalance = computed(() => this.accountSignal()?.balance ?? 0);

  recentTransactions = computed(() => this.transactionsSignal().slice(0, 10));

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
      .get<AccountBalanceResponse>(`${this.apiBaseUrl}/accounts/${accountId}/balance`)
      .pipe(
        map(({ balance, currency, name, type, iban }) => ({
          id: String(accountId),
          name: name ?? `Conto ${accountId}`,
          balance,
          currency: currency ?? 'EUR',
          type: type ?? 'primary',
          iban,
        })),
        tap((account) => this.accountSignal.set(account))
      );
  }

  fetchTransactions(): Observable<Transaction[]> {
    const accountId = this.requireAccountId();
    return this.http
      .get<ServerTransaction[] | TransactionsListResponse>(
        `${this.apiBaseUrl}/accounts/${accountId}/transactions`
      )
      .pipe(
        map((body) => {
          const list = Array.isArray(body) ? body : body.transactions;
          return list.map((tx) => this.mapServerTransaction(tx));
        }),
        tap((transactions) => this.transactionsSignal.set(transactions))
      );
  }

  fetchTransaction(transactionId: string): Observable<Transaction> {
    const accountId = this.requireAccountId();
    return this.http
      .get<ServerTransaction>(
        `${this.apiBaseUrl}/accounts/${accountId}/transactions/${transactionId}`
      )
      .pipe(map((tx) => this.mapServerTransaction(tx)));
  }

  updateTransaction(
    transactionId: string,
    update: Partial<Pick<ServerTransaction, 'amount' | 'description' | 'type'>>
  ): Observable<Transaction> {
    const accountId = this.requireAccountId();
    return this.http
      .put<ServerTransaction>(
        `${this.apiBaseUrl}/accounts/${accountId}/transactions/${transactionId}`,
        update
      )
      .pipe(
        switchMap((tx) =>
          this.refreshDashboardData().pipe(map(() => this.mapServerTransaction(tx)))
        )
      );
  }

  deleteTransaction(transactionId: string): Observable<void> {
    const accountId = this.requireAccountId();
    return this.http
      .delete<void>(
        `${this.apiBaseUrl}/accounts/${accountId}/transactions/${transactionId}`
      )
      .pipe(
        switchMap(() => this.refreshDashboardData()),
        map(() => undefined)
      );
  }

  createAccount(name: string, type: Account['type'] = 'primary'): Observable<Account> {
    return this.http
      .post<Account>(`${this.apiBaseUrl}/accounts`, { name, type })
      .pipe(
        map((response) => ({
          id: String(response.id ?? ''),
          name: response.name ?? name,
          balance: response.balance ?? 0,
          currency: response.currency ?? 'EUR',
          type: response.type ?? type,
          iban: response.iban,
        }))
      );
  }

  addDeposit(amount: number, method: string, description: string): Observable<Deposit> {
    const accountId = this.requireAccountId();
    return this.http
      .post<{ message?: string }>(`${this.apiBaseUrl}/accounts/${accountId}/deposits`, {
        amount,
        description,
      })
      .pipe(
        switchMap(() =>
          this.refreshDashboardData().pipe(
            map(
              () => ({
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
      .post<{ message?: string }>(`${this.apiBaseUrl}/accounts/${accountId}/withdrawals`, {
        amount,
        description,
      })
      .pipe(
        switchMap(() =>
          this.refreshDashboardData().pipe(
            map(
              () => ({
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
      .get<CryptoConversionResponse>(
        `${this.apiBaseUrl}/accounts/${accountId}/balance/convert/crypto?to=${encodeURIComponent(
          toCurrency
        )}`
      )
      .pipe(
        switchMap(({ crypto_price, crypto_amount }) =>
          this.refreshDashboardData().pipe(
            map(
              () =>
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
          )
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
      .get<FiatConversionResponse>(
        `${this.apiBaseUrl}/accounts/${accountId}/balance/convert/fiat?to=${encodeURIComponent(
          toCurrency
        )}`
      )
      .pipe(
        switchMap(({ rate: serverRate, converted_balance }) =>
          this.refreshDashboardData().pipe(
            map(
              () =>
                ({
                  id: `fiat-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  fromAmount,
                  fromCurrency,
                  toAmount: converted_balance,
                  toCurrency,
                  rate: serverRate,
                  status: 'completed',
                }) as FiatConversion
            )
          )
        )
      );
  }

  /** Ricarica saldo e lista transazioni e aggiorna la cache condivisa. */
  refreshDashboardData(): Observable<[Account, Transaction[]]> {
    this.dashboardSyncing.set(true);
    return forkJoin({
      account: this.fetchAccount(),
      transactions: this.fetchTransactions(),
    }).pipe(
      map(({ account, transactions }) => [account, transactions] as [Account, Transaction[]]),
      finalize(() => this.dashboardSyncing.set(false))
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

  private mapServerTransaction(tx: ServerTransaction): Transaction {
    const mappedType: Transaction['type'] =
      tx.type === 'deposit' || tx.type === 'withdrawal' ? tx.type : 'other';
    const amountNum = Number(tx.amount);
    const signedAmount = mappedType === 'withdrawal' ? -Math.abs(amountNum) : Math.abs(amountNum);
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
