import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { Experiment, UpsertExperimentType, ExperimentVM, ExperimentStateInfo, SEARCH_KEY, SORT_KEY, SORT_AS } from './store/experiments.model';
import { Store, select } from '@ngrx/store';
import {
  selectAllExperiment,
  selectIsLoadingExperiment,
  selectSelectedExperiment,
  selectAllPartitions,
  selectAllUniqueIdentifiers
} from './store/experiments.selectors';
import * as experimentAction from './store//experiments.actions';
import { AppState } from '../core.state';
import { map } from 'rxjs/operators';

@Injectable()
export class ExperimentService {
  constructor(private store$: Store<AppState>) {}

  experiments$: Observable<Experiment[]> = this.store$.pipe(
    select(selectAllExperiment),
    map(experiments =>
      experiments.sort((a, b) => {
        const d1 = new Date(a.createdAt);
        const d2 = new Date(b.createdAt);
        return d1 < d2 ? 1 : d1 > d2 ? -1 : 0;
      })
    )
  );
  isLoadingExperiment$ = this.store$.pipe(select(selectIsLoadingExperiment));
  selectedExperiment$ = this.store$.pipe(select(selectSelectedExperiment));
  allPartitions$ = this.store$.pipe(select(selectAllPartitions));
  uniqueIdentifiers$ = this.store$.pipe(select(selectAllUniqueIdentifiers));

  isInitialExperimentsLoading() {
    return combineLatest(
      this.store$.pipe(select(selectIsLoadingExperiment)),
      this.experiments$
    ).pipe(
      map(([isLoading, experiments]) => {
        return !isLoading || experiments.length
      })
    )
  }

  loadExperiments(fromStarting?: boolean) {
    return this.store$.dispatch(experimentAction.actionGetExperiments({ fromStarting }));
  }

  createNewExperiment(experiment: Experiment) {
    this.store$.dispatch(
      experimentAction.actionUpsertExperiment({ experiment, actionType: UpsertExperimentType.CREATE_NEW_EXPERIMENT })
    );
  }

  updateExperiment(experiment: ExperimentVM) {
    delete experiment.stat;
    this.store$.dispatch(
      experimentAction.actionUpsertExperiment({ experiment, actionType: UpsertExperimentType.UPDATE_EXPERIMENT })
    );
  }

  deleteExperiment(experimentId) {
    this.store$.dispatch(experimentAction.actionDeleteExperiment({ experimentId }));
  }

  updateExperimentState(experimentId: string, experimentStateInfo: ExperimentStateInfo) {
    this.store$.dispatch(experimentAction.actionUpdateExperimentState({ experimentId, experimentStateInfo }));
  }

  setSearchKey(searchKey: SEARCH_KEY) {
    this.store$.dispatch(experimentAction.actionSetSearchKey({ searchKey }));
  }

  setSearchString(searchString: string) {
    this.store$.dispatch(experimentAction.actionSetSearchString({ searchString }));
  }

  setSortKey(sortKey: SORT_KEY) {
    this.store$.dispatch(experimentAction.actionSetSortKey({ sortKey }));
  }

  setSortingType(sortingType: SORT_AS) {
    this.store$.dispatch(experimentAction.actionSetSortingType({ sortingType }));
  }
}
