import apiClient from "../lib/axios";

export const fetchGeneratedTestMonitorSummary = () => {
  return apiClient.get("/test-generation/openapi");
};
