export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "TransitOps API",
    version: "1.0.0",
    description: "Production-grade backend APIs for the TransitOps transport management system.",
  },
  servers: [{ url: "http://localhost:3001/api" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Auth" },
    { name: "Organizations" },
    { name: "Users" },
    { name: "Vehicles" },
    { name: "Drivers" },
    { name: "Trips" },
    { name: "Maintenance" },
    { name: "Fuel Logs" },
    { name: "Expenses" },
    { name: "Dashboards" },
    { name: "Reports" },
    { name: "Notifications" },
  ],
  paths: {
    "/auth/login": { post: { tags: ["Auth"], summary: "Login with email and password" } },
    "/auth/refresh": { post: { tags: ["Auth"], summary: "Rotate refresh token" } },
    "/auth/logout": { post: { tags: ["Auth"], summary: "Logout user session" } },
    "/auth/forgot-password": { post: { tags: ["Auth"], summary: "Request password reset" } },
    "/auth/reset-password": { post: { tags: ["Auth"], summary: "Reset password using token" } },
    "/auth/verify-email": { post: { tags: ["Auth"], summary: "Verify email address" } },
    "/auth/accept-invitation": { post: { tags: ["Auth"], summary: "Accept user invitation" } },
    "/organizations": {
      get: { tags: ["Organizations"], summary: "List organizations" },
      post: { tags: ["Organizations"], summary: "Create organization" },
    },
    "/users": {
      get: { tags: ["Users"], summary: "List users" },
      post: { tags: ["Users"], summary: "Create user" },
    },
    "/users/invite": { post: { tags: ["Users"], summary: "Invite user" } },
    "/vehicles": {
      get: { tags: ["Vehicles"], summary: "List vehicles" },
      post: { tags: ["Vehicles"], summary: "Create vehicle" },
    },
    "/drivers": {
      get: { tags: ["Drivers"], summary: "List drivers" },
      post: { tags: ["Drivers"], summary: "Create driver" },
    },
    "/trips": {
      get: { tags: ["Trips"], summary: "List trips" },
      post: { tags: ["Trips"], summary: "Create trip" },
    },
    "/maintenance": {
      get: { tags: ["Maintenance"], summary: "List maintenance logs" },
      post: { tags: ["Maintenance"], summary: "Create maintenance log" },
    },
    "/fuel-logs": {
      get: { tags: ["Fuel Logs"], summary: "List fuel logs" },
      post: { tags: ["Fuel Logs"], summary: "Create fuel log" },
    },
    "/expenses": {
      get: { tags: ["Expenses"], summary: "List expenses" },
      post: { tags: ["Expenses"], summary: "Create expense" },
    },
    "/dashboards/organization": { get: { tags: ["Dashboards"], summary: "Organization dashboard" } },
    "/dashboards/global": { get: { tags: ["Dashboards"], summary: "Global dashboard" } },
    "/reports/fuel-efficiency": { get: { tags: ["Reports"], summary: "Fuel efficiency report" } },
    "/reports/monthly-expenses/export": { get: { tags: ["Reports"], summary: "Export monthly expenses report" } },
    "/notifications": { get: { tags: ["Notifications"], summary: "List notifications" } },
  },
};

