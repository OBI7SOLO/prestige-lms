import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export interface PaymentPlan {
  id?: string;
  studentId: string;
  totalAmount: number;
  paidAmount: number;
  installments: number;
  createdAt: string;
}

export interface PaymentHistory {
  id?: string;
  studentId: string;
  amount: number;
  receiptUrl?: string;
  paymentDate: string;
}

export interface FinancialStatus {
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  progressPercentage: number;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private firestore = inject(Firestore);

  async createPaymentPlan(
    studentId: string,
    totalAmount: number,
    installments: number,
  ): Promise<string> {
    const plansRef = collection(this.firestore, 'paymentPlans');
    const docRef = await addDoc(plansRef, {
      studentId,
      totalAmount,
      paidAmount: 0,
      installments,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  }

  async registerPayment(
    studentId: string,
    amount: number,
    receiptUrl: string,
    planId: string,
  ): Promise<void> {
    // Save history
    const historyRef = collection(this.firestore, 'paymentHistory');
    await addDoc(historyRef, {
      studentId,
      amount,
      receiptUrl,
      paymentDate: new Date().toISOString(),
    });

    // Update plan
    const planDocRef = doc(this.firestore, `paymentPlans/${planId}`);
    await updateDoc(planDocRef, {
      paidAmount: increment(amount),
    });
  }

  getFinancialStatus(studentId: string): Observable<FinancialStatus | null> {
    const plansRef = collection(this.firestore, 'paymentPlans');
    const q = query(plansRef, where('studentId', '==', studentId));

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) return null;
        // Assuming one active plan for MVP
        const plan = snapshot.docs[0].data() as PaymentPlan;
        const remainingBalance = plan.totalAmount - plan.paidAmount;
        const progressPercentage =
          plan.totalAmount > 0 ? (plan.paidAmount / plan.totalAmount) * 100 : 0;

        return {
          totalAmount: plan.totalAmount,
          paidAmount: plan.paidAmount,
          remainingBalance: Math.max(0, remainingBalance),
          progressPercentage: Math.min(100, progressPercentage),
        };
      }),
    );
  }

  // Admin global stats
  getAdminGlobalStats(): Observable<{ totalRevenue: number; pendingPayments: number }> {
    const plansRef = collection(this.firestore, 'paymentPlans');
    return from(getDocs(plansRef)).pipe(
      map((snapshot) => {
        let totalRevenue = 0;
        let pendingPayments = 0;

        snapshot.docs.forEach((docSnap) => {
          const plan = docSnap.data() as PaymentPlan;
          totalRevenue += plan.paidAmount;
          if (plan.totalAmount > plan.paidAmount) {
            pendingPayments++;
          }
        });

        return { totalRevenue, pendingPayments };
      }),
    );
  }
}
