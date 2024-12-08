import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Types
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: number;
  description: string;
  requirements: string[];
  postedDate: string;
}

export interface JobFilters {
  location: string | null;
  jobType: string | null;
  salary: number | null;
  searchQuery: string;
}

export interface JobsState {
  items: Job[];
  filters: JobFilters;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: JobsState = {
  items: [],
  filters: {
    location: null,
    jobType: null,
    salary: null,
    searchQuery: '',
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (filters: Partial<JobsState['filters']>) => {
    const queryParams = new URLSearchParams();
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.jobType) queryParams.append('type', filters.jobType);
    if (filters.salary) queryParams.append('salary', filters.salary.toString());
    if (filters.searchQuery) queryParams.append('q', filters.searchQuery);

    const API_URL = process.env.API_URL || 'http://localhost:3000';
    const response = await fetch(`${API_URL}/jobs${queryParams.toString() ? '?' + queryParams.toString() : ''}`);

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    return response.json();
  }
);

// Slice
const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch jobs';
      });
  },
});

export const { setFilters, clearFilters } = jobsSlice.actions;
export default jobsSlice.reducer; 