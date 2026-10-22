import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createCharacterController } from '../application/http/CharacterController.js';
import { sqliteCharacterRepository } from '../infrastructure/database/SqliteCharacterRepository.js';
import { validateBody } from '../middleware/validate.js';
import {
  createCharacterSchema,
  updateCharacterSchema,
  addAttackSchema,
  addItemSchema,
  addFeatureSchema,
} from '../application/validators/characterSchemas.js';

const controller = createCharacterController(sqliteCharacterRepository);
const router = express.Router();

router.get('/meta/options', controller.getMetaOptions);

router.use(authenticateToken);

router.get('/dm/roster', controller.getDMRoster);
router.patch('/dm/:id', validateBody(updateCharacterSchema), controller.updateCharacterAsDM);

router.get('/', controller.listCharacters);
router.get('/:id', controller.getCharacterDetail);
router.post('/', validateBody(createCharacterSchema), controller.createCharacter);
router.patch('/:id', validateBody(updateCharacterSchema), controller.updateCharacter);
router.post('/:id/long-rest', controller.longRest);
router.delete('/:id', controller.deleteCharacter);

router.post('/:id/skills/toggle', controller.toggleSkill);
router.post('/:id/saving-throws/toggle', controller.toggleSavingThrow);

router.patch('/:id/spell-slots/:slotLevel', controller.updateSpellSlot);

router.post('/:id/attacks', validateBody(addAttackSchema), controller.addAttack);
router.delete('/:id/attacks/:attackId', controller.deleteAttack);

router.post('/:id/features', validateBody(addFeatureSchema), controller.addFeature);
router.patch('/:id/features/:featureId', controller.updateFeature);
router.delete('/:id/features/:featureId', controller.deleteFeature);

router.post('/:id/items', validateBody(addItemSchema), controller.addItem);
router.patch('/:id/items/:itemId', controller.updateItem);
router.delete('/:id/items/:itemId', controller.deleteItem);

export default router;
