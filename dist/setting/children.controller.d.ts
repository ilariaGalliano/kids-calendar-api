import { ChildrenService } from './children.service';
export declare class ChildrenController {
    private readonly childrenService;
    constructor(childrenService: ChildrenService);
    getAllChildren(): any[];
    addChild(dto: any): any;
    updateChild(id: string, dto: any): any;
    deleteChild(id: string): boolean;
}
