
export class CustomError extends Error {
    code: number;
    data: string[];

    constructor(message: string) {
        super(message);
        this.code = 500;
        this.data = [];
    }

}