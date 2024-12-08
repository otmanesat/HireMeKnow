import { configureStore } from '@reduxjs/toolkit';
import jobsReducer, { fetchJobs, setFilters, clearFilters } from '../slices/jobsSlice';
import type { Job } from '../slices/jobsSlice';

// Mock fetch
global.fetch = jest.fn();

interface TestStore {
  jobs: ReturnType<typeof jobsReducer>;
}

describe('Jobs Slice', () => {
  let store: ReturnType<typeof configureStore<TestStore>>;

  beforeEach(() => {
    store = configureStore({
      reducer: { jobs: jobsReducer },
    });
    (fetch as jest.Mock).mockClear();
  });

  describe('Initial State', () => {
    it('should have the correct initial state', () => {
      const state = store.getState();
      expect(state.jobs).toEqual({
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
        title: 'Frontend Developer',
        company: 'Tech Co',
        location: 'New York',
        type: 'full-time',
        salary: 100000,
        description: 'Frontend role',
        requirements: ['React'],
        postedDate: '2024-01-08',
      },
      {
        id: '2',
        title: 'Backend Developer',
        company: 'Tech Co',
        location: 'Remote',
        type: 'contract',
        salary: 120000,
        description: 'Backend role',
        requirements: ['Node.js'],
        postedDate: '2024-01-08',
      },
    ];

    it('should handle successful jobs fetch', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJobs),
      });

      await store.dispatch(fetchJobs({}));
      const state = store.getState();

      expect(state.jobs.items).toEqual(mockJobs);
      expect(state.jobs.isLoading).toBe(false);
      expect(state.jobs.error).toBeNull();
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
      const state = store.getState();

      expect(state.jobs.items).toEqual([]);
      expect(state.jobs.isLoading).toBe(false);
      expect(state.jobs.error).toBe('Failed to fetch jobs');
    });

    it('should handle network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await store.dispatch(fetchJobs({}));
      const state = store.getState();

      expect(state.jobs.items).toEqual([]);
      expect(state.jobs.isLoading).toBe(false);
      expect(state.jobs.error).toBe('Network error');
    });
  });

  describe('Filter Management', () => {
    it('should update filters', () => {
      const newFilters = {
        location: 'New York',
        jobType: 'remote',
      };

      store.dispatch(setFilters(newFilters));
      const state = store.getState();

      expect(state.jobs.filters).toEqual({
        ...state.jobs.filters,
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
      const state = store.getState();

      expect(state.jobs.filters).toEqual({
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
      const loadingState = store.getState();
      expect(loadingState.jobs.isLoading).toBe(true);
      expect(loadingState.jobs.error).toBeNull();
    });

    it('should clear loading state after fetch', () => {
      store.dispatch({ type: 'jobs/fetchJobs/fulfilled', payload: [] });
      const state = store.getState();
      expect(state.jobs.isLoading).toBe(false);
    });
  });
}); 