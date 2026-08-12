import api from "./axiosConfig";

const BASE_URL = "/api/addresses";

const AddressService = {
  getAll: () => api.get(BASE_URL),

  getCount: () => api.get(`${BASE_URL}/count`),

  getDefault: () => api.get(`${BASE_URL}/default`),

  getById: (addressId) =>
    api.get(`${BASE_URL}/${addressId}`),

  create: (data) => api.post(BASE_URL, data),

  update: (addressId, data) =>
    api.put(`${BASE_URL}/${addressId}`, data),

  setDefault: (addressId) =>
    api.patch(`${BASE_URL}/${addressId}/default`),

  remove: (addressId) =>
    api.delete(`${BASE_URL}/${addressId}`),
};

export default AddressService;