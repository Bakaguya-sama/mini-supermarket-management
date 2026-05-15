# Software Architecture Document

## 1. Introduction

This document provides a comprehensive architectural overview of the **Mini Supermarket Management System**. It captures and conveys the significant architectural decisions that have been made for the system, ensuring that developers, project managers, and stakeholders share a common understanding of the system's structure and behavior.

### 1.2 Scope

The architecture described in this document concerns the web-based Mini Supermarket Management System, comprising a React-based frontend client and an Express/Node.js backend. The system utilizes a **Layered Architecture** (Controller-Model pattern) optimized for reliability, performance, and security. It incorporates advanced inventory management logic, including multi-shelf tracking and atomic stock adjustments.

### 1.3 References

This document references the core technologies, main packages, and security mechanisms utilized in the system:

| #       | Document             | Contents outline                                                                                                                                              |
| :------ | :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [REF1]  | React 19             | Component-based UI rendering library for building user interfaces.                                                                                            |
| [REF2]  | Vite                 | Next-generation frontend tooling providing a fast build tool and development server.                                                                          |
| [REF3]  | React Router DOM     | Declarative routing for React web applications.                                                                                                               |
| [REF4]  | Axios                | Promise-based HTTP client for the browser and node.js used for API communication.                                                                             |
| [REF5]  | Express.js & Node.js | Fast, unopinionated, minimalist web framework for Node.js serving as the RESTful API foundation.                                                              |
| [REF6]  | MongoDB & Mongoose   | Document-oriented NoSQL Database and elegant MongoDB object modeling (ODM) for Node.js.                                                                       |
| [REF7]  | JSON Web Token (JWT) | Open standard (RFC 7519) defining a compact and self-contained way for securely transmitting information as a JSON object, used for stateless authentication. |
| [REF8]  | Bcrypt / Bcryptjs    | A password-hashing function designed to securely hash and store user passwords.                                                                               |
| [REF9]  | Express-Validator    | A set of express.js middlewares that wraps validator.js functions for robust request payload validation.                                                      |
| [REF10] | Layered Architecture | Architectural pattern utilizing Controllers, Services, and Repositories to separate concerns and decouple HTTP transport from business logic.                 |

### 1.4 Document Overview

This document is organized to provide a logical progression through the architecture of the Mini Supermarket Management System. It begins by establishing the foundational goals and constraints that guided the design process. Following this, the architecture is dissected from multiple perspectives—including Use Case, Logical, Implementation, Deployment, and Data views—to ensure all stakeholders, from developers to system administrators, have a clear and comprehensive understanding of the system's inner workings. Finally, the document evaluates the size, performance, and overall quality attributes of the architecture.

---

## 2. Architectural Representation

### 2.1 Architectural Style: Layered Architecture

The Mini Supermarket Management System follows a Layered Architecture style, which emphasizes the separation of concerns by grouping related functionality into distinct layers. This approach enhances maintainability, testability, and scalability. The system is divided into three primary logical layers:

- **Presentation Layer**: Developed using React and Vite, responsible for handling user interactions, displaying data, and communicating with the backend via RESTful APIs.
- **Business Logic Layer (Service Layer)**: The core of the system where all business rules (e.g., inventory management, promotion calculation, order processing) are implemented. This layer coordinates tasks and delegates data persistence to the layer below.
- **Data Access Layer (Repository Layer)**: Responsible for interacting with the MongoDB Database. It handles complex document queries, aggregations, and data manipulations via Mongoose.

### 2.2 The 4+1 View Model

To provide a complete picture of the architecture, this document uses the 4+1 View Model approach:

- **Logical View**: Focuses on the functional requirements and the decomposition of the system into logical components (Controllers, Services, Repositories).
- **Process View (Runtime View)**: Illustrates the system's dynamic behavior, focusing on runtime processes and request handling.
- **Deployment View**: Describes the physical mapping of software components to hardware nodes, including Web Servers, Application Servers, and Database instances.
- **Implementation View (Development View)**: Shows the organization of the actual software modules and packages in the development environment.
- **Use-Case View (+1)**: Acts as a redundant view that links all other views together by demonstrating how the architecture supports key business scenarios.

### 2.3 Technology Stack Summary

The architecture is realized using the following core technologies:

- **Frontend**: React 19 (via Vite) for a Component-Based Single Page Application.
- **Backend Server**: Node.js with Express for building the RESTful API.
- **Database**: MongoDB (Document-oriented NoSQL) accessed via Mongoose ODM.
- **Security**: Custom JWT authentication and Bcrypt for password hashing.

---

## 3. Architectural Goals and Constraints

### 3.1 Architectural Goals (Architecturally Significant Requirements - ASR)

The architecture of the Mini Supermarket Management System is driven by a set of high-priority Quality Attributes. Each goal is mapped to a specific **ASR ID** and priority level (e.g., (H,H) for High Business Value and High Risk/Difficulty).

| QA ID | Quality Attribute | Attribute Refinement | Priority | Driving ASR / Scenario |
| :--- | :--- | :--- | :--- | :--- |
| **QA-01** | **Availability** | Zero downtime updates | (H,H) | UC4.2: Update promotion during deployment. |
| **QA-02** | **Availability** | Fault tolerance via retries | (H,H) | UC22.2: Local payment queuing during congestion. |
| **QA-03** | **Performance** | Latency / Response Time | (H,H) | UC2.3, UC5.4, UC12.4: Paginated search < 2s. |
| **QA-04** | **Reliability** | Data Integrity | (H,H) | UC24.2, UC2.1.3.7: Atomic stock updates. |
| **QA-05** | **Security** | Access Control (RBAC) | (H,H) | UC5.1, UC12.1: JWT Auth & Privilege escalation prevention. |
| **QA-06** | **Security** | Traceability (Audit) | (H,H) | UC24.2, UC20.2: Tamper-proof AUDIT_LOG fields. |
| **QA-07** | **Maintainability** | SoC / Soft-Delete | (H,M) | UC5.3: Soft-delete staff to preserve history. |
| **QA-08** | **Flexibility** | Logic Isolation | (M,M) | UC4.1, UC4.2: Dynamic promotion logic (JSON). |
| **QA-09** | **Scalability** | High Workloads | (M,H) | UC21.1, UC21.6: Managed DBaaS & Stateless API. |
| **QA-10** | **Usability** | Feedback / Validation | (M,L) | UC14.1, UC16.1: Instant validation & fuzzy search. |

