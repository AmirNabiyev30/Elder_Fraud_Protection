/**
 * @jest-environment node
 */

const BASE_URL = process.env.FLASK_URL || 'http://127.0.0.1:8000';

describe('MongoDB Atlas Integration', () => {
  test('Flask server should be reachable and responsive', async () => {
    const start = Date.now();
    const response = await fetch(`${BASE_URL}/api/health`);
    const duration = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(2000);
  });
  
  const testMongoConnection = process.env.MONGO_URI ? test : test.skip;

  testMongoConnection('Flask should return a successful MongoDB connection status', async () => {
    // We can change the end of that url to test different "endpoints"
    const response = await fetch(`${BASE_URL}/api/status`);
    
    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data).toMatchObject({
        status: "online",
        database: "connected" 
    });
  });
});
