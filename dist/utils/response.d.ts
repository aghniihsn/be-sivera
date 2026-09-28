import { Response } from 'express';
export declare const sendSuccess: (res: Response, message: string, data?: any, code?: number) => Response<any, Record<string, any>>;
export declare const sendError: (res: Response, message: string, code?: number, errors?: any) => Response<any, Record<string, any>>;
//# sourceMappingURL=response.d.ts.map