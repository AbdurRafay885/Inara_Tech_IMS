const DEPARTMENT_LABELS = {
  AI_ML: 'AI/ML',
  DEVOPS: 'DevOps',
  SECURITY: 'Security',
  NETWORKING: 'Networking',
  DEVELOPMENT: 'Development',
};

export function formatDepartment(dept) {
  if (!dept) return 'N/A';
  
  try {
    const cached = localStorage.getItem('departmentLabels');
    if (cached) {
      const labels = JSON.parse(cached);
      if (labels[dept]) return labels[dept];
    }
  } catch (e) {
    // Silent fail
  }

  return DEPARTMENT_LABELS[dept] || String(dept).charAt(0).toUpperCase() + String(dept).slice(1).toLowerCase();
}
