export default () => ({
  regionsDbConfigs: process.env.REGIONS_DB_CONFIGS ? JSON.parse(process.env.REGIONS_DB_CONFIGS) : [],
  general: {
    port: parseInt(process.env.PORT, 10) || 30045,
    host: process.env.HOST || '0.0.0.0',
    name: 'trait',
  },
});
