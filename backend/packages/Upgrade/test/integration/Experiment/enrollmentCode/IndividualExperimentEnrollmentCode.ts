import Container from 'typedi';
import { ExperimentService } from '../../../../src/api/services/ExperimentService';
import { UserService } from '../../../../src/api/services/UserService';
import { systemUser } from '../../mockData/user/index';
import { individualAssignmentExperiment } from '../../mockData/experiment/index';
import { getAllExperimentCondition, markExperimentPoint } from '../../utils';
import {
  checkMarkExperimentPointForUser,
  checkExperimentAssignedIsNull,
  checkExperimentAssignedIsNotDefault,
} from '../../utils/index';
import { experimentUsers } from '../../mockData/experimentUsers/index';
import { EXPERIMENT_STATE, ENROLLMENT_CODE } from 'upgrade_types';

export default async function testCase(): Promise<void> {
  const experimentService = Container.get<ExperimentService>(ExperimentService);
  const userService = Container.get<UserService>(UserService);

  // creating new user
  const user = await userService.upsertUser(systemUser as any);

  // experiment object
  const experimentObject = individualAssignmentExperiment;

  // create experiment
  await experimentService.create(experimentObject as any, user);
  let experiments = await experimentService.find();
  expect(experiments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: experimentObject.name,
        state: experimentObject.state,
        postExperimentRule: experimentObject.postExperimentRule,
        assignmentUnit: experimentObject.assignmentUnit,
        consistencyRule: experimentObject.consistencyRule,
      }),
    ])
  );

  const experimentName = experimentObject.partitions[0].expId;
  const experimentPoint = experimentObject.partitions[0].expPoint;
  const condition = experimentObject.conditions[0].conditionCode;

  // get all experiment condition for user 1
  let experimentConditionAssignments = await getAllExperimentCondition(experimentUsers[0].id);
  expect(experimentConditionAssignments).toHaveLength(0);

  // mark experiment point
  let markedExperimentPoint = await markExperimentPoint(experimentUsers[0].id, experimentName, experimentPoint, condition);
  checkMarkExperimentPointForUser(
    markedExperimentPoint,
    experimentUsers[0].id,
    experimentName,
    experimentPoint,
    1,
    null
  );

  // get all experiment condition for user 2
  experimentConditionAssignments = await getAllExperimentCondition(experimentUsers[1].id);
  expect(experimentConditionAssignments).toHaveLength(0);

  // mark experiment point for user 2
  markedExperimentPoint = await markExperimentPoint(experimentUsers[1].id, experimentName, experimentPoint, condition);
  checkMarkExperimentPointForUser(
    markedExperimentPoint,
    experimentUsers[1].id,
    experimentName,
    experimentPoint,
    1,
    null
  );

  // change experiment status to Enrolling
  const experimentId = experiments[0].id;
  await experimentService.updateState(experimentId, EXPERIMENT_STATE.ENROLLING, user);

  // fetch experiment
  experiments = await experimentService.find();
  expect(experiments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: experimentObject.name,
        state: EXPERIMENT_STATE.ENROLLING,
        postExperimentRule: experimentObject.postExperimentRule,
        assignmentUnit: experimentObject.assignmentUnit,
        consistencyRule: experimentObject.consistencyRule,
      }),
    ])
  );

  // get all experiment condition for user 1
  experimentConditionAssignments = await getAllExperimentCondition(experimentUsers[0].id);
  checkExperimentAssignedIsNull(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 1
  markedExperimentPoint = await markExperimentPoint(experimentUsers[0].id, experimentName, experimentPoint, condition);
  checkMarkExperimentPointForUser(
    markedExperimentPoint,
    experimentUsers[0].id,
    experimentName,
    experimentPoint,
    2,
    ENROLLMENT_CODE.PARTICIPANT_ON_EXCLUSION_LIST
  );

  // get all experiment condition for user 2
  experimentConditionAssignments = await getAllExperimentCondition(experimentUsers[1].id);
  checkExperimentAssignedIsNull(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 2
  markedExperimentPoint = await markExperimentPoint(experimentUsers[1].id, experimentName, experimentPoint, condition);
  checkMarkExperimentPointForUser(
    markedExperimentPoint,
    experimentUsers[1].id,
    experimentName,
    experimentPoint,
    2,
    ENROLLMENT_CODE.PARTICIPANT_ON_EXCLUSION_LIST
  );

  // get all experiment condition for user 3
  experimentConditionAssignments = await getAllExperimentCondition(experimentUsers[2].id);
  checkExperimentAssignedIsNotDefault(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 3
  markedExperimentPoint = await markExperimentPoint(experimentUsers[2].id, experimentName, experimentPoint, condition);
  checkMarkExperimentPointForUser(
    markedExperimentPoint,
    experimentUsers[2].id,
    experimentName,
    experimentPoint,
    1,
    ENROLLMENT_CODE.ENROLL
  );

  await experimentService.updateState(experimentId, EXPERIMENT_STATE.ENROLLMENT_COMPLETE, user);

  // fetch experiment
  experiments = await experimentService.find();
  expect(experiments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: experimentObject.name,
        state: EXPERIMENT_STATE.ENROLLMENT_COMPLETE,
        postExperimentRule: experimentObject.postExperimentRule,
        assignmentUnit: experimentObject.assignmentUnit,
        consistencyRule: experimentObject.consistencyRule,
      }),
    ])
  );

  // check for experiment condition for user 4
  experimentConditionAssignments = await getAllExperimentCondition(experimentUsers[3].id);
  checkExperimentAssignedIsNull(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 4
  markedExperimentPoint = await markExperimentPoint(experimentUsers[3].id, experimentName, experimentPoint, condition);
  checkMarkExperimentPointForUser(
    markedExperimentPoint,
    experimentUsers[3].id,
    experimentName,
    experimentPoint,
    1,
    ENROLLMENT_CODE.REACHED_PRIOR
  );

  // get all experiment condition for user 2
  experimentConditionAssignments = await getAllExperimentCondition(experimentUsers[1].id);
  checkExperimentAssignedIsNull(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 2
  markedExperimentPoint = await markExperimentPoint(experimentUsers[1].id, experimentName, experimentPoint, condition);
  checkMarkExperimentPointForUser(
    markedExperimentPoint,
    experimentUsers[1].id,
    experimentName,
    experimentPoint,
    3,
    ENROLLMENT_CODE.PARTICIPANT_ON_EXCLUSION_LIST
  );

  // get all experiment condition for user 3
  experimentConditionAssignments = await getAllExperimentCondition(experimentUsers[2].id);
  checkExperimentAssignedIsNotDefault(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 3
  markedExperimentPoint = await markExperimentPoint(experimentUsers[2].id, experimentName, experimentPoint, condition);
  checkMarkExperimentPointForUser(
    markedExperimentPoint,
    experimentUsers[2].id,
    experimentName,
    experimentPoint,
    2,
    ENROLLMENT_CODE.ENROLL
  );

  // change back to ENROLLING
  await experimentService.updateState(experimentId, EXPERIMENT_STATE.ENROLLING, user);

  // fetch experiment
  experiments = await experimentService.find();
  expect(experiments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: experimentObject.name,
        state: EXPERIMENT_STATE.ENROLLING,
        postExperimentRule: experimentObject.postExperimentRule,
        assignmentUnit: experimentObject.assignmentUnit,
        consistencyRule: experimentObject.consistencyRule,
      }),
    ])
  );

  // check for experiment condition for user 4
  experimentConditionAssignments = await getAllExperimentCondition(experimentUsers[3].id);
  checkExperimentAssignedIsNull(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 4
  markedExperimentPoint = await markExperimentPoint(experimentUsers[3].id, experimentName, experimentPoint, condition);
  checkMarkExperimentPointForUser(
    markedExperimentPoint,
    experimentUsers[3].id,
    experimentName,
    experimentPoint,
    2,
    ENROLLMENT_CODE.REACHED_PRIOR
  );

  // get all experiment condition for user 2
  experimentConditionAssignments = await getAllExperimentCondition(experimentUsers[1].id);
  checkExperimentAssignedIsNull(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 2
  markedExperimentPoint = await markExperimentPoint(experimentUsers[1].id, experimentName, experimentPoint, condition);
  checkMarkExperimentPointForUser(
    markedExperimentPoint,
    experimentUsers[1].id,
    experimentName,
    experimentPoint,
    4,
    ENROLLMENT_CODE.PARTICIPANT_ON_EXCLUSION_LIST
  );

  // get all experiment condition for user 3
  experimentConditionAssignments = await getAllExperimentCondition(experimentUsers[2].id);
  checkExperimentAssignedIsNotDefault(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 3
  markedExperimentPoint = await markExperimentPoint(experimentUsers[2].id, experimentName, experimentPoint, condition);
  checkMarkExperimentPointForUser(
    markedExperimentPoint,
    experimentUsers[2].id,
    experimentName,
    experimentPoint,
    3,
    ENROLLMENT_CODE.ENROLL
  );
}