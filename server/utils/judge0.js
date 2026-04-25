const axios = require('axios');

const JUDGE0_API = process.env.JUDGE0_API_URL || 'https://ce.judge0.com';

const LANGUAGE_IDS = {
  'c': 50,
  'cpp': 54,
  'java': 62,
  'python': 71,
};

const createSubmission = async (sourceCode, languageId, stdin = '') => {
  try {
    const response = await axios.post(`${JUDGE0_API}/submissions?base64_encoded=false&wait=true`, {
      source_code: sourceCode,
      language_id: languageId,
      stdin: stdin,
      cpu_time_limit: 5,
      memory_limit: 256000,
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      throw new Error('RATE_LIMIT');
    }
    // Log the actual error for debugging
    console.error('Judge0 API error:', error.response?.status, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.response?.data?.error || `Judge0 API error (${error.response?.status || 'timeout'})`);
  }
};

const getSubmission = async (token) => {
  try {
    const response = await axios.get(`${JUDGE0_API}/submissions/${token}?base64_encoded=false`, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

module.exports = { createSubmission, getSubmission, LANGUAGE_IDS };
