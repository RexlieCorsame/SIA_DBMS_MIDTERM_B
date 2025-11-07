import axios from 'axios';
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

async function fetchAllUsers() {
    console.log('--- Fetching all users ---');
    try {
        const response = await axios.get(`${API_URL}/users`);
        console.log('Users fetched successfully', response.data.length, 'users.');
    } catch (error) {
        console.error('Error fetching users:', error.message);
    }
}

async function fetchUserById(userId) {
    console.log(`\n--- Fetching user with ID: ${userId}...---`);
    try {
        const response = await axios.get(`${API_URL}/users/${userId}`);
        console.log(`Success! Fetched usee: ${response.data.name}`);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn(` Warning: No user found with ID ${userId}.`);
        } else {
            console.error(`Error fetching user ${userId}:`, error.message);
        }
    }
}

async function main() {
    await fetchAllUsers();
    await fetchUserById(4);
    await fetchUserById(999);
}
main();