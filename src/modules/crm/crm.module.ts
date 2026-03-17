import { Module } from '@nestjs/common';

import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { SegmentationController } from './segmentation.controller';
import { SegmentationService } from './segmentation.service';

@Module({
  controllers: [
    ActivitiesController,
    ContactsController,
    EmailController,
    LeadsController,
    OpportunitiesController,
    SegmentationController,
  ],
  providers: [
    ActivitiesService,
    ContactsService,
    EmailService,
    LeadsService,
    OpportunitiesService,
    SegmentationService,
  ],
  exports: [ContactsService, EmailService],
})
export class CrmModule {}
