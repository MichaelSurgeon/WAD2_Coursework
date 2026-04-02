import { Router } from "express";
import {
    listUsers,
    promoteUserToOrganiser,
    deleteUser,
} from "../../controllers/adminController.js";

const router = Router();

router.get("/", listUsers);
router.post("/:id/promote", promoteUserToOrganiser);
router.post("/:id/delete", deleteUser);

export default router;
