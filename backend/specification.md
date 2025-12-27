RegisterRequest:
{
  "username": "string",
  "password": "string",
  "email": "string",
  "phone": "string (可选)"
}

LoginRequest:
{
  "username": "string",
  "password": "string"
}

ChangePasswordRequest:
{
  "oldPassword": "string",
  "newPassword": "string"
}