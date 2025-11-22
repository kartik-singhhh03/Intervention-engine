const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiCall = async (endpoint, options = {}) => {
  // Remove leading slash from endpoint if API_URL already includes /api
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${cleanEndpoint}`;
  console.log('🔗 API Call:', url);
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ API call failed: ${endpoint}`, error);
    throw error;
  }
};

export const submitDailyCheckin = (studentId, focusMinutes, quizScore, pageVisibilityEvents = 0, cheaterDetected = false) => {
  return apiCall('/daily/checkin', {
    method: 'POST',
    body: JSON.stringify({
      studentId,
      focusMinutes,
      quizScore,
      pageVisibilityEvents,
      cheaterDetected,
    }),
  });
};

export const completeTask = (studentId, interventionId) => {
  return apiCall('/interventions/complete', {
    method: 'POST',
    body: JSON.stringify({ studentId, interventionId }),
  });
};

export const getStudentData = (studentId) => {
  return apiCall(`/student/${studentId}`);
};

export const ping = () => {
  return apiCall('/ping');
};