### 3.2 Architectural Constraints

The design and implementation of the system are bound by the following technical constraints:

- **Layered Architecture:** The system adheres to a layered design. Frontend components and Backend Controllers are prohibited from executing direct database queries without going through the Model layer.
- **Document-Oriented Database:** To accommodate the dynamic nature of product catalogs and multi-shelf relationships, MongoDB is utilized as the primary NoSQL data store.
- **Stateless Backend:** The API must remain stateless (using JWT) to allow for horizontal scaling and minimize server-side session overhead.
- **Platform Independence:** The core backend services are designed to be platform-agnostic, enabling deployment via Docker or standard virtual machines.

### 3.3 Architectural Rationale

The decision to adopt a Controller-Service-Repository architecture with a stateless custom backend is driven by several core justifications:

- **NoSQL for Flexibility:** The decision to adopt MongoDB is driven by the need to handle heterogeneous product attributes flexibly without complex schema migrations or multi-table JOINs, which are common in supermarket product catalogs.
- **Deep Control via Custom Backend:** A custom Node.js/Express backend provides the necessary granular control over complex business workflows (e.g., stock batch expirations, promotion calculations) that are often constrained by generic Backend-as-a-Service (BaaS) platforms.
- **Resilience via Exception Masking:** Implementing a Global Exception Handler across the Backend API ensures that all unexpected server errors (HTTP 500) are gracefully caught, sanitized, and logged internally. This guarantees that zero sensitive stack trace data is ever exposed to the client, a vital requirement for system security.

### 3.4 Architectural Trade-offs

To achieve the aforementioned goals of control, security, and flexibility, the following trade-offs have been accepted:

- **Application-Level Data Integrity vs. RDBMS Constraints:** Relying on a NoSQL document store means the system lacks built-in foreign key constraints. Referential integrity (e.g., cascading updates if a category name changes) must be manually enforced in the application's Service layer, increasing code complexity compared to SQL.
- **Boilerplate Overhead vs. Maintainability:** The strict separation of Repository and Service layers introduces additional boilerplate code for simple CRUD operations. However, this trade-off is accepted to ensure long-term maintainability and prevent business logic from leaking into controllers.
- **Manual Scalability vs. Auto-scaling:** Unlike a serverless architecture where scaling is handled automatically, this traditional architecture requires the team to manually configure, provision, and maintain the deployment nodes.

---

## 4. Security

### 4.1 Introduction

Security is a paramount quality attribute for the Mini Supermarket Management System, especially given its role in processing transactions and managing staff data. In this architecture, the system implements a custom, fully controlled internal security infrastructure within the backend. This ensures strict access control and compliance with enterprise security standards.

### 4.2 Authentication & Authorization

The system employs a stateless security mechanism based on industry-standard encryption to verify user identities and enforce access rights:

- **Authentication (Bcrypt & JWT):** When a user (Staff or Admin) registers or logs in, their password is subjected to one-way hashing using the Bcrypt algorithm before being persisted in the database. Upon successful verification, the backend generates a JSON Web Token (JWT) containing the user's identity payload and returns it to the client.
- **Role-Based Access Control (RBAC):** All sensitive REST API endpoints are protected by an Auth Middleware. This middleware acts as a gatekeeper, intercepting incoming HTTP requests to decode and verify the JWT signature in the header. It enforces strict RBAC, ensuring that users can only execute actions permitted by their assigned roles.
- **Privilege Escalation Prevention:** To prevent malicious role upgrades, role modifications are handled exclusively by Admin-only endpoints. This contains rigid validation rules to guarantee that no regular staff can self-escalate to Admin privileges.

### 4.3 Client-Server Communication

To protect data integrity and confidentiality against eavesdropping and Man-in-the-Middle (MitM) attacks, data transmitted between the React Client and the Backend API must be encrypted:

- **HTTPS/TLS:** It is strictly mandated that all RESTful API endpoints operate over HTTPS using Transport Layer Security (TLS) in the production environment.

### 4.4 Exception Prevention & Masking

To prevent attackers from exploiting system vulnerabilities through error messages, the architecture incorporates an Exception Prevention and Masking tactic:

- **Global Exception Handler:** The entire Backend API is wrapped in a centralized error-handling module. Instead of crashing the application or leaking raw stack traces to the client when a database failure (HTTP 500) or a bad request (HTTP 400) occurs, this handler intercepts the exception. It logs the detailed stack trace internally for developers and returns a sanitized, standardized JSON error message to the client. This guarantees that zero sensitive backend infrastructure data is exposed.

### 4.5 System Auditing & Audit Trail

Ensuring traceability for security incidents and inventory discrepancies is a critical architectural requirement. To achieve this, the system implements an Audit Trail tactic:

- **Traceability:** Critical data mutations (creating/updating products, processing orders) are tracked. The system embeds user identity references (e.g., `createdBy`, `updatedBy`) within the MongoDB documents to ensure accountability for inventory and financial changes.

### 4.6 Secrets and API Key Management

Unlike legacy systems that rely on configuration files for certificates, the system manages sensitive credentials (e.g., `JWT_SECRET`, `MONGO_URI`) through secure Environment Variables (`.env`). In the production environment, these secrets are securely encrypted and injected dynamically by the hosting provider.

### 4.7 Security Disclaimer

