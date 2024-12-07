import axios from 'axios';

const api = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.API_KEY}`,
  },
});

export const ApiService = {
  get: async <T>(endpoint: string) => {
    const response = await api.get<T>(endpoint);
    return response.data;
  },
  
  post: async <T>(endpoint: string, data: any) => {
    const response = await api.post<T>(endpoint, data);
    return response.data;
  },
}; 