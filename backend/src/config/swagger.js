const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'College Review System API',
      version: '1.0.0',
      description:
        'Production-grade Express.js & MongoDB REST API for College Review System with role-based access control, rating aggregations, and pagination.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication and user management' },
      { name: 'Colleges', description: 'College management and rating queries' },
      { name: 'Reviews', description: 'Student and teacher reviews for colleges' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Thirumoorthi M' },
            email: { type: 'string', example: 'student1@college.edu' },
            role: { type: 'string', enum: ['student', 'teacher', 'admin'], example: 'student' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        College: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Indian Institute of Technology Madras (IIT Madras)' },
            location: { type: 'string', example: 'Sardar Patel Road, Guindy' },
            city: { type: 'string', example: 'Chennai' },
            state: { type: 'string', example: 'Tamil Nadu' },
            description: { type: 'string', example: 'Premier national technical and research institute ranked #1 in NIRF across India.' },
            website: { type: 'string', example: 'https://www.iitm.ac.in' },
            establishedYear: { type: 'integer', example: 1959 },
            averageRating: { type: 'number', example: 5.0 },
            reviewCount: { type: 'integer', example: 2 },
          },
        },
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            title: { type: 'string', example: 'World-class research culture and ecosystem' },
            comment: { type: 'string', example: 'IITM Research Park, top-tier professors, and outstanding robotics and AI labs.' },
            college: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                total: { type: 'integer', example: 25 },
                totalPages: { type: 'integer', example: 3 },
              },
            },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Priya Dharshini' },
                    email: { type: 'string', example: 'priya@college.edu' },
                    password: { type: 'string', example: 'Password123!' },
                    role: { type: 'string', enum: ['student', 'teacher'], default: 'student' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Validation error' },
            409: { description: 'Email already exists' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Log in to existing user account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'student1@college.edu' },
                    password: { type: 'string', example: 'Password123!' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Logged in successfully, returns JWT token' },
            401: { description: 'Invalid email or password' },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'User profile fetched successfully' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/colleges': {
        get: {
          tags: ['Colleges'],
          summary: 'List colleges with dynamic average rating and review count',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by college name, city, or location' },
            { name: 'city', in: 'query', schema: { type: 'string' }, description: 'Filter by exact city' },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['rating_desc', 'rating_asc', 'newest', 'name_asc'], default: 'rating_desc' } },
          ],
          responses: {
            200: { description: 'Colleges fetched successfully with aggregations' },
          },
        },
        post: {
          tags: ['Colleges'],
          summary: 'Create a new college (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'location', 'city', 'description'],
                  properties: {
                    name: { type: 'string', example: 'PSG College of Technology' },
                    location: { type: 'string', example: 'Avinashi Road, Peelamedu' },
                    city: { type: 'string', example: 'Coimbatore' },
                    state: { type: 'string', example: 'Tamil Nadu' },
                    description: { type: 'string', example: 'Government-aided autonomous engineering college renowned for industry interaction.' },
                    website: { type: 'string', example: 'https://www.psgtech.edu' },
                    establishedYear: { type: 'integer', example: 1951 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'College created successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden (Admin role required)' },
            409: { description: 'College name already exists' },
          },
        },
      },
      '/colleges/{id}': {
        get: {
          tags: ['Colleges'],
          summary: 'Get single college details with rating breakdown statistics',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'College details fetched successfully' },
            404: { description: 'College not found' },
          },
        },
        put: {
          tags: ['Colleges'],
          summary: 'Update college details (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    location: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    description: { type: 'string' },
                    website: { type: 'string' },
                    establishedYear: { type: 'integer' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'College updated successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden (Admin role required)' },
            404: { description: 'College not found' },
          },
        },
        delete: {
          tags: ['Colleges'],
          summary: 'Delete college and cascade delete its reviews (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'College and associated reviews deleted successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden (Admin role required)' },
            404: { description: 'College not found' },
          },
        },
      },
      '/colleges/{collegeId}/reviews': {
        get: {
          tags: ['Reviews'],
          summary: 'Get reviews for a college with pagination and rating filter',
          parameters: [
            { name: 'collegeId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'rating', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 5 } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'rating_desc', 'rating_asc'], default: 'newest' } },
          ],
          responses: {
            200: { description: 'Reviews fetched successfully' },
          },
        },
        post: {
          tags: ['Reviews'],
          summary: 'Create a review for a college (Student or Teacher)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'collegeId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['rating', 'comment'],
                  properties: {
                    rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                    title: { type: 'string', example: 'Excellent campus environment' },
                    comment: { type: 'string', example: 'World class research facilities, inspiring professors, and great community.' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Review submitted successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            409: { description: 'User already reviewed this college' },
          },
        },
      },
      '/reviews/{id}': {
        get: {
          tags: ['Reviews'],
          summary: 'Get review by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Review fetched successfully' },
            404: { description: 'Review not found' },
          },
        },
        put: {
          tags: ['Reviews'],
          summary: 'Update review (Owner or Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
                    title: { type: 'string' },
                    comment: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Review updated successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden (Not the author or admin)' },
            404: { description: 'Review not found' },
          },
        },
        delete: {
          tags: ['Reviews'],
          summary: 'Delete review (Owner or Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Review deleted successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
            404: { description: 'Review not found' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = swaggerSpec;
