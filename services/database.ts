
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { Car, SiteConfig, User, Rental, Payment } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyA7Q4VwibeVMWwKH9mJw6YZqfRc8RfaZLU",
  authDomain: "car2list-ffb63.firebaseapp.com",
  databaseURL: "https://car2list-ffb63-default-rtdb.firebaseio.com",
  projectId: "car2list-ffb63",
  storageBucket: "car2list-ffb63.firebasestorage.app",
  messagingSenderId: "719650717440",
  appId: "1:719650717440:web:319d64553d08edcf2bbde5",
  measurementId: "G-E6JJG57PSR"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const dbService = {
  // --- Cars ---
  subscribeToCars(callback: (cars: Car[]) => void) {
    return onValue(ref(db, 'cars'), (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        callback(Object.keys(data).map(k => ({ ...data[k], id: k })));
      } else callback([]);
    });
  },
  async updateCar(carId: string, updates: Partial<Car>) {
    await update(ref(db, `cars/${carId}`), updates);
  },
  async addCar(car: Omit<Car, 'id'>) {
    const newRef = push(ref(db, 'cars'));
    await set(newRef, { ...car, createdAt: new Date().toISOString() });
    return newRef.key;
  },
  async deleteCar(carId: string) {
    await remove(ref(db, `cars/${carId}`));
  },

  // --- Users ---
  async getUsers(): Promise<User[]> {
    const snap = await get(ref(db, 'users'));
    return snap.exists() ? Object.keys(snap.val()).map(k => ({ ...snap.val()[k], id: k })) : [];
  },
  subscribeToUsers(callback: (users: User[]) => void) {
    return onValue(ref(db, 'users'), (snap) => {
      if (snap.exists()) callback(Object.keys(snap.val()).map(k => ({ ...snap.val()[k], id: k })));
      else callback([]);
    });
  },
  async saveUser(uid: string, user: User) { await set(ref(db, `users/${uid}`), user); },
  async updateUser(uid: string, updates: Partial<User>) { await update(ref(db, `users/${uid}`), updates); },

  // --- Configuration ---
  subscribeToConfig(callback: (config: SiteConfig) => void) {
    return onValue(ref(db, 'config'), (snap) => snap.exists() && callback(snap.val()));
  },
  async updateSiteConfig(config: Partial<SiteConfig>) { await update(ref(db, 'config'), config); },

  // --- Rentals (Refactored) ---
  async createRental(rental: Omit<Rental, 'id' | 'createdAt' | 'status'>) {
    const newRef = push(ref(db, 'rentals'));
    const data = { ...rental, id: newRef.key, status: 'Pending', createdAt: new Date().toISOString() };
    await set(newRef, data);
    return newRef.key;
  },
  subscribeToAllRentals(callback: (rentals: Rental[]) => void) {
    return onValue(ref(db, 'rentals'), (snap) => {
      if (snap.exists()) callback(Object.values(snap.val()) as Rental[]);
      else callback([]);
    });
  },
  subscribeToUserRentals(uid: string, callback: (rentals: Rental[]) => void) {
    return onValue(ref(db, 'rentals'), (snap) => {
      if (snap.exists()) {
        const all = Object.values(snap.val()) as Rental[];
        callback(all.filter(r => r.userId === uid).sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
      } else callback([]);
    });
  },
  subscribeToDealerRentals(did: string, callback: (rentals: Rental[]) => void) {
    return onValue(ref(db, 'rentals'), (snap) => {
      if (snap.exists()) {
        const all = Object.values(snap.val()) as Rental[];
        callback(all.filter(r => r.dealerId === did).sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
      } else callback([]);
    });
  },
  async updateRentalStatus(rid: string, status: Rental['status']) {
    await update(ref(db, `rentals/${rid}`), { status });
  },

  // --- Payments ---
  async submitPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'status'>) {
    const newRef = push(ref(db, 'payments'));
    const data = { ...payment, id: newRef.key, status: 'Pending', createdAt: new Date().toISOString() };
    await set(newRef, data);
    return newRef.key;
  },
  subscribeToAllPayments(callback: (payments: Payment[]) => void) {
    return onValue(ref(db, 'payments'), (snap) => {
      if (snap.exists()) callback(Object.values(snap.val()) as Payment[]);
      else callback([]);
    });
  },
  // Fixed: Added subscribeToPurchases to handle user payment history synchronization
  subscribeToPurchases(uid: string, callback: (payments: Payment[]) => void) {
    return onValue(ref(db, 'payments'), (snap) => {
      if (snap.exists()) {
        const all = Object.values(snap.val()) as Payment[];
        callback(all.filter(p => p.userId === uid).sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
      } else callback([]);
    });
  },
  async updatePaymentStatus(pid: string, status: Payment['status']) {
    await update(ref(db, `payments/${pid}`), { status });
  },

  // --- Notifications ---
  subscribeToNotifications(uid: string, callback: (notifs: any[]) => void) {
    return onValue(ref(db, `notifications/${uid}`), (snap) => {
      if (snap.exists()) callback(Object.keys(snap.val()).map(k => ({ ...snap.val()[k], id: k })).reverse());
      else callback([]);
    });
  },
  async createNotification(uid: string, n: { title: string; message: string; type: 'info' | 'success' | 'warning' }) {
    await push(ref(db, `notifications/${uid}`), { ...n, read: false, time: new Date().toISOString() });
  },
  async notifyAllAdmins(n: any) {
    const users = await this.getUsers();
    const admins = users.filter(u => u.role === 'ADMIN');
    for (const a of admins) await this.createNotification(a.id, n);
  },
  async markNotificationRead(uid: string, nid: string) { await update(ref(db, `notifications/${uid}/${nid}`), { read: true }); },
  async clearUserNotifications(uid: string) { await remove(ref(db, `notifications/${uid}`)); },

  // Legacy Bookings (for Test Drives only now)
  async createBooking(booking: any) {
    const newRef = push(ref(db, 'bookings/all'));
    await set(newRef, { ...booking, id: newRef.key, createdAt: new Date().toISOString(), status: 'Confirmed' });
    return newRef.key;
  },
  subscribeToBookings(uid: string, callback: (b: any[]) => void) {
    return onValue(ref(db, 'bookings/all'), (snap) => {
      if (snap.exists()) callback(Object.values(snap.val()).filter((b:any) => b.userId === uid));
      else callback([]);
    });
  },
  subscribeToDealerBookings(did: string, callback: (b: any[]) => void) {
    return onValue(ref(db, 'bookings/all'), (snap) => {
      if (snap.exists()) callback(Object.values(snap.val()).filter((b:any) => b.dealerId === did));
      else callback([]);
    });
  },
  subscribeToAllBookings(callback: (b: any[]) => void) {
    return onValue(ref(db, 'bookings/all'), (snap) => {
      if (snap.exists()) callback(Object.values(snap.val()));
      else callback([]);
    });
  }
};
