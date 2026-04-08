import adminApi from "./axios";

export const getKnowledgeBases = async () => {
  const response = await adminApi.get("/admin/knowledge-bases");
  return response.data;
};

export const createKnowledgeBase = async (data) => {
  const response = await adminApi.post("/admin/knowledge-bases", data);
  return response.data;
};
export const getKnowledgeBaseDocuments = async (kbId) => {
  const response = await adminApi.get(`/admin/knowledge-bases/${kbId}/documents`);
  return response.data;
};

export const updateKnowledgeBaseConfig = async (kbId, data) => {
  const response = await adminApi.patch(`/admin/knowledge-bases/${kbId}/config`, data);
  return response.data;
};

export const uploadKnowledgeBaseDocument = async (kbId, file, chunkSize, chunkOverlap, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('chunk_size', chunkSize);
  formData.append('chunk_overlap', chunkOverlap);

  const response = await adminApi.post(
    `/admin/knowledge-bases/${kbId}/documents/upload`,
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