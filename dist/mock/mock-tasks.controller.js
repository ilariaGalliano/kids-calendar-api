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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockTasksController = void 0;
const common_1 = require("@nestjs/common");
const mock_db_service_1 = require("./mock-db.service");
let MockTasksController = class MockTasksController {
    mockDb;
    constructor(mockDb) {
        this.mockDb = mockDb;
    }
    async getTasks(householdId) {
        return this.mockDb.tasks.filter(t => t.householdId === householdId);
    }
};
exports.MockTasksController = MockTasksController;
__decorate([
    (0, common_1.Get)(':householdId'),
    __param(0, (0, common_1.Param)('householdId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MockTasksController.prototype, "getTasks", null);
exports.MockTasksController = MockTasksController = __decorate([
    (0, common_1.Controller)('mock/tasks'),
    __metadata("design:paramtypes", [mock_db_service_1.MockDbService])
], MockTasksController);
//# sourceMappingURL=mock-tasks.controller.js.map