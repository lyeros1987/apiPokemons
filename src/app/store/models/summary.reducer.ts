// store/reducers/summary.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { updateSummary } from '../models/summary.actions';

export const initialState: { [letter: string]: number } = {};

export const summaryReducer = createReducer(
  initialState,
  on(updateSummary, (state, { summary }) => ({ ...summary }))
);