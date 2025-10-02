/**
 * Global error handler utility for API errors
 * Converts permission errors to user-friendly toast notifications
 */

export function handleApiError(error, toast) {
  if (!error || !toast) return;

  const status = error.status;
  const message = error.message || 'An error occurred';

  // Permission errors (403 Forbidden)
  if (status === 403) {
    // Check for specific permission error messages
    if (message.includes('permission to modify') || message.includes('permission to write')) {
      toast.push({
        type: 'error',
        title: 'Access Denied',
        message: 'You don\'t have permission to create or modify data. Please contact your administrator.',
        duration: 5000
      });
      return true;
    }
    
    if (message.includes('permission to delete')) {
      toast.push({
        type: 'error',
        title: 'Access Denied',
        message: 'You don\'t have permission to delete data. Please contact your administrator.',
        duration: 5000
      });
      return true;
    }
    
    if (message.includes('permission to export')) {
      toast.push({
        type: 'error',
        title: 'Access Denied',
        message: 'You don\'t have permission to export data. Please contact your administrator.',
        duration: 5000
      });
      return true;
    }

    // Generic forbidden error
    toast.push({
      type: 'error',
      title: 'Access Denied',
      message: message || 'You don\'t have permission to perform this action.',
      duration: 5000
    });
    return true;
  }

  // Authentication errors (401)
  if (status === 401) {
    toast.push({
      type: 'error',
      title: 'Authentication Required',
      message: 'Your session has expired. Please log in again.',
      duration: 5000
    });
    return true;
  }

  // Not found errors (404)
  if (status === 404) {
    toast.push({
      type: 'error',
      title: 'Not Found',
      message: 'The requested resource was not found.',
      duration: 4000
    });
    return true;
  }

  // Conflict errors (409)
  if (status === 409) {
    toast.push({
      type: 'error',
      title: 'Conflict',
      message: message || 'This action conflicts with existing data.',
      duration: 5000
    });
    return true;
  }

  // Server errors (500+)
  if (status >= 500) {
    toast.push({
      type: 'error',
      title: 'Server Error',
      message: 'Something went wrong on the server. Please try again later.',
      duration: 5000
    });
    return true;
  }

  // Return false if error wasn't handled
  return false;
}
