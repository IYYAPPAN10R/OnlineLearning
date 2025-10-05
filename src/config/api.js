export const API_BASE_URL = 'http://localhost:5002/api';

export const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.accessToken
    ? { 'x-access-token': user.accessToken }
    : {};
};
