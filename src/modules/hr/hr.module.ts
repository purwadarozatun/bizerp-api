import { Module } from '@nestjs/common';

import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PaystubController } from './paystub.controller';
import { PaystubService } from './paystub.service';
import { SelfServiceController } from './self-service.controller';
import { SelfServiceService } from './self-service.service';
import { TimeTrackingController } from './time-tracking.controller';
import { TimeTrackingService } from './time-tracking.service';

@Module({
  controllers: [
    EmployeesController,
    LeaveController,
    PayrollController,
    PaystubController,
    SelfServiceController,
    TimeTrackingController,
  ],
  providers: [
    EmployeesService,
    LeaveService,
    PayrollService,
    PaystubService,
    SelfServiceService,
    TimeTrackingService,
  ],
  exports: [EmployeesService],
})
export class HrModule {}
