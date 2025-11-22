let visibilityCount = 0;
let cheaterDetected = false;
let visibilityChangeHandler = null;
let blurHandler = null;
let socket = null;
let currentStudentId = null;

export const startCheaterDetection = (socketInstance, studentId) => {
  socket = socketInstance;
  currentStudentId = studentId;

  visibilityChangeHandler = () => {
    if (document.hidden) {
      visibilityCount++;
      cheaterDetected = true;
      console.log('🚨 Tab hidden detected! Count:', visibilityCount);
      
      if (socket && currentStudentId) {
        socket.emit('cheater', {
          student_id: currentStudentId,
          reason: 'tab_switch'
        });
      }
    }
  };

  blurHandler = () => {
    visibilityCount++;
    cheaterDetected = true;
    console.log('🚨 Window blur detected! Count:', visibilityCount);
    
    if (socket && currentStudentId) {
      socket.emit('cheater', {
        student_id: currentStudentId,
        reason: 'tab_switch'
      });
    }
  };

  document.addEventListener('visibilitychange', visibilityChangeHandler);
  window.addEventListener('blur', blurHandler);
};

export const stopCheaterDetection = () => {
  if (visibilityChangeHandler) {
    document.removeEventListener('visibilitychange', visibilityChangeHandler);
  }
  if (blurHandler) {
    window.removeEventListener('blur', blurHandler);
  }
  visibilityChangeHandler = null;
  blurHandler = null;
  socket = null;
  currentStudentId = null;
};

export const getVisibilityEventCount = () => visibilityCount;

export const getCheaterDetected = () => cheaterDetected;

export const resetCheaterStatus = () => {
  visibilityCount = 0;
  cheaterDetected = false;
};
