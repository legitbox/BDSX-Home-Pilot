"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializableVec3 = void 0;
class SerializableVec3 {
    constructor(x, y, z) {
        if (typeof x === "number") {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        else {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        }
    }
}
exports.SerializableVec3 = SerializableVec3;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXphYmxlVmVjMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcmlhbGl6YWJsZVZlYzMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsTUFBYSxnQkFBZ0I7SUFLekIsWUFBWSxDQUFxQixFQUFFLENBQVUsRUFBRSxDQUFVO1FBQ3JELElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFFLENBQUM7WUFDWixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUUsQ0FBQztTQUNmO2FBQU07WUFDSCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBQ0o7QUFoQkQsNENBZ0JDIn0=