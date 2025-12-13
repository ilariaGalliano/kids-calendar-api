"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const calendar_module_1 = require("../calendar/calendar.module");
const database_module_1 = require("../database/database.module");
const households_module_1 = require("../households/households.module");
const prisma_service_1 = require("../prisma/prisma.service");
const profiles_modules_1 = require("../profiles/profiles.modules");
const tasks_module_1 = require("../tasks/tasks.module");
let AppModule = class AppModule {
    constructor(prisma) {
        if (prisma.seedDemo) {
            prisma.seedDemo();
        }
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            database_module_1.DatabaseModule,
            households_module_1.HouseholdsModule,
            profiles_modules_1.ProfilesModule,
            tasks_module_1.TasksModule,
            calendar_module_1.CalendarModule,
        ],
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppModule);
//# sourceMappingURL=auth.module.js.map