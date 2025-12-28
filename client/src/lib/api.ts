// API client for LearnFlow backend
const API_BASE = "/api";

// API request helper
// Note: Authentication is handled via cookies (Replit Auth sessions)
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Content API
export const contentAPI = {
  getAll: (params?: { topic?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.topic) query.set("topic", params.topic);
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.offset) query.set("offset", params.offset.toString());

    return apiRequest<any[]>(`/content${query.toString() ? `?${query}` : ""}`);
  },

  getById: (id: string) => apiRequest<any>(`/content/${id}`),

  create: (data: any) =>
    apiRequest<any>("/content", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/content/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/content/${id}`, {
      method: "DELETE",
    }),
};

// Social API
export const socialAPI = {
  like: (contentId: string) =>
    apiRequest("/social/likes", {
      method: "POST",
      body: JSON.stringify({ contentId }),
    }),

  unlike: (contentId: string) =>
    apiRequest(`/social/likes/${contentId}`, {
      method: "DELETE",
    }),

  bookmark: (contentId: string) =>
    apiRequest("/social/bookmarks", {
      method: "POST",
      body: JSON.stringify({ contentId }),
    }),

  unbookmark: (contentId: string) =>
    apiRequest(`/social/bookmarks/${contentId}`, {
      method: "DELETE",
    }),

  getComments: (contentId: string) =>
    apiRequest<any[]>(`/social/comments/${contentId}`),

  createComment: (contentId: string, body: string, parentId?: string) =>
    apiRequest<any>("/social/comments", {
      method: "POST",
      body: JSON.stringify({ contentId, body, parentId }),
    }),

  deleteComment: (id: string) =>
    apiRequest(`/social/comments/${id}`, {
      method: "DELETE",
    }),

  report: (contentId: string, reason: string) =>
    apiRequest("/social/reports", {
      method: "POST",
      body: JSON.stringify({ contentId, reason }),
    }),

  likeComment: (commentId: string) =>
    apiRequest(`/social/comments/${commentId}/likes`, {
      method: "POST",
    }),

  unlikeComment: (commentId: string) =>
    apiRequest(`/social/comments/${commentId}/likes`, {
      method: "DELETE",
    }),
};

// Feed API
export const feedAPI = {
  getPersonalized: (params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.offset) query.set("offset", params.offset.toString());

    return apiRequest<any[]>(`/feed/personalized${query.toString() ? `?${query}` : ""}`);
  },
};

// Admin API
export const adminAPI = {
  getStats: () => apiRequest<any>("/admin/stats"),

  getPendingContent: () => apiRequest<any[]>("/admin/moderation/pending"),

  approveContent: (id: string) =>
    apiRequest(`/admin/moderation/approve/${id}`, {
      method: "POST",
    }),

  rejectContent: (id: string) =>
    apiRequest(`/admin/moderation/reject/${id}`, {
      method: "POST",
    }),

  getSheerIDVerifications: () =>
    apiRequest<any[]>("/admin/sheerid/verifications"),

  verifyEducator: (userId: string) =>
    apiRequest(`/admin/sheerid/verify/${userId}`, {
      method: "POST",
    }),
};
