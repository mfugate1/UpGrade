import { Entity, PrimaryColumn, ManyToOne, Column } from 'typeorm';
import { BaseModel } from './base/BaseModel';
import { Experiment } from './Experiment';
import { ExperimentUser } from './ExperimentUser';
import { ENROLLMENT_CODE } from 'upgrade_types';
@Entity()
export class IndividualExclusion extends BaseModel {
  @PrimaryColumn()
  public id: string;

  @Column({
    type: 'enum',
    enum: ENROLLMENT_CODE,
    nullable: true,
  })
  public enrollmentCode: ENROLLMENT_CODE | null;

  @ManyToOne((type) => Experiment, { onDelete: 'CASCADE' })
  public experiment: Experiment;

  @ManyToOne((type) => ExperimentUser, { onDelete: 'CASCADE' })
  public user: ExperimentUser;
}
