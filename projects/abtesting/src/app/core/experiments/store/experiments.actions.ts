import { createAction, props } from '@ngrx/store';
import { Experiment, UpsertExperimentType } from './experiments.model';

export const actionGetAllExperiment = createAction('[Experiment] Get All');

export const actionGetExperimentById = createAction('[Experiment] Get By Id');

export const actionStoreExperiment = createAction(
  '[Experiment] Store Experiment',
  props<{ experiments: Experiment[] }>()
);

export const actionUpsertExperiment = createAction(
  '[Experiment] Upsert Experiment',
  props<{ experiment: Experiment, actionType: UpsertExperimentType }>()
);

export const actionUpsertExperimentSuccess = createAction(
  '[Experiment] Upsert Experiment Success',
  props<{ experiment: Experiment }>()
);

export const actionUpsertExperimentFailure = createAction(
  '[Experiment] Upsert Experiment Failure'
);
