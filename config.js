const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const config = {
  token: process.env.GITHUB_TOKEN || '',
  owner: process.env.GITHUB_OWNER || '',
  repo: process.env.GITHUB_REPO || '',
  commitMode: (process.env.COMMIT_MODE || 'DEMO').toUpperCase(),
  batchSize: parseInt(process.env.BATCH_SIZE || '50', 10),
  batchFlushSeconds: parseInt(process.env.BATCH_FLUSH_SECONDS || '60', 10),
  heartbeatAuto: (process.env.HEARTBEAT_AUTO || 'true') === 'true',
  heartbeatHours: parseInt(process.env.HEARTBEAT_HOURS || '24', 10),
  port: parseInt(process.env.PORT || '3000', 10),
  baseUrl: (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  localDataDir: path.resolve(__dirname, process.env.LOCAL_DATA_DIR || './local-data'),
  publicDir: path.join(__dirname, 'public'),
};

config.githubEnabled = Boolean(config.token && config.owner && config.repo);
config.mode = config.commitMode === 'PRODUCTION' ? 'PRODUCTION' : 'DEMO';

module.exports = config;
