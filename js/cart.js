// ==========================================
// Prime Store - Cart Manager
// ==========================================

const CART_KEY = 'prime_store_cart';

class CartManager {
  constructor() {
    this.items = this._load();
    this.listeners = [];
  }

  _load() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  _save() {
    localStorage.setItem(CART_KEY, JSON.stringify(this.items));
    this._notify();
  }

  _notify() {
    this.listeners.forEach(fn => fn(this.items, this.getTotal(), this.getCount()));
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  add(product, quantity = 1) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        priceRange: product.priceRange,
        image: product.image,
        quantity,
      });
    }
    this._save();
  }

  remove(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this._save();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.remove(productId);
        return;
      }
    }
    this._save();
  }

  clear() {
    this.items = [];
    this._save();
  }

  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotal() {
    return this.items.reduce((sum, item) => {
      if (item.price) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);
  }

  getItems() {
    return [...this.items];
  }
}

export const cart = new CartManager();
