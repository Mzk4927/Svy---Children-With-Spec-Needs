const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  setTokens(token, refreshToken) {
    const effectiveRefreshToken = refreshToken || token;
    this.token = token;
    this.refreshToken = effectiveRefreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', effectiveRefreshToken);
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  async handleResponse(response) {
    if (!response.ok) {
      if (response.status === 401) {
        const isLoginOrRegister =
          response.url.includes('/auth/login') || response.url.includes('/auth/register');

        if (isLoginOrRegister) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || 'Invalid credentials');
        }

        const refreshed = this.refreshToken ? await this.refreshAccessToken() : false;
        if (refreshed) return { __retry: true };
        this.clearTokens();
        window.location.href = '/';
        throw new Error('Session expired');
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'API request failed');
    }
    return response.json();
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
  }

  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await this.handleResponse(response);
    this.setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async register(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async logout() {
    this.clearTokens();
  }

  async getRecords(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/records${query ? '?' + query : ''}`, {
      headers: this.getHeaders(),
    });
    const data = await this.handleResponse(response);
    if (data && data.__retry) return this.getRecords(params);
    return data;
  }

  async getRecordById(id) {
    const response = await fetch(`${API_URL}/records/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await this.handleResponse(response);
    if (data && data.__retry) return this.getRecordById(id);
    return data;
  }

  async createRecord(recordData) {
    const response = await fetch(`${API_URL}/records`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(recordData),
    });
    const data = await this.handleResponse(response);
    if (data && data.__retry) return this.createRecord(recordData);
    return data;
  }

  async updateRecord(id, recordData) {
    const response = await fetch(`${API_URL}/records/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(recordData),
    });
    const data = await this.handleResponse(response);
    if (data && data.__retry) return this.updateRecord(id, recordData);
    return data;
  }

  async updateTreatmentStatus(id, treatmentStatus) {
    return this.updateRecord(id, { treatmentStatus });
  }

  async deleteRecord(id) {
    const response = await fetch(`${API_URL}/records/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const data = await this.handleResponse(response);
    if (data && data.__retry) return this.deleteRecord(id);
    return data;
  }

  async searchRecords(query) {
    const response = await fetch(`${API_URL}/records/search?q=${encodeURIComponent(query)}`, {
      headers: this.getHeaders(),
    });
    const data = await this.handleResponse(response);
    if (data && data.__retry) return this.searchRecords(query);
    return data;
  }

  async getStatistics() {
    const response = await fetch(`${API_URL}/stats`, {
      headers: this.getHeaders(),
    });
    const data = await this.handleResponse(response);
    if (data && data.__retry) return this.getStatistics();
    return data;
  }

  async getCategories() {
    const response = await fetch(`${API_URL}/categories`, {
      headers: this.getHeaders(),
    });
    const data = await this.handleResponse(response);
    if (data && data.__retry) return this.getCategories();
    return data;
  }

  async createCategory(payload) {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await this.handleResponse(response);
    if (data && data.__retry) return this.createCategory(payload);
    return data;
  }

  async getRecordReviews(recordId) {
    const response = await fetch(`${API_URL}/records/${recordId}/reviews`, {
      headers: this.getHeaders(),
    });
    const data = await this.handleResponse(response);
    if (data && data.__retry) return this.getRecordReviews(recordId);
    return data;
  }

  async addRecordReview(recordId, payload) {
    const response = await fetch(`${API_URL}/records/${recordId}/reviews`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await this.handleResponse(response);
    if (data && data.__retry) return this.addRecordReview(recordId, payload);
    return data;
  }

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: formData,
    });
    const data = await this.handleResponse(response);
    if (data && data.__retry) return this.uploadImage(file);
    return data;
  }
}

export default new ApiService();
