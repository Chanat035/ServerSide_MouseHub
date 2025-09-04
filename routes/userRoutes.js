import userController, {userLoginSchema, userRegistrationSchema} from "../controllers/userControllers.js";
import validateData from "../middleware/validationMiddleware.js";

const useUserRoute = async (router) => {
  router.get('/user', userController.getAllUsers)
//   router.get('/user/:id', userController.getUserById)
  router.post('/register',validateData(userRegistrationSchema), userController.create)
  router.post('/login', validateData(userLoginSchema), userController.login)
}

export default useUserRoute