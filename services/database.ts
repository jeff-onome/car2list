
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { Car, SiteConfig, User } from "../types";

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
  // --- Cars Operations ---
  async getCars(): Promise<Car[]> {
    const snapshot = await get(ref(db, 'cars'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ ...data[key], id: key }));
    }
    return [];
  },

  subscribeToCars(callback: (cars: Car[]) => void) {
    const carsRef = ref(db, 'cars');
    return onValue(carsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const carList = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(carList);
      } else {
        callback([]);
      }
    });
  },

  async addCar(car: Omit<Car, 'id'>) {
    const carsRef = ref(db, 'cars');
    const newCarRef = push(carsRef);
    await set(newCarRef, { ...car, createdAt: new Date().toISOString() });
    return newCarRef.key;
  },

  async updateCar(carId: string, updates: Partial<Car>) {
    await update(ref(db, `cars/${carId}`), updates);
  },

  async deleteCar(carId: string) {
    await remove(ref(db, `cars/${carId}`));
  },

  // --- Site Config Operations ---
  async getSiteConfig(): Promise<SiteConfig | null> {
    const snapshot = await get(ref(db, 'config'));
    return snapshot.exists() ? snapshot.val() : null;
  },

  subscribeToConfig(callback: (config: SiteConfig) => void) {
    const configRef = ref(db, 'config');
    return onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
  },

  async updateSiteConfig(config: Partial<SiteConfig>) {
    await update(ref(db, 'config'), config);
  },

  // --- User Operations ---
  async saveUser(userId: string, user: User) {
    await set(ref(db, `users/${userId}`), user);
  },

  async updateUser(userId: string, updates: Partial<User>) {
    await update(ref(db, `users/${userId}`), updates);
  },

  async getUsers(): Promise<User[]> {
    const snapshot = await get(ref(db, 'users'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ ...data[key], id: key }));
    }
    return [];
  },

  subscribeToUsers(callback: (users: User[]) => void) {
    const usersRef = ref(db, 'users');
    return onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userList = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(userList);
      } else {
        callback([]);
      }
    });
  },

  // --- Purchases ---
  subscribeToPurchases(userId: string, callback: (purchases: any[]) => void) {
    const purchaseRef = ref(db, `purchases/${userId}`);
    return onValue(purchaseRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        callback(Object.keys(data).map(key => ({ ...data[key], id: key })));
      } else {
        callback([]);
      }
    });
  },

  // --- REFACTORED GLOBAL BOOKINGS ---
  
  async createBooking(booking: any) {
    const bookingsRef = ref(db, 'bookings/all');
    const newBookingRef = push(bookingsRef);
    const bookingData = {
      ...booking,
      id: newBookingRef.key,
      createdAt: new Date().toISOString(),
      status: 'Confirmed'
    };
    await set(newBookingRef, bookingData);
    return newBookingRef.key;
  },

  subscribeToBookings(userId: string, callback: (bookings: any[]) => void) {
    const bookingsRef = ref(db, 'bookings/all');
    return onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const all = Object.keys(data).map(key => ({ ...data[key], id: key }));
        // Filter for specific user
        callback(all.filter(b => b.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        callback([]);
      }
    });
  },

  subscribeToDealerBookings(dealerId: string, callback: (bookings: any[]) => void) {
    const bookingsRef = ref(db, 'bookings/all');
    return onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const all = Object.keys(data).map(key => ({ ...data[key], id: key }));
        // Filter for specific dealer's cars
        callback(all.filter(b => b.dealerId === dealerId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        callback([]);
      }
    });
  },

  subscribeToAllBookings(callback: (bookings: any[]) => void) {
    const bookingsRef = ref(db, 'bookings/all');
    return onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const all = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(all.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        callback([]);
      }
    });
  },

  // --- Real-time Notifications ---
  subscribeToNotifications(userId: string, callback: (notifications: any[]) => void) {
    const notifyRef = ref(db, `notifications/${userId}`);
    return onValue(notifyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const sorted = Object.keys(data)
          .map(key => ({ ...data[key], id: key }))
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        callback(sorted);
      } else {
        callback([]);
      }
    });
  },

  async createNotification(userId: string, notification: { title: string; message: string; type: 'info' | 'success' | 'warning' }) {
    const notifyRef = ref(db, `notifications/${userId}`);
    const newNotifyRef = push(notifyRef);
    await set(newNotifyRef, {
      ...notification,
      read: false,
      time: new Date().toISOString()
    });
  },

  // Helper to notify all users with ADMIN role
  async notifyAllAdmins(notification: { title: string; message: string; type: 'info' | 'success' | 'warning' }) {
    const users = await this.getUsers();
    const admins = users.filter(u => u.role === 'ADMIN');
    const promises = admins.map(admin => this.createNotification(admin.id, notification));
    await Promise.all(promises);
  },

  async markNotificationRead(userId: string, notificationId: string) {
    await update(ref(db, `notifications/${userId}/${notificationId}`), { read: true });
  },

  async clearUserNotifications(userId: string) {
    await remove(ref(db, `notifications/${userId}`));
  }
};
