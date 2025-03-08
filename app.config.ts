const IS_PRODUCTION = import.meta.env.MODE === 'production' || import.meta.env.MODE === 'staging';

export default defineAppConfig({
  WS_URL: IS_PRODUCTION ? 'ws.listenify.net' : 'localhost:8081',
  API_URL: IS_PRODUCTION ? 'api.listenify.net' : 'localhost:8080',
});