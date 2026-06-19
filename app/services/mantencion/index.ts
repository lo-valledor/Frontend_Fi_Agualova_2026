import { classificationsService } from './classifications.service';
import { conceptsService } from './concepts.service';
import { nichosService } from './nichos.service';
import { referenceDataMantencionService } from './reference-data.service';

export { classificationsService } from './classifications.service';
export type { ConceptosData } from './concepts.service';
export { conceptsService } from './concepts.service';
export { nichosService } from './nichos.service';
export { referenceDataMantencionService } from './reference-data.service';

// Consolidated services object
export const mantencionServices = {
  referenceData: referenceDataMantencionService,
  concepts: conceptsService,
  classifications: classificationsService,
  nichos: nichosService
};
