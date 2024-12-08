import {
  selectUser,
  selectIsAuthenticated,
  selectAllJobs,
  selectFilteredJobs,
  selectAllApplications,
  selectApplicationsByStatus,
  selectApplicationsByJob,
  selectJobWithApplicationStatus,
  selectUserStats,
} from '../selectors';
import type { RootState } from '../store';
import type { Job } from '../slices/jobsSlice';
import type { Application } from '../slices/applicationsSlice';

describe('Redux Selectors', () => {
  describe('Auth Selectors', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    };

    it('should select user', () => {
      const state = {
        auth: { user: mockUser, token: 'token', isLoading: false, error: null },
      } as RootState;

      expect(selectUser(state)).toEqual(mockUser);
    });

    it('should determine authentication status', () => {
      const authenticatedState = {
        auth: { user: mockUser, token: 'token', isLoading: false, error: null },
      } as RootState;

      const unauthenticatedState = {
        auth: { user: null, token: null, isLoading: false, error: null },
      } as RootState;

      expect(selectIsAuthenticated(authenticatedState)).toBe(true);
      expect(selectIsAuthenticated(unauthenticatedState)).toBe(false);
    });
  });

  describe('Jobs Selectors', () => {
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

    const state = {
      jobs: {
        items: mockJobs,
        filters: {
          location: null,
          jobType: null,
          salary: null,
          searchQuery: '',
        },
        isLoading: false,
        error: null,
      },
    } as RootState;

    it('should select all jobs', () => {
      expect(selectAllJobs(state)).toEqual(mockJobs);
    });

    it('should filter jobs by search query', () => {
      const stateWithSearch = {
        ...state,
        jobs: {
          ...state.jobs,
          filters: { ...state.jobs.filters, searchQuery: 'frontend' },
        },
      } as RootState;

      const filtered = selectFilteredJobs(stateWithSearch);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Frontend Developer');
    });

    it('should filter jobs by location', () => {
      const stateWithLocation = {
        ...state,
        jobs: {
          ...state.jobs,
          filters: { ...state.jobs.filters, location: 'Remote' },
        },
      } as RootState;

      const filtered = selectFilteredJobs(stateWithLocation);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].location).toBe('Remote');
    });
  });

  describe('Applications Selectors', () => {
    const mockApplications: Application[] = [
      {
        id: '1',
        jobId: 'job1',
        userId: 'user1',
        status: 'pending',
        appliedDate: '2024-01-08',
        resume: 'resume1.pdf',
      },
      {
        id: '2',
        jobId: 'job2',
        userId: 'user1',
        status: 'accepted',
        appliedDate: '2024-01-08',
        resume: 'resume2.pdf',
      },
    ];

    const state = {
      applications: {
        items: mockApplications,
        isLoading: false,
        error: null,
      },
    } as RootState;

    it('should select all applications', () => {
      expect(selectAllApplications(state)).toEqual(mockApplications);
    });

    it('should select applications by status', () => {
      const pendingApps = selectApplicationsByStatus(state, 'pending');
      expect(pendingApps).toHaveLength(1);
      expect(pendingApps[0].status).toBe('pending');

      const acceptedApps = selectApplicationsByStatus(state, 'accepted');
      expect(acceptedApps).toHaveLength(1);
      expect(acceptedApps[0].status).toBe('accepted');
    });

    it('should select applications by job', () => {
      const jobApps = selectApplicationsByJob(state, 'job1');
      expect(jobApps).toHaveLength(1);
      expect(jobApps[0].jobId).toBe('job1');
    });
  });

  describe('Combined Selectors', () => {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Developer',
        company: 'Tech Co',
        location: 'New York',
        type: 'full-time',
        salary: 100000,
        description: 'Role description',
        requirements: ['React'],
        postedDate: '2024-01-08',
      },
    ];

    const mockApplications: Application[] = [
      {
        id: 'app1',
        jobId: '1',
        userId: 'user1',
        status: 'pending',
        appliedDate: '2024-01-08',
        resume: 'resume.pdf',
      },
    ];

    const state = {
      jobs: { items: mockJobs, filters: {}, isLoading: false, error: null },
      applications: { items: mockApplications, isLoading: false, error: null },
    } as RootState;

    it('should combine job and application status', () => {
      const jobWithStatus = selectJobWithApplicationStatus(state, '1');
      expect(jobWithStatus).toEqual({
        ...mockJobs[0],
        applicationStatus: 'pending',
        applicationId: 'app1',
      });
    });

    it('should calculate user stats', () => {
      const stats = selectUserStats(state);
      expect(stats).toEqual({
        total: 1,
        pending: 1,
        reviewed: 0,
        accepted: 0,
        rejected: 0,
      });
    });
  });
}); 