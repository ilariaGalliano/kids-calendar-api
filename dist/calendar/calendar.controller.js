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
var CalendarController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const calendar_service_1 = require("./calendar.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let CalendarController = CalendarController_1 = class CalendarController {
    svc;
    logger = new common_1.Logger(CalendarController_1.name);
    constructor(svc) {
        this.svc = svc;
    }
    list(householdId, from, to) {
        this.logger.log(`GET /calendar household=${householdId} from=${from} to=${to}`);
        return this.svc.list(householdId, from, to);
    }
    async getMonthCalendar(householdId, year, month) {
        this.logger.log(`GET /calendar/month household=${householdId} year=${year} month=${month}`);
        return this.svc.getCalendar(householdId, parseInt(year), parseInt(month));
    }
    async getWeekCalendar(householdId, date) {
        this.logger.log(`GET /calendar/week household=${householdId} date=${date}`);
        return this.svc.getWeekCalendar(householdId, date);
    }
    async getDayCalendar(householdId, date) {
        this.logger.log(`GET /calendar/day household=${householdId} date=${date}`);
        return this.svc.getDayCalendar(householdId, date);
    }
    async getCurrentTimeWindow(householdId, datetime) {
        this.logger.log(`GET /calendar/now household=${householdId} datetime=${datetime}`);
        return this.svc.getCurrentTimeWindow(householdId, datetime);
    }
    done(id, body) {
        return this.svc.markDone(id, body.done);
    }
};
exports.CalendarController = CalendarController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('householdId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('month'),
    __param(0, (0, common_1.Query)('householdId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getMonthCalendar", null);
__decorate([
    (0, common_1.Get)('week'),
    __param(0, (0, common_1.Query)('householdId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getWeekCalendar", null);
__decorate([
    (0, common_1.Get)('day'),
    __param(0, (0, common_1.Query)('householdId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getDayCalendar", null);
__decorate([
    (0, common_1.Get)('now'),
    __param(0, (0, common_1.Query)('householdId')),
    __param(1, (0, common_1.Query)('datetime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getCurrentTimeWindow", null);
__decorate([
    (0, common_1.Patch)(':id/done'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "done", null);
exports.CalendarController = CalendarController = CalendarController_1 = __decorate([
    (0, common_1.UseGuards)(jwt_strategy_1.JwtStrategy),
    (0, common_1.Controller)('calendar'),
    __metadata("design:paramtypes", [calendar_service_1.CalendarService])
], CalendarController);
//# sourceMappingURL=calendar.controller.js.map