import { configureStore } from '@reduxjs/toolkit';
import patientReducer from './patientSlice';

export const makeStore = () =>
  configureStore({ reducer: { patient: patientReducer } });

export const store = makeStore();
