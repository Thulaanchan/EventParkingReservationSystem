export type AuthRole = 'Customer' | 'Administrator';

export const AuthRoles = {
  Customer: 'Customer' as const,
  Administrator: 'Administrator' as const
} as const;
