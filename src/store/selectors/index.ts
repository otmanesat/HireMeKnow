import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import type { Job } from '../slices/jobsSlice';
import type { Application } from '../slices/applicationsSlice';

// Auth selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

// Jobs selectors
export const selectAllJobs = (state: RootState) => state.jobs.items;
export const selectJobsLoading = (state: RootState) => state.jobs.isLoading;
export const selectJobsError = (state: RootState) => state.jobs.error;
export const selectJobsFilters = (state: RootState) => state.jobs.filters;

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
export const selectAllApplications = (state: RootState) => state.applications.items;
export const selectApplicationsLoading = (state: RootState) => state.applications.isLoading;
export const selectApplicationsError = (state: RootState) => state.applications.error;

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
export const selectTheme = (state: RootState) => state.userPreferences.theme;
export const selectNotifications = (state: RootState) => state.userPreferences.notifications;
export const selectLanguage = (state: RootState) => state.userPreferences.language;
export const selectJobAlerts = (state: RootState) => state.userPreferences.jobAlerts;
export const selectDisplaySettings = (state: RootState) => state.userPreferences.displaySettings;

// Combined selectors
export const selectJobWithApplicationStatus = createSelector(
  [selectAllJobs, selectAllApplications, (_, jobId: string) => jobId],
  (jobs: Job[], applications: Application[], jobId: string) => {
    const job = jobs.find((j: Job) => j.id === jobId);
    const application = applications.find((a: Application) => a.jobId === jobId);
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
      pending: applications.filter((app: Application) => app.status === 'pending').length,
      reviewed: applications.filter((app: Application) => app.status === 'reviewed').length,
      accepted: applications.filter((app: Application) => app.status === 'accepted').length,
      rejected: applications.filter((app: Application) => app.status === 'rejected').length,
    };
  }
); 