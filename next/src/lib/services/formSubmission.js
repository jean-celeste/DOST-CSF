export async function submitForm(formData) {
  try {
    // Determine which form to submit based on service type
    if (formData.personalDetails.service_type_id === 1) {
      // Submit CSM ARTA form for on-site services
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: 1, // CSM ARTA form ID
          serviceId: formData.personalDetails.service_id,
          personalDetails: formData.personalDetails,
          csmARTACheckmark: formData.csmARTACheckmark,
          csmARTARatings: formData.csmARTARatings,
          suggestion: formData.suggestion
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit CSM ARTA form');
      }
      return result;
    } else if (formData.personalDetails.service_type_id === 2) {
      // Submit QMS form for off-site services
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: 3, // QMS form ID
          serviceId: formData.personalDetails.service_id,
          personalDetails: formData.personalDetails,
          qmsCheckmark: formData.qmsCheckmark,
          qmsRatings: formData.qmsRatings,
          suggestion: formData.suggestion
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit QMS form');
      }
      return result;
    } else {
      throw new Error('Invalid service type');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
} 