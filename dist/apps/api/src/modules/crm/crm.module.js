"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmModule = void 0;
const common_1 = require("@nestjs/common");
const activities_controller_1 = require("./activities.controller");
const activities_service_1 = require("./activities.service");
const contacts_controller_1 = require("./contacts.controller");
const contacts_service_1 = require("./contacts.service");
const email_controller_1 = require("./email.controller");
const email_service_1 = require("./email.service");
const leads_controller_1 = require("./leads.controller");
const leads_service_1 = require("./leads.service");
const opportunities_controller_1 = require("./opportunities.controller");
const opportunities_service_1 = require("./opportunities.service");
const segmentation_controller_1 = require("./segmentation.controller");
const segmentation_service_1 = require("./segmentation.service");
let CrmModule = class CrmModule {
};
exports.CrmModule = CrmModule;
exports.CrmModule = CrmModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            activities_controller_1.ActivitiesController,
            contacts_controller_1.ContactsController,
            email_controller_1.EmailController,
            leads_controller_1.LeadsController,
            opportunities_controller_1.OpportunitiesController,
            segmentation_controller_1.SegmentationController,
        ],
        providers: [
            activities_service_1.ActivitiesService,
            contacts_service_1.ContactsService,
            email_service_1.EmailService,
            leads_service_1.LeadsService,
            opportunities_service_1.OpportunitiesService,
            segmentation_service_1.SegmentationService,
        ],
        exports: [contacts_service_1.ContactsService, email_service_1.EmailService],
    })
], CrmModule);
//# sourceMappingURL=crm.module.js.map