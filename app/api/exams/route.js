export async function GET(request) {
  try {
    // Get studentId from query parameters
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return Response.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Get authentication key from environment variable
    const authKey = process.env.CBT_AUTHENTICATION_KEY;
    
    if (!authKey) {
      console.error('CBT_AUTHENTICATION_KEY is not set in environment variables');
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Call the external API
    const response = await fetch(
      `https://api.waccps.org/quiz?studentId=${encodeURIComponent(studentId)}`,
      {
        headers: {
          'Authentication-Key': authKey,
          'Content-Type': 'application/json',
        },
        // Optional: Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!response.ok) {
      console.error(`External API error: ${response.status} ${response.statusText}`);
      return Response.json(
        { error: 'Failed to fetch exams from external API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);

  } catch (error) {
    console.error('API route error:', error);
    
    if (error.name === 'TimeoutError') {
      return Response.json(
        { error: 'Request timeout. Please try again.' },
        { status: 408 }
      );
    }
    
    if (error.name === 'AbortError') {
      return Response.json(
        { error: 'Request was aborted' },
        { status: 500 }
      );
    }
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}