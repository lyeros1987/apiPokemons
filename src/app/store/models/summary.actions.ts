import { createAction, props } from '@ngrx/store';

export const updateSummary = createAction(
  '[Summary] Update',
  props<{ summary: { [letter: string]: number } }>()
);