While the system utilizes secure authentication mechanisms, the operational team must still adhere to standard security practices. This includes strictly keeping environment variables (`.env`) out of public version control (GitHub), configuring CORS policies correctly, and securing physical access to server resources.

---

## 5. Use-Case View

This section provides a representation of the use cases that are architecturally significant to the Mini Supermarket Management System.

**Selection Rationale**
The use cases relevant for the architecture have been selected based on the following criteria:

- Use cases that heavily exercise the core Architectural Drivers (Security, Reliability, and Performance).
- Use cases representing the critical paths for the primary actors: Manager, Staff (Warehouse/Cashier), and Customer.
- Use cases that involve complex state changes within the Backend API database (e.g., inventory management) and strict authorization checks via JWT Auth Middleware.

**The following use cases have been selected:**

- **Customer Role:**
  - **Account & Security:** Signup (UC13), Profile (UC11), Password Reset (UC11.3).
  - **Shopping:** Product Search (UC14), Cart Management (UC21), Checkout (UC21.3).
  - **Loyalty:** View Points (UC10), Promotions (UC10.2), Rate Order (UC21.4).
- **Warehouse Staff Role:**
  - **Inventory:** Goods Receiving (UC24), Stock Adjustments (UC18), Batch Tracking (UC24.2).
  - **Shelf Mgmt:** Product-to-Shelf Mapping (UC20.1), Shelf Updates (UC20.2).
- **Cashier Role:**
  - **POS Operations:** Create Invoice (UC23), Process Payment (UC22), Add Customer (UC17).
- **Manager Role:**
  - **Business Control:** Promotion Mgmt (UC4), Product/Supplier Mgmt (UC3, UC6).
  - **Staff Mgmt:** Account Mgmt (UC5), Report Approvals (UC12), Instructions (UC9).
  - **Analytics:** Business Reports (UC8), Audit Trail (UC24.2).

---

## 6. Logical View

### 6.1 Overview

This chapter describes the logical organization of the Mini Supermarket Management System. To fulfill the strict quality attributes specified in the Architectural Drivers (specifically Reliability, Security, and Maintainability), the system utilizes a **Layered Architecture** (Presentation - Logic - Data). This logical decomposition ensures a strict Separation of Concerns (SoC). Each layer is cohesive, loosely coupled, and interacts with adjacent layers exclusively through well-defined patterns.

### 6.2 Architecturally Significant Design Packages

The architecture is logically divided into three primary layers and an external resources integration tier.

#### 6.2.1 Presentation Layer (Client Tier)

This layer is entirely decoupled from business rules and data persistence. Its sole responsibility is rendering the user interface, managing local client state, and capturing user inputs.

- **UI Components:** Built using React and Vite. It encapsulates the visual elements for all actor scopes: Manager Dashboards, Staff Portals (Warehouse/Cashier), and the Customer Shopping interface.
- **State Management & API Clients:** Utilizes HTTP clients (e.g., Axios) to communicate with the Backend REST API, and manages state to reflect real-time updates like cart totals or inventory alerts.

#### 6.2.2 Business Logic Layer (Application Tier)

This is the core layer of the system, residing on a secure Node.js backend server. It orchestrates all business rules, validates inputs, and enforces security policies.

- **Controllers & Gateways:** Act as the entry points for all HTTP requests, handling route mapping and payload deserialization (e.g., `OrderController`, `ProductController`).
- **Cross-Cutting Middlewares:**
  - **Auth Middleware (RBAC):** Intercepts all incoming requests to mathematically verify JWT signatures and strictly enforce Role-Based Access Control.
  - **Global Exception Handler:** A centralized safety net that catches all unhandled server or database exceptions (HTTP 500/400). It sanitizes errors, logs stack traces internally, and returns safe JSON responses.
- **Core Domain Services:** Encapsulate complex business workflows.
  - **InventoryService:** Manages stock levels, batch tracking, and atomic stock deductions.
  - **OrderService:** Handles transaction validation, integrates with promotions, and processes payments.
  - **Centralized Logging Service:** Records all data mutations into an immutable Audit Trail.

#### 6.2.3 Data Access Layer (Repository Tier)

To protect the Business Logic Layer from changes in database technology or ORM updates, all data persistence operations are isolated within the Data Access Layer using the Repository Pattern.

- **Repositories (`ProductRepository`, `OrderRepository`, etc.):** These components are the only entities permitted to execute raw MongoDB queries or utilize Mongoose ODM methods.
- **Concurrency Control:** The Repositories are specifically responsible for executing advanced database-level atomic operations (e.g., `$inc`) and multi-document transactions to guarantee consistency and completely eliminate "overselling" during peak shopping hours.

#### 6.2.4 External Integrations (Infrastructure)

The Data Access and Logic layers communicate with specialized external infrastructure:

- **Primary Database (NoSQL):** MongoDB acting as the single source of truth for transactional data and heterogeneous product catalogs.
- **Cloud Object Storage:** Stores product images and documents, referenced via URLs in the database to prevent document bloat.
- **Session-Based Caching:** Utilizes server-side memory or session stores for frequently accessed read-heavy data (like cart data and active promotions) to reduce database load.

---

## 7. Deployment View

The Mini Supermarket Management System is deployed using a robust multi-tier infrastructure. This architecture provides the development team with full control over the compute, networking, and data persistence layers. This level of control is essential to guarantee data integrity, prevent inventory overselling, and manage high-concurrency traffic effectively.

**The logical deployment nodes are identified as follows:**

