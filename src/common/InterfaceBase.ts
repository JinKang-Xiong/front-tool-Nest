
export interface BaseRespone<T> {
    code: number;
    data: T;
    message: string;
    description: string
}

