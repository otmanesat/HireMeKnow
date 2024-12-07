/**
 * Navigation Types for HireMeKnow Application
 */

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Jobs: undefined;
  JobDetails: { jobId: string };
  Applications: undefined;
  Profile: undefined;
  Messages: undefined;
};

export type MainTabParamList = {
  Jobs: undefined;
  Applications: undefined;
  Profile: undefined;
  Messages: undefined;
};

// Navigation props types
export type RootStackNavigationProp = NavigationProp<RootStackParamList>;
export type AuthStackNavigationProp = NavigationProp<AuthStackParamList>;
export type MainStackNavigationProp = NavigationProp<MainStackParamList>;
export type MainTabNavigationProp = NavigationProp<MainTabParamList>;

// Route props types
export type RootStackRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;
export type AuthStackRouteProp<T extends keyof AuthStackParamList> = RouteProp<AuthStackParamList, T>;
export type MainStackRouteProp<T extends keyof MainStackParamList> = RouteProp<MainStackParamList, T>;
export type MainTabRouteProp<T extends keyof MainTabParamList> = RouteProp<MainTabParamList, T>; 