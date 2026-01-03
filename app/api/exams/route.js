export async function GET(request) {

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return Response.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    const apiUrl = `https://api.waccps.org/quiz?studentId=${studentId}`;

    const res = await fetch(apiUrl, {
      method: 'GET',
    headers: {
  'authentication-key': process.env.WACCPS_API_KEY
} 
   });

    if (!res.ok) {
  const errorText = await res.text();
console.error('External API error', {
  studentId,
  status: res.status,
  errorText,
  apiUrl
})

  return Response.json(
    { error: 'Failed to fetch exams', details: errorText },
    { status: res.status }
  );
}

    const data = await res.json();

    return Response.json(data);

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
