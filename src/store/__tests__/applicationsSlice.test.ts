import { configureStore } from '@reduxjs/toolkit';
import applicationsReducer, {
  fetchApplications,
  submitApplication,
  updateApplicationStatus,
} from '../slices/applicationsSlice';
import type { Application } from '../slices/applicationsSlice';

// Mock fetch
global.fetch = jest.fn();

describe('Applications Slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: { applications: applicationsReducer },
    });
    (fetch as jest.Mock).mockClear();
  });

  describe('Initial State', () => {
    it('should have the correct initial state', () => {
      const state = store.getState().applications;
      expect(state).toEqual({
        items: [],
        isLoading: false,
        error: null,
      });
    });
  });

  describe('Fetch Applications', () => {
    const mockApplications: Application[] = [
      {
        id: '1',
        jobId: 'job1',
        userId: 'user1',
        status: 'pending',
        appliedDate: '2024-01-08',
        resume: 'resume.pdf',
        coverLetter: 'cover-letter.pdf',
      },
    ];

    it('should handle successful applications fetch', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApplications),
      });

      await store.dispatch(fetchApplications('user1'));
      const state = store.getState().applications;

      expect(state.items).toEqual(mockApplications);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await store.dispatch(fetchApplications('user1'));
      const state = store.getState().applications;

      expect(state.items).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch applications');
    });
  });

  describe('Submit Application', () => {
    const mockApplication = {
      jobId: 'job1',
      userId: 'user1',
      resume: 'resume.pdf',
      coverLetter: 'cover-letter.pdf',
    };

    const mockResponse: Application = {
      ...mockApplication,
      id: '1',
      status: 'pending',
      appliedDate: '2024-01-08',
    };

    it('should handle successful application submission', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await store.dispatch(submitApplication(mockApplication));
      const state = store.getState().applications;

      expect(state.items).toContainEqual(mockResponse);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle submission failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await store.dispatch(submitApplication(mockApplication));
      const state = store.getState().applications;

      expect(state.items).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to submit application');
    });
  });

  describe('Update Application Status', () => {
    it('should update application status', () => {
      // First add an application
      store.dispatch({
        type: 'applications/submitApplication/fulfilled',
        payload: {
          id: '1',
          jobId: 'job1',
          userId: 'user1',
          status: 'pending',
          appliedDate: '2024-01-08',
          resume: 'resume.pdf',
        },
      });

      // Then update its status
      store.dispatch(updateApplicationStatus({
        id: '1',
        status: 'accepted',
      }));

      const state = store.getState().applications;
      const updatedApplication = state.items.find(app => app.id === '1');
      expect(updatedApplication?.status).toBe('accepted');
    });

    it('should not update status for non-existent application', () => {
      store.dispatch(updateApplicationStatus({
        id: 'non-existent',
        status: 'accepted',
      }));

      const state = store.getState().applications;
      expect(state.items).toEqual([]);
    });
  });

  describe('Loading States', () => {
    it('should handle loading states for fetch applications', () => {
      store.dispatch({ type: 'applications/fetchApplications/pending' });
      expect(store.getState().applications.isLoading).toBe(true);

      store.dispatch({ type: 'applications/fetchApplications/fulfilled', payload: [] });
      expect(store.getState().applications.isLoading).toBe(false);
    });

    it('should handle loading states for submit application', () => {
      store.dispatch({ type: 'applications/submitApplication/pending' });
      expect(store.getState().applications.isLoading).toBe(true);

      store.dispatch({ type: 'applications/submitApplication/fulfilled', payload: {
        id: '1',
        jobId: 'job1',
        userId: 'user1',
        status: 'pending',
        appliedDate: '2024-01-08',
        resume: 'resume.pdf',
      }});
      expect(store.getState().applications.isLoading).toBe(false);
    });
  });
}); 