- **Client Node (User Device):** The execution environment for the end-user, running on a standard web browser (Desktop or Mobile). It hosts the compiled React frontend bundle. It communicates with the backend exclusively through the Reverse Proxy via secure HTTPS.
- **Web Server / Reverse Proxy Node (Nginx):** Acts as the primary gateway and the first line of defense. It is responsible for SSL/TLS termination, serving static frontend assets, and efficiently load-balancing incoming traffic across multiple internal Application Server instances.
- **Application Server Node (Node.js):** The core stateless runtime environment hosting the Business Logic Layer. It executes the REST API controllers, the custom Auth Middleware, the Global Exception Handler, and all domain services. Because these nodes are stateless, they can be horizontally scaled behind the Nginx load balancer.
- **Managed Database Node (MongoDB Atlas):** The system utilizes MongoDB to ensure flexible schema design and fast document retrieval. By adopting a managed DBaaS like MongoDB Atlas, the architecture separates compute from storage, allowing the database to automatically scale its processing power during traffic spikes.
- **Infrastructure Services (Storage & Caching):**
  - **Server-Side Cache:** Memory-efficient caching of frequently accessed data (e.g., product categories, active promotions).
  - **Asynchronous Processing:** Handles time-consuming tasks like generating complex monthly revenue reports.

---

## 8. Implementation View

### 8.1 Overview

This section describes the physical organization of the software layers and how the source code is structured within the version control repository. The platform utilizes a modern JavaScript/TypeScript stack with React (via Vite) on the frontend and Node.js/Express on the backend.

The implementation view maps the logical building blocks defined in the Logical View into physical directories and files, ensuring that developers can easily navigate the codebase and strictly adhere to the Separation of Concerns (SoC) principle.

### 8.2 Directory Structure and Layer Mapping

The system's codebase is logically divided into the following implementation directories:

**Presentation Layer (Frontend `client/`):**

- `/src/pages/` and `/src/components/` containing React routing views and reusable components.
- `/src/services/` containing Axios API clients to communicate with the backend.

**Business Logic Layer (Backend `server/`):**

- `/src/controllers/`: Acts as the entry point for backend operations. Files here (e.g., `productController.js`) handle incoming HTTP requests, extract payload data, and return HTTP responses.
- `/src/services/`: The core of the application. These files encapsulate complex business rules (e.g., `orderService.js` for calculating revenues and applying promotions, or `inventoryService.js` for handling restocks).
- `/src/middlewares/`: Houses cross-cutting concerns that intercept requests, including `authMiddleware.js` for JWT validation/RBAC and `errorHandler.js` for global error masking.

**Data Access Layer (Model):**

- `/src/models/`: Defines the Mongoose schemas and indexes (e.g., `Account`, `Product`, `ProductShelf`, `Invoice`). This layer encapsulates database interaction and schema validation.
- `/src/config/`: Contains infrastructure integration files, such as database connection URIs.

---

## 9. Data View

### 9.1 Data Model

The system relies on a Document-Oriented NoSQL database (MongoDB). This allows for dynamic product schemas where different categories (e.g., Electronics vs. Groceries) can have flexible attributes without requiring complex table joins or schema migrations.

### 9.2 Core Entities Description

- **Accounts & Roles (`accounts`, `staff`, `managers`, `customers`):** The system strictly separates generic authentication data (`accounts`) from role-specific profiles (`staff`, `managers`, `customers`). This normalizes login credentials while allowing role-specific fields (e.g., membership points for customers, salary for staff).
- **Inventory Management (`products`, `shelves`, `sections`, `product_shelves`):** The system models the physical warehouse layout. `products` defines the core details (SKU, barcode, global stock). Inventory is dynamically managed via the `product_shelves` junction table, mapping a product to multiple physical `shelves` (and `sections`) with specific quantities and expiry dates.
- **Transactions & Delivery (`orders`, `order_items`, `invoices`, `payments`, `delivery_orders`):** Separates the conceptual order (`orders`, `order_items`) from the financial receipt (`invoices`, `invoice_items`) and physical delivery assignments (`delivery_orders`). `payments` specifically handles the transaction states and methods.
- **Promotions (`promotions`, `promotion_products`):** Explicitly links campaigns to applicable products through a junction table (`promotion_products`), allowing granular discount overrides.
- **Operational Data (`instructions`, `reports`, `customer_feedbacks`):** Manages internal staff task assignments, performance reporting, and customer grievance tracking.

### 9.3 Data Auditing & Traceability

To strictly satisfy the Reliability and Security requirements, the platform implements a comprehensive auditing strategy:

- **Soft Deletion:** Collections implement an `isDelete` boolean flag (used across all 23 Mongoose schemas). Records are never permanently removed via application logic to preserve historical integrity.
- **Traceability Fields:** Critical business entities (e.g., `products`, `promotions`, `orders`) include `createdBy` and `updatedBy` fields referencing Account IDs. This establishes a direct chain of custody for all mutations.
- **Audit Logging:** Critical system actions such as `IMPORT_HISTORY` and `EXPORT_HISTORY` are recorded within dedicated collections, capturing the User ID, action type, timestamp, and modification payload.

### 9.4 State Machines

The core dynamic behavior revolves around the lifecycle of order transactions and inventory workflows.

**9.4.1 Order Payment & Fulfillment State Machine**

- **PENDING:** A new order is created. The system tentatively deducts the quantity from the `products` and `product_shelves` records.
- **PAID / COMPLETED:** Upon successful payment or cashier confirmation, the payment status changes to 'completed' and an `invoice` is generated. The sale is finalized.
- **FAILED / CANCELLED:** If the payment fails, the order is marked 'failed', and the tentatively locked inventory is restored back via atomic `$inc` operations.
- **REFUNDED:** Manager triggers a return. The order status becomes 'refunded', and the stock is optionally restocked into the system.

**9.4.2 Staff Report Workflow State Machine**

- **PENDING:** Staff submits a report (Incident/Damage). Notification is sent to the Manager.
- **APPROVED:** Manager reviews and approves the report. Stock discrepancies may be officially recorded.
- **REJECTED:** Manager rejects invalid reports with comments.

---

## 10. Size and Performance

### 10.1 Size Constraints and Data Management

The Mini Supermarket Management System focuses on optimizing application state, fast data retrieval, and efficient storage management.

