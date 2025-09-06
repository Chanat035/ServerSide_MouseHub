import userController, {userLoginSchema, userRegistrationSchema, changePasswordSchema} from "../controllers/userControllers.js";
import validateData from "../middleware/validationMiddleware.js";

const useUserRoute = async (router) => {
  router.get('/user', userController.getAllUsers)
  router.post('/register',validateData(userRegistrationSchema), userController.register)
  router.post('/login', validateData(userLoginSchema), userController.login)
  router.patch('/addBalance', userController.addBalance)
  router.patch('/changePassword',validateData(changePasswordSchema), userController.changePassword)
}

export default useUserRoute