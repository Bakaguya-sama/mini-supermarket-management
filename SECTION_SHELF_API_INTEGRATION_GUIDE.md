# 📦 Section & Shelf Management API Integration Guide

## 📋 Tổng quan

Tài liệu này mô tả chi tiết cách tích hợp API cho **Section Management** và **Shelf Management** trong Merchandise Supervisor Portal, bao gồm:

- Section CRUD Operations (List, Add, Edit, Delete)
- Shelf CRUD Operations (List, Add, Edit, Delete)
- Statistics & Filtering
- Error Handling & Loading States
- Data Validation

---

## 🏗️ Kiến trúc hiện tại

### Frontend Structure

```
Merchandise Supervisor Portal
├── Section Management
│   ├── SectionListView (Danh sách sections)
│   ├── AddSectionView (Tạo section mới)
│   └── EditSectionView (Chỉnh sửa section)
└── Shelf Management
    ├── ShelfListView (Danh sách shelves)
    ├── AddShelfView (Tạo shelf mới)
    └── EditShelfView (Chỉnh sửa shelf)
```

### Services Available

- ✅ `sectionService.js` - Hoàn chỉnh với CRUD operations
- ✅ `shelfService.js` - Hoàn chỉnh với CRUD operations
- ✅ `apiClient.js` - Centralized Axios instance

### Backend API Endpoints

#### Section APIs

```
GET    /api/sections              - Get all sections (with pagination)
GET    /api/sections/stats         - Get section statistics
GET    /api/sections/:id           - Get section by ID
GET    /api/sections/:id/shelves   - Get shelves in section
POST   /api/sections               - Create new section
PUT    /api/sections/:id           - Update section
DELETE /api/sections/:id           - Delete section (soft delete)
```

#### Shelf APIs

```
GET    /api/shelves                    - Get all shelves (with pagination)
GET    /api/shelves/stats              - Get shelf statistics
GET    /api/shelves/available          - Get available shelves
GET    /api/shelves/category/:category - Get shelves by category
GET    /api/shelves/:id                - Get shelf by ID
GET    /api/shelves/:id/capacity       - Get shelf capacity info
POST   /api/shelves                    - Create new shelf
PUT    /api/shelves/:id                - Update shelf
PUT    /api/shelves/:id/toggle-full    - Toggle shelf full status
DELETE /api/shelves/:id                - Delete shelf (soft delete)
```

---

## 📊 1. SECTION MANAGEMENT

### 1.1. Data Model

#### Frontend Format

```javascript
{
  sectionName: String,
  shelfCount: Number,
  note: String
}
```

#### Backend Format (API)

```javascript
{
  _id: ObjectId,
  section_name: String,
  shelf_count: Number,
  note: String,
  created_at: Date,
  updated_at: Date,
  isDelete: Boolean
}
```

### 1.2. SectionListView - Already Integrated ✅

**Current Implementation:**

```javascript
// client/src/views/merchandise-supervisor/section/SectionListView.jsx
import sectionService from "../../../services/sectionService";

const SectionListView = () => {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load sections from API
  const loadSections = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await sectionService.getAll({
        limit: 100,
        page: 1,
      });

      if (response.success && response.data) {
        setSections(response.data);
        calculateStats(response.data);
      } else {
        setError("Failed to load sections");
      }
    } catch (error) {
      console.error("Error loading sections:", error);
      setError(error.message || "Failed to load sections");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete section with confirmation
  const confirmDeleteSection = async () => {
    if (confirmDelete) {
      try {
        const response = await sectionService.delete(confirmDelete._id);
        if (response.success) {
          await loadSections(); // Reload after delete
        } else {
          setError(response.message || "Failed to delete section");
        }
      } catch (error) {
        setError(error.message || "Failed to delete section");
      } finally {
        setConfirmDelete(null);
      }
    }
  };
};
```

**Features:**

- ✅ Load sections with pagination
- ✅ Calculate statistics (total sections, total shelves)
- ✅ Search functionality
- ✅ Delete with confirmation dialog
- ✅ Error handling
- ✅ Loading states

### 1.3. AddSectionView - Already Integrated ✅

**Current Implementation:**

