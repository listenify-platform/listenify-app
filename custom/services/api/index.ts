export * from './base';
export * from './modules';

import { authModule, roomModule, userModule } from './modules';

export const apiModules = {
  auth: authModule,
  user: userModule,
  room: roomModule,
  // playlist: playlistService,
  // media: mediaService,
  // health: healthService
};