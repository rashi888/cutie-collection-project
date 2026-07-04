import api from "./axiosConfig";

const BASE_URL = "/api/products";

const ProductService = {
  getAll:            ()                          => api.get(BASE_URL),
  getById:           (id)                        => api.get(`${BASE_URL}/${id}`),
  getByCategory:     (categoryId)                => api.get(`${BASE_URL}/category/${categoryId}`),
  create:            (data)                      => api.post(BASE_URL, data),
  update:            (id, data)                  => api.put(`${BASE_URL}/${id}`, data),
  delete:            (id)                        => api.delete(`${BASE_URL}/${id}`),

 // ✅ Paged — NO keyword (backend doesn't support it here)
  getPagedProducts:  (page, size, sortBy, direction) =>
    api.get(`${BASE_URL}/paged?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`),

  // ✅ Keyword search — uses separate /search endpoint
  searchByKeyword:   (keyword) =>
    api.get(`${BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`),


getProductById(id) {
  return axios.get(
    `${API_BASE_URL}/products/${id}`
  );
}

};
export default ProductService;