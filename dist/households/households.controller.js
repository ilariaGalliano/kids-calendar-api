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
exports.HouseholdsController = void 0;
const common_1 = require("@nestjs/common");
const households_service_1 = require("./households.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let HouseholdsController = class HouseholdsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    get(id) {
        return this.svc.get(id);
    }
    profiles(id) {
        return this.svc.listProfiles(id);
    }
};
exports.HouseholdsController = HouseholdsController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HouseholdsController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id/profiles'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HouseholdsController.prototype, "profiles", null);
exports.HouseholdsController = HouseholdsController = __decorate([
    (0, common_1.UseGuards)(jwt_strategy_1.JwtStrategy),
    (0, common_1.Controller)('households'),
    __metadata("design:paramtypes", [households_service_1.HouseholdsService])
], HouseholdsController);
//# sourceMappingURL=households.controller.js.map