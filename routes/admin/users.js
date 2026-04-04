import { Router } from "express";
import {
    listUsers,
    showAddUserPage,
    postAddUser,
    promoteUserToOrganiser,
    demoteUserToStudent,
    deleteUser,
} from "../../controllers/adminUsersController.js";

const router = Router();

router.get("/", listUsers);
router.get("/new", showAddUserPage);
router.post("/", postAddUser);
router.post("/:id/promote", promoteUserToOrganiser);
router.post("/:id/demote", demoteUserToStudent);
router.post("/:id/delete", deleteUser);

export default router;
