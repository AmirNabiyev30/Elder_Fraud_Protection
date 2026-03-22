/**
 * @jest-environment node
 */

const BASE_URL = process.env.FLASK_URL || 'http://127.0.0.1:5000';

describe('MongoDB Atlas Integration', () => {
  
  test('Flask should return a successful MongoDB connection status', async () => {
    // We can change the end of that url to test different "endpoints"
    const response = await fetch(`${BASE_URL}/`);
    
    // Check if the HTTP status is OK (200-299)
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data).toMatchObject({
        message: "Connected to MongoDB Atlas!",
        document_count: expect.any(Number) 
    });
  });

  test('Database should be reachable and responsive', async () => {
    const start = Date.now();
    await fetch(`${BASE_URL}/`);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(2000);
  });
});