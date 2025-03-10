export * from './base';

import { authService } from './auth';
import { roomService } from './room';
import { userService } from './user';

export const apiModules = {
  auth: authService,
  user: userService,
  room: roomService,
};