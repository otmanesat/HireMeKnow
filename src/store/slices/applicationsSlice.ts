import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedDate: string;
  resume: string;
  coverLetter?: string;
  notes?: string;
}

interface ApplicationsState {
  items: Application[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ApplicationsState = {
  items: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchApplications = createAsyncThunk(
  'applications/fetchApplications',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`YOUR_API_URL/applications?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      return data as Application[];
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const submitApplication = createAsyncThunk(
  'applications/submitApplication',
  async (application: Omit<Application, 'id' | 'status' | 'appliedDate'>, { rejectWithValue }) => {
    try {
      const response = await fetch('YOUR_API_URL/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...application,
          status: 'pending',
          appliedDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const data = await response.json();
      return data as Application;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Slice
const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateApplicationStatus: (state, action: PayloadAction<{ id: string; status: Application['status'] }>) => {
      const application = state.items.find(app => app.id === action.payload.id);
      if (application) {
        application.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch applications
      .addCase(fetchApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action: PayloadAction<Application[]>) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Submit application
      .addCase(submitApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitApplication.fulfilled, (state, action: PayloadAction<Application>) => {
        state.isLoading = false;
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateApplicationStatus } = applicationsSlice.actions;
export default applicationsSlice.reducer; 