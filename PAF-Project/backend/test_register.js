const req = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    studentId: 'IT8877',
    department: 'CS',
    email: 'test8877@test.com',
    password: 'Test@1234'
  })
};

fetch('http://localhost:8080/api/auth/register', req)
  .then(res => res.json().then(data => ({status: res.status, data})))
  .then(console.log)
  .catch(console.error);
