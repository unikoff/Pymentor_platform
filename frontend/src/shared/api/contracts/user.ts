export type UserProfile = {
  id: number;
  username: string;
  email: string;
  subscription_until?: string | null;
  subscription_plan?: string | null;
  has_active_subscription?: boolean;
  is_admin?: boolean;
};
