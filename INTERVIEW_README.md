# 🎓 StudentHub Full-Stack Platform
*Comprehensive Interview & Portfolio Documentation*

---

## 📑 Table of Contents
1. [Project Overview & Motivation](#1-project-overview--motivation)
2. [Technical Architecture & Stack](#2-technical-architecture--stack)
3. [Core Modules Breakdown](#3-core-modules-breakdown)
4. [System Workflows & Logic](#4-system-workflows--logic)
5. [Security, Performance & Deployment](#5-security-performance--deployment)
6. [Business Value & Reflections](#6-business-value--reflections)
7. [🔥 40 High-Impact Interview Questions & Answers](#-40-high-impact-interview-questions--answers)

---

## 1. Project Overview & Motivation

### 1.1 Project Title
**StudentHub Full-Stack Platform**

### 1.2 Project Overview
StudentHub is a comprehensive networking and recruitment platform connecting students and recruiters. It features real-time messaging, skill-based job matching, dynamic public profiles, and an end-to-end interview and offer management system. 

### 1.3 Problem Statement
Students often struggle to find relevant job opportunities that match their exact skill sets, while recruiters waste time filtering through unqualified candidates. Additionally, the process of scheduling interviews and extending offers is typically scattered across emails and third-party tools, lacking a centralized platform.

### 1.4 Objective of the Project
To build a seamless, centralized platform where students can showcase their skills and posts, and recruiters can post jobs, automatically find matching candidates, schedule interviews, and send offers all within a single ecosystem.

### 1.5 Why This Project Was Chosen
To demonstrate proficiency in modern full-stack development, specifically using FastAPI (Python) for high-performance asynchronous backends and React 18 for dynamic frontends. It showcases complex relational logic within a NoSQL database (MongoDB) and real-time state management.

---

## 2. Technical Architecture & Stack

### 2.1 Technologies Used
*   **Frontend**: React 18, Vite, plain CSS.
*   **Backend**: FastAPI (Python 3.10+), Uvicorn.
*   **Database**: MongoDB (Motor async driver).
*   **Authentication & Security**: JSON Web Tokens (JWT), Password Hashing.
*   **API Client**: Axios (Frontend).
*   **Data Validation**: Pydantic models (Backend).

### 2.2 System Architecture
The application utilizes a decoupled **Client-Server Architecture**. 
*   The **Presentation Layer** (React/Vite) provides a fast, interactive SPA experience.
*   The **Business Logic Layer** (FastAPI) handles highly concurrent asynchronous requests, auth workflows, and complex job matching algorithms.
*   The **Data Layer** (MongoDB) persists unstructured/semi-structured data like messages, profiles, and job postings.

### 2.3 Database Design and Schema Explanation
The database leverages MongoDB with the asynchronous Motor driver:
*   `users`: Stores credentials, roles (`student`, `recruiter`), PRN, and skill arrays.
*   `posts`: Student-generated content with tags and visibility rules.
*   `jobs`: Recruiter-created postings with `skills_required`.
*   `threads` & `messages`: Supports the messaging MVP with optimistic UI and unread counts.
*   `interviews` & `offers`: Tracks the entire lifecycle (proposed, accepted, declined, rescheduled) linking `candidate_id` and `recruiter_id`.

---

## 3. Core Modules Breakdown

### 3.1 Student Dashboard & Profile
*   **Public Profiles**: Twitter-style profiles (`/profile/:userId`) displaying banners, PRN, skills, and personal feeds.
*   **Post Controls**: Students can author, edit, and delete their own posts, managing tags inline.
*   **Job Feed**: Students view jobs filtered by `public` or `students` visibility.

### 3.2 Recruiter Workspace
*   **Job Management**: Recruiters create jobs specifying required skills.
*   **Skill-Based Matching**: The system automatically intersects job required skills with student profiles to return ranked matches (`/jobs/{jobId}/matches`).

### 3.3 Messaging MVP
*   **Threaded Inbox**: Displays conversations with unread badges.
*   **Optimistic UI**: Messages appear instantly on the frontend while confirming with the backend.

### 3.4 Interviews & Offers System
*   **Interview Lifecycle**: Recruiters propose timeslots and locations. Candidates can accept, decline, or request a reschedule. API handles ICS invite generation.
*   **Offer Lifecycle**: Recruiters send formal offers. Candidates manage accept/reject workflows.

---

## 4. System Workflows & Logic

### 4.1 Skill-Based Matching Logic
When a recruiter views a job, the backend queries the `users` collection for students whose `skills` array intersects with the job's `skills_required` array, sorting the results by the highest number of matching skills.

### 4.2 Interview Proposal Workflow
1. Recruiter hits `POST /interviews` with `candidate_id`, proposed timeslots, and location.
2. Backend validates IDs, creates an `interview` document, and optionally injects a system message into the `threads` collection to notify the candidate.
3. Candidate reviews timeslots via UI and hits `/interviews/{id}/accept`.

### 4.3 Authentication Flow
1. User logs in via `/auth/login`.
2. FastAPI hashes the input password, compares it to DB, and returns a short-lived access token (`JWT`).
3. React's `AuthContext` stores the token, and an Axios interceptor attaches it as a `Bearer` token for all subsequent requests.

---

## 5. Security, Performance & Deployment

### 5.1 Security Features
*   **JWT Auth**: Secure, stateless authentication.
*   **Pydantic Validation**: Strict schema validation on the backend ensures no invalid data or injection payloads hit the database.
*   **Route Protection**: Both React router and FastAPI dependencies restrict access based on user roles (e.g., preventing students from creating jobs).

### 5.2 Performance Optimization
*   **Asynchronous Backend**: FastAPI handles I/O bound tasks (like MongoDB queries and network requests) asynchronously, preventing thread blocking.
*   **React Context**: `AuthContext` prevents prop drilling and minimizes unnecessary re-renders when accessing user state.

### 5.3 Deployment Strategy
*   **Frontend**: Built via `npm run build` using Vite, deployable to static hosts like Vercel.
*   **Backend**: Run via Uvicorn (`uvicorn backend.main:app`), easily containerized with Docker and deployed to platforms like AWS ECS or Render.
*   **Database**: MongoDB Atlas for high availability and automated backups.

---
---

## 🔥 40 High-Impact Interview Questions & Answers
*Categorized for comprehensive viva and technical interview preparation.*

### 🏗️ Architecture & System Design

**1. Why did you choose FastAPI over traditional frameworks like Django or Flask?**
> **Answer:** FastAPI is built on modern Python features like async/await, making it incredibly fast (comparable to Node.js/Go) for I/O bound operations like database queries. It also automatically generates Swagger/OpenAPI documentation and uses Pydantic for strict data validation out of the box, which significantly sped up development.

**2. Explain the Client-Server architecture implemented in StudentHub.**
> **Answer:** It's a decoupled SPA architecture. The React/Vite frontend acts as the client, handling routing and UI state independently. It communicates asynchronously via HTTP/Axios to the FastAPI backend. The backend acts as an API gateway, handling business logic and talking to MongoDB, returning pure JSON to the client.

**3. How does your system differentiate between Student and Recruiter roles?**
> **Answer:** The `users` collection in MongoDB stores a `role` field. On login, this role is included in the JWT payload and stored in React's `AuthContext`. The frontend conditionally renders dashboards (Student vs. Recruiter), and the backend uses FastAPI dependencies to restrict API endpoints (e.g., `POST /jobs` strictly requires a recruiter token).

**4. What are the benefits of using Vite over Create React App (CRA)?**
> **Answer:** Vite uses native ES modules to serve code during development, making the dev server start almost instantly regardless of app size. It also uses Rollup for production builds, which is highly optimized. CRA uses Webpack, which bundles the entire app before serving, leading to much slower Hot Module Replacement (HMR).

**5. How does the real-time messaging work? Is it WebSockets or Polling?**
> **Answer:** Currently, it implements an MVP using REST APIs (`GET /threads/{threadId}`) with **Optimistic UI updates**. When a user sends a message, it immediately appears in the UI while the Axios request resolves in the background. For a true real-time scale, I would transition this to FastAPI WebSockets.

### ⚙️ Backend & APIs (FastAPI/Python)

**6. What is Pydantic and how is it used in your backend?**
> **Answer:** Pydantic is a data validation library for Python. I use it to define schemas for incoming requests (like Job creation) and outgoing responses. If a client sends invalid data (e.g., a string instead of an array of skills), Pydantic automatically catches it and returns a clean 422 Unprocessable Entity error before it even hits my route logic.

**7. How do you handle asynchronous database operations in FastAPI?**
> **Answer:** I use the Motor driver for MongoDB, which is asynchronous. In FastAPI, my route functions are defined as `async def`, and I `await` database calls (e.g., `await db.jobs.insert_one(job_data)`). This allows the Uvicorn server to handle other incoming requests while waiting for the database to respond.

**8. Explain the lifecycle of an API request in your application.**
> **Answer:** Request hits Uvicorn -> FastAPI routes it to the correct endpoint -> Dependency Injection extracts and verifies the JWT -> Pydantic validates the request body -> Route executes business logic (awaiting MongoDB via Motor) -> Pydantic serializes the response -> Client receives JSON.

**9. How do you handle centralized error handling in FastAPI?**
> **Answer:** FastAPI handles Pydantic validation errors automatically. For custom business logic errors (like "Job not found"), I raise `HTTPException` with specific status codes (e.g., 404). I can also define custom exception handlers globally using the `@app.exception_handler` decorator to format all error responses consistently.

**10. What is Dependency Injection in FastAPI? Can you give an example from your project?**
> **Answer:** Dependency Injection allows you to declare things a route needs to function. I use it heavily for authentication. For example, a route might have `current_user: User = Depends(get_current_user)`. FastAPI automatically runs the `get_current_user` function (which verifies the JWT) before executing the route, injecting the user object.

### 🗄️ Database (MongoDB/Motor)

**11. Why choose MongoDB (NoSQL) for this project over SQL?**
> **Answer:** Features like user profiles, varying skill sets, and job postings have dynamic schemas. MongoDB's document model allows me to store arrays (like `skills` or `tags`) and embedded objects (like proposed `timeslots` in interviews) directly within the document without needing complex JOIN tables.

**12. How do you handle relationships in MongoDB, such as linking a Message to a Thread?**
> **Answer:** I use document referencing. A `Message` document contains a `thread_id` field that references the `ObjectId` of the parent `Thread`. To fetch a conversation, I perform a fast, indexed query on the `messages` collection where `thread_id` matches.

**13. How does the Skill-Based Matching query work under the hood?**
> **Answer:** The `/jobs/{jobId}/matches` endpoint fetches the job's `skills_required` array. It then queries the `users` collection using MongoDB's `$in` operator to find students possessing any of those skills, and sorts the output in Python (or via Aggregation) based on the size of the set intersection between required and possessed skills.

**14. What are ObjectIds in MongoDB and why does the API require them for Candidate IDs?**
> **Answer:** `ObjectId` is a unique 12-byte identifier generated by MongoDB for every document. APIs require it because querying by `ObjectId` is extremely fast (it acts as the primary key index). Searching by username would require scanning fields and is prone to errors if usernames change.

**15. How do you structure the Interviews and Offers collections?**
> **Answer:** They are distinct collections to separate concerns. An `Interview` document links `candidate_id`, `recruiter_id`, and optionally `job_id`, containing arrays of proposed times and statuses. An `Offer` document similarly links users but contains salary details, attachments, and its own accept/reject lifecycle statuses.

### 🔐 Authentication & Security

**16. Explain the complete flow of JWT authentication in StudentHub.**
> **Answer:** User submits credentials -> FastAPI hashes password and compares to DB -> Generates JWT using a secret key and sets an expiration -> Returns token to React -> React stores it in memory (AuthContext) and `localStorage` -> Axios interceptor attaches it as `Authorization: Bearer <token>` to all future requests -> FastAPI dependency verifies signature.

**17. How do you securely store passwords?**
> **Answer:** Passwords are never stored in plain text. I use a hashing library (like `passlib` with `bcrypt`). When a user signs up, the backend hashes the password with a random salt before saving. On login, the incoming password is hashed and compared to the stored hash.

**18. What are the security risks of storing JWTs in `localStorage`?**
> **Answer:** `localStorage` is accessible via JavaScript, making it vulnerable to Cross-Site Scripting (XSS) attacks. If an attacker injects malicious JS, they can steal the token. For enterprise production, using `HttpOnly` cookies is safer as they cannot be accessed by JS, though it requires implementing CSRF tokens.

**19. How do you prevent a student from deleting another student's post?**
> **Answer:** On the `DELETE /posts/{id}` endpoint, the backend fetches the post and compares the `author_id` of the post with the `id` of the `current_user` injected by the JWT dependency. If they do not match, it raises an HTTP 403 Forbidden exception.

**20. What is CORS and how did you configure it in FastAPI?**
> **Answer:** Cross-Origin Resource Sharing (CORS) prevents malicious websites from making requests to your API. Since React runs on `localhost:5173` and FastAPI on `localhost:8000`, the browser blocks requests. I configured FastAPI's `CORSMiddleware` to explicitly allow requests from my frontend origins.

### 💻 Frontend (React 18/Vite)

**21. Explain the role of `AuthContext` in your React application.**
> **Answer:** `AuthContext` provides global state for authentication. It stores the JWT and the current user's profile data. It wraps the entire application, allowing any component (like the Navbar or protected routes) to easily check if a user is logged in without passing props down multiple levels (avoiding prop drilling).

**22. How did you implement an Axios Interceptor?**
> **Answer:** In `src/api/client.js`, I defined an Axios instance. I added a request interceptor that checks for the JWT in `localStorage` and automatically attaches it to the `Authorization` header of every outgoing API call. This keeps API service files clean and DRY.

**23. What is Optimistic UI and how did you use it in the Messaging MVP?**
> **Answer:** Optimistic UI is a pattern where the frontend immediately updates the UI assuming an action will succeed, before the server responds. When a user sends a message, I instantly append it to the local React state so it shows up on screen immediately, making the app feel incredibly fast, while Axios handles the actual POST request in the background.

**24. How do you handle routing and protecting routes in React?**
> **Answer:** I use React Router DOM. I created wrapper components (e.g., `<RequireAuth>` or `<RequireRecruiter>`) that check the `AuthContext`. If a student tries to access the recruiter dashboard, the wrapper component intercepts the render and redirects them to the home page using the `<Navigate>` component.

**25. Why use pure CSS instead of Tailwind CSS for this project?**
> **Answer:** Using pure CSS demonstrates a strong fundamental understanding of the CSS box model, flexbox, grid, and specific UI design principles without relying on utility classes. It keeps the HTML markup cleaner and proves I can manage a scalable CSS architecture manually.

### 🔄 Business Logic & Workflows

**26. Walk me through the Interview Proposal workflow from the Recruiter to the Candidate.**
> **Answer:** 
> 1. Recruiter selects a candidate and submits `POST /interviews` with proposed timeslots.
> 2. Backend creates an interview document and optionally posts a system message in the messaging thread.
> 3. Candidate sees the notification/message, reviews the timeslots on the frontend, and selects one.
> 4. Candidate hits `/interviews/{id}/accept`. Backend updates the status to 'accepted' and locks in the timeslot.

**27. How does the system handle "Unread Message" badges?**
> **Answer:** The backend calculates unread counts by comparing the timestamp of the last message in a thread with a `last_read_at` timestamp stored for each participant in that thread document. Calling `PUT /threads/{threadId}/read` updates this timestamp, zeroing out the badge on the frontend.

**28. Explain the Job Visibility rules.**
> **Answer:** Jobs have a `visibility` field. When the `GET /jobs` API is called by a student, the backend adds a filter to the MongoDB query ensuring only jobs marked `public` or `students` are returned. When called by a recruiter, it returns their own jobs plus public ones.

**29. How do you manage tags on Student Posts?**
> **Answer:** In the frontend, tags are managed via a local array state that is updated via an input field (pressing Enter adds a tag). On submission, the array is sent to the backend where Pydantic validates it's a list of strings before saving it into the MongoDB post document.

**30. What happens if a recruiter tries to send an offer to a student who hasn't interviewed?**
> **Answer:** While the current system architecture allows sending offers independently via `POST /offers` (for direct hiring), best practice dictates validating the pipeline. If strict enforcement is needed, the FastAPI endpoint would first query the `interviews` collection to ensure an 'accepted' interview exists between the two users before proceeding.

### 🐞 Debugging & Problem Solving ("Find the Bug")

**31. Scenario: You log in successfully, but navigating to the Dashboard gives a 401 Unauthorized error. What's wrong?**
> **Answer:** The frontend received the JWT but failed to attach it to subsequent requests. I would check the Axios Interceptor in `client.js` to ensure the header is formatted correctly as `Bearer ${token}` and that the token is successfully being retrieved from `localStorage`.

**32. Scenario: A recruiter clicks "View Matches" and the API times out. What is the bottleneck?**
> **Answer:** The database query is likely doing a full collection scan instead of using an index. The `users` collection might not have an index on the `skills` array. Adding a multikey index on `skills` in MongoDB would drastically speed up the intersection search.

**33. Find the Bug: You update a job posting in React, receive a 200 OK, but the old data still shows until you refresh the page.**
> **Answer:** The React state is stale. After the successful `PUT` request via Axios, I forgot to update the local component state (or Context/Redux) with the newly returned data from the API. React only re-renders when state changes, so the UI relies on the old state until a hard refresh fetches fresh data.

**34. A student complains that an interview time is off by 5 hours. What is the cause?**
> **Answer:** Timezone handling issue. The backend likely saved the datetime as a local server time instead of standardizing on UTC. All ISO datetimes should be parsed and saved in UTC on the backend, and the React frontend should convert them to the user's local timezone just before rendering the UI.

**35. Find the Bug: Your FastAPI server crashes with `RuntimeError: This event loop is already running` when testing.**
> **Answer:** This often happens when mixing asynchronous database calls inside synchronous functions or heavily nested async environments (like certain Pytest setups or Jupyter notebooks) without properly managing the asyncio event loop. Ensuring all route handlers correctly use `async def` usually prevents this.

### 🚀 Deployment & Scalability

**36. Walk me through how you run both the frontend and backend locally.**
> **Answer:** I open two terminals. In Terminal 1, I activate the Python virtual environment (`.venv\Scripts\activate`) and start Uvicorn (`uvicorn backend.main:app --reload`). In Terminal 2, I navigate to the frontend folder and run the Vite server (`npm run dev`).

**37. How does the backend know where the frontend is hosted for CORS and email links?**
> **Answer:** Through environment variables. I set `FRONTEND_BASE_URL` in the `backend/.env` file. The FastAPI CORS middleware reads this to allow requests, and service functions use it to construct absolute URLs for interview/offer invitation links sent externally.

**38. If you deploy to production, how do you serve the React app?**
> **Answer:** Since Vite builds a static Single Page Application (HTML/CSS/JS), I don't need a Node.js server in production. I run `npm run build` to generate the `dist/` folder, and deploy those static files to a CDN like Vercel, Netlify, or AWS S3/CloudFront for extremely fast, globally distributed loading.

**39. How do you scale FastAPI if traffic increases 10x?**
> **Answer:** FastAPI runs on Uvicorn (an ASGI server). To scale vertically, I would run Uvicorn with multiple workers using Gunicorn as a process manager (e.g., `gunicorn backend.main:app -k uvicorn.workers.UvicornWorker -w 4`). To scale horizontally, I would deploy the API inside Docker containers managed by Kubernetes or AWS ECS behind a load balancer.

**40. If you had to rebuild this project, what would you do differently?**
> **Answer:** I would implement WebSockets via FastAPI from the start for true real-time messaging rather than relying on REST and optimistic UI. I would also add comprehensive Unit Tests using `pytest` and `React Testing Library` to automate regression testing whenever adding new features like the Interviews/Offers modules.

---
*End of Document*
