"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const categories_controller_1 = require("./categories.controller");
const categories_service_1 = require("./categories.service");
const inventory_reports_controller_1 = require("./inventory-reports.controller");
const inventory_reports_service_1 = require("./inventory-reports.service");
const products_controller_1 = require("./products.controller");
const products_service_1 = require("./products.service");
const purchase_orders_controller_1 = require("./purchase-orders.controller");
const purchase_orders_service_1 = require("./purchase-orders.service");
const sales_orders_controller_1 = require("./sales-orders.controller");
const sales_orders_service_1 = require("./sales-orders.service");
const stock_controller_1 = require("./stock.controller");
const stock_service_1 = require("./stock.service");
const warehouses_controller_1 = require("./warehouses.controller");
const warehouses_service_1 = require("./warehouses.service");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            categories_controller_1.CategoriesController,
            inventory_reports_controller_1.InventoryReportsController,
            products_controller_1.ProductsController,
            purchase_orders_controller_1.PurchaseOrdersController,
            sales_orders_controller_1.SalesOrdersController,
            stock_controller_1.StockController,
            warehouses_controller_1.WarehousesController,
        ],
        providers: [
            categories_service_1.CategoriesService,
            inventory_reports_service_1.InventoryReportsService,
            products_service_1.ProductsService,
            purchase_orders_service_1.PurchaseOrdersService,
            sales_orders_service_1.SalesOrdersService,
            stock_service_1.StockService,
            warehouses_service_1.WarehousesService,
        ],
        exports: [products_service_1.ProductsService, stock_service_1.StockService, warehouses_service_1.WarehousesService],
    })
], InventoryModule);
//# sourceMappingURL=inventory.module.js.map