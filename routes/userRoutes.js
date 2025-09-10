import userController, {userLoginSchema, userRegistrationSchema, changePasswordSchema, deleteUserSchema} from "../controllers/userControllers.js";
import validateData from "../middleware/validationMiddleware.js";

const useUserRoute = async (router) => {
  router.get('/user', userController.getAllUsers)
  router.post('/register',validateData(userRegistrationSchema), userController.register)
  router.post('/login', validateData(userLoginSchema), userController.login)
  router.get('/profile', userController.profile)
  router.patch('/addBalance', userController.addBalance)
  router.patch('/changePassword',validateData(changePasswordSchema), userController.changePassword)
  router.delete('/user',validateData(deleteUserSchema), userController.deleteUser)
  router.patch('/restoreUser', userController.restoreUser)
}

export default useUserRoute