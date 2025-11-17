## 👤 User Registration
The application includes a user registration API. By default, users can register themselves. To register special accounts (e.g., admin or trainer), sending a request to the backend API.

## 🔧 Endpoint
Code
    POST http://localhost:8000/user/register-user/
### 📩 Sample Request Body
```bash
{
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "password": "1234"
}
```
### 📝 Notes
role can be set to:

- "admin" → for administrator accounts

- "trainer" → for trainer accounts

- "user" → for normal user accounts

Make sure the backend server is running at http://localhost:8000.