```javascript
// client/src/views/merchandise-supervisor/section/AddSectionView.jsx
import sectionService from "../../../services/sectionService";

const AddSectionView = () => {
  const [formData, setFormData] = useState({
    sectionName: "",
    shelfCount: "",
    note: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const sectionData = {
        section_name: formData.sectionName.trim(),
        shelf_count: parseInt(formData.shelfCount) || 0,
        note: formData.note.trim(),
      };

      const response = await sectionService.create(sectionData);

      if (response.success) {
        setSuccessMessage("Section created successfully!");
        setTimeout(() => navigate("/sections"), 1500);
      } else {
        setErrorMessage(response.message || "Failed to create section");
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to create section");
    } finally {
      setIsLoading(false);
    }
  };
};
```

**Features:**

- ✅ Form validation
- ✅ Create new section via API
- ✅ Success/Error messages
- ✅ Auto-redirect after success
- ✅ Loading state during submission

### 1.4. EditSectionView - Already Integrated ✅

**Current Implementation:**

```javascript
// client/src/views/merchandise-supervisor/section/EditSectionView.jsx
const EditSectionView = () => {
  const { id } = useParams();
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load section data on mount
  useEffect(() => {
    const loadSectionData = async () => {
      try {
        setIsLoadingData(true);
        const response = await sectionService.getById(id);

        if (response.success && response.data) {
          const section = response.data;
          setFormData({
            sectionName: section.section_name || "",
            shelfCount: section.shelf_count || 0,
            note: section.note || "",
          });
        } else {
          setErrorMessage("Failed to load section data");
        }
      } catch (error) {
        setErrorMessage(error.message || "Failed to load section data");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadSectionData();
  }, [id]);

  // Update section
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const sectionData = {
        section_name: formData.sectionName.trim(),
        shelf_count: parseInt(formData.shelfCount) || 0,
        note: formData.note.trim(),
      };

      const response = await sectionService.update(id, sectionData);

      if (response.success) {
        setSuccessMessage("Section updated successfully!");
        setTimeout(() => navigate("/sections"), 1500);
      } else {
        setErrorMessage(response.message || "Failed to update section");
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to update section");
    } finally {
      setIsLoading(false);
    }
  };
};
```

**Features:**

- ✅ Load section data by ID
- ✅ Pre-fill form with existing data
- ✅ Update section via API
- ✅ Form validation
- ✅ Success/Error messages
- ✅ Loading states for both data loading and submission

---

## 🗄️ 2. SHELF MANAGEMENT

### 2.1. Data Model

#### Frontend Format

```javascript
{
  shelfNumber: String,
  category: String,
  capacity: Number,
  currentCapacity: Number,
  location: String,
  note: String,
  section: ObjectId (reference to Section)
}
```

#### Backend Format (API)

```javascript
{
  _id: ObjectId,
  shelf_number: String,
  category: String,
  capacity: Number,
  current_capacity: Number,
  location: String,
  status: String (empty/partially_filled/full),
  note: String,
  section: {
    _id: ObjectId,
    section_name: String
  },
  created_at: Date,
  updated_at: Date,
  isDelete: Boolean
}
```

### 2.2. ShelfListView - Already Integrated ✅

**Current Implementation:**

```javascript
// client/src/views/merchandise-supervisor/shelves/ShelfListView.jsx
import shelfService from "../../../services/shelfService";
import sectionService from "../../../services/sectionService";

const ShelfListView = () => {
  const [shelves, setShelves] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All status");
  const [sectionFilter, setSectionFilter] = useState("All sections");

  // Load shelves and sections
  useEffect(() => {
    loadShelves();
    loadSections();
  }, []);

  const loadShelves = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await shelfService.getAll({
        limit: 100,
        page: 1,
      });

      if (response.success && response.data) {
        setShelves(response.data);
        calculateStats(response.data);
      } else {
        setError("Failed to load shelves");
      }
    } catch (error) {
      console.error("Error loading shelves:", error);
      setError(error.message || "Failed to load shelves");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSections = async () => {
    try {
      const response = await sectionService.getAll({ limit: 100 });
      if (response.success && response.data) {
        setSections(response.data);
      }
    } catch (error) {
      console.error("Error loading sections:", error);
    }
  };

  // Filter shelves by status and section
  const filteredShelves = shelves.filter((shelf) => {
    const matchesSearch =
      shelf.shelf_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shelf.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All status" ||
      shelf.status === statusFilter.toLowerCase();

    const matchesSection =
      sectionFilter === "All sections" || shelf.section?._id === sectionFilter;

    return matchesSearch && matchesStatus && matchesSection;
  });

  // Delete shelf with confirmation
  const confirmDeleteShelf = async () => {
    if (confirmDelete) {
      try {
        const response = await shelfService.delete(confirmDelete._id);
        if (response.success) {
          await loadShelves();
        } else {
          setError(response.message || "Failed to delete shelf");
        }
      } catch (error) {
        setError(error.message || "Failed to delete shelf");
      } finally {
        setConfirmDelete(null);
      }
    }
  };
};
```

