import { configureStore } from '@reduxjs/toolkit';
import jobsReducer, { fetchJobs } from '../slices/jobsSlice';

describe('Jobs Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { jobs: jobsReducer },
    });
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );
  });

  describe('Fetch Jobs', () => {
    it('should handle successful jobs fetch', async () => {
      const mockJobs = [{ id: '1', title: 'Developer' }];
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJobs),
      });

      await store.dispatch(fetchJobs({}));
      
      const state = store.getState().jobs;
      expect(state.items).toEqual(mockJobs);
      expect(state.isLoading).toBeFalsy();
      expect(state.error).toBeNull();
    });

    it('should handle jobs fetch with filters', async () => {
      const filters = {
        location: 'San Francisco',
        jobType: 'full-time',
        salary: 100000,
      };

      await store.dispatch(fetchJobs(filters));
      
      // Verify that the URL includes the correct query parameters
      const expectedUrl = 'http://localhost:3000/jobs?location=San+Francisco&type=full-time&salary=100000';
      expect(fetch).toHaveBeenCalledWith(expectedUrl);
    });

    it('should handle fetch failure', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await store.dispatch(fetchJobs({}));
      
      const state = store.getState().jobs;
      expect(state.items).toEqual([]);
      expect(state.isLoading).toBeFalsy();
      expect(state.error).toBe('Failed to fetch jobs');
    });

    it('should handle network error', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

      await store.dispatch(fetchJobs({}));
      
      const state = store.getState().jobs;
      expect(state.items).toEqual([]);
      expect(state.isLoading).toBeFalsy();
      expect(state.error).toBe('Network error');
    });
  });
}); 