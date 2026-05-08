import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PaymentService, FinancialStatus } from '../../services/payment.service';
import { Observable, filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Financial Management</h2>

      <ng-container *ngIf="user$ | async as user; else loading">
        <div *ngIf="financialStatus$ | async as status; else noPlan" class="max-w-3xl">
          <div class="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-6">
            <h3 class="text-lg font-medium text-slate-800 mb-4">Payment Progress</h3>

            <div class="flex justify-between text-sm font-medium text-slate-700 mb-2">
              <span>Paid: {{ status.paidAmount | currency }}</span>
              <span>Total: {{ status.totalAmount | currency }}</span>
            </div>

            <div class="w-full bg-slate-200 rounded-full h-4 mb-2">
              <div
                class="bg-green-500 h-4 rounded-full transition-all duration-500"
                [style.width.%]="status.progressPercentage"
              ></div>
            </div>

            <div class="flex justify-end text-sm text-slate-500 font-medium">
              Remaining Balance:
              <span class="text-red-600 ml-1">{{ status.remainingBalance | currency }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium text-slate-700 mb-3">Upcoming Installments</h4>
              <ul class="space-y-3">
                <li
                  class="flex justify-between items-center p-3 bg-white border border-slate-100 rounded shadow-sm"
                >
                  <span class="text-sm font-medium text-slate-600">May Installment</span>
                  <span class="text-sm font-bold text-slate-800">{{ 120 | currency }}</span>
                </li>
                <li
                  class="flex justify-between items-center p-3 bg-white border border-slate-100 rounded shadow-sm"
                >
                  <span class="text-sm font-medium text-slate-600">June Installment</span>
                  <span class="text-sm font-bold text-slate-800">{{ 120 | currency }}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 class="font-medium text-slate-700 mb-3">Actions</h4>
              <div class="p-4 bg-slate-50 border border-slate-200 rounded text-center">
                <p class="text-sm text-slate-600 mb-3">Upload your latest payment receipt</p>
                <label
                  class="cursor-pointer inline-flex justify-center py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
                >
                  <span>Upload Receipt</span>
                  <input
                    type="file"
                    class="hidden"
                    (change)="simulateUpload($event)"
                    accept="image/*,.pdf"
                  />
                </label>
                <div *ngIf="uploadSuccess" class="text-xs text-green-600 font-medium mt-2">
                  Receipt uploaded successfully!
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noPlan>
          <div class="text-slate-500 py-4">No active payment plan found for this account.</div>
        </ng-template>
      </ng-container>

      <ng-template #loading>
        <div class="text-blue-600 py-4">Loading financial data...</div>
      </ng-template>
    </div>
  `,
  styles: ``,
})
export class PaymentsComponent implements OnInit {
  private authService = inject(AuthService);
  private paymentService = inject(PaymentService);

  user$ = this.authService.user$;
  financialStatus$!: Observable<FinancialStatus | null>;
  uploadSuccess = false;

  ngOnInit() {
    this.financialStatus$ = this.user$.pipe(
      filter((user) => !!user),
      switchMap((user) => this.paymentService.getFinancialStatus(user!.uid)),
    );
  }

  simulateUpload(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      setTimeout(() => {
        this.uploadSuccess = true;
        setTimeout(() => (this.uploadSuccess = false), 3000);
      }, 1000);
    }
  }
}
