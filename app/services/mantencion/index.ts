import { referenceDataMantencionService } from './reference-data.service';
import { conceptsService } from './concepts.service';
import { classificationsService } from './classifications.service';
import { nichosService } from './nichos.service';

export { referenceDataMantencionService } from './reference-data.service';
export { conceptsService } from './concepts.service';
export { classificationsService } from './classifications.service';
export { nichosService } from './nichos.service';

export type { ConceptosData } from './concepts.service';

// Consolidated services object
export const mantencionServices = {
  referenceData: referenceDataMantencionService,
  concepts: conceptsService,
  classifications: classificationsService,
  nichos: nichosService
};
