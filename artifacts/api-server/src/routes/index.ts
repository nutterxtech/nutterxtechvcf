import { Router, type IRouter } from "express";
import healthRouter from "./health";
import registerRouter from "./register";
import vcfRouter from "./vcf";
import adminRouter from "./admin";
import countRouter from "./count";

const router: IRouter = Router();

router.use(healthRouter);
router.use(countRouter);
router.use(registerRouter);
router.use(vcfRouter);
router.use(adminRouter);

export default router;
