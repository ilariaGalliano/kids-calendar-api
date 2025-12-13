"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildrenService = void 0;
const common_1 = require("@nestjs/common");
let ChildrenService = class ChildrenService {
    children = [
        { id: '1', name: 'Alice', age: 7, avatar: '', createdAt: new Date() },
        { id: '2', name: 'Luca', age: 9, avatar: '', createdAt: new Date() }
    ];
    getAllChildren() {
        return this.children;
    }
    addChild(dto) {
        const child = { id: Date.now().toString(), ...dto };
        this.children.push(child);
        return child;
    }
    updateChild(id, dto) {
        const child = this.children.find(c => c.id === id);
        if (!child)
            return null;
        Object.assign(child, dto);
        return child;
    }
    deleteChild(id) {
        const idx = this.children.findIndex(c => c.id === id);
        if (idx === -1)
            return false;
        this.children.splice(idx, 1);
        return true;
    }
};
exports.ChildrenService = ChildrenService;
exports.ChildrenService = ChildrenService = __decorate([
    (0, common_1.Injectable)()
], ChildrenService);
//# sourceMappingURL=children.service.js.map