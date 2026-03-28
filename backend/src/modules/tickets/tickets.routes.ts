import { Router } from 'express';
import { ticketsController } from './tickets.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createTicketSchema, updateTicketSchema, addTicketCommentSchema } from '../../../../shared/schemas/ticket.schema';

const router = Router();
router.use(authenticate);

router.get('/', ticketsController.getAll);
router.post('/', validateBody(createTicketSchema), ticketsController.create);
router.get('/:id', ticketsController.getById);
router.put('/:id', ticketsController.update);
router.put('/:id/status', validateBody(updateTicketSchema), ticketsController.updateStatus);
router.post('/:id/comments', validateBody(addTicketCommentSchema), ticketsController.addComment);
router.get('/:id/comments', ticketsController.getComments);

export default router;
