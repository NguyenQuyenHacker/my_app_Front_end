import adminApi from "./axios";

const BASE_URL = "/admin/knowledge-bases";

export const getKnowledgeBases = async () => {
  const response = await adminApi.get(BASE_URL);
  return response.data;
};

export const createKnowledgeBase = async (data) => {
  const response = await adminApi.post(BASE_URL, data);
  return response.data;
};

export const getKnowledgeBaseDocuments = async (kbId) => {
  const response = await adminApi.get(`${BASE_URL}/${kbId}/documents`);
  return response.data;
};

export const updateKnowledgeBaseConfig = async (kbId, data) => {
  const response = await adminApi.patch(`${BASE_URL}/${kbId}/config`, data);
  return response.data;
};

export const toggleKnowledgeBaseStatus = async (kbId, isActive) => {
  const response = await adminApi.patch(`${BASE_URL}/${kbId}/toggle`, { is_active: isActive });
  return response.data;
};

export const deleteKnowledgeBase = async (kbId) => {
  const response = await adminApi.delete(`${BASE_URL}/${kbId}`);
  return response.data;
};

export const updateKnowledgeBaseMetadata = async (kbId, data) => {
  const response = await adminApi.patch(`${BASE_URL}/${kbId}`, data);
  return response.data;
};

export const uploadKnowledgeBaseDocument = async (kbId, file, chunkSize, chunkOverlap, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('chunk_size', chunkSize);
  formData.append('chunk_overlap', chunkOverlap);

  const response = await adminApi.post(
    `${BASE_URL}/${kbId}/documents/upload`,
    formData,
    {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    }
  );

  return response.data;
};

export const deleteKnowledgeBaseDocument = async (kbId, documentId) => {
  const response = await adminApi.delete(`${BASE_URL}/${kbId}/documents/${documentId}`);
  return response.data;
};

export const getDocumentChunks = async (kbId, documentId) => {
  const response = await adminApi.get(`${BASE_URL}/${kbId}/documents/${documentId}/chunks`);
  return response.data;
};