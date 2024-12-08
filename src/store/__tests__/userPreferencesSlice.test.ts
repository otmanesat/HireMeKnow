import { configureStore } from '@reduxjs/toolkit';
import userPreferencesReducer, {
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
} from '../slices/userPreferencesSlice';

interface TestStore {
  userPreferences: ReturnType<typeof userPreferencesReducer>;
}

describe('User Preferences Slice', () => {
  let store: ReturnType<typeof configureStore<TestStore>>;

  beforeEach(() => {
    store = configureStore({
      reducer: { userPreferences: userPreferencesReducer },
    });
  });

  describe('Initial State', () => {
    it('should have the correct initial state', () => {
      const state = store.getState();
      expect(state.userPreferences).toEqual({
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
      });
    });
  });

  describe('Theme Management', () => {
    it('should set theme', () => {
      store.dispatch(setTheme('dark'));
      expect(store.getState().userPreferences.theme).toBe('dark');

      store.dispatch(setTheme('light'));
      expect(store.getState().userPreferences.theme).toBe('light');
    });
  });

  describe('Notifications', () => {
    it('should toggle notifications', () => {
      const initialState = store.getState().userPreferences.notifications;
      store.dispatch(toggleNotifications());
      expect(store.getState().userPreferences.notifications).toBe(!initialState);

      store.dispatch(toggleNotifications());
      expect(store.getState().userPreferences.notifications).toBe(initialState);
    });
  });

  describe('Language Settings', () => {
    it('should set language', () => {
      store.dispatch(setLanguage('fr'));
      expect(store.getState().userPreferences.language).toBe('fr');

      store.dispatch(setLanguage('es'));
      expect(store.getState().userPreferences.language).toBe('es');
    });
  });

  describe('Job Alerts', () => {
    it('should update job alerts', () => {
      const newAlerts = {
        enabled: false,
        frequency: 'weekly' as const,
      };

      store.dispatch(updateJobAlerts(newAlerts));
      const state = store.getState();
      
      expect(state.userPreferences.jobAlerts.enabled).toBe(false);
      expect(state.userPreferences.jobAlerts.frequency).toBe('weekly');
      // Other properties should remain unchanged
      expect(state.userPreferences.jobAlerts.keywords).toEqual([]);
      expect(state.userPreferences.jobAlerts.locations).toEqual([]);
    });

    it('should manage keywords', () => {
      store.dispatch(addJobAlertKeyword('react'));
      store.dispatch(addJobAlertKeyword('typescript'));
      
      let state = store.getState();
      expect(state.userPreferences.jobAlerts.keywords).toEqual(['react', 'typescript']);

      // Should not add duplicate keywords
      store.dispatch(addJobAlertKeyword('react'));
      state = store.getState();
      expect(state.userPreferences.jobAlerts.keywords).toEqual(['react', 'typescript']);

      store.dispatch(removeJobAlertKeyword('react'));
      state = store.getState();
      expect(state.userPreferences.jobAlerts.keywords).toEqual(['typescript']);
    });

    it('should manage locations', () => {
      store.dispatch(addJobAlertLocation('New York'));
      store.dispatch(addJobAlertLocation('San Francisco'));
      
      let state = store.getState();
      expect(state.userPreferences.jobAlerts.locations).toEqual(['New York', 'San Francisco']);

      // Should not add duplicate locations
      store.dispatch(addJobAlertLocation('New York'));
      state = store.getState();
      expect(state.userPreferences.jobAlerts.locations).toEqual(['New York', 'San Francisco']);

      store.dispatch(removeJobAlertLocation('New York'));
      state = store.getState();
      expect(state.userPreferences.jobAlerts.locations).toEqual(['San Francisco']);
    });
  });

  describe('Display Settings', () => {
    it('should update display settings', () => {
      const newSettings = {
        compactView: true,
        showSalary: false,
      };

      store.dispatch(updateDisplaySettings(newSettings));
      const state = store.getState();
      
      expect(state.userPreferences.displaySettings.compactView).toBe(true);
      expect(state.userPreferences.displaySettings.showSalary).toBe(false);
      // Other properties should remain unchanged
      expect(state.userPreferences.displaySettings.defaultJobSort).toBe('date');
    });
  });

  describe('Reset Preferences', () => {
    it('should reset to initial state while preserving loading and error', () => {
      // Set some non-default values
      store.dispatch(setTheme('dark'));
      store.dispatch(setLanguage('fr'));
      store.dispatch(addJobAlertKeyword('react'));
      store.dispatch(updateDisplaySettings({ compactView: true }));

      // Reset preferences
      store.dispatch(resetPreferences());
      const state = store.getState();

      // Check that values are reset
      expect(state.userPreferences.theme).toBe('light');
      expect(state.userPreferences.language).toBe('en');
      expect(state.userPreferences.jobAlerts.keywords).toEqual([]);
      expect(state.userPreferences.displaySettings.compactView).toBe(false);

      // Check that loading and error states are preserved
      expect(state.userPreferences.isLoading).toBe(false);
      expect(state.userPreferences.error).toBeNull();
    });
  });
}); 