import { ZodError } from "zod";

function validateData(schema) {
  return (req, res, next) => {
    try {
      console.log('Validating request body:', req.body);
      const validatedData = schema.safeParse(req.body);
      
      if (!validatedData.success) {
        const errorDetails = validatedData.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }));

        console.log('Validation failed:', errorDetails);
        return res.status(400).json({
          error: "Invalid data",
          details: errorDetails
        });
      }

      req.body = validatedData.data;
      next();
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: error.message
      });
    }
  };
}

export default validateData;