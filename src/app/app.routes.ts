import { Routes } from '@angular/router';
import { Balance } from './components/balance/balance';
import { ConvertCrypto } from './components/convert-crypto/convert-crypto';
import { ConvertFiat } from './components/convert-fiat/convert-fiat';
import { Deposit } from './components/deposit/deposit';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Transactions } from './components/transactions/transactions';
import { Withdrawals } from './components/withdrawals/withdrawals';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Home },
  { path: 'balance', component: Balance },
  { path: 'convert-crypto', component: ConvertCrypto },
  { path: 'convert-fiat', component: ConvertFiat },
  { path: 'deposit', component: Deposit },
  { path: 'transactions', component: Transactions },
  { path: 'withdrawals', component: Withdrawals },
  { path: '**', redirectTo: '/login' },
];
