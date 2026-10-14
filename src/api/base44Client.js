import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { wrapEntitiesForOffline } from '@/lib/offlineSync';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
const client = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

// Offline-first layer: cached reads when offline, writes queue locally and
// automatically sync to the online database once the connection returns.
export const base44 = wrapEntitiesForOffline(client);