- **Document Data Optimization**: The system utilizes MongoDB. To ensure rapid query execution and prevent document bloat, the schema is designed efficiently. For example, rather than embedding infinitely growing arrays of sold items inside a user record (a NoSQL anti-pattern), orders are stored in dedicated collections referencing the User ID. This keeps individual document sizes lightweight and predictable.
- **Binary Object Storage**: The system strictly prohibits storing large binary files (such as high-resolution product images) directly in the MongoDB database. Instead, it leverages dedicated Cloud Object Storage (e.g., AWS S3, Cloudinary). The database only stores the lightweight reference URLs, drastically reducing the database footprint and I/O costs.
- **Payload Restrictions**: To prevent bandwidth abuse and server storage exhaustion, file uploads are restricted via UI validation and Backend Middlewares (e.g., maximum 5MB per image file) before any data is processed by the server.

### 10.2 Performance and Scalability

To meet high-performance requirements during peak sales hours, the architecture employs several advanced scalability tactics:

- **Multi-Level Caching**:
  - **Static Assets**: The React frontend utilizes optimized builds to serve static assets efficiently, minimizing Time-To-First-Byte (TTFB).
  - **Dynamic Data**: For read-heavy operations like browsing paginated product lists, the backend utilizes server-side session-based caching. This reduces the computation load on the primary database.
- **High-Concurrency Inventory Management**: To prevent database bottlenecks during massive sales spikes, the inventory logic utilizes MongoDB's highly optimized atomic operations (e.g., `$inc`) to manage stock deductions with sub-millisecond latency.
- **Asynchronous Processing**: Heavy, time-consuming operations—such as generating complex revenue reports—are processed asynchronously to ensure the user interface remains responsive.
- **Compute-Storage Separation**: By deploying the database on a managed DBaaS platform (e.g., MongoDB Atlas), the architecture decouples compute from storage, allowing the database to scale resources during peak hours.
- **Database Indexing and Pagination**: Frequently queried fields (e.g., `sku`, `barcode`, `invoice_number`) are equipped with B-Tree indexes. Furthermore, the REST API strictly enforces pagination for large collections, preventing memory overload.
- **Query Optimization**: The Data Access Layer utilizes Mongoose's `.lean()` method for read-only operations to bypass heavy Mongoose document instantiation, drastically reducing RAM usage.

---

## 11. Quality

The architecture of the Mini Supermarket Management System is engineered to maximize reliability, security, and performance under high-concurrency conditions.

### 11.1 Security

- **Authentication and Authorization:** The system entirely abandons third-party Identity-as-a-Service (IDaaS) in favor of a custom Auth Middleware. Passwords are cryptographically hashed using Bcrypt, and sessions are securely managed via JSON Web Tokens (JWT). The middleware intercepts all requests to strictly enforce Role-Based Access Control (RBAC) across distinct roles (Admin, Manager, Staff, Customer), preventing privilege escalation.
- **Audit Trail & Traceability:** To ensure absolute traceability, the architecture implements a Centralized Logging mechanism (e.g., Winston). Every critical data mutation (Create, Update, Delete) and financial transaction (e.g., inventory restocks, order creations) is logged independently with the executor's User ID, timestamp, and IP address, ensuring an immutable audit trail.

### 11.2 Reliability & Availability

- **ACID-Compliant Transactions & Atomic Operations:** To completely eliminate the risk of "overselling" products during high-traffic checkout periods, the Data Access Layer leverages MongoDB. By utilizing atomic `$inc` operations and Mongoose multi-document transactions, the system guarantees that stock inventory deductions are processed atomically. If a payment or order validation fails, the database transaction rolls back cleanly without data corruption.
- **Fault Tolerance via Connection Resilience:** Acknowledging that network layers can experience congestion, the system relies on Mongoose's native auto-reconnect and retry logic. If the connection to MongoDB Atlas drops, the connection pool automatically queues pending operations and retries, ensuring transient faults do not result in lost orders.
- **Exception Prevention & Masking:** The Backend API is wrapped in a Global Exception Handler. Unhandled exceptions (HTTP 500) are caught, logged internally via Winston, and sanitized before returning a safe JSON response to the client. This prevents the Node.js application from crashing and ensures zero sensitive stack-trace data is exposed to end-users.
- **Fault Detection & Fail-Fast:** To ensure high availability and prevent cascading failures, the Node.js backend monitors the MongoDB connection state (`mongoose.connection.readyState`). If the database connection is lost, the API can quickly return a 503 Service Unavailable response for dependent routes, isolating the fault and protecting the server from thread exhaustion.

### 11.3 Performance & Scalability

- **Database Indexing & Query Optimization:** To ensure sub-millisecond response times for queries, the system strictly enforces B-Tree database indexing on heavily queried fields (`sku`, `barcode`, `invoice_date`). Furthermore, the Data Access Layer utilizes Mongoose's `.lean()` method for read-only operations to drastically reduce RAM usage.
- **Computation Efficiency:** The system strictly enforces API pagination for large datasets (e.g., Admin product lists, transaction histories, or damaged product reports), preventing memory exhaustion on both the backend server and the client's browser.

### 11.4 Maintainability & Flexibility

- **Strict Separation of Concerns:** Adhering to the Layered Architecture, UI Components (React/Vite) solely handle presentation, while volatile business rules are parameterized and strictly isolated within the Backend `src/services/` and `src/repositories/` directories. This allows developers to seamlessly add new features (e.g., dynamic promotional campaigns) without disrupting the core Point-Of-Sale (POS) flow.
- **Soft Deletion Strategy:** To maintain historical data integrity for revenue reporting and audit logs, the database utilizes a soft-delete tactic (using the `isDelete: true` boolean flag across all 23 Mongoose schemas) instead of hard-deleting records via MongoDB `deleteOne` commands.

### 11.5 Portability

