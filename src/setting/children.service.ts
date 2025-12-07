import { Injectable } from '@nestjs/common';

@Injectable()
export class ChildrenService {
  private children: any[] = [
    { id: '1', name: 'Alice', age: 7, avatar: '', createdAt: new Date() },
    { id: '2', name: 'Luca', age: 9, avatar: '', createdAt: new Date() }
  ];

  getAllChildren() {
    return this.children;
  }

  addChild(dto: any) {
    const child = { id: Date.now().toString(), ...dto };
    this.children.push(child);
    return child;
  }

  updateChild(id: string, dto: any) {
    const child = this.children.find(c => c.id === id);
    if (!child) return null;
    Object.assign(child, dto);
    return child;
  }

  deleteChild(id: string) {
    const idx = this.children.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.children.splice(idx, 1);
    return true;
  }
}