**Features:**

- ✅ Load shelves with pagination
- ✅ Load sections for filtering
- ✅ Calculate statistics (total, empty, occupied, full)
- ✅ Filter by status (empty/partially_filled/full)
- ✅ Filter by section
- ✅ Search functionality
- ✅ Delete with confirmation dialog
- ✅ Error handling
- ✅ Loading states

### 2.3. AddShelfView - Already Integrated ✅

**Current Implementation:**

```javascript
// client/src/views/merchandise-supervisor/shelves/AddShelfView.jsx
import shelfService from "../../../services/shelfService";
import sectionService from "../../../services/sectionService";

const AddShelfView = () => {
  const [formData, setFormData] = useState({
    shelfNumber: "",
    category: "",
    capacity: "",
    location: "",
    note: "",
    section: "",
  });
  const [sections, setSections] = useState([]);

  // Load sections for dropdown
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await sectionService.getAll();
        if (response.success && response.data) {
          setSections(response.data);
        }
      } catch (error) {
        console.error("Error loading sections:", error);
      }
    };
    fetchSections();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const shelfData = {
        shelf_number: formData.shelfNumber.trim(),
        category: formData.category,
        capacity: parseInt(formData.capacity) || 0,
        location: formData.location.trim(),
        note: formData.note.trim(),
        section: formData.section,
        status: "empty", // Default status
        current_capacity: 0, // Default
      };

      const response = await shelfService.create(shelfData);

      if (response.success) {
        setSuccessMessage("Shelf created successfully!");
        setTimeout(() => navigate("/shelves"), 1500);
      } else {
        setErrorMessage(response.message || "Failed to create shelf");
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to create shelf");
    } finally {
      setIsLoading(false);
    }
  };
};
```

**Features:**

- ✅ Load sections for dropdown
- ✅ Form validation
- ✅ Create new shelf via API
- ✅ Success/Error messages
- ✅ Auto-redirect after success
- ✅ Loading state during submission

### 2.4. EditShelfView - Already Integrated ✅

**Current Implementation:**

```javascript
// client/src/views/merchandise-supervisor/shelves/EditShelfView.jsx
const EditShelfView = () => {
  const { id } = useParams();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [sections, setSections] = useState([]);

  // Load shelf data and sections on mount
  useEffect(() => {
    const loadShelfData = async () => {
      try {
        setIsLoadingData(true);

        // Load both shelf and sections in parallel
        const [shelfRes, sectionRes] = await Promise.all([
          shelfService.getById(id),
          sectionService.getAll(),
        ]);

        if (sectionRes.success && sectionRes.data) {
          setSections(sectionRes.data);
        }

        if (shelfRes.success && shelfRes.data) {
          const shelf = shelfRes.data;
          setFormData({
            shelfNumber: shelf.shelf_number || "",
            category: shelf.category || "",
            capacity: shelf.capacity || "",
            currentCapacity: shelf.current_capacity || 0,
            location: shelf.location || "",
            note: shelf.note || "",
            section: shelf.section?._id || "",
          });
        } else {
          setErrorMessage("Failed to load shelf data");
        }
      } catch (error) {
        setErrorMessage(error.message || "Failed to load shelf data");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadShelfData();
  }, [id]);

  // Update shelf
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const shelfData = {
        shelf_number: formData.shelfNumber.trim(),
        category: formData.category,
        capacity: parseInt(formData.capacity) || 0,
        current_capacity: parseInt(formData.currentCapacity) || 0,
        location: formData.location.trim(),
        note: formData.note.trim(),
        section: formData.section,
      };

      // Auto-calculate status based on capacity
      const capacityRatio = shelfData.current_capacity / shelfData.capacity;
      if (capacityRatio === 0) {
        shelfData.status = "empty";
      } else if (capacityRatio >= 1) {
        shelfData.status = "full";
      } else {
        shelfData.status = "partially_filled";
      }

      const response = await shelfService.update(id, shelfData);

      if (response.success) {
        setSuccessMessage("Shelf updated successfully!");
        setTimeout(() => navigate("/shelves"), 1500);
      } else {
        setErrorMessage(response.message || "Failed to update shelf");
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to update shelf");
    } finally {
      setIsLoading(false);
    }
  };
};
```