The system is inherently "cloud-native" and infrastructure-agnostic:
- The backend is a standard Node.js application.
- The database interacts via standard MongoDB connection strings.
- The entire platform can be containerized using Docker and migrated to any cloud provider (AWS, Google Cloud, DigitalOcean) with zero code refactoring.

### 11.6 Detailed Mapping of Quality Attributes to Architectural Tactics (ADD/ASR)

This table explicitly links the **Architecturally Significant Requirements (ASR)** to the architectural tactics and implementation elements within the codebase.

| Quality Attribute | Refinement / Scenario | Driving ASR | Architectural Tactic / Strategy | Implementation Element |
| :--- | :--- | :--- | :--- | :--- |
| **Availability** | Fault Tolerance | UC2.1.3.6 (BR4) | Exception Masking & Local Queuing | Global Exception Handler, local payment queuing |
| **Availability** | Detect Faults | UC6.1 | Mongoose Connection Monitoring | `mongoose.connection.readyState` checks |
| **Performance** | Latency | UC24.3, UC16.2 | B-Tree Indexing & Pagination | Indexes on `sku`, `barcode`, `invoice_date` |
| **Performance** | Efficiency | UC15.1, UC21.5 | `.lean()` Queries & Server Caching | `OrderController`, `ProductController` |
| **Reliability** | Data Integrity | UC24.2, UC2.1.3.7 | Atomic `$inc` & DB Transactions | `invoiceController.js`, `orderController.js` |
| **Reliability** | Validation | UC24.1, UC2.1.3.6 | Server-side Limit Checking | `InventoryService` logic in controllers |
| **Security** | Access Control | UC5.1, UC5.3 | JWT Auth Middleware & Bcrypt RBAC | `authMiddleware.js`, `authController.js` |
| **Security** | Traceability | UC24.2, UC2.1.3.7 | Centralized Audit Trail | `createdBy`, `updatedBy` fields in models |
| **Security** | Privilege Protection | UC12.1 | Rigid Role Validation | Admin-only endpoints for role mutations |
| **Flexibility** | Logic Isolation | UC4.1, UC4.2 | Encapsulated Service Logic | `PromotionController` business rules |
| **Maintainability** | SoC | Gen-Req | Layered Architecture (Separated Tiers) | Detached React Frontend / Express Backend |
| **Usability** | Feedback | UC16.1, UC24.1 | UI Validation & Express-Validator | React Forms & `express-validator` middleware |
| **Scalability** | Separation | UC21.1, UC21.6 | Stateless Design & Managed DBaaS | JWT auth & MongoDB Atlas integration |
| **Reusability** | Modularity | Gen-Req | Component-Based Design | Reusable React UI Components |

### 11.7 Detailed Quality Attribute Scenarios (Refined ADD Mapping)

This section provides the most granular view of the architecture's fulfillment of quality requirements, directly synchronized with the **Refined ADD.txt** source.

| QA / Refinement | Stimulus (Source) | Environment | Artifact (Implementation) | Response Measure | US ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Availability**: Zero downtime | Modifies promotions (Manager) | Normal | `promotionController.js` | 0% of users encounter 503 errors. | UC4.2 |
| **Availability**: Fault tolerance | POS network loss (Cashier) | Degraded | `invoiceController.js` / Local Queue | 100% of payments eventually recorded. | UC22.2 |
| **Availability**: Exception Masking | Unhandled exception (System) | Normal | Global Exception Handler | 0 crashes; 0 sensitive data leaked. | UC8.1 |
| **Conceptual Integrity**: Consistency | Update customer info (Manager) | Normal | `customerController.js` | 100% reuse of standard update flow. | UC2.2, UC17.2 |
| **Conceptual Integrity**: State | Search reports (Staff) | Normal | `staffController.js` | All modules interpret states consistently. | UC16.2 |
| **Flexibility**: Partial updates | Update shelf product (Supervisor) | Normal | `productShelfController.js` | Update saved within 2 seconds. | UC20.2 |
| **Flexibility**: Dynamic config | Adjust selling price (Manager) | Normal | `productController.js` | 0 system deployments needed. | UC3.2 |
| **Interoperability**: Formats | Export reports (Manager) | Normal | Export Service (CSV/PDF) | 100% compatible with 3rd-party tools. | UC6.5+ |
| **Maintainability**: Unified Role | Add staff account (Manager) | Normal | `staffController.js` / Role Array | 0 UI changes needed for new roles. | UC5.1 |
| **Maintainability**: Soft-delete | Deactivate staff (Manager) | Normal | Account/Staff Service | 100% historical accuracy preserved. | UC5.3 |
| **Modification**: Safe Schema | Create promotion rules (Manager) | Normal | `promotionController.js` | New discount types added without crash. | UC4.1 |
| **Manageability**: State Machine | Update delivery status (Staff) | Normal | `deliveryOrderController.js` | Customer notified within 3 seconds. | UC25.3 |
| **Manageability**: Audit Trail | Update shelf/report (Staff) | Normal | Centralized `AUDIT_LOG` | 100% of mutations fully traceable. | UC16.1 |
| **Performance**: Latency | Search customers/products | Normal | Controllers with DB Indexes | Results load in under 2 seconds. | UC2.3+ |
| **Performance**: Load Speed | View order history (Customer) | Degraded | `orderController.js` / Cache | History loads in under 3 seconds. | UC21.5 |
| **Reliability**: Transaction | Create payment (Cashier) | Normal | `invoiceController.js` / Transaction | 0% orphaned payments; atomic rollback. | UC22.1 |
| **Reliability**: Integrity | Delete product w/ history (Mgr) | Normal | `productController.js` / DB Logic | 0 orphaned invoice lines. | UC3.4 |
| **Scalability**: High Workload | Flash sale event (Customer) | Overloaded | Auto-scaling / Load balancer | 95% latency < 3s for 10k users. | UC21.1 |
| **Security**: Credential | Signup/Login (Customer) | Normal | Auth Service (Bcrypt) | 0 plain text passwords in DB. | UC13.1 |
| **Security**: Privilege | Role Assignment (Manager) | Normal | `staffController.js` / Role Logic | 100% prevention of unauthorized gain. | UC5.1 |
| **Usability**: Info Arch | Storefront interaction (Cust) | Normal | Frontend UI Components | Users complete tasks w/ minimal confusion. | UC10.1+ |

