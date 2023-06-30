import {VectorXYZ} from "bdsx/common";

export class SerializableVec3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number | VectorXYZ, y?: number, z?: number) {
        if (typeof x === "number") {
            this.x = x;
            this.y = y!;
            this.z = z!;
        } else {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        }
    }
}