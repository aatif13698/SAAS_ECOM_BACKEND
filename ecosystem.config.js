// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'backend-api',
      script: 'app.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'audit-worker',
      script: 'workers/auditAgendaWorker.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      kill_timeout: 30000
    }
  ]
};