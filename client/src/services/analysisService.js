import api from './api';

/**
 * Analysis Service
 * Handles API calls for resume upload, running analysis, and history.
 */

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  
  // Notice we override Content-Type to multipart/form-data for file uploads
  const response = await api.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getResumeHistory = async () => {
  const response = await api.get('/resume/history');
  return response.data;
};

export const runAnalysis = async (data) => {
  // data should contain { resumeId, jobDescription, jobTitle }
  const response = await api.post('/analysis/run', data);
  return response.data;
};

export const getAnalysis = async (id) => {
  const response = await api.get(`/analysis/${id}`);
  return response.data;
};

export const getUserAnalyses = async () => {
  const response = await api.get('/analysis');
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};
