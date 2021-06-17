import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ExperimentService } from '../../../../../../core/experiments/experiments.service';
import { ExperimentVM, EXPERIMENT_STATE } from '../../../../../../core/experiments/store/experiments.model';

@Component({
  selector: 'app-state-time-logs',
  templateUrl: './state-time-logs.component.html',
  styleUrls: ['./state-time-logs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StateTimeLogsComponent implements OnInit {

  timeLogDisplayedColumns = ['timeLogNumber', 'startTime', 'endTime'];
  experiment: ExperimentVM;

  startTimeLogs = [];
  endTimeLogs = [];
  filteredTimeLogs = [];

  constructor(
    private experimentService: ExperimentService,
    public dialogRef: MatDialogRef<StateTimeLogsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.experiment = this.data.experiment;
  }

  ngOnInit() {
    if (this.experiment.stateTimeLogs) {
      // starting time for an experiment when the experiment state changes to enrolling state
      this.startTimeLogs = this.experiment.stateTimeLogs.filter(state => state.toState===EXPERIMENT_STATE.ENROLLING);

      // ending time for an experiment when the current state is enrolling and it changes to either enrollment complete or cancelled state
      this.endTimeLogs = this.experiment.stateTimeLogs.filter(state => state.fromState===EXPERIMENT_STATE.ENROLLING);
    }

    this.startTimeLogs.sort((a, b) => {
      const startingDate1 = new Date(a.timeLog);
      const startingDate2 = new Date(b.timeLog);
      return startingDate1 > startingDate2 ? 1 : startingDate1 < startingDate2 ? -1 : 0;
    });

    this.endTimeLogs.sort((a, b) => {
      const endingDate1 = new Date(a.timeLog);
      const endingDate2 = new Date(b.timeLog);
      return endingDate1 > endingDate2 ? 1 : endingDate1 < endingDate2 ? -1 : 0;
    });

    this.startTimeLogs.forEach((startTimeLog, index) => {
      const endTimeLog = index < this.endTimeLogs.length ?  this.endTimeLogs[index].timeLog : null;
      this.filteredTimeLogs.push({startTimeLog: startTimeLog.timeLog, endTimeLog: endTimeLog});
    });
  }
}