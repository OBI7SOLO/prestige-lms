import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  authState,
  User,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  docData,
  doc as firestoreDoc,
  setDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable, of, switchMap, map, catchError } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string | null;
  role: 'admin' | 'teacher' | 'student';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private readonly roleCacheKey = 'prestige-role-cache';
  private cachedUser$?: Observable<UserProfile | null>;

  // Observable for the current authenticated Firebase user
  currentUser$: Observable<User | null> = authState(this.auth);

  // Observable for the user's custom profile from Firestore (lazy getter)
  get user$(): Observable<UserProfile | null> {
    if (!this.cachedUser$) {
      this.cachedUser$ = this.currentUser$.pipe(
        switchMap((user) => {
          if (!user) {
            return of(null);
          }

          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return docData(userDocRef, { idField: 'uid' }).pipe(
            map((profile) => {
              if (profile) {
                const userProfile = profile as UserProfile;
                this.setCachedRole(userProfile.uid, userProfile.role);
                return userProfile;
              }

              return {
                uid: user.uid,
                email: user.email,
                role: this.getCachedRole(user.uid),
              };
            }),
            catchError(() =>
              of({
                uid: user.uid,
                email: user.email,
                role: this.getCachedRole(user.uid),
              }),
            ),
          );
        }),
      );
    }
    return this.cachedUser$;
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(
    email: string,
    password: string,
    role: UserProfile['role'] = 'student',
    profileData?: Record<string, any>,
  ): Promise<string> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    const profileRef = firestoreDoc(this.firestore, `users/${credential.user.uid}`);

    await setDoc(profileRef, {
      uid: credential.user.uid,
      email: credential.user.email,
      role,
      createdAt: serverTimestamp(),
      ...(profileData || {}),
    });

    this.setCachedRole(credential.user.uid, role);
    return credential.user.uid;
  }

  private getCachedRole(uid: string): UserProfile['role'] {
    try {
      const cacheRaw = localStorage.getItem(this.roleCacheKey);
      if (!cacheRaw) return 'student';

      const cache = JSON.parse(cacheRaw) as Record<string, UserProfile['role']>;
      return cache[uid] || 'student';
    } catch {
      return 'student';
    }
  }

  private setCachedRole(uid: string, role: UserProfile['role']) {
    try {
      const cacheRaw = localStorage.getItem(this.roleCacheKey);
      const cache = cacheRaw ? (JSON.parse(cacheRaw) as Record<string, UserProfile['role']>) : {};
      cache[uid] = role;
      localStorage.setItem(this.roleCacheKey, JSON.stringify(cache));
    } catch {
      // Ignore cache write errors and keep auth flow working.
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
