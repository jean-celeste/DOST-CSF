export async function submitForm(formData) {
  try {
    // Determine which form to submit based on clientType and service type
    const clientType = formData.personalDetails.clientType;
    const serviceTypeId = formData.personalDetails.service_type_id;
    const isInternal = clientType === 'internal';
    const isExternal = ['citizen', 'business', 'government'].includes(clientType);
    const isOnsite = serviceTypeId === 1;
    const isOffsite = serviceTypeId === 2;

    if (isInternal || (isExternal && isOffsite)) {
      // Submit QMS form
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: 2, // QMS form ID
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
    } else if (isExternal && isOnsite) {
      // Submit CSM ARTA form
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
    } else {
      throw new Error('Invalid client or service type');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
} 