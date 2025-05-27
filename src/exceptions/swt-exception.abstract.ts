export default abstract class SWTException extends Error {

    public static CODE:Readonly<string>;

    constructor(message: string) {
      super(message);
      this.name = this.constructor.name;
    }

}