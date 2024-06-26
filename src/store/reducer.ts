import { combineReducers } from '@reduxjs/toolkit';

import { servers } from '../servers/slice';

export const reducer = combineReducers({
  servers,
});
