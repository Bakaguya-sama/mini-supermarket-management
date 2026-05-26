import apiClient from "./apiClient";

export const fetchGeneratedTestMonitorSummary = () => {
  return apiClient.get("/test-generation/openapi");
};

export const triggerTestGeneration = () => {
  return apiClient.post("/test-generation/generate");
};

export const triggerTestExecution = () => {
  return apiClient.post("/test-generation/run");
};

export const cancelTestTask = (type) => {
  return apiClient.post("/test-generation/cancel", { type });
};

export const clearAllTestData = () => {
  return apiClient.post("/test-generation/clear");
};
