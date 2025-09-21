import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Product & User API",
      version: "1.0.0",
      description: "API for managing products and users",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            _id: { type: "string", example: "650f1a2b3c4d5e6f7a8b9c0d" },
            name: { type: "string", example: "Logitech G Pro Wireless" },
            price: { type: "number", example: 3790 },
            quantity: { type: "number", example: 100 },
            brand: { type: "string", example: "Logitech" },
            category: { type: "string", example: "Mouse" },
            description: {
              type: "string",
              example: "High performance gaming mouse",
            },
            imgUrl: {
              type: "string",
              example: "https://example.com/mouse.jpg",
            },
            isDeleted: { type: "string", format: "date-time", nullable: true },
          },
        },
        ProductInput: {
          type: "object",
          required: ["name", "price"],
          properties: {
            name: { type: "string", example: "Razer DeathAdder V3" },
            price: { type: "number", example: 2590 },
            quantity: { type: "number", example: 50 },
            brand: { type: "string", example: "Razer" },
            category: { type: "string", example: "Mouse" },
            description: { type: "string", example: "Razer gaming mouse" },
            imgUrl: {
              type: "string",
              example: "https://example.com/razer.jpg",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "650f1a2b3c4d5e6f7a8b9c0d" },
            name: { type: "string", example: "john_doe" },
            email: { type: "string", example: "john@example.com" },
            phone: { type: "string", example: "0812345678" },
            address: { type: "string", example: "123 Bangkok, Thailand" },
            balance: { type: "number", example: 5000 },
            role: { type: "string", example: "user" },
            isDeleted: { type: "string", format: "date-time", nullable: true },
          },
        },
        UserInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "john_doe" },
            email: { type: "string", example: "john@example.com" },
            phone: { type: "string", example: "0812345678" },
            address: { type: "string", example: "123 Bangkok, Thailand" },
            password: { type: "string", example: "P@ssw0rd!" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Not found" },
            code: { type: "number", example: 404 },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
