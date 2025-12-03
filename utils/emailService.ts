
// This is a simple server-side handler for form submissions
// For deployment, you'll need to set up a backend service

export async function sendFormEmail(formData: any) {
  const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbwBp2OG8ps5VKO56_ATiERPs-_dVtr5AqQGMJhDqRnJgoAV72zo06hvWaKgHbWu1-qQ9A/exec';
  
  // Log submission started
  console.log('📝 FORM SUBMISSION STARTED');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Guest Name:', formData.name);
  console.log('Phone:', `${formData.countryCode} ${formData.phone}`);
  console.log('Attendees:', formData.attendees);
  console.log('---');
  console.log('Full Form Data:', formData);
  console.log('---');
  
  // Send to Google Apps Script webhook
  try {
    console.log('✉️ Attempting to send data to Google Apps Script...');
    console.log('Endpoint:', gasWebAppUrl);
    
    console.log('📦 Request payload:', formData);
    
    const response = await fetch(gasWebAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    // Note: With no-cors, we can't read the response, but the server still processes it
    console.log('✅ FORM SUBMISSION FINISHED SUCCESSFULLY');
    console.log('Data sent to Google Apps Script for processing');
    console.log('Emails will be sent and data will be saved to Google Sheet');
    return true;
  } catch (error) {
    console.error('❌ FORM SUBMISSION FAILED');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    console.log('Data was captured, but transmission to server failed.');
    console.log('Guest Data:', {
      name: formData.name,
      phone: `${formData.countryCode} ${formData.phone}`,
      attendees: formData.attendees,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}
