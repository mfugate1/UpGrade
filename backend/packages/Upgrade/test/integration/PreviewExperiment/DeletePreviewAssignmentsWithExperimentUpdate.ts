import { Container } from 'typedi';
import { ExperimentService } from '../../../src/api/services/ExperimentService';
import { Logger as WinstonLogger } from '../../../src/lib/logger';
import { UserService } from '../../../src/api/services/UserService';
import { systemUser } from '../mockData/user/index';
import { previewIndividualAssignmentExperiment } from '../mockData/experiment';
import { PreviewUserService } from '../../../src/api/services/PreviewUserService';
import { previewUsers } from '../mockData/previewUsers/index';

export default async function testCase(): Promise<void> {
  const logger = new WinstonLogger(__filename);
  const experimentService = Container.get<ExperimentService>(ExperimentService);
  const userService = Container.get<UserService>(UserService);
  const previewService = Container.get<PreviewUserService>(PreviewUserService);

  // creating new user
  const user = await userService.upsertUser(systemUser as any);

  // experiment object
  const experimentObject = previewIndividualAssignmentExperiment;

  // create experiment
  await experimentService.create(experimentObject as any, user);
  const experiments = await experimentService.find();
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

  // creating preview user
  const previewUser = await previewService.create(previewUsers[0]);

  // add single assignments for
  const previewDocuments: any = {
    id: previewUser.id,
    assignments: [
      {
        experiment: {
          id: experiments[0].id,
        },
        experimentCondition: {
          id: experiments[0].conditions[0].id,
        },
      },
    ],
  };

  await previewService.upsertExperimentConditionAssignment(previewDocuments);

  const previewUsersData = await previewService.find();
  expect(previewUsersData[0].assignments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        experiment: expect.objectContaining({
          id: experiments[0].id,
        }),
        experimentCondition: expect.objectContaining({
          id: experiments[0].conditions[0].id,
        }),
      }),
    ])
  );

  // replacing condition
  const newExperimentDoc = {
    ...experiments[0],
    conditions: [
      {
        name: 'Condition C',
        description: 'Condition C',
        conditionCode: 'Condition C',
        assignmentWeight: 50,
        twoCharacterId: 'CC',
      },
    ],
  };

  const updatedExperimentDoc = await experimentService.update(newExperimentDoc.id, newExperimentDoc as any, user);
  // check the conditions
  expect(updatedExperimentDoc.conditions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'Condition C',
        description: 'Condition C',
        conditionCode: 'Condition C',
        assignmentWeight: 50,
        twoCharacterId: 'CC',
      }),
    ])
  );
}
