import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
  jobAlerts: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'never';
    keywords: string[];
    locations: string[];
  };
  displaySettings: {
    compactView: boolean;
    showSalary: boolean;
    defaultJobSort: 'date' | 'relevance' | 'salary';
  };
}

interface UserPreferencesState extends UserPreferences {
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserPreferencesState = {
  theme: 'light',
  notifications: true,
  language: 'en',
  jobAlerts: {
    enabled: true,
    frequency: 'daily',
    keywords: [],
    locations: [],
  },
  displaySettings: {
    compactView: false,
    showSalary: true,
    defaultJobSort: 'date',
  },
  isLoading: false,
  error: null,
};

// Slice
const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    updateJobAlerts: (state, action: PayloadAction<Partial<UserPreferences['jobAlerts']>>) => {
      state.jobAlerts = { ...state.jobAlerts, ...action.payload };
    },
    updateDisplaySettings: (state, action: PayloadAction<Partial<UserPreferences['displaySettings']>>) => {
      state.displaySettings = { ...state.displaySettings, ...action.payload };
    },
    addJobAlertKeyword: (state, action: PayloadAction<string>) => {
      if (!state.jobAlerts.keywords.includes(action.payload)) {
        state.jobAlerts.keywords.push(action.payload);
      }
    },
    removeJobAlertKeyword: (state, action: PayloadAction<string>) => {
      state.jobAlerts.keywords = state.jobAlerts.keywords.filter(
        keyword => keyword !== action.payload
      );
    },
    addJobAlertLocation: (state, action: PayloadAction<string>) => {
      if (!state.jobAlerts.locations.includes(action.payload)) {
        state.jobAlerts.locations.push(action.payload);
      }
    },
    removeJobAlertLocation: (state, action: PayloadAction<string>) => {
      state.jobAlerts.locations = state.jobAlerts.locations.filter(
        location => location !== action.payload
      );
    },
    resetPreferences: (state) => {
      return { ...initialState, isLoading: state.isLoading, error: state.error };
    },
  },
});

export const {
  setTheme,
  toggleNotifications,
  setLanguage,
  updateJobAlerts,
  updateDisplaySettings,
  addJobAlertKeyword,
  removeJobAlertKeyword,
  addJobAlertLocation,
  removeJobAlertLocation,
  resetPreferences,
} = userPreferencesSlice.actions;

export default userPreferencesSlice.reducer; 