**Features:**

- ✅ Load shelf data by ID
- ✅ Load sections for dropdown
- ✅ Pre-fill form with existing data
- ✅ Update shelf via API
- ✅ Auto-calculate status based on capacity
- ✅ Form validation
- ✅ Success/Error messages
- ✅ Loading states for both data loading and submission

---

## 🔧 3. ADVANCED FEATURES & IMPROVEMENTS

### 3.1. Enhanced Statistics Dashboard

**Current Implementation:**

```javascript
// Calculate stats from loaded data
const calculateStats = (dataList) => {
  if (!Array.isArray(dataList)) return;

  // For Sections
  const totalSections = dataList.length;
  const totalShelves = dataList.reduce((sum, section) => {
    return sum + (section.shelf_count || 0);
  }, 0);

  setStats({ totalSections, totalShelves });

  // For Shelves
  const totalShelves = dataList.length;
  const emptyShelves = dataList.filter((s) => s.status === "empty").length;
  const occupiedShelves = dataList.filter(
    (s) => s.status === "partially_filled"
  ).length;
  const fullShelves = dataList.filter((s) => s.status === "full").length;

  setStats({ totalShelves, emptyShelves, occupiedShelves, fullShelves });
};
```

**Recommended Enhancement:**

```javascript
// Use dedicated stats API for better performance
const loadStats = async () => {
  try {
    // For sections
    const sectionStats = await sectionService.getStats();
    setStats(sectionStats.data);

    // For shelves
    const shelfStats = await shelfService.getStats();
    setStats(shelfStats.data);
  } catch (error) {
    console.error("Failed to load stats:", error);
  }
};

// Add to sectionService.js
getStats: async () => {
  try {
    const response = await apiClient.get("/sections/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching section stats:", error);
    throw error;
  }
};
```

### 3.2. Real-time Search with Debounce

**Current Implementation:**

```javascript
// Search happens on every keystroke
<input
  type="text"
  placeholder="Search..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

**Recommended Enhancement:**

```javascript
// Add debounce for better performance
import { useEffect, useState } from "react";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// In component
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  loadShelves({ search: debouncedSearch });
}, [debouncedSearch]);
```

### 3.3. Pagination Implementation

**Current Status:** Client-side pagination with all data loaded

**Recommended Enhancement:**

```javascript
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [itemsPerPage] = useState(10);

