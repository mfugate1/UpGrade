import { Repository, EntityRepository } from 'typeorm';
import { ExperimentUser } from '../models/ExperimentUser';
import repositoryError from './utils/repositoryError';

type UserInput = Omit<ExperimentUser, 'createdAt' | 'updatedAt' | 'versionNumber' | 'workingGroup'>;

@EntityRepository(ExperimentUser)
export class ExperimentUserRepository extends Repository<ExperimentUser> {
  public async upsertExperimentUser(user: Partial<ExperimentUser>): Promise<ExperimentUser> {
    var updateStatement = `("id") DO UPDATE SET "group" = :group, "workingGroup" = :workingGroup`;
    if (!user.group) { 
      var updateStatement = `("id") DO UPDATE SET "workingGroup" = :workingGroup`;
    }
    if (!user.workingGroup) { 
      var updateStatement = `("id") DO UPDATE SET "group" = :group`;
    }
    if (!user.workingGroup && !user.group) { 
      var updateStatement = `("id") DO UPDATE SET "id" = :id`;
    }

    const result = await this.createQueryBuilder()
      .insert()
      .into(ExperimentUser)
      .values(user)
      .onConflict(updateStatement)
      .setParameter('id', user.id)
      .setParameter('group', user.group)
      .setParameter('workingGroup',user.workingGroup)
      .returning('*')
      .execute()
      .catch((errorMsg: any) => {
        const errorMsgString = repositoryError('ExperimentUserRepository', 'upsertExperimentUser', { user }, errorMsg);
        throw errorMsgString;
      });
    return result.raw[0];
  }

  public async saveRawJson(rawData: UserInput): Promise<ExperimentUser> {
    const result = await this.createQueryBuilder('experimentUser')
      .insert()
      .into(ExperimentUser)
      .values(rawData)
      .onConflict(`("id") DO UPDATE SET "group" = :group`)
      .setParameter('group', rawData.group)
      .returning('*')
      .execute()
      .catch((errorMsg: any) => {
        const errorMsgString = repositoryError('ExperimentUserRepository', 'saveRawJson', { rawData }, errorMsg);
        throw errorMsgString;
      });

    return result.raw;
  }

  public async updateWorkingGroup(userId: string, workingGroup: any): Promise<ExperimentUser> {
    const result = await this.createQueryBuilder()
      .update(ExperimentUser)
      .set({
        workingGroup,
      })
      .where('id = :id', { id: userId })
      .returning('*')
      .execute()
      .catch((errorMsg: any) => {
        const errorMsgString = repositoryError(
          'ExperimentUserRepository',
          'updateWorkingGroup',
          { userId, workingGroup },
          errorMsg
        );
        throw errorMsgString;
      });

    return result.raw[0];
  }
}
