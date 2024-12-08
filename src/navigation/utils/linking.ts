import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../types';

/**
 * Deep linking configuration for the application
 * Supports both app scheme (hiremekow://) and universal links (https://hiremekow.com)
 */
export const linkingConfiguration: LinkingOptions<RootStackParamList> = {
  prefixes: ['hiremekow://', 'https://hiremekow.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Jobs: {
            path: 'jobs',
            screens: {
              JobsList: '',
              JobDetails: {
                path: ':jobId',
                parse: {
                  jobId: (jobId: string) => jobId,
                },
              },
            },
          },
          Applications: {
            path: 'applications',
            screens: {
              ApplicationsList: '',
              ApplicationDetails: {
                path: ':applicationId',
                parse: {
                  applicationId: (id: string) => id,
                },
              },
            },
          },
          Profile: 'profile',
          Messages: {
            path: 'messages',
            screens: {
              MessagesList: '',
              Chat: {
                path: ':chatId',
                parse: {
                  chatId: (id: string) => id,
                },
              },
            },
          },
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
    },
  },
  // Custom function to get the navigation state from the path
  getStateFromPath: (path, options) => {
    // Add custom path processing logic here if needed
    return options.getStateFromPath(path, options);
  },
  // Custom function to get the path from the navigation state
  getPathFromState: (state, options) => {
    // Add custom state processing logic here if needed
    return options.getPathFromState(state, options);
  },
}; 