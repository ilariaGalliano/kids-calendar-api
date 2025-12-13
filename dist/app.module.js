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
const database_module_1 = require("./database/database.module");
const prisma_service_1 = require("./prisma/prisma.service");
const households_module_1 = require("./households/households.module");
const tasks_module_1 = require("./tasks/tasks.module");
const calendar_module_1 = require("./calendar/calendar.module");
const profiles_modules_1 = require("./profiles/profiles.modules");
const children_controller_1 = require("./setting/children.controller");
const children_service_1 = require("./setting/children.service");
const routine_controller_1 = require("./setting/routine.controller");
const routine_service_1 = require("./setting/routine.service");
const tasks_service_1 = require("./setting/tasks.service");
const tasks_controller_1 = require("./setting/tasks.controller");
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
        controllers: [
            children_controller_1.ChildrenController,
            tasks_controller_1.TasksController,
            routine_controller_1.RoutineController,
        ],
        providers: [
            children_service_1.ChildrenService,
            tasks_service_1.TasksService,
            routine_service_1.RoutineService,
        ],
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppModule);
//# sourceMappingURL=app.module.js.map