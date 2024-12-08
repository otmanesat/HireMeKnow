import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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
  async (filters: Partial<JobFilters>, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const queryParams = new URLSearchParams();
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.jobType) queryParams.append('type', filters.jobType);
      if (filters.salary) queryParams.append('salary', filters.salary.toString());
      if (filters.searchQuery) queryParams.append('search', filters.searchQuery);

      const response = await fetch(`YOUR_API_URL/jobs?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      return data as Job[];
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Slice
const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<JobFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, clearError } = jobsSlice.actions;
export default jobsSlice.reducer; 