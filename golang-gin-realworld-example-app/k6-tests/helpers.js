import http from 'k6/http';
import { BASE_URL, getHeaders } from './config.js';

// Helper function to register a new user
export function registerUser(username, email, password) {
    const payload = JSON.stringify({
        user: {
            username: username,
            email: email,
            password: password
        }
    });

    

    const response = http.post(
        `${BASE_URL}/api/users/`,
        payload,
        { headers: getHeaders(), redirects: 10 }
    );

    return response;
}

// Helper function to login
export function loginUser(email, password) {
    const payload = JSON.stringify({
        user: {
            email: email,
            password: password
        }
    });

    const response = http.post(
        `${BASE_URL}/api/users/login`,
        payload,
        { headers: getHeaders(), redirects: 10 }
    );

    if (response.status === 200) {
        const body = JSON.parse(response.body);
        return body.user.token;
    }
    return null;
}

// Helper function to create an article
export function createArticle(token, title, description, body, tagList = []) {
    const payload = JSON.stringify({
        article: {
            title: title,
            description: description,
            body: body,
            tagList: tagList
        }
    });

    const response = http.post(
        `${BASE_URL}/api/articles/`,
        payload,
        { headers: getHeaders(token) }
    );

    return response;
}

// Helper function to get articles
export function getArticles(token = null) {
    const response = http.get(
        `${BASE_URL}/api/articles/`,
        { headers: getHeaders(token), redirects: 10 }
    );

    return response;
}

// Helper function to get a specific article
export function getArticle(slug, token = null) {
    const response = http.get(
        `${BASE_URL}/api/articles/${slug}/`,
        { headers: getHeaders(token) }
    );

    return response;
}

// Helper function to get tags
export function getTags() {
    const response = http.get(
        `${BASE_URL}/api/tags/`,
        { headers: getHeaders(), redirects: 10 }
    );

    return response;
}

// Helper function to create a comment
export function createComment(slug, token, body) {
    const payload = JSON.stringify({
        comment: {
            body: body
        }
    });

    const response = http.post(
        `${BASE_URL}/api/articles/${slug}/comments`,
        payload,
        { headers: getHeaders(token) }
    );

    return response;
}

// Helper function to favorite an article
export function favoriteArticle(slug, token) {
    const response = http.post(
        `${BASE_URL}/api/articles/${slug}/favorite`,
        null,
        { headers: getHeaders(token) }
    );

    return response;
}
