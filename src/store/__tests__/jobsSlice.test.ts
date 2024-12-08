import { configureStore } from '@reduxjs/toolkit';
import jobsReducer, { fetchJobs, setFilters, clearFilters } from '../slices/jobsSlice';
import type { Job } from '../slices/jobsSlice';

// Mock fetch
global.fetch = jest.fn();

describe('Jobs Slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: { jobs: jobsReducer },
    });
    (fetch as jest.Mock).mockClear();
  });

  describe('Initial State', () => {
    it('should have the correct initial state', () => {
      const state = store.getState().jobs;
      expect(state).toEqual({
        items: [],
        filters: {
          location: null,
          jobType: null,
          salary: null,
          searchQuery: '',
        },
        isLoading: false,
        error: null,
      });
    });
  });

  describe('Fetch Jobs', () => {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'San Francisco',
        type: 'full-time',
        salary: 120000,
        description: 'Great job opportunity',
        requirements: ['React', 'Node.js'],
        postedDate: '2024-01-08',
      },
    ];

    it('should handle successful jobs fetch', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJobs),
      });

      await store.dispatch(fetchJobs({}));
      const state = store.getState().jobs;

      expect(state.items).toEqual(mockJobs);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle jobs fetch with filters', async () => {
      const filters = {
        location: 'San Francisco',
        jobType: 'full-time',
        salary: 100000,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJobs),
      });

      await store.dispatch(fetchJobs(filters));
      
      // Verify that the URL includes the correct query parameters
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('location=San%20Francisco')
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('type=full-time')
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('salary=100000')
      );
    });

    it('should handle fetch failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await store.dispatch(fetchJobs({}));
      const state = store.getState().jobs;

      expect(state.items).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch jobs');
    });

    it('should handle network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await store.dispatch(fetchJobs({}));
      const state = store.getState().jobs;

      expect(state.items).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });

  describe('Filter Management', () => {
    it('should update filters', () => {
      const newFilters = {
        location: 'New York',
        jobType: 'remote',
      };

      store.dispatch(setFilters(newFilters));
      const state = store.getState().jobs;

      expect(state.filters).toEqual({
        ...state.filters,
        ...newFilters,
      });
    });

    it('should clear filters', () => {
      // Set some filters first
      store.dispatch(setFilters({
        location: 'London',
        jobType: 'contract',
      }));

      // Then clear them
      store.dispatch(clearFilters());
      const state = store.getState().jobs;

      expect(state.filters).toEqual({
        location: null,
        jobType: null,
        salary: null,
        searchQuery: '',
      });
    });
  });

  describe('Loading States', () => {
    it('should set loading state during fetch', () => {
      store.dispatch({ type: 'jobs/fetchJobs/pending' });
      const loadingState = store.getState().jobs;
      expect(loadingState.isLoading).toBe(true);
      expect(loadingState.error).toBeNull();
    });

    it('should clear loading state after fetch', () => {
      store.dispatch({ type: 'jobs/fetchJobs/fulfilled', payload: [] });
      const state = store.getState().jobs;
      expect(state.isLoading).toBe(false);
    });
  });
}); 