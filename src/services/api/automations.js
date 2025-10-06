import axios from 'axios';
import { apiUrl } from '@/lib/utils';

export const getAutomations = async (token) => {
    const res = await axios.get(`${apiUrl}/api/v1/automate`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
};

export const startAutomation = async (token, payload) => {
    const res = await axios.post(`${apiUrl}/api/v1/automate`, payload, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
};

export const getSheets = async (token) => {
    const res = await axios.get(`${apiUrl}/api/v1/products/sheets`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
};

export const getAutomation = async (token, id) => {
    const res = await axios.get(`${apiUrl}/api/v1/automate/${id} `, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
};
