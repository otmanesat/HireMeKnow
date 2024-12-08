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
} from '../../store/slices/userPreferencesSlice';

describe('User Preferences Slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: { userPreferences: userPreferencesReducer },
    });
  });

  it('should handle initial state', () => {
    expect(store.getState().userPreferences).toEqual({
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

  it('should handle theme change', () => {
    store.dispatch(setTheme('dark'));
    expect(store.getState().userPreferences.theme).toBe('dark');
  });

  it('should handle notifications toggle', () => {
    const initialState = store.getState().userPreferences.notifications;
    store.dispatch(toggleNotifications());
    expect(store.getState().userPreferences.notifications).toBe(!initialState);
  });

  it('should handle language change', () => {
    store.dispatch(setLanguage('fr'));
    expect(store.getState().userPreferences.language).toBe('fr');
  });

  it('should handle job alerts update', () => {
    const newAlerts = {
      enabled: false,
      frequency: 'weekly' as const,
    };
    store.dispatch(updateJobAlerts(newAlerts));
    expect(store.getState().userPreferences.jobAlerts).toEqual({
      ...store.getState().userPreferences.jobAlerts,
      ...newAlerts,
    });
  });

  it('should handle display settings update', () => {
    const newSettings = {
      compactView: true,
      showSalary: false,
    };
    store.dispatch(updateDisplaySettings(newSettings));
    expect(store.getState().userPreferences.displaySettings).toEqual({
      ...store.getState().userPreferences.displaySettings,
      ...newSettings,
    });
  });

  describe('Job Alert Keywords', () => {
    it('should add keyword', () => {
      store.dispatch(addJobAlertKeyword('React Native'));
      expect(store.getState().userPreferences.jobAlerts.keywords).toContain('React Native');
    });

    it('should not add duplicate keyword', () => {
      store.dispatch(addJobAlertKeyword('React Native'));
      store.dispatch(addJobAlertKeyword('React Native'));
      expect(
        store.getState().userPreferences.jobAlerts.keywords.filter(k => k === 'React Native').length
      ).toBe(1);
    });

    it('should remove keyword', () => {
      store.dispatch(addJobAlertKeyword('React Native'));
      store.dispatch(removeJobAlertKeyword('React Native'));
      expect(store.getState().userPreferences.jobAlerts.keywords).not.toContain('React Native');
    });
  });

  describe('Job Alert Locations', () => {
    it('should add location', () => {
      store.dispatch(addJobAlertLocation('San Francisco'));
      expect(store.getState().userPreferences.jobAlerts.locations).toContain('San Francisco');
    });

    it('should not add duplicate location', () => {
      store.dispatch(addJobAlertLocation('San Francisco'));
      store.dispatch(addJobAlertLocation('San Francisco'));
      expect(
        store.getState().userPreferences.jobAlerts.locations.filter(l => l === 'San Francisco').length
      ).toBe(1);
    });

    it('should remove location', () => {
      store.dispatch(addJobAlertLocation('San Francisco'));
      store.dispatch(removeJobAlertLocation('San Francisco'));
      expect(store.getState().userPreferences.jobAlerts.locations).not.toContain('San Francisco');
    });
  });

  it('should handle preferences reset', () => {
    // First, make some changes
    store.dispatch(setTheme('dark'));
    store.dispatch(setLanguage('fr'));
    store.dispatch(addJobAlertKeyword('React Native'));

    // Then reset
    store.dispatch(resetPreferences());

    // Check if state is back to initial
    expect(store.getState().userPreferences).toEqual({
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