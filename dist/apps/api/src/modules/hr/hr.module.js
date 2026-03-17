"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrModule = void 0;
const common_1 = require("@nestjs/common");
const employees_controller_1 = require("./employees.controller");
const employees_service_1 = require("./employees.service");
const leave_controller_1 = require("./leave.controller");
const leave_service_1 = require("./leave.service");
const payroll_controller_1 = require("./payroll.controller");
const payroll_service_1 = require("./payroll.service");
const paystub_controller_1 = require("./paystub.controller");
const paystub_service_1 = require("./paystub.service");
const self_service_controller_1 = require("./self-service.controller");
const self_service_service_1 = require("./self-service.service");
const time_tracking_controller_1 = require("./time-tracking.controller");
const time_tracking_service_1 = require("./time-tracking.service");
let HrModule = class HrModule {
};
exports.HrModule = HrModule;
exports.HrModule = HrModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            employees_controller_1.EmployeesController,
            leave_controller_1.LeaveController,
            payroll_controller_1.PayrollController,
            paystub_controller_1.PaystubController,
            self_service_controller_1.SelfServiceController,
            time_tracking_controller_1.TimeTrackingController,
        ],
        providers: [
            employees_service_1.EmployeesService,
            leave_service_1.LeaveService,
            payroll_service_1.PayrollService,
            paystub_service_1.PaystubService,
            self_service_service_1.SelfServiceService,
            time_tracking_service_1.TimeTrackingService,
        ],
        exports: [employees_service_1.EmployeesService],
    })
], HrModule);
//# sourceMappingURL=hr.module.js.map