### 11.8 System Operation Environments

Based on the **Refined ADD.txt** analysis, the architecture is designed to maintain specific quality levels across three distinct operational environments:

- **Normal Operation:** Standard daily supermarket activities. The architecture focuses on latency (<2s) and conceptual integrity.
- **Degraded Operation:** Occurs during network congestion or infrastructure resource constraints. The architecture employs tactics like **Local Queuing** and **Server-Side Caching** to maintain availability (UC22.2, UC21.5).
- **Overloaded Operation:** Occurs during high-traffic events like flash sales. The architecture triggers **Auto-scaling** and **Stateless Session Management** to handle up to 10,000 concurrent users with <3s latency (UC21.1, UC21.6).

---

## 12. Logging

### 12.1 Implementation

As a custom-hosted layered architecture, the system implements a robust logging mechanism using standard output streams and structured metadata.

- **Console Transport:** System anomalies, error stack traces, and application warnings are written to the standard output for real-time debugging.
- **Database Audit Trail:** Critical security events and business transactions (e.g., inventory imports, staff role changes) are logged into dedicated collections in MongoDB or as metadata within existing documents.
- **Log Structure:** All logs include `timestamp`, `severity_level`, `user_id`, and `request_context`.

Logs within the platform are logically grouped into three main categories:

- **SECURITY:** Information about user authentication, RBAC middleware rejections, and JWT validations.
- **BUSINESS:** Information regarding core platform operations such as order placements, stock deductions, and report approvals.
- **SYSTEM:** Internal application health, background worker statuses, and unhandled exceptions caught by the Global Exception Handler.

### 12.2 System Log Codes

| Category     | Event Code | Description                                                                                  |
| :----------- | :--------- | :------------------------------------------------------------------------------------------- |
| **SECURITY** | `SEC-001`  | Unauthorized access attempt blocked by Auth Middleware (Missing/Invalid JWT).                |
| **SECURITY** | `SEC-002`  | User attempted to access a restricted API endpoint without the required role.                |
| **SECURITY** | `SEC-003`  | Failed login attempt (Invalid credentials / Potential brute-force risk).                     |
| **SECURITY** | `SEC-004`  | Suspicious data access pattern detected (Rate limiting threshold exceeded).                  |
| **SECURITY** | `SEC-005`  | High-level privilege mutation (e.g., promoting a Staff member to Admin/Manager).             |
| **BUSINESS** | `BUS-001`  | New Product or Promotion successfully created by a Manager.                                  |
| **BUSINESS** | `BUS-002`  | Inventory update failed due to validation constraints (e.g., exceeding capacity).            |
| **BUSINESS** | `BUS-003`  | Ticket/Stock inventory mutation completed: Quantity successfully deducted via atomic `$inc`. |
| **BUSINESS** | `BUS-004`  | Order transaction successfully captured and completed.                                       |
| **BUSINESS** | `BUS-005`  | Goods imported/exported successfully; `IMPORT_HISTORY` logged.                               |
| **SYSTEM**   | `SYS-001`  | Global Exception Handler triggered: Unhandled server error caught, masked, and logged.       |
| **SYSTEM**   | `SYS-002`  | Connection lost or successfully reconnected to MongoDB / Redis.                              |
| **SYSTEM**   | `SYS-003`  | Background Worker Task Failed (e.g., Failed to generate report or dispatch email).           |
| **SYSTEM**   | `SYS-004`  | External API Integration Timeout (e.g., Payment Gateway or Cloud Object Storage failure).    |

### 12.3 Data Auditing & Traceability

To ensure absolute traceability for financial and administrative operations, every critical business operation (e.g., creating a promotion, restocking) is recorded with immutable `createdAt` and `createdBy` (`user_id`) timestamps within the MongoDB documents. For operations that modify existing records, the exact mutation payload is logged via the Centralized Logging Service, ensuring a clear, unalterable audit trail.

---

## 13. Caching

### 13.1 Introduction

To optimize performance, dramatically minimize MongoDB database reads, and deliver a blazing-fast user experience, the system employs a deliberate caching strategy at the Edge and Application layers.

### 13.2 Frontend and Edge Caching

The React presentation layer leverages built-in caching mechanisms deployed across a Content Delivery Network (CDN) and the client browser:

- **Static Assets & CDN:** Publicly accessible assets and compiled JS/CSS bundles are cached on CDN edge nodes, allowing users to load the initial application with near-zero latency.
- **Client-Side Cache:** Axios interceptors and React state management can cache repetitive dictionary data (e.g., list of categories) to prevent redundant HTTP requests to the backend.

### 13.3 Backend Query Caching

To protect the primary MongoDB database from heavy read loads, the Logic Layer integrates session-based caching:

- **Explicit Query Caching:** Heavy read operations, such as paginated product lists and active promotions, are cached. When a user requests this data, the system first checks the cache before querying MongoDB.
- **Cache Invalidation:** When a mutation occurs (e.g., price update), the corresponding cache is cleared to ensure data consistency.

### 13.4 Authentication & Session Caching

The platform brings session management in-house to reduce latency:

- **Stateless JWTs:** User authentication state is maintained via stateless JSON Web Tokens (JWTs), allowing the Auth Middleware to verify permissions instantly using cryptographic signatures without hitting the database.
- **Token Invalidation:** Secure logouts or immediate role revocations are handled by managing token expiration and validity on the server side.

---

## 14. Multi-Branch / Multitenancy

### 14.1 General

