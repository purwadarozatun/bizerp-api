import { Module } from '@nestjs/common';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { InventoryReportsController } from './inventory-reports.controller';
import { InventoryReportsService } from './inventory-reports.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';

@Module({
  controllers: [
    CategoriesController,
    InventoryReportsController,
    ProductsController,
    PurchaseOrdersController,
    SalesOrdersController,
    StockController,
    WarehousesController,
  ],
  providers: [
    CategoriesService,
    InventoryReportsService,
    ProductsService,
    PurchaseOrdersService,
    SalesOrdersService,
    StockService,
    WarehousesService,
  ],
  exports: [ProductsService, StockService, WarehousesService],
})
export class InventoryModule {}
