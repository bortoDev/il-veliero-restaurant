import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import blacklistRoutes from './blacklist.routes';
import auditRoutes from './audit.routes';
import uploadRoutes from './upload.routes';
import menuRoutes from './menu.routes';
import pescatoRoutes from './pescato.routes';
import avvisoRoutes from './avviso.routes';
import eventoRoutes from './evento.routes';
import infoRoutes from './info.routes';

const apiRouter = Router();

apiRouter.use(healthRoutes);
apiRouter.use(authRoutes);
apiRouter.use(userRoutes);
apiRouter.use(blacklistRoutes);
apiRouter.use(auditRoutes);
apiRouter.use(uploadRoutes);
apiRouter.use(menuRoutes);
apiRouter.use(pescatoRoutes);
apiRouter.use(avvisoRoutes);
apiRouter.use(eventoRoutes);
apiRouter.use(infoRoutes);

export default apiRouter;
