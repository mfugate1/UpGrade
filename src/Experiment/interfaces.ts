export interface IEnrollmentCompleteCondition {
  userCount: number;
  groupCount: number;
}

interface IConditionEnrollmentStats {
  id: string;
  user: number;
  group: number;
}

interface ISegmentEnrollmentStats {
  id: string;
  user: number;
  group: number;
  conditions: IConditionEnrollmentStats[];
}

export interface IExperimentEnrollmentStats {
  id: string;
  users: number;
  group: number;
  userExcluded: number;
  groupExcluded?: number;
  conditions: IConditionEnrollmentStats[];
  segments: ISegmentEnrollmentStats[];
}