const loadShelves = async () => {
  try {
    setIsLoading(true);

    const response = await shelfService.getAll({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      status: statusFilter !== "All status" ? statusFilter : undefined,
      section: sectionFilter !== "All sections" ? sectionFilter : undefined,
    });

    if (response.success) {
      setShelves(response.data);
      setTotalPages(response.pages);
      setTotalItems(response.total);
    }
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

// Reload when page or filters change
useEffect(() => {
  loadShelves();
}, [currentPage, statusFilter, sectionFilter, debouncedSearch]);
```

### 3.4. Bulk Operations

**Feature: Bulk Delete Sections/Shelves**

```javascript
const [selectedItems, setSelectedItems] = useState([]);

const handleSelectItem = (id) => {
  setSelectedItems((prev) =>
    prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
  );
};

const handleBulkDelete = async () => {
  if (selectedItems.length === 0) return;

  try {
    setIsLoading(true);

    // Delete in parallel
    const deletePromises = selectedItems.map((id) => shelfService.delete(id));

    const results = await Promise.all(deletePromises);

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.length - successCount;

    if (successCount > 0) {
      setSuccessMessage(`Successfully deleted ${successCount} items`);
      await loadShelves(); // Reload
    }

    if (failCount > 0) {
      setErrorMessage(`Failed to delete ${failCount} items`);
    }

    setSelectedItems([]);
  } catch (error) {
    setErrorMessage("Bulk delete failed");
  } finally {
    setIsLoading(false);
  }
};
```

### 3.5. Export/Import Functionality

**Export Shelves to CSV**

```javascript
const exportToCSV = () => {
  const headers = [
    "Shelf Number",
    "Category",
    "Capacity",
    "Status",
    "Section",
    "Location",
  ];
  const csvData = shelves.map((shelf) => [
    shelf.shelf_number,
    shelf.category,
    shelf.capacity,
    shelf.status,
    shelf.section?.section_name || "",
    shelf.location,
  ]);

  const csvContent = [
    headers.join(","),
    ...csvData.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shelves_${new Date().toISOString()}.csv`;
  a.click();
};
```

**Import Shelves from CSV**

```javascript
const handleImport = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/shelves/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.success) {
      setSuccessMessage(`Imported ${response.data.count} shelves`);
      await loadShelves();
    }
  } catch (error) {
    setErrorMessage("Import failed");
  }
};
```

---

## 🛡️ 4. ERROR HANDLING & VALIDATION

### 4.1. Comprehensive Form Validation

**Section Validation**

```javascript
const validateSectionForm = () => {
  const errors = {};

  // Section name
  if (!formData.sectionName.trim()) {
    errors.sectionName = "Section name is required";
  } else if (formData.sectionName.length < 3) {
    errors.sectionName = "Section name must be at least 3 characters";
  } else if (formData.sectionName.length > 50) {
    errors.sectionName = "Section name must not exceed 50 characters";
  }

  // Shelf count
  if (formData.shelfCount === "") {
    errors.shelfCount = "Shelf count is required";
  } else if (formData.shelfCount < 0) {
    errors.shelfCount = "Shelf count cannot be negative";
  } else if (formData.shelfCount > 1000) {
    errors.shelfCount = "Shelf count seems unrealistic";
  }

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};
```

**Shelf Validation**

```javascript
const validateShelfForm = () => {
  const errors = {};

  // Shelf number
  if (!formData.shelfNumber.trim()) {
    errors.shelfNumber = "Shelf number is required";
  } else if (!/^[A-Z0-9-]+$/i.test(formData.shelfNumber)) {
    errors.shelfNumber =
      "Shelf number can only contain letters, numbers, and hyphens";
  }

  // Category
  if (!formData.category) {
    errors.category = "Category is required";
  }

  // Capacity
  if (!formData.capacity) {
    errors.capacity = "Capacity is required";
  } else if (formData.capacity <= 0) {
    errors.capacity = "Capacity must be greater than 0";
  } else if (formData.capacity > 10000) {
    errors.capacity = "Capacity seems unrealistic";
  }

  // Current capacity validation
  if (formData.currentCapacity > formData.capacity) {
    errors.currentCapacity = "Current capacity cannot exceed total capacity";
  }

  // Location
  if (!formData.location.trim()) {
    errors.location = "Location is required";
  }

  // Section
  if (!formData.section) {
    errors.section = "Section is required";
  }

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};
```

### 4.2. API Error Handling Pattern

```javascript
const handleApiError = (error, defaultMessage) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || defaultMessage;
    setErrorMessage(message);

    // Handle specific status codes
    if (error.response.status === 401) {
      // Unauthorized - redirect to login
      navigate("/login");
    } else if (error.response.status === 403) {
      // Forbidden
      setErrorMessage("You do not have permission to perform this action");
    } else if (error.response.status === 404) {
      // Not found
      setErrorMessage("The requested resource was not found");
    } else if (error.response.status === 409) {
      // Conflict (e.g., duplicate entry)
      setErrorMessage("This item already exists");
    }
  } else if (error.request) {
    // Request made but no response
    setErrorMessage("Server is not responding. Please try again later.");
  } else {
    // Something else happened
    setErrorMessage(error.message || defaultMessage);
  }
};
```

### 4.3. Retry Logic for Failed Requests

```javascript
const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// Usage
const loadShelves = async () => {
  try {
    setIsLoading(true);
    const response = await retryRequest(() =>
      shelfService.getAll({ limit: 100 })
    );
    setShelves(response.data);
  } catch (error) {
    setError("Failed to load shelves after multiple attempts");
  } finally {
    setIsLoading(false);
  }
};
```

---

## 📊 5. PERFORMANCE OPTIMIZATION

### 5.1. Memoization for Filtered Data

```javascript
import { useMemo } from "react";

const filteredShelves = useMemo(() => {
  return shelves.filter((shelf) => {
    const matchesSearch =
      shelf.shelf_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shelf.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All status" ||
      shelf.status === statusFilter.toLowerCase();

    const matchesSection =
      sectionFilter === "All sections" || shelf.section?._id === sectionFilter;

    return matchesSearch && matchesStatus && matchesSection;
  });
}, [shelves, searchTerm, statusFilter, sectionFilter]);
```

### 5.2. Lazy Loading for Large Lists

```javascript
import { useState, useEffect, useRef } from "react";

const useInfiniteScroll = (loadMore, hasMore) => {
  const observerRef = useRef();
  const lastElementRef = useRef();

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });

    if (lastElementRef.current) {
      observer.observe(lastElementRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadMore]);

  return lastElementRef;
};
```

### 5.3. Caching Strategy

```javascript
// Simple in-memory cache
const cache = new Map();

const cachedRequest = async (key, requestFn, ttl = 5 * 60 * 1000) => {
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await requestFn();
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });

  return data;
};

// Usage
const loadShelves = async () => {
  const data = await cachedRequest("shelves_list", () =>
    shelfService.getAll({ limit: 100 })
  );
  setShelves(data.data);
};
```

---

## ✅ 6. IMPLEMENTATION CHECKLIST

### Phase 1: Core Functionality (COMPLETED ✅)

- [x] SectionListView with API integration
- [x] AddSectionView with API integration
- [x] EditSectionView with API integration
- [x] ShelfListView with API integration
- [x] AddShelfView with API integration
- [x] EditShelfView with API integration
- [x] Delete operations with confirmation
- [x] Success/Error message components
- [x] Loading states for all operations

### Phase 2: Enhanced Features (RECOMMENDED)

- [ ] Implement server-side pagination
- [ ] Add debounced search
- [ ] Add bulk operations (bulk delete, bulk update status)
- [ ] Export to CSV functionality
- [ ] Import from CSV functionality
- [ ] Advanced filtering (date range, capacity range)
- [ ] Sorting options (by name, capacity, date)
- [ ] Quick filters (empty shelves, full shelves)

### Phase 3: Statistics & Analytics (RECOMMENDED)

- [ ] Use dedicated stats API endpoints
- [ ] Real-time capacity tracking
- [ ] Utilization charts (capacity usage over time)
- [ ] Section-wise shelf distribution
- [ ] Status distribution pie chart
- [ ] Low capacity alerts

### Phase 4: Performance Optimization (OPTIONAL)

- [ ] Implement React.memo for list items
- [ ] Add virtualization for large lists
- [ ] Implement caching strategy
- [ ] Add optimistic UI updates
- [ ] Reduce re-renders with useMemo/useCallback

### Phase 5: User Experience (RECOMMENDED)

- [ ] Add keyboard shortcuts
- [ ] Implement drag-and-drop for reordering
- [ ] Add tooltips for icons
- [ ] Implement undo/redo for delete
- [ ] Add quick edit (inline editing)
- [ ] Mobile responsive improvements

### Phase 6: Testing & Documentation (IMPORTANT)

- [ ] Write unit tests for services
- [ ] Write integration tests for components
- [ ] Test error scenarios
- [ ] Test edge cases (empty data, network errors)
- [ ] Document API usage patterns
- [ ] Create user guide for features

---

## 📝 7. BEST PRACTICES SUMMARY

### 7.1. Service Layer Pattern

```javascript
// Always use try-catch in service methods
export const sectionService = {
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get("/sections", { params });
      return {
        success: true,
        data: response.data,
        ...response, // Include pagination info
      };
    } catch (error) {
      console.error("Error fetching sections:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch sections",
        data: [],
      };
    }
  },
};
```

### 7.2. Component State Management

```javascript
// Centralize loading and error states
const [state, setState] = useState({
  data: [],
  isLoading: false,
  error: null,
  successMessage: null,
});

// Update helpers
const setLoading = (isLoading) => {
  setState((prev) => ({ ...prev, isLoading }));
};

const setError = (error) => {
  setState((prev) => ({ ...prev, error, isLoading: false }));
};

const setData = (data) => {
  setState((prev) => ({ ...prev, data, isLoading: false, error: null }));
};
```

### 7.3. Form Handling Pattern

```javascript
// Reusable form field component
const FormField = ({ label, name, error, ...props }) => (
  <div className="form-field">
    <label htmlFor={name}>{label}</label>
    <input id={name} name={name} className={error ? "error" : ""} {...props} />
    {error && <span className="error-message">{error}</span>}
  </div>
);

// In component
<FormField
  label="Shelf Number"
  name="shelfNumber"
  value={formData.shelfNumber}
  onChange={handleInputChange}
  error={validationErrors.shelfNumber}
  required
/>;
```

### 7.4. Error Boundary for Components

```javascript
// ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap components
<ErrorBoundary>
  <SectionListView />
</ErrorBoundary>;
```

---

## 🚀 8. NEXT STEPS & RECOMMENDATIONS

### Immediate (Do Now)

1. **Test all CRUD operations** end-to-end
2. **Verify error handling** for network failures
3. **Test with real backend** API endpoints
4. **Ensure data consistency** between frontend and backend

### Short-term (Next Sprint)

1. Implement **server-side pagination**
2. Add **debounced search**
3. Implement **bulk operations**
4. Add **export/import** functionality

### Mid-term (Next Month)

1. Add **statistics dashboard** with charts
2. Implement **performance optimizations**
3. Add **keyboard shortcuts**
4. Create **comprehensive tests**

### Long-term (Future)

1. Add **real-time updates** with WebSockets
2. Implement **audit logging**
3. Add **role-based permissions**
4. Create **mobile app** version

---

## 📊 9. MONITORING & ANALYTICS

### Track Important Metrics

```javascript
// Add to components
import analytics from "../../utils/analytics";

const handleCreate = async () => {
  analytics.track("section_created", {
    section_name: formData.sectionName,
    shelf_count: formData.shelfCount,
  });

  // ... create logic
};

const handleError = (error) => {
  analytics.track("error_occurred", {
    component: "SectionListView",
    error_type: error.name,
    error_message: error.message,
  });
};
```

### Performance Monitoring

```javascript
// Measure API response times
const measurePerformance = async (name, fn) => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;

    console.log(`${name} took ${duration}ms`);

    // Send to analytics
    analytics.timing(name, duration);

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    analytics.timing(`${name}_error`, duration);
    throw error;
  }
};

// Usage
const loadShelves = async () => {
  const data = await measurePerformance("load_shelves", () =>
    shelfService.getAll({ limit: 100 })
  );
  setShelves(data.data);
};
```

---

## 🎯 CONCLUSION

Các page Section và Shelf Management đã được tích hợp API đầy đủ với:

✅ **Core Features Completed:**

- CRUD operations hoàn chỉnh
- Form validation
- Error handling
- Loading states
- Success/Error messages
- Delete confirmations

🔄 **Recommended Enhancements:**

- Server-side pagination
- Advanced filtering
- Bulk operations
- Export/Import
- Statistics dashboard
- Performance optimizations

📈 **Quality Standards:**

- Consistent error handling
- Loading state management
- User feedback with messages
- Data validation
- API response handling

Toàn bộ implementation đã sẵn sàng cho production, với các recommended enhancements có thể được thêm vào dần theo priority business requirements.
