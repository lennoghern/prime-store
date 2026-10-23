// ==========================================
// Prime Store - Hash Router
// ==========================================

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    window.addEventListener('hashchange', () => this._handleRoute());
    window.addEventListener('load', () => this._handleRoute());
  }

  on(path, handler) {
    this.routes[path] = handler;
    return this;
  }

  _handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, ...params] = hash.split('/').filter(Boolean);
    const route = '/' + (path || '');

    if (this.routes[route]) {
      this.currentRoute = route;
      this.routes[route](params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (this.routes['/']) {
      this.currentRoute = '/';
      this.routes['/'](params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  navigate(path) {
    window.location.hash = path;
  }

  getCurrentRoute() {
    return this.currentRoute;
  }
}

export const router = new Router();
