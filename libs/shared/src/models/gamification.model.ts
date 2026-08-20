export interface XpLog {
  id: number;
  action_type: string;
  xp_amount: number;
  description: string;
  created_at: string;
}

export interface ProgressSummary {
  level: number;
  xp: number;
  xp_for_next_level: number;
  xp_progress_percent: number;
  current_streak: number;
  longest_streak: number;
}

export interface Achievement {
  key: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  earned: boolean;
  earned_date?: string;
  progress: number;
  target: number;
}

export interface WeeklyChallenge {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  criteria_type: string;
  criteria_value: number;
  start_date: string;
  end_date: string;
  current_progress: number;
  completed: boolean;
  completed_at?: string;
  progress_percent: number;
}

export interface GamificationDashboard {
  progress: ProgressSummary;
  recent_xp: XpLog[];
  recent_achievements: Achievement[];
  total_achievements: number;
  unlocked_achievements: number;
  active_challenges: WeeklyChallenge[];
}

export interface AwardResult {
  xp_gained: number;
  new_xp_total: number;
  old_level: number;
  new_level: number;
  leveled_up: boolean;
  description: string;
}