While a single instance of the Mini Supermarket App may serve a single physical location, the architecture is designed to support **Logical Isolation** using a Discriminator Field Strategy to accommodate potential expansion to multiple branches (Multitenancy).
All data can be stored in shared collections (e.g., `products`, `orders`, `staff`), but every branch-specific document inherently holds a discriminator field—specifically, the `branch_id` or `store_id`.

### 14.2 Identification and Security

- **Tenant Identification:** Tenant (branch) identification is securely and implicitly managed via the custom Auth Middleware. When a Staff or Manager logs in, the backend encodes their assigned `branch_id` into the signed JWT.
- **Security and Access Segregation:** To prevent cross-branch data leakage, the Repository Layer strictly appends an ownership clause (e.g., `{ branch_id: decoded_jwt.branch_id }`) to queries. This completely mitigates Insecure Direct Object Reference (IDOR) vulnerabilities.

### 14.3 Configuration and Shared Resources

- **File Storage Isolation:** Product images are stored in shared Cloud Object Storage, but logically linked to specific branch databases if needed.
- **Background Jobs:** Asynchronous tasks (like sweeping expired product batches) are managed globally via worker processes. A single worker sweeps the collection, identifying expired goods across all branches concurrently, drastically reducing operational overhead.

---

## 15. Data Indexing and UI Performance

### 15.1 Architectural Approach to Performance

In contrast to legacy systems that rely on complex "UI Replication" mechanisms (e.g., maintaining secondary flat tables synchronized via heavy messaging queues) to mitigate UI latency, the Mini Supermarket Management System employs a native, streamlined performance strategy. By leveraging MongoDB's flexible document model, strategic B-Tree indexing, and a dedicated Redis Cache layer, the architecture guarantees sub-second query execution and real-time UI responsiveness, entirely eliminating the overhead of redundant replication tables and background cron-job synchronization.

### 15.2 Database Indexing Mechanism

Instead of relying on slow table scans, the system achieves high-performance data retrieval through strictly defined B-Tree Indexes in MongoDB.

**Key Index Implementations:**

- **Product Searching:** Indexes are placed on `products` collection attributes (e.g., `barcode`, `sku`, `category_id`). This allows the POS screen and search interfaces to rapidly locate items.
- **Inventory Lookup:** The `product_shelves` collection is indexed by `product_id` and `expiry_date` to ensure rapid validation during checkout.
- **Business Reporting:** The `orders` and `invoices` collections are indexed by `createdAt` and `status` to ensure complex aggregation pipelines (calculating total revenue) execute swiftly.

### 15.3 Reactive UI Synchronization

To prevent overselling while maintaining a dynamic user experience across multiple POS terminals, the system ensures data consistency through efficient state management.

- **Optimistic UI:** The React frontend utilizes optimistic updates for non-critical actions to ensure a fluid user experience.
- **Immediate Re-render:** Components (e.g., the Cashier screen) react to updated state payloads from API responses, instantly triggering a localized DOM re-render to reflect "Available Stock" in real-time.
- **Polling & Manual Refresh:** For high-traffic dashboards, the system implements smart polling or manual refresh triggers to stay synchronized with backend inventory changes.

### 15.4 Rate Limiting & Pagination

To further protect backend infrastructure and prevent massive memory consumption on the client browser:

- **Pagination:** Queries for large datasets (Manager lists, transaction histories) strictly employ Pagination. The UI fetches data in manageable chunks (e.g., 20 items per request).
- **Request Throttling:** The platform utilizes rate-limiting logic to prevent automated bots or malicious actors from spamming expensive queries, ensuring consistent performance for all genuine users.

---

## 16. Contact Information

For any inquiries, technical support, architectural discussions, or bug reports regarding the Mini Supermarket Management System platform, please contact the core development team:

**Mini Supermarket Development Team:**

- **Nguyen Van Hao:** 23520448@gm.uit.edu.vn
- **Bui Van Tung:** 23521756@gm.uit.edu.vn

**Technical Support & Issues:** For code-related issues, feature requests, or deployment troubleshooting, please open a new issue directly on the project's official **GitHub Repository**.

---

## 17. Traceability Matrix

This matrix provides a direct mapping from functional requirements (User Stories) to architectural strategies, tactics, and specific implementation elements (Controllers/Models), based on the **ADD.txt** source.

| UC ID | User Story Activity | Quality Attribute | Architectural Strategy / Tactic | Artifact (Implementation) |
| :--- | :--- | :--- | :--- | :--- |
| **UC2.1** | Add customer account | Security | Validate JWT & Admin role; bcrypt hashing. | `customerController.js` |
| **UC2.3** | Search customers | Performance | Indexed FullName query + Pagination. | `customerController.js` |
| **UC4.2** | Update promotion | Availability | Zero-downtime updates via non-blocking DB ops. | `promotionController.js` |
| **UC8.1** | Analyze business reports | Availability | Exception Masking + Sanitized JSON. | Global Exception Handler |
| **UC12.1** | Approve staff report | Modification | Extensible policy architecture (Workflow). | `staffController.js` |
| **UC16.2** | Search submitted reports | Conceptual Integrity | Uniform state modeling across modules. | `staffController.js` |
| **UC21.1** | Add to cart | Scalability | Server-side session-based caching. | `cartController.js` |
| **UC21.3** | Place order | Reliability | Server-side arithmetic + ACID Transaction. | `orderController.js` |
| **UC21.5** | View order history | Performance | Cache-aside for degraded load speed. | `orderController.js` |
| **UC22.2** | Process payment | Availability | Local queuing and async retry logic. | `invoiceController.js` |
| **UC23.2** | Update invoice | Reliability | Concurrency conflict prevention (Locking). | `invoiceController.js` |
| **UC24.1** | Add received goods | Performance | Batch processing efficiency. | `productBatchController.js` |
| **UC25.3** | Update order status | Manageability | Clear state transitions (State Machine). | `deliveryOrderController.js` |

