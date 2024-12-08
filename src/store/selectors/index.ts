import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import type { Job } from '../slices/jobsSlice';
import type { Application } from '../slices/applicationsSlice';

// Auth selectors
export const selectUser = (state: RootState) => state._persist ? state.auth.user : null;
export const selectIsAuthenticated = (state: RootState) => state._persist ? !!state.auth.token : false;
export const selectAuthLoading = (state: RootState) => state._persist ? state.auth.isLoading : false;
export const selectAuthError = (state: RootState) => state._persist ? state.auth.error : null;

// Jobs selectors
export const selectAllJobs = (state: RootState) => state._persist ? state.jobs.items : [];
export const selectJobsLoading = (state: RootState) => state._persist ? state.jobs.isLoading : false;
export const selectJobsError = (state: RootState) => state._persist ? state.jobs.error : null;
export const selectJobsFilters = (state: RootState) => state._persist ? state.jobs.filters : {
  location: null,
  jobType: null,
  salary: null,
  searchQuery: '',
};

export const selectFilteredJobs = createSelector(
  [selectAllJobs, selectJobsFilters],
  (jobs: Job[], filters) => {
    return jobs.filter((job: Job) => {
      if (filters.location && job.location !== filters.location) return false;
      if (filters.jobType && job.type !== filters.jobType) return false;
      if (filters.salary && job.salary < filters.salary) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }
);

// Applications selectors
export const selectAllApplications = (state: RootState) => state._persist ? state.applications.items : [];
export const selectApplicationsLoading = (state: RootState) => state._persist ? state.applications.isLoading : false;
export const selectApplicationsError = (state: RootState) => state._persist ? state.applications.error : null;

export const selectApplicationsByStatus = createSelector(
  [selectAllApplications, (_, status: Application['status']) => status],
  (applications: Application[], status: Application['status']) => 
    applications.filter((app: Application) => app.status === status)
);

export const selectApplicationsByJob = createSelector(
  [selectAllApplications, (_, jobId: string) => jobId],
  (applications: Application[], jobId: string) => 
    applications.filter((app: Application) => app.jobId === jobId)
);

// User preferences selectors
export const selectTheme = (state: RootState) => state._persist ? state.userPreferences.theme : 'light';
export const selectNotifications = (state: RootState) => state._persist ? state.userPreferences.notifications : true;
export const selectLanguage = (state: RootState) => state._persist ? state.userPreferences.language : 'en';
export const selectJobAlerts = (state: RootState) => state._persist ? state.userPreferences.jobAlerts : {
  enabled: true,
  frequency: 'daily' as const,
  keywords: [],
  locations: [],
};
export const selectDisplaySettings = (state: RootState) => state._persist ? state.userPreferences.displaySettings : {
  compactView: false,
  showSalary: true,
  defaultJobSort: 'date' as const,
};

// Combined selectors
export const selectJobWithApplicationStatus = createSelector(
  [selectAllJobs, selectAllApplications, (_, jobId: string) => jobId],
  (jobs: Job[], applications: Application[], jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    const application = applications.find(a => a.jobId === jobId);
    return {
      ...job,
      applicationStatus: application?.status || null,
      applicationId: application?.id || null,
    };
  }
);

export const selectUserStats = createSelector(
  [selectAllApplications],
  (applications: Application[]) => {
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      reviewed: applications.filter(app => app.status === 'reviewed').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };
  }
); 